// Composants d'interface partagés par toutes les pages.
// Chaque composant a une seule apparence, définie dans css/02-components.css.
const { esc, nl, price, attr, img } = require('./util');
const { icon, doodle } = require('./icons');

// ---------- Navigation ----------
const isActive = (href, url) => {
  if (href.includes('#')) return false;
  const h = href.split('?')[0] || '/';
  return h === '/' ? url.pathname === '/' : url.pathname === h || url.pathname.startsWith(h + '/');
};
const navLinks = (items, url, cls = '') =>
  items.map((n) => {
    const on = isActive(n.href, url) || (n.href === '/menu' && url.pathname.startsWith('/produit/'));
    return `<a class="${cls}${on ? ' is-active' : ''}" href="${esc(n.href)}"${on ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`;
  }).join('');

// ---------- Boutons ----------
const cartCount = '<b class="cart-count" data-cart-count hidden>0</b>';
// « Commander » : mène au menu tant que le panier est vide ; ensuite affiche le total et ouvre le panier (voir site.js).
const commanderBtn = (cls = '', label = 'Commander') =>
  `<a class="btn btn--dark ${cls}" href="/menu" data-commander>${icon('bag')}<span data-cart-label data-empty="${esc(label)}">${esc(label)}</span></a>`;
const bagBtn = (cls = '') => `<button type="button" class="icon-btn ${cls}" data-open-cart aria-label="Panier">${icon('bag')}${cartCount}</button>`;
const burgerBtn = (cls = '') => `<button type="button" class="icon-btn ${cls}" data-open-menu aria-label="Ouvrir le menu" aria-expanded="false">${icon('burger')}</button>`;
const linkBtn = (href, label, cls = 'btn--dark', ico = '', extra = {}) =>
  `<a class="btn ${cls}" ${attr({ href, ...extra })}>${ico ? icon(ico) + ' ' : ''}${esc(label)}</a>`;
const linkArrow = (href, label) => `<a class="link-more" href="${esc(href)}">${esc(label)}</a>`;

// Statut d'ouverture calculé en direct (heure de Paris) par site.js à partir des horaires de l'admin.
const openStatus = (cls = '') => `<span class="status ${cls}" data-open-status></span>`;

const socials = (s, cls = '', set = ['instagram', 'facebook', 'tiktok']) =>
  `<div class="socials ${cls}">${set.filter((k) => s[k]).map((k) => `<a href="${esc(s[k])}" target="_blank" rel="noopener" aria-label="${k}">${icon(k)}</a>`).join('')}</div>`;

// Titre avec le petit cœur collé au dernier mot (jamais seul sur sa ligne).
const withHeart = (title, cls = '') => nl(title).replace(/(\S+)$/, `<span class="nw">$1${doodle(cls)}</span>`);

// ---------- Titres de section ----------
// Même structure partout : sur-titre, titre, texte, lien « voir tout » optionnel.
function secHead({ kicker, title, text, link, align = 'left', level = 2, cls = '' }) {
  const h = `h${level}`;
  return `<header class="sh sh--${align} ${cls}">
    <div class="sh__text">
      ${kicker ? `<p class="t-kicker">${esc(kicker)}</p>` : ''}
      <${h} class="${level === 1 ? 't-h1' : 't-h2'}">${nl(title)}</${h}>
      ${text ? `<p class="sh__sub">${nl(text)}</p>` : ''}
    </div>
    ${link ? linkArrow(link.href, link.label) : ''}
  </header>`;
}

// ---------- Bandeau d'ouverture ----------
// Même composition sur chaque page : texte à gauche, visuel à droite.
function hero({ kicker, title, text, actions = '', media = '', between = '', after = '', cls = '', heart = false, display = false }) {
  return `<section class="hero ${cls}">
    ${media ? `<div class="hero__media">${media}</div>` : ''}
    <div class="hero__content">
      ${kicker ? `<p class="t-kicker">${esc(kicker)}</p>` : ''}
      <h1 class="${display ? 't-display' : 't-h1'}">${heart ? withHeart(title, 'hero__heart') : nl(title)}</h1>
      ${text ? `<p class="t-lead">${nl(text)}</p>` : ''}
      ${between}
      ${actions ? `<div class="btn-row">${actions}</div>` : ''}
      ${after}
    </div>
  </section>`;
}

