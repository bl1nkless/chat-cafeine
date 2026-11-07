// Jeu d'icônes SVG en ligne (trait 24×24, currentColor).
const { esc } = require('./util');

const P = {
  pin: '<path d="M12 21s-6.5-6.1-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.9-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  pinFill: '<path fill="currentColor" stroke="none" d="M12 1.8a7.7 7.7 0 0 0-7.7 7.7c0 5.6 6.6 12 7 12.4a1 1 0 0 0 1.4 0c.4-.4 7-6.8 7-12.4A7.7 7.7 0 0 0 12 1.8Zm0 10.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>',
  bag: '<path d="M5.5 8h13l-1 12.5h-11L5.5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  truck: '<path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 9.5h4l3 3.2v2.8h-7"/><circle cx="6.5" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/><path d="M1 9h4M1 12h3"/>',
  arrow: '<path d="M4 12h15M14 6.5l5.5 5.5-5.5 5.5"/>',
  whatsapp: '<path d="M4.2 19.8l1.1-3.9A8.3 8.3 0 1 1 8.4 19l-4.2.8Z"/><path d="M9 8.3c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.3.6 1.5 2 3 2.6.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.2.4.4 0 .3 0 1-.5 1.5-.5.5-1.4.8-2.2.7-1.4-.2-3.6-1.3-5-3.3-.8-1.1-1.3-2.2-1.2-3.1 0-.6.3-1.1.6-1.3Z" fill="currentColor" stroke="none"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>',
  facebook: '<path fill="currentColor" stroke="none" d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 12 2Z"/>',
  facebookPlain: '<path fill="currentColor" stroke="none" d="M13.6 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.6V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.4H7.7V13h2.7v8h3.2Z"/>',
  tiktok: '<path fill="currentColor" stroke="none" d="M16.6 3h-3.2v12.2a2.7 2.7 0 1 1-2.7-2.7c.3 0 .5 0 .8.1V9.3a6 6 0 1 0 5.1 5.9V9.1a7.6 7.6 0 0 0 4.4 1.4V7.3A4.4 4.4 0 0 1 16.6 3Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3.5 6.5 12 13l8.5-6.5"/>',
  phone: '<path fill="currentColor" stroke="none" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"/>',
  store: '<path fill="currentColor" stroke="none" d="M3 4h18v2H3zM2 7.5h20l-1 4H3zM4 12.5h16V20h-6.5v-4.5h-3V20H4z"/>',
  clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7v5.2l3.3 2"/>',
  send: '<path d="M21 3 10 14M21 3l-6.5 18-4.5-7-7-4.5L21 3Z"/>',
  paw: '<g fill="currentColor" stroke="none"><ellipse cx="12" cy="15.6" rx="4.6" ry="3.9"/><ellipse cx="6" cy="10.2" rx="1.9" ry="2.4"/><ellipse cx="9.6" cy="6.6" rx="1.9" ry="2.5"/><ellipse cx="14.4" cy="6.6" rx="1.9" ry="2.5"/><ellipse cx="18" cy="10.2" rx="1.9" ry="2.4"/></g>',
  heart: '<path d="M12 20s-7.5-4.7-8.6-9.6C2.6 6.9 5 4.5 7.6 4.5c1.9 0 3.4 1.1 4.4 2.7 1-1.6 2.5-2.7 4.4-2.7 2.6 0 5 2.4 4.2 5.9C19.5 15.3 12 20 12 20Z"/>',
  heartFill: '<path fill="currentColor" stroke="none" d="M12 20s-7.5-4.7-8.6-9.6C2.6 6.9 5 4.5 7.6 4.5c1.9 0 3.4 1.1 4.4 2.7 1-1.6 2.5-2.7 4.4-2.7 2.6 0 5 2.4 4.2 5.9C19.5 15.3 12 20 12 20Z"/>',
  leaf: '<path d="M5 19c0-8 5-13.5 14-14 .5 9-5 14-13 14Z"/><path d="M5 19c3-4 6-6.5 9.5-8.5"/>',
  leafFill: '<path fill="currentColor" stroke="none" d="M4.5 19.5C4.5 10.5 10 4.8 20 4.3c.5 10-5.5 15.3-14 15.3l-1.5-.1Zm1.6-.6c2.8-4 6-6.8 9.6-8.7l-.5-.9c-3.8 2-7.2 5-10 9.1l.9.5Z"/>',
  whisk: '<path d="M14.5 9.5 4 20"/><path d="M14.3 9.7c-1.6-1.6-1.7-5.2.6-7 2.4-1.8 6 .2 6.4 2.6.4 2.4-1 5.6-3.7 5.8-1.3.1-2.4-.5-3.3-1.4Z"/><path d="M15.2 8.8c.9-2.6 2.6-4.5 4.9-5.4M15.4 9c2.3-.7 4.6-.4 5.8 1"/>',
  cup: '<path d="M4 9.5h12.5v4.8a5 5 0 0 1-5 5h-2.5a5 5 0 0 1-5-5V9.5Z"/><path d="M16.5 11h1.6a2.4 2.4 0 0 1 0 4.8h-1.9"/><path d="M2.5 21h16"/><path d="M8.2 3.5c-.8 1 .8 1.8 0 3M11.6 3.5c-.8 1 .8 1.8 0 3"/>',
  cupFill: '<path fill="currentColor" stroke="none" d="M3.5 9h13v5.2a5.3 5.3 0 0 1-5.3 5.3H8.8a5.3 5.3 0 0 1-5.3-5.3V9Zm13.5 1.5h1.3a2.9 2.9 0 0 1 0 5.8H16.5v-1.6h1.8a1.3 1.3 0 0 0 0-2.6H17v-1.6ZM2 20.5h16V22H2z"/><path d="M8 3c-.9 1.1.9 2 0 3.3M11.5 3c-.9 1.1.9 2 0 3.3" fill="none"/>',
  home: '<path d="M4 10.5 12 4l8 6.5V20h-5.3v-5.5H9.3V20H4v-9.5Z"/>',
  snow: '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6M9.5 3.8 12 6.3l2.5-2.5M9.5 20.2 12 17.7l2.5 2.5M3.4 10.6l3.4-.9-.9-3.4M20.6 13.4l-3.4.9.9 3.4M5.9 17.7l.9-3.4-3.4-.9M18.1 6.3l-.9 3.4 3.4.9"/>',
  burger: '<path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"/>',
  close: '<path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/>',
  plus: '<path d="M12 6.5v11M6.5 12h11"/>',
  minus: '<path d="M6.5 12h11"/>',
  user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.8-4 3.7-6 7.5-6s6.7 2 7.5 6"/>',
  cake: '<path d="M4 20.5h16M5 20.5v-6.5h14v6.5M5 15.8c1.5 1.2 2.9 1.2 4.4 0 1.5 1.2 2.9 1.2 4.4 0 1.5 1.2 2.9 1.2 4.4 0"/><path d="M7 14V11h10v3M12 11V8"/><path d="M12 4.2c.9.9.9 2 0 2.6-.9-.6-.9-1.7 0-2.6Z"/>',
  bowl: '<path d="M3 11.5h18a9 9 0 0 1-18 0Z"/><path d="M7.5 20h9"/><path d="M14.5 8.2 19 3.5"/><path d="M8.6 8.5c-.8-1 .8-1.8 0-2.9M11.6 8.5c-.8-1 .8-1.8 0-2.9"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  doodleHeart: '<path d="M12.4 20.6C9 16.5 2.9 12.2 3.6 7.4c.5-3.3 4.5-4.6 6.8-2.2.8.8 1.4 2 1.7 3.2.5-1.8 1.6-3.6 3.5-4.2 2.6-.8 5 1.4 4.6 4.3-.6 4.8-5.2 7.7-7.8 12.1Z"/>',
  sparkle: '<path d="M4 4l3 3M2 10h4M10 2v4"/>',
};
const icon = (name, cls = '', title = '') =>
  `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="${title ? 'false' : 'true'}"${title ? ` role="img" aria-label="${esc(title)}"` : ''}>${P[name] || ''}</svg>`;

// Petit cœur dessiné à la main, signature graphique du site.
const doodle = (cls = '') => `<svg class="doodle ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">${P.doodleHeart}</svg>`;

// Brin de feuillage décoratif (miroir avec flip).

module.exports = { P, icon, doodle };
