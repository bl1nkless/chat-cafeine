// Contact : formulaire + coordonnées, horaires et plan.
const { esc, nl, wa, tel, img, pic } = require('../util');
const { icon } = require('../icons');
const { hero, field, honeypot, formFooter, openStatus } = require('../ui');
const { page } = require('../chrome');

module.exports = function contact(c, { url }) {
  const s = c.settings, k = c.contact;
  const main = `
  ${hero({
    kicker: s.siteName + ' · ' + s.city, title: k.title, text: k.text,
    media: pic(k.heroImage, k.heroImageMobile, s.siteName + ' — café familial à ' + s.city, 'hero__img', { eager: true, fetchpriority: 'high' }),
  })}

  <section class="sec sec--form">
    <form class="form panel" data-contact-form novalidate>
      ${field({ label: k.labelName, name: 'name', required: true, autocomplete: 'name', maxlength: 80, placeholder: k.placeholderName })}
      <div class="form-row">
        ${field({ label: k.labelPhone, name: 'phone', type: 'tel', autocomplete: 'tel', maxlength: 25, placeholder: k.placeholderPhone })}
        ${field({ label: k.labelEmail, name: 'email', type: 'email', required: true, autocomplete: 'email', maxlength: 120, placeholder: k.placeholderEmail })}
      </div>
      ${field({ label: k.labelMessage, name: 'message', rows: 5, required: true, maxlength: 4000, placeholder: k.placeholderMessage })}
      ${honeypot}
      ${formFooter({ submit: k.submit, waHref: wa(s, 'Bonjour Chat Caféiné !'), waLabel: k.whatsapp, done: k.success })}
    </form>
    <aside class="coords">
      <h2 class="t-h3">${esc(k.coordsTitle)}</h2>
      <ul class="coords__list">
        <li>${icon('pinFill')}<div><a href="${esc(s.mapsUrl)}" target="_blank" rel="noopener">${esc(s.addressName)}</a><small>${esc(s.address)}</small></div></li>
        <li>${icon('phone')}<div><a href="${tel(s.phone)}">${esc(s.phone)}</a></div></li>
        <li>${icon('mail')}<div><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></div></li>
        <li>${icon('instagram')}<div><a href="${esc(s.instagram)}" target="_blank" rel="noopener">${esc(s.instagramHandle)}</a></div></li>
        <li>${icon('store')}<div>${esc(s.pickupTitle)}<small>${esc(s.pickupNote)}</small></div></li>
      </ul>
      <h2 class="t-h3">${esc(k.hoursTitle)}</h2>
      <ul class="coords__list"><li>${icon('clock')}<div>${openStatus()}<br>${nl(s.hours)}</div></li></ul>
      <h2 class="t-h3">${esc(k.mapTitle)}</h2>
      <a class="map" href="${esc(s.mapsUrl)}" target="_blank" rel="noopener" aria-label="Ouvrir dans Google Maps">${img(k.mapImage, 'Plan : ' + s.addressName)}<span class="map__cta">${icon('pinFill')} Ouvrir dans Google Maps</span></a>
    </aside>
  </section>

  <section class="band">${pic(k.bandImage, k.bandImageMobile, 'Au plaisir de vous accueillir bientôt au Chat Caféiné !')}</section>`;
  return page(c, { url, name: 'contact', title: k.seoTitle, description: k.seoDescription, main });
};
