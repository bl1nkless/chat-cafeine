// Gâteaux sur mesure : formulaire de demande + catalogue des créations.
const { esc, nl, oneLine, wa, img } = require('../util');
const { hero, secHead, field, honeypot, formFooter, linkBtn } = require('../ui');
const { page } = require('../chrome');

module.exports = function cakes(c, { url }) {
  const s = c.settings, k = c.cakes;
  const card = (it) => `<li class="cake" style="--lab:${esc(it.color)};--lab-text:${esc(it.text || '#2b140a')}">
    <button type="button" class="cake__hit" data-cake="${esc(oneLine(it.title))}" aria-label="Commander : ${esc(oneLine(it.title))}"></button>
    <div class="cake__img">${img(it.image, oneLine(it.title), '', { sizes: '(max-width: 959.98px) 50vw, 22vw' })}</div>
    <div class="cake__label">
      <span class="cake__price">${esc(it.price)}</span><i></i>
      <h3 class="t-h3">${nl(it.title)}</h3>${it.note ? `<small>${esc(it.note)}</small>` : ''}
      <span class="cake__cta">${esc(k.orderButton)}</span>
    </div>
  </li>`;

  const form = `<form class="form panel" id="commande" data-cake-form novalidate>
    <h2 class="t-h3">${esc(k.formTitle)}</h2>
    <div class="form-row">
      ${field({ label: k.formName, name: 'name', required: true, autocomplete: 'name', maxlength: 80, placeholder: k.formName })}
      ${field({ label: k.formPhone, name: 'phone', type: 'tel', required: true, autocomplete: 'tel', maxlength: 25, placeholder: '06 12 34 56 78' })}
    </div>
    ${field({ label: k.formRequest, name: 'request', rows: 3, required: true, maxlength: 2000, placeholder: k.formRequestHint })}
    <input type="hidden" name="cake">
    ${honeypot}
    ${formFooter({ submit: k.formSubmit, submitIcon: 'bag', waHref: wa(s, 'Bonjour ! Je souhaite commander un gâteau sur mesure.'), waLabel: k.formWhatsapp, waAttr: 'data-wa-cake', done: k.formSuccess })}
    ${img(k.catImage, '', 'panel__cat')}
  </form>`;

  const main = `
  ${hero({
    kicker: k.kicker, title: k.title, text: k.text, cls: 'hero--arch',
    media: img(k.heroImage, 'Gâteau sur mesure Chat Caféiné', 'hero__img', { eager: true, fetchpriority: 'high' }),
    actions: linkBtn('#commande', k.formTitle),
  })}

  <section class="sec sec--form">
    ${form}
    <div class="steps">
      <h2 class="t-h2">${nl(k.howTitle)}</h2>
      <ol>${k.steps.map((st, i) => `<li><span class="steps__n">${String(i + 1).padStart(2, '0')}</span>${img(st.icon, '', 'steps__icon')}<div><strong>${esc(st.title)}</strong><span>${nl(st.text)}</span></div></li>`).join('')}</ol>
    </div>
  </section>

  <section class="sec sec--alt">
    ${secHead({ kicker: k.listKicker, title: k.listTitle, text: k.listText, align: 'center' })}
    <ul class="cakes">${k.items.map(card).join('')}</ul>
  </section>`;
  return page(c, { url, name: 'cakes', title: k.seoTitle, description: k.seoDescription, ogImage: k.heroImage, main });
};
