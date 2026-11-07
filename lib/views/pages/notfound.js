// Page 404.
const { hero, linkBtn } = require('../ui');
const { page } = require('../chrome');

module.exports = function notfound(c, { url }) {
  const main = hero({
    kicker: 'Erreur 404', title: 'Oups, page introuvable', cls: 'hero--center',
    text: 'Cette page s’est sauvée comme un chat curieux… Retournez à l’accueil ou découvrez notre menu.',
    actions: linkBtn('/', 'Accueil') + linkBtn('/menu', 'Notre menu', 'btn--outline'),
  });
  return page(c, { url, name: 'notfound', title: 'Page introuvable — ' + c.settings.siteName, main });
};
