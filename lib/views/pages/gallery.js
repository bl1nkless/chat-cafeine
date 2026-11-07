// Galerie photo avec visionneuse.
const { esc, img, photo } = require('../util');
const { icon } = require('../icons');
const { hero } = require('../ui');
const { page } = require('../chrome');

module.exports = function gallery(c, { url }) {
  const g = c.gallery;
  const main = `
  ${hero({ kicker: g.kicker, title: g.title, text: g.text, cls: 'hero--center' })}
  <section class="sec sec--flush">
    <ul class="gallery" data-gallery>${g.images.map((it, i) => `<li><button type="button" data-lightbox="${i}" aria-label="Agrandir : ${esc(it.caption)}">${img(it.image, it.caption, '', { sizes: '(max-width: 959.98px) 50vw, 33vw', 'data-full': photo(it.image, 2560) })}</button>${it.caption ? `<span>${esc(it.caption)}</span>` : ''}</li>`).join('')}</ul>
  </section>
  <div class="lightbox" data-lightbox-view hidden>
    <button type="button" class="lightbox__close" data-lightbox-close aria-label="Fermer">${icon('close')}</button>
    <button type="button" class="lightbox__nav lightbox__prev" data-lightbox-prev aria-label="Précédent">${icon('chevron')}</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button type="button" class="lightbox__nav lightbox__next" data-lightbox-next aria-label="Suivant">${icon('chevron')}</button>
  </div>`;
  return page(c, { url, name: 'gallery', title: g.seoTitle, description: g.seoDescription, main });
};
