// Fiche produit.
const { esc, nl, price, wa, img } = require('../util');
const { icon } = require('../icons');
const { secHead, byIds, productRail, visible, openStatus } = require('../ui');
const { page } = require('../chrome');

module.exports = function product(c, { url, product: p }) {
  const s = c.settings, cfg = c.product;
  const cat = c.categories.find((x) => x.id === p.category) || {};
  const kicker = p.kicker || cat.kicker || '';
  const title = p.title || p.name;

  // Suggestions : celles choisies dans l'admin, complétées jusqu'à 4 avec d'autres douceurs.
  const pairIds = (p.pairings && p.pairings.length ? p.pairings : cfg.defaultPairings).filter((id) => id !== p.id);
  const pairs = byIds(c, pairIds);
  for (const q of c.products) {
    if (pairs.length >= 4) break;
    if (q.id !== p.id && visible(q) && q.category !== 'boissons' && !pairs.includes(q)) pairs.push(q);
  }

  const L = p.layers || {};
  const hasLayers = L.image && L.items && L.items.length;
  const waText = `Bonjour ${s.siteName} ! Je souhaite commander : ${p.name} (${price(p.price)}).`;

  const main = `
  <section class="pd">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="/menu">Menu</a>${icon('chevron')}<a href="/menu#${esc(cat.id || '')}">${esc(cat.title || '')}</a>${icon('chevron')}<b>${esc(p.name)}</b></nav>
    <div class="pd__info">
      ${kicker ? `<p class="t-kicker">${esc(kicker)}</p>` : ''}
      <h1 class="t-display">${esc(title)}</h1>
      ${p.description ? `<p class="t-lead">${nl(p.description)}</p>` : ''}

      <div class="buy" data-buy>
        <p class="buy__price">${price(p.price)}${p.measure ? ` <span>${esc(p.measure)}</span>` : ''}</p>
        <div class="buy__row">
          <div class="stepper" data-stepper>
            <button type="button" data-step="-1" aria-label="Un de moins">${icon('minus')}</button>
            <output data-stepper-val aria-live="polite">1</output>
            <button type="button" data-step="1" aria-label="Un de plus">${icon('plus')}</button>
          </div>
          <button type="button" class="btn btn--dark buy__add" data-add="${esc(p.id)}">${esc(cfg.addToCart)}</button>
        </div>
        <p class="buy__incart" data-in-cart="${esc(p.id)}" hidden></p>
        <p class="buy__pickup">${esc(s.pickupTitle)} — <a href="${esc(s.mapsUrl)}" target="_blank" rel="noopener">${esc(s.address)}</a>. ${openStatus()}</p>
        <a class="buy__wa" href="${esc(wa(s, waText))}" target="_blank" rel="noopener">${icon('whatsapp')} ${esc(cfg.whatsapp)}</a>
      </div>
    </div>
    <div class="pd__media">${img(p.hero || p.image, title, '', { eager: true, fetchpriority: 'high' })}</div>
  </section>

  ${p.ingredients && p.ingredients.length ? `<section class="sec">
    ${secHead({ title: cfg.ingredientsTitle })}
    <ul class="ingr">${p.ingredients.map((g) => `<li>${img(g.image, g.name, '', { sizes: '112px' })}<strong>${esc(g.name)}</strong><span>${esc(g.text)}</span></li>`).join('')}</ul>
  </section>` : ''}

  ${hasLayers ? `<section class="sec">
    <div class="layers">
      <div class="layers__head">
        ${secHead({ title: [L.kicker, L.title].filter(Boolean).join(' ') })}
        ${img(L.catImage, '', 'layers__cat only-d')}
      </div>
      <div class="layers__stack">
        ${img(L.image, title + ' en détails', 'layers__img')}
        <svg class="layers__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${L.items.map((it) => `<polyline points="0,${it.dotY ?? 50} 8,${it.labelY ?? it.dotY ?? 50} 100,${it.labelY ?? it.dotY ?? 50}" vector-effect="non-scaling-stroke"/>`).join('')}</svg>
        <ol class="layers__labels">${L.items.map((it) => `<li style="--y:${Number(it.labelY ?? it.dotY ?? 50)}"><strong>${esc(it.title)}</strong><span>${esc(it.text)}</span></li>`).join('')}</ol>
      </div>
    </div>
  </section>` : ''}

  ${p.info && p.info.length ? `<section class="sec">
    ${secHead({ title: cfg.infoTitle })}
    <dl class="facts">${p.info.map((it) => `<div><dt>${esc(it.title)}</dt><dd>${nl(it.text)}</dd></div>`).join('')}</dl>
  </section>` : ''}

  ${pairs.length ? `<section class="sec sec--alt">
    ${secHead({ title: cfg.pairingsTitle, link: { href: '/menu', label: 'Tout le menu' } })}
    ${productRail(pairs.slice(0, 4), { desc: true })}
  </section>` : ''}`;
  return page(c, { url, name: 'product', title: `${kicker ? kicker + ' ' : ''}${title} — ${s.siteName}`, description: p.description, ogImage: p.hero || p.image, main });
};
