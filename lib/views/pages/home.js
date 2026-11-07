// Accueil.
const { esc, nl, oneLine, wa, img, pic } = require('../util');
const { icon } = require('../icons');
const { hero, secHead, byIds, productRail, linkBtn, openStatus } = require('../ui');
const { page } = require('../chrome');

module.exports = function home(c, { url }) {
  const s = c.settings, h = c.home;
  const main = `
  ${hero({
    kicker: h.kicker, title: h.title, text: h.text, heart: true,
    media: pic(h.heroImage, h.heroImageMobile, '', 'hero__img', { eager: true, fetchpriority: 'high' }),
    actions: linkBtn('/menu', h.ctaMenu) + linkBtn(wa(s), h.ctaWhatsapp, 'btn--outline', 'whatsapp', { target: '_blank', rel: 'noopener' }),
    after: `<p class="hero__info">
      <a href="${esc(s.mapsUrl)}" target="_blank" rel="noopener">${esc(oneLine(s.addressShort))}</a>
      ${openStatus()}
      <span>${esc(s.pickupTitle)}</span>
    </p>`,
  })}

  <section class="sec" id="incontournables">
    ${secHead({ title: h.featuredTitle, text: h.featuredText, link: { href: '/menu', label: h.featuredLink } })}
    ${productRail(byIds(c, h.featured), { desc: true })}
  </section>

  <section class="split split--story" id="histoire">
    <div class="split__text">
      ${secHead({ title: h.storyTitle })}
      <p class="t-body">${esc(h.storyText)}</p>
      ${linkBtn('/a-propos', h.storyButton, 'btn--outline')}
    </div>
    <div class="split__media">${pic(h.storyImage, h.storyImageMobile, '', 'split__img')}</div>
  </section>

  <section class="sec sec--alt" id="boissons">
    ${secHead({ title: h.drinksTitle, text: h.drinksText, link: { href: '/menu#boissons', label: h.drinksLink } })}
    ${productRail(byIds(c, h.drinks), { desc: true })}
  </section>

  <section class="split split--visit">
    <div class="split__text">
      ${secHead({ title: h.visitTitle })}
      <p class="t-body">${esc(h.visitText)}</p>
      <dl class="facts">
        <div><dt>Adresse</dt><dd><a href="${esc(s.mapsUrl)}" target="_blank" rel="noopener">${nl(s.addressShort)}</a></dd></div>
        <div><dt>Horaires</dt><dd>${openStatus()}<br>${nl(s.hours)}</dd></div>
        <div><dt>Commandes</dt><dd>${esc(s.pickupTitle)}<br>${esc(s.pickupNote)}</dd></div>
      </dl>
      <div class="btn-row">
        ${linkBtn(s.mapsUrl, h.visitButtonMobile, 'btn--dark', 'pinFill', { target: '_blank', rel: 'noopener' })}
        ${linkBtn('/contact', h.visitButton, 'btn--outline')}
      </div>
    </div>
    <div class="split__media">${pic(h.visitImage, h.visitImageMobile, 'Notre café à ' + s.city, 'split__img')}${img(h.visitCat, '', 'h-visit__cat only-d')}</div>
  </section>`;
  return page(c, { url, name: 'home', title: h.seoTitle, description: h.seoDescription, ogImage: h.heroImage, main });
};