// ---------- Produits ----------
const productUrl = (p) => '/produit/' + encodeURIComponent(p.id);
const visible = (p) => p && p.visible !== false;
const byIds = (c, ids) => (ids || []).map((id) => c.products.find((p) => p.id === id)).filter(visible);
// Bouton « Ajouter » qui devient un sélecteur − n + dès que le produit est dans le panier (voir site.js).
const buyControl = (p, label = 'Ajouter') => `<div class="add" data-buy-id="${esc(p.id)}">
    <button type="button" class="add__btn" data-add="${esc(p.id)}" aria-label="Ajouter ${esc(p.name)} au panier">${icon('plus')}<span>${esc(label)}</span></button>
    <div class="add__qty" hidden><button type="button" data-qty="${esc(p.id)}" data-d="-1" aria-label="Retirer un ${esc(p.name)}">${icon('minus')}</button><output data-buy-n>0</output><button type="button" data-qty="${esc(p.id)}" data-d="1" aria-label="Ajouter un ${esc(p.name)}">${icon('plus')}</button></div>
  </div>`;

// Carte produit unique : accueil et suggestions. Photo en arche, nom et prix, puis l'ajout au panier.
function productCard(p, { desc = false } = {}) {
  return `<article class="pc">
    <a class="pc__img" href="${productUrl(p)}" tabindex="-1" aria-hidden="true">${img(p.image, '', '', { sizes: '(max-width: 959.98px) 72vw, 25vw' })}</a>
    <div class="pc__head"><h3 class="pc__name"><a href="${productUrl(p)}">${esc(p.name)}</a></h3><span class="pc__price">${price(p.price)}</span></div>
    ${desc && p.tagline ? `<p class="pc__desc">${esc(String(p.tagline).replace(/\s*\n\s*/g, ' '))}</p>` : ''}
    ${buyControl(p)}
  </article>`;
}

// Ligne de carte (page Menu) : vignette, nom, description, prix, ajout — lisible d'un coup d'œil.
function menuItem(p) {
  return `<article class="mi">
    <a class="mi__img" href="${productUrl(p)}" tabindex="-1" aria-hidden="true">${img(p.image, '', '', { sizes: '(max-width: 959.98px) 96px, 10vw' })}</a>
    <div class="mi__body">
      <div class="mi__head"><h3 class="mi__name"><a href="${productUrl(p)}">${esc(p.name)}</a></h3><span class="mi__price">${price(p.price)}</span></div>
      ${p.tagline ? `<p class="mi__desc">${esc(String(p.tagline).replace(/\s*\n\s*/g, ' '))}</p>` : ''}
      ${buyControl(p)}
    </div>
  </article>`;
}

// Rangée de cartes : grille de 4 sur ordinateur, défilement horizontal sur mobile.
function productRail(list, { desc = false } = {}) {
  return `<div class="rail">${list.map((p) => productCard(p, { desc })).join('')}</div>`;
}

// ---------- Formulaires ----------
// Champ avec libellé au-dessus : même rendu dans le panier, la commande de gâteau et le contact.
function field({ label, name, type = 'text', required = false, placeholder = '', rows = 0, autocomplete, maxlength, cls = '', extra = {} }) {
  const a = attr({ name, placeholder, required, autocomplete, maxlength, ...extra });
  const control = rows
    ? `<textarea class="fld__input" ${a} rows="${rows}"></textarea>`
    : `<input class="fld__input" ${attr({ type: type === 'text' ? undefined : type })} ${a}>`;
  return `<label class="fld ${cls}"><span class="fld__label">${esc(label)}${required ? ' <span class="req">*</span>' : ''}</span>${control}</label>`;
}
const honeypot = '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">';
function formFooter({ submit, submitIcon = 'send', waHref, waLabel, waAttr = '', done }) {
  return `<p class="form-msg" data-form-msg role="alert"></p>
    <div class="form-actions">
      <button class="btn btn--dark" type="submit">${icon(submitIcon)} ${esc(submit)}</button>
      ${waHref ? `<a class="btn btn--outline" href="${esc(waHref)}" target="_blank" rel="noopener" ${waAttr}>${icon('whatsapp')} ${esc(waLabel)}</a>` : ''}
    </div>
    <p class="form-done" data-form-done hidden>${icon('check')} <span>${esc(done)}</span></p>`;
}


module.exports = {
  hero, isActive, navLinks, commanderBtn, bagBtn, burgerBtn, linkBtn, linkArrow, openStatus, socials, secHead, withHeart,
  productUrl, visible, byIds, buyControl, productCard, menuItem, productRail, field, honeypot, formFooter,
};
