// Fonctions utilitaires communes à tous les gabarits : échappement, mise en forme, images, liens.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = (s) => esc(s).replace(/\n/g, '<br>');
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const paras = (s) => String(s ?? '').split(/\n\s*\n/).filter(Boolean).map((p) => `<p>${md(p).replace(/\n/g, '<br>')}</p>`).join('');
const oneLine = (s) => String(s ?? '').replace(/\s*\n\s*/g, ' ');
const price = (n) => (Number(n) || 0).toFixed(2).replace('.', ',') + ' €';
const attr = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`)).join(' ');

const wa = (s, text) => `https://wa.me/${String(s.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(text || s.whatsappMessage || '')}`;
const tel = (p) => 'tel:' + String(p || '').replace(/[^\d+]/g, '');

// Photos Unsplash : le CDN redimensionne à la volée, on propose donc plusieurs largeurs (jusqu'à la 4K)
// et le navigateur choisit selon l'écran (Retina, 4K…). Les images locales /img/… restent telles quelles.
const isPhoto = (src) => /^https:\/\/images\.unsplash\.com\//.test(String(src || ''));
const WIDTHS = [400, 640, 960, 1280, 1920, 2560, 3840];
const photo = (src, w) => (isPhoto(src) ? `${src}${src.includes('?') ? '&' : '?'}auto=format&q=80&w=${w}` : src);
const srcset = (src) => WIDTHS.map((w) => `${photo(src, w)} ${w}w`).join(', ');

// <img> paresseuse par défaut ; { eager: true } pour les visuels au-dessus de la ligne de flottaison.
// { sizes } indique la largeur affichée (par défaut : demi-écran sur ordinateur, plein écran sur mobile).
const img = (src, alt = '', cls = '', extra = {}) => {
  if (!src) return '';
  const resp = isPhoto(src) ? { src: photo(src, 1280), srcset: srcset(src), sizes: extra.sizes || '(max-width: 959.98px) 100vw, 50vw' } : { src };
  return `<img ${attr({ ...resp, alt, class: cls || undefined, loading: extra.eager ? 'eager' : 'lazy', decoding: 'async', ...extra, sizes: resp.sizes, eager: undefined })}>`;
};

// <picture> avec variante mobile optionnelle (même point de rupture que la CSS).
const pic = (desk, mob, alt = '', cls = '', extra = {}) => {
  if (!mob || mob === desk) return img(desk, alt, cls, extra);
  return `<picture class="${esc(cls)}"><source media="(max-width: 959.98px)" srcset="${esc(mob)}">${img(desk || mob, alt, '', extra)}</picture>`;
};

module.exports = { esc, nl, md, paras, oneLine, price, attr, wa, tel, img, pic, photo, isPhoto };
