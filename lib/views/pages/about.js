// À propos : notre histoire.
const { esc, nl, paras, img, pic } = require('../util');
const { icon } = require('../icons');
const { hero, secHead, linkBtn } = require('../ui');
const { page } = require('../chrome');

module.exports = function about(c, { url }) {
  const s = c.settings, a = c.about;
  const main = `
  ${hero({
    kicker: a.label, title: a.title, text: a.text,
    media: img(a.heroImage, '', 'hero__img', { eager: true, fetchpriority: 'high' }),
    actions: linkBtn('#histoire', a.heroButton),
  })}

  <section class="split split--why" id="histoire">
    <div class="split__text">
      ${secHead({ title: a.whyTitle })}
      <div class="t-body prose">${paras(a.whyText)}</div>
    </div>
    <div class="mascot">
      <div class="mascot__img">${pic(a.mascotImage, a.mascotImageMobile, 'Katia, la chatte noire du Chat Caféiné')}</div>
      <div class="mascot__text">
        <h3 class="t-h3">${nl(a.mascotTitle)}</h3>
        <p class="t-body">${esc(a.mascotText)}</p>
      </div>
    </div>
  </section>

  <section class="split split--rev split--place">
    <div class="split__media">${pic(a.placeImage, a.placeImageMobile, 'Le café Chat Caféiné à ' + s.city, 'split__img')}</div>
    <div class="split__text">
      ${secHead({ title: a.placeTitle })}
      <div class="t-body prose">${paras(a.placeText)}</div>
      <p class="note">${icon('store')}<span>${nl(a.placeNote)}</span></p>
    </div>
  </section>

  <section class="sec sec--tight">
    ${secHead({ title: a.valuesTitle })}
    <ul class="values">${a.values.map((v) => `<li>${img(v.icon, '', 'values__img')}<strong>${esc(v.title)}</strong><span>${esc(v.text)}</span></li>`).join('')}</ul>
  </section>`;
  return page(c, { url, name: 'about', title: a.seoTitle, description: a.seoDescription, ogImage: a.heroImage, main });
};
