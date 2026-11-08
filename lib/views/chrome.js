// Cadre commun à toutes les pages : document HTML, bandeau, en-tête, pied de page, panier, menu mobile.
// Une seule version de chaque élément : la navigation ne « saute » pas d'une page à l'autre.
const { esc, nl, wa, tel, photo } = require('./util');
const { icon } = require('./icons');
const { navLinks, commanderBtn, bagBtn, burgerBtn, linkBtn, openStatus, socials, field, honeypot } = require('./ui');

const FONTS = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap';

// Bandeau du haut : d'abord ce qui compte (ouvert ou non), puis les annonces de l'admin.
function topbar(s) {
  const items = (s.announcement || []).filter(Boolean);
  return `<div class="topbar"><p class="topbar__in">${openStatus('', s)}${items.map((t, i) => `<span class="topbar__msg${i ? ' only-d' : ''}">${esc(t)}</span>`).join('')}</p></div>`;
}

function header(c, url) {
  const s = c.settings;
  return `${topbar(s)}
<header class="hdr" data-hdr>
  <div class="hdr__in">
    <a class="hdr__logo" href="/" aria-label="${esc(s.siteName)} — accueil"><img src="${esc(s.logos.script)}" alt="${esc(s.siteName)}" width="207" height="123"></a>
    <nav class="hdr__nav" aria-label="Navigation principale">${navLinks(s.nav, url)}</nav>
    <div class="hdr__actions">
      ${commanderBtn('hdr__cta only-d')}
      ${bagBtn('hdr__bag only-m')}
      ${burgerBtn('hdr__burger only-m')}
    </div>
  </div>
</header>`;
}

function footer(c, url) {
  const s = c.settings;
  return `<footer class="ftr">
  <svg class="ftr__wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 34C160 8 330 4 520 20s360 34 560 18 280-30 360-26V60H0Z"/></svg>
  <div class="ftr__in">
    <a href="/" class="ftr__logo"><img src="${esc(s.logos.scriptLight)}" alt="${esc(s.siteName)}" loading="lazy"></a>
    <nav class="ftr__nav" aria-label="Pied de page">${navLinks(s.nav, url)}</nav>
    <div class="ftr__info">
      <a href="${esc(s.mapsUrl)}" target="_blank" rel="noopener">${icon('pinFill')}<span>${nl(s.addressShort)}</span></a>
      <p>${icon('clock')}<span>${openStatus('status--light')}<br>${nl(s.hours)}</span></p>
      <p>${icon('store')}<span>${esc(s.pickupTitle)}<br>${esc(s.pickupNote)}</span></p>
    </div>
    <div class="ftr__contact">
      <a href="${tel(s.phone)}">${icon('phone')}<span>${esc(s.phone)}</span></a>
      <a href="mailto:${esc(s.email)}">${icon('mail')}<span>${esc(s.email)}</span></a>
      ${socials(s, 'ftr__soc')}
    </div>
  </div>
  <p class="ftr__copy">${esc(s.copyright)}</p>
</footer>`;
}

