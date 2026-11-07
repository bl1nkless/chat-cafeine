// Point d'entrée des gabarits : render('home', content, { url }) → HTML.
//
//   util.js    échappement, prix, images
//   icons.js   icônes SVG
//   ui.js      composants partagés (bandeau, titres, cartes produit, formulaires)
//   chrome.js  cadre commun (en-tête, pied de page, panier, menu mobile)
//   pages/     une fonction par page, qui ne décrit que le contenu de <main>
const pages = {
  home: require('./pages/home'),
  about: require('./pages/about'),
  menu: require('./pages/menu'),
  product: require('./pages/product'),
  cakes: require('./pages/cakes'),
  contact: require('./pages/contact'),
  gallery: require('./pages/gallery'),
  notfound: require('./pages/notfound'),
};

function render(name, content, ctx) { return pages[name](content, ctx); }

module.exports = { render };
