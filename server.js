// Chat Caféiné — serveur du site (Node.js, sans dépendances).
// Lancement : npm start  →  http://localhost:3000
// L'admin est en réserve : désactivée par défaut, réactivable avec ADMIN=1 npm start.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const store = require('./lib/store');
const auth = require('./lib/auth');
const views = require('./lib/views');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC = path.join(__dirname, 'public');
const COOKIE = 'cc_admin';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

// Feuilles de style : public/css/*.css puis public/css/pages/*.css, assemblées en un seul /css/site.css.
// L'unité « u » (1u = 1px d'une maquette de 1440px, mise à l'échelle de l'écran) est convertie ici en calc().
const CSS_DIR = path.join(PUBLIC, 'css');
const compileU = (src) => src.replace(/(^|[\s(,:\-+*/])(-?\d*\.?\d+)u(?![\w-])/g, (m, pre, n) => `${pre}calc(${n} * var(--u))`);
let cssBundle = { key: '', body: '', etag: '' };
function cssFiles() {
  const list = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.css')).sort().map((f) => path.join(dir, f));
  return [...list(CSS_DIR), ...list(path.join(CSS_DIR, 'pages'))];
}
function buildCss() {
  const files = cssFiles();
  const key = files.map((f) => f + ':' + fs.statSync(f).mtimeMs).join('|');
  if (key !== cssBundle.key) {
    const body = files.map((f) => `/* ${path.relative(CSS_DIR, f)} */\n` + compileU(fs.readFileSync(f, 'utf8'))).join('\n');
    cssBundle = { key, body, etag: '"css-' + crypto.createHash('sha1').update(body).digest('hex').slice(0, 16) + '"' };
  }
  return cssBundle;
}
function serveCss(req, res) {
  const { body, etag } = buildCss();
  if (req.headers['if-none-match'] === etag) return send(res, 304, '');
  send(res, 200, body, { 'Content-Type': MIME['.css'], ETag: etag, 'Cache-Control': 'no-cache' });
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(body);
}
function json(res, status, data) {
  send(res, status, JSON.stringify(data), { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });
}
function html(res, status, body) {
  send(res, status, body, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache', 'X-Frame-Options': 'SAMEORIGIN' });
}

function serveFile(req, res, root, rel) {
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root)) return false;
  let stat;
  try { stat = fs.statSync(file); } catch { return false; }
  if (!stat.isFile()) return false;
  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const etag = '"' + stat.size.toString(36) + '-' + Math.floor(stat.mtimeMs).toString(36) + '"';
  if (req.headers['if-none-match'] === etag) { send(res, 304, ''); return true; }
  const isAsset = /\/(img|uploads)\//.test(file);
  const headers = { 'Content-Type': type, ETag: etag, 'Cache-Control': isAsset ? 'public, max-age=604800' : 'no-cache' };
  if (ext === '.svg') headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'";
  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
  return true;
}

