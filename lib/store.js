// Stockage JSON simple sur disque (écriture atomique).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA = process.env.VERCEL ? '/tmp/chat-cafeine-data' : path.join(__dirname, '..', 'data');
const UPLOADS = path.join(DATA, 'uploads');
try { fs.mkdirSync(UPLOADS, { recursive: true }); } catch {}

function file(name) { return path.join(DATA, name + '.json'); }

function read(name, fallback) {
  try { return JSON.parse(fs.readFileSync(file(name), 'utf8')); }
  catch { return typeof fallback === 'function' ? fallback() : fallback; }
}

function write(name, value) {
  const target = file(name);
  const tmp = target + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, target);
}

function clone(v) { return JSON.parse(JSON.stringify(v)); }

// Fusionne les nouvelles clés des valeurs par défaut sans écraser ce que la gérante a modifié.
function fillDefaults(target, defaults) {
  if (Array.isArray(defaults) || typeof defaults !== 'object' || defaults === null) return target;
  for (const k of Object.keys(defaults)) {
    if (!(k in target)) target[k] = clone(defaults[k]);
    else if (target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) fillDefaults(target[k], defaults[k]);
  }
  return target;
}

// Migrations du contenu enregistré : appliquées une fois, au chargement, selon content.version.
// Une valeur n'est remplacée que si la gérante ne l'a pas modifiée (égale à l'ancienne valeur par défaut).
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const MIGRATIONS = {
  // v2 : un seul design pour tout le site (une navigation, un bandeau d'annonces).
  2(c, d) {
    const s = c.settings || {};
    delete s.navs; delete s.announcementShort;
    if (c.menu) delete c.menu.titleImage;
    (s.nav || []).forEach((n) => { if (n.href === '/gateaux' && n.label === 'Commander un gâteau') n.label = 'Gâteaux'; });
    if (same(s.announcement, ['Livraison gratuite dès 30€ d’achat à Chartres', 'Retrait au café uniquement', 'Des douceurs faites avec amour ♡'])) s.announcement = clone(d.settings.announcement);
  },
  // v3 : la fiche produit n'a plus de barre d'onglets mobile.
  3(c) {
    if (c.product) delete c.product.tabs;
  },
  // v4 : moins de décor, plus d'informations utiles. Les blocs supprimés du site sortent aussi du contenu.
  4(c, d) {
    const s = c.settings || {};
    if (same(s.announcement, ['Retrait au café à Chartres uniquement', 'Pas de livraison', 'Des douceurs faites avec amour ♡'])) s.announcement = clone(d.settings.announcement);
    if (c.home) { delete c.home.badges; delete c.home.features; }
    if (c.menu) { delete c.menu.seeAll; delete c.menu.footerItems; }
    (c.categories || []).forEach((k) => delete k.limit);
    if (c.product) ['ingredientsKicker', 'pairingsKicker', 'stamp', 'perks'].forEach((k) => delete c.product[k]);
    (c.products || []).forEach((p) => (p.info || []).forEach((it) => delete it.icon));
  },
};
function migrate(c, d) {
  let changed = false;
  for (let v = (c.version || 1) + 1; v <= d.version; v++) {
    if (MIGRATIONS[v]) MIGRATIONS[v](c, d);
    c.version = v; changed = true;
  }
  return changed;
}

// Sans admin (par défaut), le contenu vient directement de lib/defaults.js : on modifie ce fichier,
// la page suivante l'affiche (rechargé dès que le fichier change). data/content.json reste en réserve pour l'admin.
const ADMIN = process.env.ADMIN === '1';
const DEFAULTS_FILE = require.resolve('./defaults');
let defaultsMtime = 0;
function codeContent() {
  const m = fs.statSync(DEFAULTS_FILE).mtimeMs;
  if (!content || m !== defaultsMtime) {
    delete require.cache[DEFAULTS_FILE];
    try { content = clone(require('./defaults')); defaultsMtime = m; }
    catch (e) { console.error('lib/defaults.js :', e.message); if (!content) throw e; }
  }
  return content;
}

let content = null;
function getContent() {
  if (!ADMIN) return codeContent();
  if (!content) {
    const defaults = require('./defaults');
    content = read('content', null);
    if (!content) { content = clone(defaults); write('content', content); }
    else {
      const changed = migrate(content, defaults);
      fillDefaults(content, defaults);
      if (changed) write('content', content);
    }
  }
  return content;
}
function setContent(next) {
  if (fs.existsSync(file('content'))) {
    const backups = path.join(DATA, 'backups');
    fs.mkdirSync(backups, { recursive: true });
    fs.copyFileSync(file('content'), path.join(backups, 'content-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json'));
    const list = fs.readdirSync(backups).filter((f) => f.startsWith('content-')).sort();
    while (list.length > 30) fs.unlinkSync(path.join(backups, list.shift()));
  }
  content = next;
  write('content', content);
}
function resetContent() {
  delete require.cache[require.resolve('./defaults')];
  setContent(clone(require('./defaults')));
  return content;
}

// Boîtes de réception : commandes, demandes de gâteaux, messages.
const INBOXES = ['orders', 'cakes', 'messages'];
function list(box) { return read(box, []); }
function add(box, item) {
  const all = list(box);
  const seq = read('seq', {});
  seq[box] = (seq[box] || 0) + 1;
  write('seq', seq);
  const rec = { id: crypto.randomUUID(), number: seq[box], createdAt: new Date().toISOString(), status: 'new', ...item };
  all.unshift(rec);
  write(box, all);
  return rec;
}
function update(box, id, patch) {
  const all = list(box);
  const i = all.findIndex((r) => r.id === id);
  if (i < 0) return null;
  all[i] = { ...all[i], ...patch, updatedAt: new Date().toISOString() };
  write(box, all);
  return all[i];
}
function remove(box, id) {
  const all = list(box);
  const next = all.filter((r) => r.id !== id);
  write(box, next);
  return next.length !== all.length;
}

module.exports = { ADMIN, DATA, UPLOADS, INBOXES, read, write, getContent, setContent, resetContent, list, add, update, remove };
