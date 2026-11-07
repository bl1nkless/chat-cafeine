// Menu : toute la carte sur une page, avec une barre de rubriques qui reste visible.
const { esc, img } = require('../util');
const { hero, secHead, menuItem, visible } = require('../ui');
const { page } = require('../chrome');

module.exports = function menu(c, { url }) {
  const m = c.menu;
  const groups = c.categories
    .map((cat) => ({ cat, items: c.products.filter((p) => p.category === cat.id && visible(p)) }))
    .filter((x) => x.items.length);

  const nav = `<nav class="cats" aria-label="Rubriques du menu" data-cats>
    <div class="cats__in">${groups.map(({ cat, items }) => `<a href="#${esc(cat.id)}">${esc(cat.title)} <small>${items.length}</small></a>`).join('')}</div>
  </nav>`;

  const sections = groups.map(({ cat, items }) => `<section class="sec sec--menu" id="${esc(cat.id)}" data-cat-section>
      ${secHead({ title: cat.title, text: cat.subtitle })}
      <div class="mlist">${items.map(menuItem).join('')}</div>
    </section>`).join('');

  const main = `
  ${hero({ kicker: m.kicker, title: m.title, text: m.subtitle, media: img(m.catImage, '', 'hero__img hero__img--contain', { eager: true }), cls: 'hero--short' })}
  ${nav}
  ${sections}`;
  return page(c, { url, name: 'menu', title: m.seoTitle, description: m.seoDescription, main });
};