function readBody(req, limit = 1e6) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error('Fichier trop volumineux'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(Object.assign(new Error('JSON invalide'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function isAdmin(req) { return !!auth.verify(cookies(req)[COOKIE]); }

// Limitation simple des envois de formulaires par IP.
const hits = new Map();
function rateLimited(req, key, max = 12, windowMs = 36e5) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const k = key + ':' + ip; const now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(k, arr);
  return arr.length > max;
}

const clean = (v, max = 500) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
const validPhone = (v) => /^[+()\d\s.-]{6,25}$/.test(v);
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const euro = (n) => n.toFixed(2).replace('.', ',') + ' €';

async function notify(text) {
  const s = store.getContent().settings;
  if (!s.telegramToken || !s.telegramChatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${s.telegramToken}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: s.telegramChatId, text }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) { console.warn('Telegram:', e.message); }
}

// ---------- API publique ----------
async function apiPublic(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/catalog') {
    const c = store.getContent();
    return json(res, 200, c.products.filter((p) => p.visible !== false).map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image })));
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Méthode non autorisée' });
  const body = await readBody(req, 64e3);
  if (body.website) return json(res, 200, { ok: true }); // pot de miel anti-spam

  if (url.pathname === '/api/orders') {
    if (rateLimited(req, 'order')) return json(res, 429, { error: 'Trop de commandes envoyées. Réessayez plus tard ou écrivez-nous sur WhatsApp.' });
    const c = store.getContent();
    const name = clean(body.name, 80), phone = clean(body.phone, 30);
    if (!name) return json(res, 400, { error: 'Indiquez votre nom.' });
    if (!validPhone(phone)) return json(res, 400, { error: 'Indiquez un numéro de téléphone valide.' });
    const items = [];
    for (const it of Array.isArray(body.items) ? body.items.slice(0, 50) : []) {
      const prod = c.products.find((p) => p.id === it.id && p.visible !== false);
      const qty = Math.max(1, Math.min(50, parseInt(it.qty, 10) || 1));
      if (prod) items.push({ id: prod.id, name: prod.name, price: prod.price, qty });
    }
    if (!items.length) return json(res, 400, { error: 'Votre panier est vide.' });
    const total = Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;
    const order = store.add('orders', {
      name, phone, items, total,
      pickupDate: clean(body.pickupDate, 20), pickupTime: clean(body.pickupTime, 10), note: clean(body.note, 600),
    });
    notify(`🛍 Nouvelle commande n°${order.number}\n${name} — ${phone}\nRetrait : ${order.pickupDate || '?'} ${order.pickupTime || ''}\n` +
      items.map((i) => `• ${i.qty} × ${i.name} (${euro(i.price)})`).join('\n') + `\nTotal : ${euro(total)}` + (order.note ? `\nNote : ${order.note}` : ''));
    return json(res, 200, { ok: true, number: order.number, total });
  }

  if (url.pathname === '/api/cakes') {
    if (rateLimited(req, 'cake')) return json(res, 429, { error: 'Trop de demandes envoyées. Réessayez plus tard.' });
    const name = clean(body.name, 80), phone = clean(body.phone, 30), request = clean(body.request, 2000);
    if (!name) return json(res, 400, { error: 'Indiquez votre nom.' });
    if (!validPhone(phone)) return json(res, 400, { error: 'Indiquez un numéro de téléphone valide.' });
    if (request.length < 3) return json(res, 400, { error: 'Décrivez votre demande.' });
    const rec = store.add('cakes', { name, phone, request, cake: clean(body.cake, 100) });
    notify(`🎂 Demande de gâteau n°${rec.number}\n${name} — ${phone}\n${rec.cake ? 'Modèle : ' + rec.cake + '\n' : ''}${request}`);
    return json(res, 200, { ok: true, number: rec.number });
  }

  if (url.pathname === '/api/messages') {
    if (rateLimited(req, 'msg')) return json(res, 429, { error: 'Trop de messages envoyés. Réessayez plus tard.' });
    const name = clean(body.name, 80), phone = clean(body.phone, 30), email = clean(body.email, 120), message = clean(body.message, 4000);
    if (!name) return json(res, 400, { error: 'Indiquez votre nom.' });
    if (!validEmail(email)) return json(res, 400, { error: 'Indiquez une adresse e-mail valide.' });
    if (phone && !validPhone(phone)) return json(res, 400, { error: 'Le numéro de téléphone n’est pas valide.' });
    if (message.length < 3) return json(res, 400, { error: 'Écrivez votre message.' });
    const rec = store.add('messages', { name, phone, email, message });
    notify(`✉️ Nouveau message n°${rec.number}\n${name} — ${email}${phone ? ' — ' + phone : ''}\n${message}`);
    return json(res, 200, { ok: true });
  }
  return json(res, 404, { error: 'Introuvable' });
}