function drawer(c) {
  const s = c.settings;
  return `<div class="drawer" data-drawer hidden>
  <div class="drawer__backdrop" data-close-cart></div>
  <aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
    <header class="drawer__head">
      <h2 id="cart-title" class="t-h3">Votre panier</h2>
      <button type="button" class="icon-btn drawer__close" data-close-cart aria-label="Fermer">${icon('close')}</button>
    </header>
    <div class="drawer__body">
      <div class="cart-empty" data-cart-empty>
        <img src="${esc(c.cakes.catImage)}" alt="" width="84">
        <p>Votre panier est vide pour le moment.</p>
        ${linkBtn('/menu', 'Découvrir notre menu')}
      </div>
      <ul class="cart-list" data-cart-list></ul>
      <form class="form cart-form" data-order-form hidden novalidate>
        <div class="cart-total"><span>Total</span><strong data-cart-total>0,00 €</strong></div>
        <p class="note">${icon('store')} <span>${esc(s.cartNote)}<br><a href="${esc(s.mapsUrl)}" target="_blank" rel="noopener">${esc(s.address)}</a> · ${openStatus()}</span></p>
        ${field({ label: 'Nom', name: 'name', required: true, autocomplete: 'name', maxlength: 80, placeholder: 'Votre nom' })}
        ${field({ label: 'Téléphone', name: 'phone', type: 'tel', required: true, autocomplete: 'tel', maxlength: 25, placeholder: 'Votre numéro de téléphone' })}
        <div class="form-row">
          ${field({ label: 'Jour du retrait', name: 'pickupDate', type: 'date', extra: { 'data-pickup-date': true } })}
          <label class="fld"><span class="fld__label">Heure</span><select class="fld__input" name="pickupTime" data-pickup-time></select></label>
        </div>
        ${field({ label: 'Remarque', name: 'note', rows: 2, maxlength: 600, placeholder: 'Allergies, message, précisions…' })}
        ${honeypot}
        <p class="form-msg" data-form-msg role="alert"></p>
        <button class="btn btn--dark btn--block" type="submit">${icon('bag')} Valider la commande</button>
        <button class="btn btn--outline btn--block" type="button" data-cart-whatsapp>${icon('whatsapp')} Commander via WhatsApp</button>
      </form>
      <div class="cart-done" data-cart-done hidden>
        <div class="cart-done__icon">${icon('check')}</div>
        <h3 class="t-h3">Merci pour votre commande !</h3>
        <p data-cart-done-text></p>
        <button type="button" class="btn btn--dark" data-close-cart>Continuer</button>
      </div>
    </div>
  </aside>
</div>`;
}

function mobileMenu(c, url) {
  const s = c.settings;
  return `<div class="mmenu" data-mmenu hidden>
  <div class="mmenu__backdrop" data-close-menu></div>
  <nav class="mmenu__panel" aria-label="Menu principal">
    <div class="mmenu__head">
      <a href="/" class="mmenu__logo"><img src="${esc(s.logos.script)}" alt="${esc(s.siteName)}"></a>
      <button type="button" class="icon-btn" data-close-menu aria-label="Fermer le menu">${icon('close')}</button>
    </div>
    <div class="mmenu__links">${navLinks(s.nav, url)}</div>
    <div class="mmenu__actions">
      ${commanderBtn('btn--block')}
      <a class="btn btn--outline btn--block" href="${esc(wa(s))}" target="_blank" rel="noopener">${icon('whatsapp')} Commander sur WhatsApp</a>
    </div>
    <div class="mmenu__info">
      <p>${icon('pin')} <a href="${esc(s.mapsUrl)}" target="_blank" rel="noopener">${nl(s.address)}</a></p>
      <p>${icon('clock')} <span>${openStatus()}<br>${nl(s.hours)}</span></p>
      <p>${icon('phone')} <a href="${tel(s.phone)}">${esc(s.phone)}</a></p>
    </div>
    ${socials(s, 'socials--dark')}
  </nav>
</div>`;
}

// Gabarit complet d'une page : seul le contenu de <main> change d'une page à l'autre.
function page(c, { url, name, title, description = '', ogImage = '', main }) {
  const s = c.settings;
  const data = {
    whatsapp: String(s.whatsapp || '').replace(/\D/g, ''),
    products: c.products.filter((p) => p.visible !== false).map((p) => ({ id: p.id, name: p.name, price: p.price, image: photo(p.cutout || p.image, 200) })),
    openDays: s.openDays, openFrom: s.openFrom, openTo: s.openTo,
  };
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${ogImage ? `<meta property="og:image" content="${esc(photo(ogImage, 1200))}">` : ''}
<meta name="theme-color" content="#3b1f12">
<link rel="icon" href="${esc(s.logos.badge)}">
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css">
<script>document.documentElement.style.setProperty('--vw', document.documentElement.clientWidth + 'px')</script>
</head>
<body class="page-${name}">
<a class="skip" href="#main">Aller au contenu</a>
${header(c, url)}
<main id="main">
${main}
</main>
${footer(c, url)}
${drawer(c)}
${mobileMenu(c, url)}
<div class="cartbar only-m" data-cartbar hidden>
  <button type="button" data-open-cart><span><b data-cart-items></b><span data-cart-sum></span></span><span class="cartbar__go">Voir le panier</span></button>
</div>
<script>window.CC=${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script src="/js/site.js" defer></script>
<script src="/js/cat.js" defer></script>
</body>
</html>`;
}

module.exports = { page };
