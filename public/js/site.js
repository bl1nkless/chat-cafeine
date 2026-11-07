// Chat Caféiné — interactions du site : panier, commandes, formulaires, menus, carrousels, galerie.
(() => {
  const CC = window.CC || { products: [] };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const euro = (n) => (Number(n) || 0).toFixed(2).replace('.', ',') + ' €';
  const byId = (id) => CC.products.find((p) => p.id === id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Largeur réelle de la fenêtre (sans barre de défilement) pour l'échelle desktop.
  const setVw = () => document.documentElement.style.setProperty('--vw', document.documentElement.clientWidth + 'px');
  setVw();
  addEventListener('resize', setVw, { passive: true });

  // En-tête collant : ombre légère dès qu'on a défilé.
  const hdr = document.querySelector('[data-hdr]');
  const onScroll = () => hdr && hdr.classList.toggle('is-stuck', hdr.getBoundingClientRect().top <= 0 && scrollY > 4);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Panier (stocké dans le navigateur) ----------
  const KEY = 'cc-cart-v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  let cart = load().filter((i) => byId(i.id));
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {} render(); };
  const count = () => cart.reduce((s, i) => s + i.qty, 0);
  const total = () => cart.reduce((s, i) => s + (byId(i.id)?.price || 0) * i.qty, 0);

  function add(id, qty = 1) {
    const p = byId(id); if (!p) return;
    const it = cart.find((i) => i.id === id);
    if (it) it.qty = Math.min(50, it.qty + qty); else cart.push({ id, qty });
    save();
  }
  function setQty(id, qty) {
    cart = cart.map((i) => (i.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0);
    save();
  }

  const svg = (d) => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${d}</svg>`;
  const plural = (n) => `${n} article${n > 1 ? 's' : ''}`;
  function render() {
    const n = count(), sum = euro(total());
    $$('[data-cart-count]').forEach((b) => { b.textContent = n; b.hidden = n === 0; });
    // Bouton de l'en-tête : « Commander » tant que le panier est vide, puis le total.
    $$('[data-cart-label]').forEach((l) => { l.textContent = n ? `Panier · ${sum}` : l.dataset.empty; });
    // Cartes : « Ajouter » devient − n + dès que le produit est dans le panier.
    $$('[data-buy-id]').forEach((el) => {
      const q = cart.find((i) => i.id === el.dataset.buyId)?.qty || 0;
      el.querySelector('.add__btn').hidden = q > 0;
      el.querySelector('.add__qty').hidden = q === 0;
      el.querySelector('[data-buy-n]').textContent = q;
    });
    $$('[data-in-cart]').forEach((el) => {
      const q = cart.find((i) => i.id === el.dataset.inCart)?.qty || 0;
      el.hidden = q === 0;
      el.innerHTML = q ? `Déjà ${q} dans votre panier · <button type="button" data-open-cart>Voir le panier</button>` : '';
    });
    // Barre panier mobile.
    const bar = $('[data-cartbar]');
    if (bar) {
      bar.hidden = n === 0;
      document.body.classList.toggle('has-cart', n > 0);
      $('[data-cart-items]', bar).textContent = plural(n);
      $('[data-cart-sum]', bar).textContent = sum;
    }
    const list = $('[data-cart-list]'); if (!list) return;
    list.innerHTML = cart.map((i) => {
      const p = byId(i.id);
      return `<li class="cart-item"><img src="${esc(p.image)}" alt=""><div><h3>${esc(p.name)}</h3><p>${i.qty > 1 ? `${i.qty} × ${euro(p.price)} = ` : ''}${euro(p.price * i.qty)}</p></div>
        <div class="qty"><button type="button" data-qty="${esc(i.id)}" data-d="-1" aria-label="Retirer un">${svg('<path d="M6.5 12h11"/>')}</button><span>${i.qty}</span><button type="button" data-qty="${esc(i.id)}" data-d="1" aria-label="Ajouter un">${svg('<path d="M12 6.5v11M6.5 12h11"/>')}</button></div></li>`;
    }).join('');
    const empty = cart.length === 0;
    $('[data-cart-empty]').hidden = !empty;
    $('[data-order-form]').hidden = empty;
    $('[data-cart-total]').textContent = sum;
  }

  // ---------- Ouvert / fermé, à l'heure de Paris ----------
  const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const hhmm = (m) => `${Math.floor(m / 60)}h${pad(m % 60)}`;
  function parisNow() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday), min: Number(parts.hour) * 60 + Number(parts.minute) };
  }
  function openStatus() {
    const from = toMin(CC.openFrom || '09:00'), to = toMin(CC.openTo || '18:30');
    const { day, min } = parisNow();
    if (openDays.includes(day) && min >= from && min < to) return { open: true, text: `Ouvert · jusqu’à ${hhmm(to)}` };
    if (openDays.includes(day) && min < from) return { open: false, text: `Fermé · ouvre à ${hhmm(from)}` };
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (openDays.includes(d)) return { open: false, text: `Fermé · ouvre ${i === 1 ? 'demain' : DAYS[d]} à ${hhmm(from)}` };
    }
    return { open: false, text: 'Fermé' };
  }
  function paintStatus() {
    const st = openStatus();
    $$('[data-open-status]').forEach((el) => { el.textContent = st.text; el.classList.toggle('is-open', st.open); el.classList.toggle('is-closed', !st.open); });
  }

  // ---------- Fiche produit : quantité et barre d'achat mobile ----------
  function setStep(out, n) {
    n = Math.max(1, Math.min(20, n));
    out.textContent = n;
    const [minus, plus] = out.parentElement.querySelectorAll('[data-step]');
    minus.disabled = n <= 1; plus.disabled = n >= 20;
  }
  $$('[data-stepper-val]').forEach((o) => setStep(o, 1));

  // ---------- Tiroirs ----------
  let lastFocus = null;
  function openLayer(el) {
    lastFocus = document.activeElement;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    setTimeout(() => (el.querySelector('button, a, input') || el).focus(), 50);
  }
  function closeLayer(el) {
    if (!el || el.hidden) return;
    el.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { el.hidden = true; }, 320);
    if (lastFocus) lastFocus.focus();
  }
  const drawer = $('[data-drawer]');
  const mmenu = $('[data-mmenu]');
  function openCart() {
    closeLayer(mmenu);
    $('[data-cart-done]').hidden = true;
    render();
    openLayer(drawer);
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-add],[data-step],[data-open-cart],[data-close-cart],[data-commander],[data-open-menu],[data-close-menu],[data-qty],[data-cart-whatsapp]');
    if (!t) return;
    if (t.matches('[data-add]')) {
      // Sur la fiche produit, la quantité vient du sélecteur ; puis il revient à 1.
      const out = t.closest('[data-buy]')?.querySelector('[data-stepper-val]');
      e.preventDefault(); add(t.dataset.add, out ? Number(out.textContent) || 1 : 1);
      if (out) setStep(out, 1);
      t.classList.add('is-added'); setTimeout(() => t.classList.remove('is-added'), 900);
      // Le bouton vient d'être remplacé par − n + : on garde le focus au même endroit.
      if (t.classList.contains('add__btn')) t.parentElement.querySelector('.add__qty [data-d="1"]').focus();
    } else if (t.matches('[data-step]')) {
      const out = t.closest('[data-stepper]').querySelector('[data-stepper-val]');
      setStep(out, Number(out.textContent) + Number(t.dataset.step));
    } else if (t.matches('[data-open-cart]')) { e.preventDefault(); openCart(); }
    else if (t.matches('[data-close-cart]')) { closeLayer(drawer); }
    else if (t.matches('[data-commander]')) {
      // « Commander » : ouvre le panier s'il contient des articles, sinon mène au menu.
      if (count() > 0) { e.preventDefault(); openCart(); }
      else if (t.tagName === 'BUTTON') location.href = '/menu';
    } else if (t.matches('[data-open-menu]')) { openLayer(mmenu); t.setAttribute('aria-expanded', 'true'); }
    else if (t.matches('[data-close-menu]')) { closeLayer(mmenu); $$('[data-open-menu]').forEach((b) => b.setAttribute('aria-expanded', 'false')); }
    else if (t.matches('[data-qty]')) {
      const it = cart.find((i) => i.id === t.dataset.qty);
      if (it) setQty(it.id, it.qty + Number(t.dataset.d));
      const box = t.closest('[data-buy-id]');
      if (box && box.querySelector('.add__qty').hidden) box.querySelector('.add__btn').focus();
    } else if (t.matches('[data-cart-whatsapp]')) {
      const f = $('[data-order-form]');
      const lines = cart.map((i) => `• ${i.qty} × ${byId(i.id).name} (${euro(byId(i.id).price)})`);
      const d = f.pickupDate.value ? new Date(f.pickupDate.value + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
      const msg = `Bonjour Chat Caféiné ! Je souhaite commander :\n${lines.join('\n')}\nTotal : ${euro(total())}` +
        (d ? `\nRetrait : ${d}${f.pickupTime.value ? ' à ' + f.pickupTime.value : ''}` : '') +
        (f.name.value ? `\nNom : ${f.name.value}` : '') + (f.note.value ? `\nRemarque : ${f.note.value}` : '');
      window.open(`https://wa.me/${CC.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeLayer(drawer); closeLayer(mmenu); closeLightbox(); }
  });
  $$('.mmenu__links a').forEach((a) => a.addEventListener('click', () => closeLayer(mmenu)));

  // ---------- Créneaux de retrait ----------
  const dateIn = $('[data-pickup-date]');
  const timeIn = $('[data-pickup-time]');
  const pad = (n) => String(n).padStart(2, '0');
  const toMin = (s) => { const [h, m] = String(s || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
  const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const openDays = CC.openDays && CC.openDays.length ? CC.openDays : [1, 2, 3, 4, 5, 6];
  function nextOpen(from) {
    const d = new Date(from);
    for (let i = 0; i < 14; i++) { if (openDays.includes(d.getDay())) return d; d.setDate(d.getDate() + 1); }
    return from;
  }
  function fillTimes() {
    if (!timeIn) return;
    const from = toMin(CC.openFrom || '09:00'), to = toMin(CC.openTo || '18:30');
    const sel = dateIn.value ? new Date(dateIn.value + 'T00:00') : new Date();
    const now = new Date();
    const today = isoDay(sel) === isoDay(now);
    const min = today ? now.getHours() * 60 + now.getMinutes() + 45 : 0;
    const closed = !openDays.includes(sel.getDay());
    const opts = [];
    for (let m = Math.ceil(from / 15) * 15; m <= to - 15; m += 15) if (m >= min) opts.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
    timeIn.innerHTML = closed ? '<option value="">Fermé ce jour-là</option>' : opts.length ? opts.map((o) => `<option>${o}</option>`).join('') : '<option value="">Plus de créneau aujourd’hui</option>';
  }
  if (dateIn) {
    const now = new Date();
    const lateToday = now.getHours() * 60 + now.getMinutes() + 45 > toMin(CC.openTo || '18:30') - 15;
    const first = nextOpen(lateToday ? new Date(now.getTime() + 864e5) : now);
    dateIn.min = isoDay(new Date());
    dateIn.value = isoDay(first);
    dateIn.addEventListener('change', fillTimes);
    fillTimes();
  }

  // ---------- Envoi des formulaires ----------
  async function post(url, data) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Une erreur est survenue. Réessayez ou écrivez-nous sur WhatsApp.');
    return j;
  }
  function formData(f) { return Object.fromEntries(new FormData(f).entries()); }
  function checkRequired(f) {
    f.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    for (const el of f.querySelectorAll('[required]')) {
      const bad = (m) => { el.setAttribute('aria-invalid', 'true'); el.focus(); return m; };
      if (!el.value.trim()) return bad('Merci de remplir tous les champs obligatoires.');
      if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) return bad('Adresse e-mail invalide.');
      if (el.type === 'tel' && el.value.replace(/\D/g, '').length < 9) return bad('Numéro de téléphone incomplet.');
    }
    return '';
  }
  function bindForm(f, url, extra, onDone) {
    if (!f) return;
    const msg = f.querySelector('[data-form-msg]');
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      const err = checkRequired(f);
      if (err) { msg.textContent = err; return; }
      const btn = f.querySelector('[type=submit]');
      btn.disabled = true;
      try { const res = await post(url, { ...formData(f), ...(extra ? extra() : {}) }); onDone(res); }
      catch (ex) { msg.textContent = ex.message; }
      finally { btn.disabled = false; }
    });
  }

  bindForm($('[data-order-form]'), '/api/orders', () => ({ items: cart }), (res) => {
    const f = $('[data-order-form]');
    cart = []; save();
    f.reset(); if (dateIn) { dateIn.value = isoDay(nextOpen(new Date())); fillTimes(); }
    $('[data-order-form]').hidden = true; $('[data-cart-empty]').hidden = true;
    $('[data-cart-done]').hidden = false;
    $('[data-cart-done-text]').textContent = `Commande n°${res.number} — ${euro(res.total)}. Nous la préparons et vous confirmons très vite. À récupérer au café.`;
  });

  const cakeForm = $('[data-cake-form]');
  bindForm(cakeForm, '/api/cakes', null, () => {
    cakeForm.reset();
    cakeForm.querySelector('[data-form-done]').hidden = false;
  });
  // Carte de gâteau → pré-remplit la demande et remonte au formulaire.
  $$('[data-cake]').forEach((b) => b.addEventListener('click', () => {
    if (!cakeForm) return;
    const name = b.dataset.cake;
    cakeForm.cake.value = name;
    const ta = cakeForm.request;
    if (!ta.value.trim() || ta.dataset.auto === '1') { ta.value = `${name} — pour le … (date), … parts. `; ta.dataset.auto = '1'; }
    cakeForm.querySelector('[data-form-done]').hidden = true;
    cakeForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    cakeForm.classList.remove('is-highlight'); void cakeForm.offsetWidth; cakeForm.classList.add('is-highlight');
    setTimeout(() => cakeForm.name.focus({ preventScroll: true }), 500);
  }));
  const waCake = $('[data-wa-cake]');
  if (waCake && cakeForm) waCake.addEventListener('click', (e) => {
    const d = formData(cakeForm);
    const txt = `Bonjour ! Je souhaite commander un gâteau sur mesure.${d.request ? '\n' + d.request : ''}${d.name ? '\nNom : ' + d.name : ''}`;
    waCake.href = `https://wa.me/${CC.whatsapp}?text=${encodeURIComponent(txt)}`;
  });

  const contactForm = $('[data-contact-form]');
  bindForm(contactForm, '/api/messages', null, () => {
    contactForm.reset();
    contactForm.querySelector('[data-form-done]').hidden = false;
  });

  // ---------- Menu : la rubrique visible est marquée dans la barre ----------
  const catLinks = $$('[data-cats] a');
  if (catLinks.length && 'IntersectionObserver' in window) {
    const mark = (id) => {
      catLinks.forEach((a) => a.classList.toggle('is-active', a.hash === '#' + id));
      const on = catLinks.find((a) => a.hash === '#' + id);
      if (on) on.parentElement.scrollTo({ left: on.offsetLeft - 16, behavior: 'smooth' });
    };
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) mark(en.target.id); }), { rootMargin: '-35% 0px -60% 0px' });
    $$('[data-cat-section]').forEach((sec) => io.observe(sec));
  }

  // ---------- Galerie ----------
  const lb = $('[data-lightbox-view]');
  const shots = $$('[data-lightbox]');
  let lbIndex = 0;
  function showShot(i) {
    lbIndex = (i + shots.length) % shots.length;
    const im = shots[lbIndex].querySelector('img');
    lb.querySelector('img').src = im.dataset.full || im.currentSrc || im.src;
    lb.querySelector('img').alt = im.alt;
    lb.querySelector('figcaption').textContent = im.alt;
  }
  function closeLightbox() { if (lb && !lb.hidden) { lb.hidden = true; document.body.style.overflow = ''; } }
  if (lb) {
    shots.forEach((b, i) => b.addEventListener('click', () => { showShot(i); lb.hidden = false; document.body.style.overflow = 'hidden'; }));
    lb.querySelector('[data-lightbox-close]').addEventListener('click', closeLightbox);
    lb.querySelector('[data-lightbox-prev]').addEventListener('click', () => showShot(lbIndex - 1));
    lb.querySelector('[data-lightbox-next]').addEventListener('click', () => showShot(lbIndex + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'ArrowLeft') showShot(lbIndex - 1);
      if (e.key === 'ArrowRight') showShot(lbIndex + 1);
    });
  }

  render();
  paintStatus();
  setInterval(paintStatus, 60000);
})();