// ---------- API admin ----------
async function apiAdmin(req, res, url) {
  const p = url.pathname.replace('/api/admin', '');
  if (p === '/login' && req.method === 'POST') {
    if (rateLimited(req, 'login', 10, 9e5)) return json(res, 429, { error: 'Слишком много попыток. Подождите 15 минут.' });
    const body = await readBody(req);
    if (!auth.checkPassword(body.password || '')) return json(res, 401, { error: 'Неверный пароль' });
    const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `${COOKIE}=${auth.createSession()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${auth.SESSION_DAYS * 86400}${secure}`);
    return json(res, 200, { ok: true });
  }
  if (p === '/logout') {
    res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
    return json(res, 200, { ok: true });
  }
  if (!isAdmin(req)) return json(res, 401, { error: 'Нужно войти' });
  // Protection CSRF : les requêtes qui modifient doivent venir de la même origine.
  if (req.method !== 'GET') {
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) return json(res, 403, { error: 'Origine refusée' });
  }

  if (p === '/me') {
    const counts = {};
    for (const b of store.INBOXES) counts[b] = store.list(b).filter((r) => r.status === 'new').length;
    return json(res, 200, { ok: true, defaultPassword: !!auth.getAuth().isDefault, counts });
  }
  if (p === '/content' && req.method === 'GET') return json(res, 200, store.getContent());
  if (p === '/content' && req.method === 'PUT') {
    const body = await readBody(req, 5e6);
    if (!body || typeof body !== 'object' || !body.settings || !Array.isArray(body.products)) return json(res, 400, { error: 'Неверные данные' });
    store.setContent(body);
    return json(res, 200, { ok: true });
  }
  if (p === '/reset' && req.method === 'POST') return json(res, 200, store.resetContent());
  if (p === '/upload' && req.method === 'POST') {
    const body = await readBody(req, 25e6);
    const m = /^data:image\/(webp|jpeg|png|gif|avif);base64,(.+)$/.exec(body.data || '');
    if (!m) return json(res, 400, { error: 'Поддерживаются только изображения (JPG, PNG, WebP, GIF)' });
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const base = clean(body.name, 60).toLowerCase().normalize('NFD').replace(/[^\w.-]+/g, '-').replace(/\.[a-z0-9]+$/, '').replace(/^-+|-+$/g, '') || 'image';
    const fname = `${base}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(store.UPLOADS, fname), Buffer.from(m[2], 'base64'));
    return json(res, 200, { ok: true, url: '/uploads/' + fname });
  }
  if (p === '/password' && req.method === 'POST') {
    const body = await readBody(req);
    if (!auth.checkPassword(body.current || '')) return json(res, 400, { error: 'Текущий пароль неверный' });
    if (String(body.next || '').length < 6) return json(res, 400, { error: 'Новый пароль — минимум 6 символов' });
    auth.setPassword(body.next);
    res.setHeader('Set-Cookie', `${COOKIE}=${auth.createSession()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${auth.SESSION_DAYS * 86400}`);
    return json(res, 200, { ok: true });
  }
  if (p === '/test-telegram' && req.method === 'POST') {
    await notify('✅ Chat Caféiné : уведомления работают!');
    return json(res, 200, { ok: true });
  }
  const m = /^\/inbox\/(orders|cakes|messages)(?:\/([\w-]+))?$/.exec(p);
  if (m) {
    const [, box, id] = m;
    if (!id && req.method === 'GET') return json(res, 200, store.list(box));
    if (id && req.method === 'PATCH') {
      const body = await readBody(req);
      const allowed = {};
      if (['new', 'confirmed', 'ready', 'done', 'cancelled'].includes(body.status)) allowed.status = body.status;
      if (typeof body.adminNote === 'string') allowed.adminNote = clean(body.adminNote, 1000);
      const rec = store.update(box, id, allowed);
      return rec ? json(res, 200, rec) : json(res, 404, { error: 'Не найдено' });
    }
    if (id && req.method === 'DELETE') return json(res, 200, { ok: store.remove(box, id) });
  }
  return json(res, 404, { error: 'Не найдено' });
}

// ---------- Pages ----------
function page(req, res, url) {
  const c = store.getContent();
  let p = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';
  const routes = { '/': 'home', '/menu': 'menu', '/a-propos': 'about', '/gateaux': 'cakes', '/contact': 'contact', '/galerie': 'gallery' };
  if (routes[p]) return html(res, 200, views.render(routes[p], c, { url }));
  const prod = /^\/produit\/([\w-]+)$/.exec(p);
  if (prod) {
    const item = c.products.find((x) => x.id === prod[1] && x.visible !== false);
    if (item) return html(res, 200, views.render('product', c, { url, product: item }));
  }
  return html(res, 404, views.render('notfound', c, { url }));
}

const handler = async (req, res) => {
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  try {
    if (url.pathname.startsWith('/api/admin')) return store.ADMIN ? await apiAdmin(req, res, url) : json(res, 404, { error: 'Introuvable' });
    if (url.pathname.startsWith('/api/')) return await apiPublic(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Méthode non autorisée' });
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      if (!store.ADMIN) return page(req, res, url);
      return serveFile(req, res, PUBLIC, 'admin/index.html') || send(res, 404, 'Not found');
    }
    if (url.pathname === '/css/site.css') return serveCss(req, res);
    if (url.pathname.startsWith('/uploads/') && serveFile(req, res, store.UPLOADS, url.pathname.slice(9))) return;
    if (/\.\w+$/.test(url.pathname) && serveFile(req, res, PUBLIC, decodeURIComponent(url.pathname))) return;
    if (/\.\w+$/.test(url.pathname)) return send(res, 404, 'Not found');
    return page(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) json(res, e.status || 500, { error: e.status ? e.message : 'Erreur serveur' });
  }
};

const server = http.createServer(handler);

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`\n  ☕ Chat Caféiné — http://localhost:${PORT}`);
    if (!store.ADMIN) { console.log('  ✏️  Contenu : lib/defaults.js (admin désactivée)\n'); return; }
    const a = auth.getAuth();
    console.log(`  🔐 Admin        — http://localhost:${PORT}/admin`);
    if (a.isDefault) console.log(`     Mot de passe par défaut : « ${auth.DEFAULT_PASSWORD} » (à changer dans l'admin)\n`);
  });
}

module.exports = handler;
