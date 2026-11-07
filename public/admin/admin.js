// Админка Chat Caféiné: заказы, заявки, сообщения и редактирование всего содержимого сайта.
(() => {
  const app = document.getElementById('app');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const euro = (n) => (Number(n) || 0).toFixed(2).replace('.', ',') + ' €';
  const clone = (v) => JSON.parse(JSON.stringify(v));

  const state = { content: null, saved: '', view: 'orders', productId: null, filter: 'all', counts: {}, defaultPassword: false };

  async function api(path, opts = {}) {
    const r = await fetch('/api/admin' + path, {
      method: opts.method || 'GET',
      headers: opts.body ? { 'Content-Type': 'application/json' } : {},
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && path !== '/login') { renderLogin(); throw new Error('auth'); }
    if (!r.ok) throw new Error(j.error || 'Ошибка');
    return j;
  }

  let toastT;
  function toast(msg, bad) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.toggle('bad', !!bad); t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }

  // ---------- Доступ по пути в объекте ----------
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  function set(obj, path, val) {
    const ks = path.split('.'); const last = ks.pop();
    const target = ks.reduce((o, k) => (o[k] ??= /^\d+$/.test(k) ? [] : {}), obj);
    target[last] = val;
  }
  const dirty = () => JSON.stringify(state.content) !== state.saved;
  function markDirty() { document.querySelector('.savebar')?.classList.toggle('on', dirty()); }

  // ---------- Поля формы ----------
  // f: { k: путь, l: подпись, t: тип, h: подсказка, w: на всю ширину, fields: для списков }
  function fieldHtml(f, base) {
    const path = base ? base + '.' + f.k : f.k;
    const v = get(state.content, path);
    const id = 'f_' + path.replace(/\W/g, '_');
    const label = `<span>${esc(f.l)}</span>`;
    const hint = f.h ? `<small>${esc(f.h)}</small>` : '';
    const wide = f.w || ['textarea', 'list', 'image', 'products', 'lines'].includes(f.t) ? ' wide' : '';
    switch (f.t) {
      case 'textarea':
        return `<label class="field${wide}">${label}<textarea data-path="${esc(path)}" rows="${f.rows || 3}">${esc(v)}</textarea>${hint}</label>`;
      case 'number':
        return `<label class="field">${label}<input type="number" step="${f.step || '0.1'}" data-path="${esc(path)}" data-num value="${esc(v)}">${hint}</label>`;
      case 'check':
        return `<label class="field check"><input type="checkbox" data-path="${esc(path)}" data-bool ${v !== false ? 'checked' : ''}> ${esc(f.l)}</label>`;
      case 'time':
        return `<label class="field">${label}<input type="time" data-path="${esc(path)}" value="${esc(v)}">${hint}</label>`;
      case 'color':
        return `<label class="field">${label}<div class="row"><input type="color" data-path="${esc(path)}" value="${esc(v || '#e6baa6')}"> <code>${esc(v)}</code></div>${hint}</label>`;
      case 'select':
        return `<label class="field">${label}<select data-path="${esc(path)}">${f.options().map((o) => `<option value="${esc(o.value)}" ${o.value === v ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>${hint}</label>`;
      case 'image':
        return `<div class="field${wide}">${label}<div class="img-field"><img src="${esc(v || '')}" alt="" onerror="this.style.visibility='hidden'" onload="this.style.visibility=''">
          <div class="img-actions"><div class="row"><button type="button" class="btn btn--sm" data-upload="${esc(path)}">Загрузить фото</button>${v ? `<button type="button" class="btn btn--sm btn--ghost" data-clear="${esc(path)}">Убрать</button>` : ''}</div>
          <input type="text" data-path="${esc(path)}" value="${esc(v)}" placeholder="/img/... или ссылка"></div></div>${hint}</div>`;
      case 'days': {
        const names = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const arr = Array.isArray(v) ? v : [];
        return `<div class="field wide">${label}<div class="row">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<label class="check"><input type="checkbox" data-day="${d}" data-days="${esc(path)}" ${arr.includes(d) ? 'checked' : ''}> ${names[d]}</label>`).join('')}</div>${hint}</div>`;
      }
      case 'lines':
        return `<label class="field wide">${label}<textarea data-path="${esc(path)}" data-lines rows="${f.rows || 3}">${esc((v || []).join('\n'))}</textarea><small>${esc(f.h || 'Каждая строка — отдельный пункт')}</small></label>`;
      case 'products': {
        const ids = Array.isArray(v) ? v : [];
        const all = state.content.products;
        return `<div class="field wide">${label}
          ${ids.map((id, i) => `<div class="row" style="margin-bottom:6px"><select data-ref="${esc(path)}" data-i="${i}">${all.map((p) => `<option value="${esc(p.id)}" ${p.id === id ? 'selected' : ''}>${esc(p.name)} — ${euro(p.price)}</option>`).join('')}</select>
            <button type="button" class="btn btn--sm btn--ghost" data-ref-del="${esc(path)}" data-i="${i}">✕</button></div>`).join('')}
          <div><button type="button" class="btn btn--sm" data-ref-add="${esc(path)}">+ Добавить товар</button></div>${hint}</div>`;
      }
      case 'list': {
        const arr = Array.isArray(v) ? v : [];
        return `<div class="field wide">${label}${hint}
          ${arr.map((_, i) => `<div class="list-item"><div class="list-item__bar"><strong>${esc(f.item || 'Пункт')} ${i + 1}${f.title ? ' — ' + esc(get(state.content, path + '.' + i + '.' + f.title) || '') : ''}</strong>
            <div class="list-item__tools"><button type="button" class="btn btn--sm btn--ghost" data-move="${esc(path)}" data-i="${i}" data-d="-1" title="Выше">↑</button><button type="button" class="btn btn--sm btn--ghost" data-move="${esc(path)}" data-i="${i}" data-d="1" title="Ниже">↓</button><button type="button" class="btn btn--sm btn--danger" data-del="${esc(path)}" data-i="${i}">Удалить</button></div></div>
            <div class="grid">${f.fields.map((ff) => fieldHtml(ff, path + '.' + i)).join('')}</div></div>`).join('')}
          <div><button type="button" class="btn btn--sm" data-add-item="${esc(path)}" data-tpl='${esc(JSON.stringify(f.tpl || {}))}'>+ Добавить</button></div></div>`;
      }
      default:
        return `<label class="field${wide}">${label}<input type="text" id="${id}" data-path="${esc(path)}" value="${esc(v)}">${hint}</label>`;
    }
  }
  const card = (title, fields, base, extra = '') => `<section class="card"><h3>${esc(title)}${extra}</h3><div class="grid">${fields.map((f) => fieldHtml(f, base)).join('')}</div></section>`;

  // ---------- Схемы разделов ----------
  const T = (k, l, h) => ({ k, l, h });
  const A = (k, l, h, rows) => ({ k, l, h, t: 'textarea', rows });
  const IMG = (k, l, h) => ({ k, l, h, t: 'image' });
  const iconHint = 'Иконка: pin, bag, whatsapp, truck, whisk, leaf, heart, cup, bowl, paw, home, snow, clock, store, phone, mail';
  const navList = (k, l) => ({ k, l, t: 'list', item: 'Ссылка', title: 'label', tpl: { label: 'Новая', href: '/' }, fields: [T('label', 'Текст'), T('href', 'Адрес', 'Например /menu или /contact')] });
  const seo = [T('seoTitle', 'Заголовок вкладки (SEO)'), A('seoDescription', 'Описание для Google (SEO)', '', 2)];

  const pages = {
    home: () => [
      card('Первый экран', [T('kicker', 'Надзаголовок'), A('title', 'Заголовок', 'Перенос строки = новая строка', 2), A('text', 'Текст'), T('ctaMenu', 'Кнопка «Меню»'), T('ctaWhatsapp', 'Кнопка WhatsApp'),
        IMG('heroImage', 'Фото (компьютер)'), IMG('heroImageMobile', 'Фото (телефон)')], 'home'),
      card('Наши хиты', [T('featuredTitle', 'Заголовок'), A('featuredText', 'Текст', '', 2), T('featuredLink', 'Ссылка «Всё меню»'), { k: 'featured', l: 'Товары в блоке', t: 'products', h: 'На компьютере показываются первые 4, на телефоне — все с прокруткой' }], 'home'),
      card('Наша история', [T('storyTitle', 'Заголовок'), A('storyText', 'Текст', '', 4), T('storyButton', 'Кнопка'), IMG('storyImage', 'Фото (компьютер)'), IMG('storyImageMobile', 'Фото (телефон)')], 'home'),
      card('Напитки', [T('drinksTitle', 'Заголовок'), A('drinksText', 'Текст', '', 2), T('drinksLink', 'Ссылка'), { k: 'drinks', l: 'Напитки в блоке', t: 'products' }], 'home'),
      card('Ждём вас в Шартре', [A('visitTitle', 'Заголовок', '', 2), A('visitText', 'Текст'), T('visitButton', 'Кнопка «Контакты»'), T('visitButtonMobile', 'Кнопка «Google Maps»'), IMG('visitImage', 'Фото (компьютер)'), IMG('visitImageMobile', 'Фото (телефон)'), IMG('visitCat', 'Котик')], 'home'),
      card('SEO', seo, 'home'),
    ],
    about: () => [
      card('Первый экран', [T('label', 'Метка'), A('title', 'Заголовок', '', 2), A('text', 'Текст'), T('heroButton', 'Кнопка'), IMG('heroImage', 'Фото')], 'about'),
      card('Почему Chat Caféiné', [T('whyTitle', 'Заголовок'), A('whyText', 'Текст', 'Пустая строка между абзацами = новый абзац', 7)], 'about'),
      card('Талисман', [A('mascotTitle', 'Заголовок', '', 2), A('mascotText', 'Текст', '', 4), IMG('mascotImage', 'Картинка (компьютер)'), IMG('mascotImageMobile', 'Картинка (телефон)')], 'about'),
      card('Место', [T('placeTitle', 'Заголовок'), A('placeText', 'Текст', '**слово** — жирным. Пустая строка = новый абзац', 8), A('placeNote', 'Плашка внизу', '', 2), IMG('placeImage', 'Фото (компьютер)'), IMG('placeImageMobile', 'Фото (телефон)')], 'about'),
      card('Ценности', [T('valuesTitle', 'Заголовок'), { k: 'values', l: '', t: 'list', item: 'Ценность', title: 'title', tpl: { title: '', text: '', icon: '' }, fields: [T('title', 'Заголовок'), T('text', 'Текст'), IMG('icon', 'Иконка')] }], 'about'),
      card('SEO', seo, 'about'),
    ],
    menuPage: () => [
      card('Шапка меню', [T('kicker', 'Надзаголовок'), T('title', 'Заголовок'), T('subtitle', 'Подзаголовок'), IMG('catImage', 'Котик')], 'menu'),
      card('SEO', seo, 'menu'),
    ],
    categories: () => [
      `<p class="hint">Разделы меню и их порядок. В меню показываются все видимые товары раздела. Код раздела менять не нужно — он связывает товары с разделом.</p>`,
      card('Разделы', [{ k: 'categories', l: '', t: 'list', item: 'Раздел', title: 'title', tpl: { id: 'nouveau', title: 'Nouveau', subtitle: '', kicker: '' }, fields: [T('title', 'Название'), T('subtitle', 'Подзаголовок'), T('kicker', 'Надзаголовок на странице товара'), T('id', 'Код раздела (латиницей)')] }]),
    ],
    productCommon: () => [
      card('Тексты на страницах товаров', [T('ingredientsTitle', 'Заголовок ингредиентов'), T('infoTitle', 'Заголовок информации'), T('pairingsTitle', 'Заголовок «Попробуйте также»'), T('addToCart', 'Кнопка «В корзину»'), T('whatsapp', 'Кнопка WhatsApp'), { k: 'defaultPairings', l: '«Попробуйте также» по умолчанию', t: 'products' }], 'product'),
    ],
    cakesPage: () => [
      card('Первый экран и форма', [T('kicker', 'Надзаголовок'), A('title', 'Заголовок', '', 2), A('text', 'Текст'), IMG('heroImage', 'Фото торта (арка)'), T('formTitle', 'Заголовок формы'), T('formName', 'Поле «Имя»'), T('formPhone', 'Поле «Телефон»'), T('formRequest', 'Поле «Запрос»'), T('formRequestHint', 'Подсказка запроса'), T('formSubmit', 'Кнопка отправки'), T('formWhatsapp', 'Кнопка WhatsApp'), A('formSuccess', 'Сообщение после отправки', '', 2), IMG('catImage', 'Котик у формы')], 'cakes'),
      card('Список тортов', [T('listKicker', 'Надзаголовок'), T('listTitle', 'Заголовок'), A('listText', 'Текст', '', 2), T('orderButton', 'Кнопка «Заказать»'),
        { k: 'items', l: '', t: 'list', item: 'Торт', title: 'title', tpl: { title: 'Gâteau', price: 'À partir de 35 €', note: '', color: '#e6baa6', text: '#2b140a', image: '' }, fields: [A('title', 'Название', '', 2), T('price', 'Цена'), T('note', 'Примечание'), { k: 'color', l: 'Цвет плашки', t: 'color' }, { k: 'text', l: 'Цвет текста', t: 'color' }, IMG('image', 'Фото')] }], 'cakes'),
      card('Как это работает', [A('howTitle', 'Заголовок', '', 2), { k: 'steps', l: '', t: 'list', item: 'Шаг', title: 'title', tpl: { title: '', text: '', icon: '' }, fields: [T('title', 'Заголовок'), A('text', 'Текст', '', 2), IMG('icon', 'Иконка')] }], 'cakes'),
      card('SEO', seo, 'cakes'),
    ],
    contactPage: () => [
      card('Шапка', [IMG('heroImage', 'Баннер (компьютер)'), IMG('heroImageMobile', 'Баннер (телефон)'), T('title', 'Заголовок'), A('text', 'Текст')], 'contact'),
      card('Форма', [T('labelName', 'Подпись «Имя»'), T('placeholderName', 'Подсказка'), T('labelPhone', 'Подпись «Телефон»'), T('placeholderPhone', 'Подсказка'), T('labelEmail', 'Подпись «E-mail»'), T('placeholderEmail', 'Подсказка'), T('labelMessage', 'Подпись «Сообщение»'), T('placeholderMessage', 'Подсказка'), T('submit', 'Кнопка'), T('whatsapp', 'Кнопка WhatsApp'), A('success', 'Сообщение после отправки', '', 2)], 'contact'),
      card('Блоки справа и низ', [T('coordsTitle', 'Заголовок «Координаты»'), T('hoursTitle', 'Заголовок «Часы»'), T('mapTitle', 'Заголовок «Карта»'), IMG('mapImage', 'Картинка карты', 'Клик ведёт на Google Maps из настроек'), IMG('bandImage', 'Полоса внизу (компьютер)'), IMG('bandImageMobile', 'Полоса внизу (телефон)')], 'contact'),
      card('SEO', seo, 'contact'),
    ],
    gallery: () => [
      card('Галерея', [T('kicker', 'Надзаголовок'), T('title', 'Заголовок'), A('text', 'Текст', '', 2), { k: 'images', l: 'Фотографии', t: 'list', item: 'Фото', title: 'caption', tpl: { image: '', caption: '' }, fields: [IMG('image', 'Фото'), T('caption', 'Подпись')] }], 'gallery'),
      card('SEO', seo, 'gallery'),
    ],
    settings: () => [
      card('Контакты', [T('siteName', 'Название'), T('city', 'Город'), T('phone', 'Телефон'), T('whatsapp', 'WhatsApp (номер)', 'Цифрами с кодом страны, например 33612345678'), A('whatsappMessage', 'Текст сообщения WhatsApp по умолчанию', '', 2), T('email', 'E-mail'), T('addressName', 'Название точки'), T('address', 'Адрес одной строкой'), A('addressShort', 'Адрес в 2 строки', '', 2), { k: 'mapsUrl', l: 'Ссылка Google Maps', w: true }], 'settings'),
      card('Часы работы и самовывоз', [A('hours', 'Часы (текст на сайте)', '', 2), { k: 'openDays', l: 'Дни, когда можно забрать заказ', t: 'days' }, { k: 'openFrom', l: 'Открытие', t: 'time' }, { k: 'openTo', l: 'Закрытие', t: 'time' }, T('pickupTitle', 'Самовывоз'), T('pickupNote', 'Примечание'), A('cartNote', 'Подсказка в корзине', '', 2)], 'settings'),
      card('Соцсети', [T('instagram', 'Instagram (ссылка)'), T('instagramHandle', 'Instagram (ник)'), T('facebook', 'Facebook (ссылка)'), T('tiktok', 'TikTok (ссылка)', 'Пусто — значок не показывается')], 'settings'),
      card('Объявления и подписи', [{ k: 'announcement', l: 'Строка объявлений над шапкой', t: 'lines', h: 'Одна строка = одно объявление. На телефоне видно только первое' }, T('copyright', 'Копирайт в подвале')], 'settings'),
      card('Логотипы', [IMG('logos.script', 'Логотип в шапке'), IMG('logos.scriptLight', 'Светлый логотип в подвале'), IMG('logos.badge', 'Круглый значок (иконка вкладки)')], 'settings'),
      card('Меню навигации', [navList('nav', 'Пункты меню — одинаковые в шапке, подвале и мобильном меню')], 'settings'),
      card('Уведомления в Telegram', [T('telegramToken', 'Токен бота', 'Создайте бота у @BotFather и вставьте токен'), T('telegramChatId', 'Chat ID', 'Ваш ID (узнать у @userinfobot) или ID группы')], 'settings', ` <button type="button" class="btn btn--sm" data-action="tg-test">Проверить</button>`),
    ],
  };

  // ---------- Товары ----------
  function productsView() {
    const c = state.content;
    const cats = c.categories;
    const list = c.products.map((p, i) => ({ p, i })).filter(({ p }) => state.filter === 'all' || p.category === state.filter);
    return `<div class="filters"><button class="chip ${state.filter === 'all' ? 'on' : ''}" data-filter="all">Все (${c.products.length})</button>${cats.map((k) => `<button class="chip ${state.filter === k.id ? 'on' : ''}" data-filter="${esc(k.id)}">${esc(k.title)} (${c.products.filter((p) => p.category === k.id).length})</button>`).join('')}</div>
    <section class="card"><h3>Товары <button class="btn btn--sm btn--dark" data-action="new-product">+ Новый товар</button></h3>
    <p class="hint">Цену и видимость можно менять прямо здесь. Порядок стрелками = порядок в меню.</p>
    <table class="prod-table"><thead><tr><th></th><th>Название</th><th class="hide-m">Раздел</th><th>Цена, €</th><th>На сайте</th><th></th></tr></thead><tbody>
    ${list.map(({ p, i }) => `<tr class="${p.visible === false ? 'hidden' : ''}">
      <td><img src="${esc(p.image)}" alt=""></td>
      <td><strong>${esc(p.name)}</strong><br><a href="/produit/${esc(p.id)}" target="_blank" style="font-size:12px">открыть ↗</a></td>
      <td class="hide-m">${esc(cats.find((k) => k.id === p.category)?.title || p.category)}</td>
      <td><input type="number" step="0.1" min="0" data-path="products.${i}.price" data-num value="${esc(p.price)}"></td>
      <td><input type="checkbox" class="check" data-path="products.${i}.visible" data-bool ${p.visible !== false ? 'checked' : ''}></td>
      <td><div class="row"><button class="btn btn--sm" data-edit="${esc(p.id)}">Изменить</button><button class="btn btn--sm btn--ghost" data-move="products" data-i="${i}" data-d="-1">↑</button><button class="btn btn--sm btn--ghost" data-move="products" data-i="${i}" data-d="1">↓</button></div></td>
    </tr>`).join('')}</tbody></table></section>`;
  }

  function productEditor() {
    const c = state.content;
    const i = c.products.findIndex((p) => p.id === state.productId);
    if (i < 0) { state.view = 'products'; return productsView(); }
    const b = 'products.' + i;
    const p = c.products[i];
    return `<div class="row" style="margin-bottom:12px"><button class="btn" data-view="products">← Все товары</button><a class="btn" href="/produit/${esc(p.id)}" target="_blank">Открыть на сайте ↗</a><button class="btn btn--danger" data-action="del-product" style="margin-left:auto">Удалить товар</button></div>
    ${card('Основное', [T('name', 'Название'), { k: 'price', l: 'Цена, €', t: 'number' }, { k: 'category', l: 'Раздел', t: 'select', options: () => c.categories.map((k) => ({ value: k.id, label: k.title })) }, { k: 'visible', l: 'Показывать на сайте', t: 'check' },
      IMG('image', 'Фото для карточек'), IMG('hero', 'Большое фото на странице товара', 'Если пусто — используется фото карточки'), IMG('cutout', 'Фото без фона (корзина)'),
      T('kicker', 'Надзаголовок', 'Например «Cinnamon roll». Пусто — из раздела'), T('title', 'Крупный заголовок', 'Пусто — название'),
      A('tagline', 'Короткое описание (карточки на главной)', '', 2), A('description', 'Описание', '', 3), T('measure', 'Вес / объём', 'Например «Poids : 160 g»')], b)}
    ${card('Ингредиенты', [{ k: 'ingredients', l: '', t: 'list', item: 'Ингредиент', title: 'name', tpl: { name: '', text: '', image: '' }, fields: [T('name', 'Название'), T('text', 'Описание'), IMG('image', 'Фото')] }], b)}
    ${card('Состав «в деталях» (слои)', [T('layers.kicker', 'Надзаголовок'), T('layers.title', 'Заголовок'), IMG('layers.image', 'Фото со слоями', 'Пусто — блок скрыт'), IMG('layers.catImage', 'Котик рядом с заголовком'),
      { k: 'layers.items', l: 'Подписи', t: 'list', item: 'Слой', title: 'title', tpl: { title: '', text: '', dotY: 50, labelY: 50 }, fields: [T('title', 'Название'), A('text', 'Описание', '', 2), { k: 'dotY', l: 'Высота точки, %', t: 'number', step: '0.5' }, { k: 'labelY', l: 'Высота подписи, %', t: 'number', step: '0.5' }] }], b)}
    ${card('Практическая информация', [{ k: 'info', l: '', t: 'list', item: 'Пункт', title: 'title', tpl: { title: '', text: '' }, fields: [T('title', 'Заголовок'), A('text', 'Текст', '', 2)] }], b)}
    ${card('Попробуйте также', [{ k: 'pairings', l: 'Товары', t: 'products', h: 'Пусто — берутся товары по умолчанию' }], b)}`;
  }

  // ---------- Входящие ----------
  const statusNames = { new: 'Новый', confirmed: 'Подтверждён', ready: 'Готов', done: 'Выдан', cancelled: 'Отменён' };
  const fmtDate = (s) => new Date(s).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const telLink = (p) => `<a href="tel:${esc(String(p).replace(/[^\d+]/g, ''))}">${esc(p)}</a> · <a href="https://wa.me/${esc(String(p).replace(/\D/g, '').replace(/^0/, '33'))}" target="_blank">WhatsApp</a>`;
  async function inboxView(box) {
    const items = await api('/inbox/' + box);
    const titles = { orders: 'Заказы', cakes: 'Заявки на торты', messages: 'Сообщения' };
    const body = items.length ? items.map((r) => {
      let content = '';
      if (box === 'orders') {
        const d = r.pickupDate ? new Date(r.pickupDate + 'T12:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }) : '—';
        content = `<p><strong>Самовывоз:</strong> ${esc(d)} ${esc(r.pickupTime || '')}</p><ul>${r.items.map((it) => `<li>${it.qty} × ${esc(it.name)} — ${euro(it.price * it.qty)}</li>`).join('')}</ul><p><strong>Итого: ${euro(r.total)}</strong></p>${r.note ? `<div class="msg">${esc(r.note)}</div>` : ''}`;
      } else if (box === 'cakes') content = `${r.cake ? `<p><strong>Модель:</strong> ${esc(r.cake)}</p>` : ''}<div class="msg">${esc(r.request)}</div>`;
      else content = `<p><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></p><div class="msg">${esc(r.message)}</div>`;
      return `<article class="inbox-item ${r.status === 'new' ? 'new' : ''}"><header><h4>№${r.number} · ${esc(r.name)}</h4><span class="status ${esc(r.status)}">${statusNames[r.status] || r.status}</span><time>${fmtDate(r.createdAt)}</time></header>
        <p>${r.phone ? telLink(r.phone) : ''}</p>${content}
        <footer><select data-status="${esc(box)}" data-id="${esc(r.id)}">${Object.entries(statusNames).filter(([k]) => box === 'orders' || ['new', 'done', 'cancelled'].includes(k)).map(([k, v]) => `<option value="${k}" ${k === r.status ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <input type="text" placeholder="Заметка для себя" value="${esc(r.adminNote || '')}" data-note="${esc(box)}" data-id="${esc(r.id)}" style="flex:1;min-width:160px">
        <button class="btn btn--sm btn--danger" data-remove="${esc(box)}" data-id="${esc(r.id)}">Удалить</button></footer></article>`;
    }).join('') : `<div class="empty">Пока ничего нет. Новые ${titles[box].toLowerCase()} появятся здесь.</div>`;
    return `<p class="hint">Обновляется автоматически каждые 30 секунд. Для мгновенных уведомлений на телефон подключите Telegram в «Настройках».</p>${body}`;
  }

  function securityView() {
    return `<section class="card"><h3>Сменить пароль</h3><form data-form="password" class="grid">
      <label class="field"><span>Текущий пароль</span><input type="password" name="current" required autocomplete="current-password"></label>
      <label class="field"><span>Новый пароль</span><input type="password" name="next" required minlength="6" autocomplete="new-password"></label>
      <div class="field wide"><button class="btn btn--dark" type="submit">Сохранить пароль</button></div></form></section>
    <section class="card"><h3>Резервная копия</h3><p class="hint">Сайт сам хранит 30 последних версий в папке data/backups. Здесь можно скачать копию или восстановить из файла.</p>
      <div class="row"><button class="btn" data-action="export">Скачать копию (JSON)</button><label class="btn">Загрузить из файла<input type="file" accept="application/json" data-import hidden></label>
      <button class="btn btn--danger" data-action="reset" style="margin-left:auto">Вернуть всё как в макете</button></div></section>`;
  }

  // ---------- Навигация ----------
  const NAV = [
    ['Входящие', [['orders', 'Заказы', 'orders'], ['cakes', 'Заявки на торты', 'cakes'], ['messages', 'Сообщения', 'messages']]],
    ['Каталог', [['products', 'Товары'], ['categories', 'Разделы меню'], ['productCommon', 'Страница товара']]],
    ['Страницы', [['home', 'Главная'], ['about', 'О нас'], ['menuPage', 'Меню'], ['cakesPage', 'Торты на заказ'], ['contactPage', 'Контакты'], ['gallery', 'Галерея']]],
    ['Система', [['settings', 'Настройки'], ['security', 'Пароль и копии']]],
  ];
  const titleOf = (v) => NAV.flatMap((g) => g[1]).find((x) => x[0] === v)?.[1] || 'Товар';

  async function render() {
    const v = state.view;
    let html;
    if (['orders', 'cakes', 'messages'].includes(v)) html = await inboxView(v);
    else if (v === 'products') html = productsView();
    else if (v === 'product') html = productEditor();
    else if (v === 'security') html = securityView();
    else html = pages[v]().join('');
    const sy = scrollY;
    app.innerHTML = `<div class="layout">
      <aside class="side"><div class="side__brand"><img src="${esc(state.content.settings.logos.badge)}" alt="">Chat Caféiné</div>
        ${NAV.map(([g, items]) => `<h4>${g}</h4>${items.map(([k, l, c]) => `<button class="${k === v || (v === 'product' && k === 'products') ? 'on' : ''}" data-view="${k}">${l}${c && state.counts[c] ? `<span class="badge">${state.counts[c]}</span>` : ''}</button>`).join('')}`).join('')}
        <div class="side__foot"><a href="/" target="_blank">Открыть сайт ↗</a><button data-action="logout">Выйти</button></div></aside>
      <main class="main">
        <div class="mobile-nav"><select data-mnav>${NAV.flatMap(([, items]) => items).map(([k, l, c]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${l}${c && state.counts[c] ? ` (${state.counts[c]})` : ''}</option>`).join('')}</select></div>
        ${state.defaultPassword ? `<div class="notice">⚠️ Установлен пароль по умолчанию. Смените его в разделе «Пароль и копии».</div>` : ''}
        <div class="topline"><div><h1>${esc(v === 'product' ? (state.content.products.find((p) => p.id === state.productId)?.name || 'Товар') : titleOf(v))}</h1></div></div>
        ${html}
      </main>
      <div class="savebar ${dirty() ? 'on' : ''}"><span>Есть несохранённые изменения</span><button class="btn" data-action="revert">Отменить</button><button class="btn btn--dark" data-action="save">Сохранить и опубликовать</button></div>
    </div>`;
    if (state.keepScroll) scrollTo(0, sy); else scrollTo(0, 0);
    state.keepScroll = false;
  }
  const rerender = () => { state.keepScroll = true; render(); };
  function go(view) {
    if (['orders', 'cakes', 'messages', 'security'].includes(view) && dirty()) {
      if (!confirm('Есть несохранённые изменения. Перейти без сохранения?')) return;
      state.content = JSON.parse(state.saved);
    }
    state.view = view; render();
  }

  // ---------- События ----------
  app.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.path) {
      let val = el.value;
      if (el.dataset.num !== undefined) val = el.value === '' ? 0 : Number(el.value);
      if (el.dataset.bool !== undefined) val = el.checked;
      if (el.dataset.lines !== undefined) val = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
      set(state.content, el.dataset.path, val);
      if (el.closest('.img-field')) el.closest('.img-field').querySelector('img').src = val;
      if (el.type === 'color') el.nextElementSibling.textContent = val;
      markDirty();
    }
  });
  app.addEventListener('change', async (e) => {
    const el = e.target;
    if (el.dataset.ref) { get(state.content, el.dataset.ref)[el.dataset.i] = el.value; markDirty(); }
    if (el.dataset.days) {
      const days = [...app.querySelectorAll(`[data-days="${el.dataset.days}"]`)].filter((x) => x.checked).map((x) => Number(x.dataset.day));
      set(state.content, el.dataset.days, days); markDirty();
    }
    if (el.dataset.path && el.type === 'checkbox') { set(state.content, el.dataset.path, el.checked); markDirty(); if (state.view === 'products') rerender(); }
    if (el.dataset.mnav !== undefined) go(el.value);
    if (el.dataset.status) {
      await api(`/inbox/${el.dataset.status}/${el.dataset.id}`, { method: 'PATCH', body: { status: el.value } });
      await refreshCounts(); toast('Статус обновлён'); rerender();
    }
    if (el.dataset.note) { await api(`/inbox/${el.dataset.note}/${el.dataset.id}`, { method: 'PATCH', body: { adminNote: el.value } }); toast('Заметка сохранена'); }
    if (el.dataset.import !== undefined && el.files[0]) {
      try {
        const data = JSON.parse(await el.files[0].text());
        if (!data.settings || !Array.isArray(data.products)) throw new Error('Это не файл резервной копии сайта');
        state.content = data; rerender(); toast('Файл загружен — нажмите «Сохранить»');
      } catch (ex) { toast(ex.message, true); }
    }
  });
  app.addEventListener('submit', async (e) => {
    const f = e.target;
    if (f.dataset.form === 'password') {
      e.preventDefault();
      try { await api('/password', { method: 'POST', body: Object.fromEntries(new FormData(f)) }); state.defaultPassword = false; toast('Пароль изменён'); render(); }
      catch (ex) { toast(ex.message, true); }
    }
  });

  function pickImage(path) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      toast('Загрузка…');
      try {
        const data = await compress(file);
        const r = await api('/upload', { method: 'POST', body: { name: file.name, data } });
        set(state.content, path, r.url); markDirty(); rerender(); toast('Фото загружено — не забудьте сохранить');
      } catch (ex) { toast(ex.message, true); }
    };
    inp.click();
  }
  // Сжимаем фото в браузере до 2000px и WebP, чтобы сайт оставался быстрым.
  function compress(file) {
    return new Promise((resolve, reject) => {
      if (file.type === 'image/gif') { const fr = new FileReader(); fr.onload = () => resolve(fr.result); fr.onerror = reject; fr.readAsDataURL(file); return; }
      const im = new Image();
      im.onload = () => {
        const max = 2000, k = Math.min(1, max / Math.max(im.width, im.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        let out = cv.toDataURL('image/webp', 0.86);
        if (!out.startsWith('data:image/webp')) out = cv.toDataURL('image/jpeg', 0.86);
        URL.revokeObjectURL(im.src); resolve(out);
      };
      im.onerror = () => reject(new Error('Не удалось прочитать изображение'));
      im.src = URL.createObjectURL(file);
    });
  }

  const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'produit';

  app.addEventListener('click', async (e) => {
    const t = e.target.closest('button, [data-view]');
    if (!t) return;
    const d = t.dataset;
    if (d.view) return go(d.view);
    if (d.filter) { state.filter = d.filter; return rerender(); }
    if (d.edit) { state.productId = d.edit; state.view = 'product'; return render(); }
    if (d.upload) return pickImage(d.upload);
    if (d.clear) { set(state.content, d.clear, ''); markDirty(); return rerender(); }
    if (d.addItem) {
      const arr = get(state.content, d.addItem) || [];
      arr.push(JSON.parse(d.tpl || '{}')); set(state.content, d.addItem, arr); markDirty(); return rerender();
    }
    if (d.del) {
      if (!confirm('Удалить этот пункт?')) return;
      get(state.content, d.del).splice(Number(d.i), 1); markDirty(); return rerender();
    }
    if (d.move) {
      const arr = get(state.content, d.move); const i = Number(d.i), j = i + Number(d.d);
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]]; markDirty(); return rerender();
    }
    if (d.refAdd) {
      const arr = get(state.content, d.refAdd) || [];
      arr.push(state.content.products[0].id); set(state.content, d.refAdd, arr); markDirty(); return rerender();
    }
    if (d.refDel) { get(state.content, d.refDel).splice(Number(d.i), 1); markDirty(); return rerender(); }
    if (d.remove) {
      if (!confirm('Удалить навсегда?')) return;
      await api(`/inbox/${d.remove}/${d.id}`, { method: 'DELETE' }); await refreshCounts(); return rerender();
    }
    switch (d.action) {
      case 'save':
        try {
          t.disabled = true;
          await api('/content', { method: 'PUT', body: state.content });
          state.saved = JSON.stringify(state.content); markDirty(); toast('Сохранено — изменения уже на сайте');
        } catch (ex) { toast(ex.message, true); } finally { t.disabled = false; }
        break;
      case 'revert': state.content = JSON.parse(state.saved); rerender(); break;
      case 'logout': await api('/logout', { method: 'POST' }); renderLogin(); break;
      case 'new-product': {
        const name = prompt('Название нового товара');
        if (!name) return;
        let id = slug(name); while (state.content.products.some((p) => p.id === id)) id += '-2';
        const cat = state.filter !== 'all' ? state.filter : state.content.categories[0]?.id;
        state.content.products.push({ id, category: cat, name, price: 0, visible: false, image: '', hero: '', cutout: '', kicker: '', title: '', tagline: '', description: '', measure: '', ingredients: [], layers: { image: '', kicker: '', title: '', items: [] }, info: [], banner: '', bannerMobileOnly: true, pairings: [] });
        state.productId = id; state.view = 'product'; markDirty(); render();
        toast('Товар создан (скрыт). Заполните и включите «Показывать на сайте».');
        break;
      }
      case 'del-product':
        if (!confirm('Удалить товар навсегда?')) return;
        state.content.products = state.content.products.filter((p) => p.id !== state.productId);
        state.view = 'products'; markDirty(); render(); break;
      case 'export': {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(state.content, null, 2)], { type: 'application/json' }));
        a.download = 'chat-cafeine-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); break;
      }
      case 'reset':
        if (!confirm('Вернуть все тексты, цены и фото к исходному макету? Текущая версия сохранится в резервных копиях.')) return;
        state.content = await api('/reset', { method: 'POST' }); state.saved = JSON.stringify(state.content); toast('Сайт возвращён к макету'); render(); break;
      case 'tg-test':
        if (dirty()) { toast('Сначала сохраните настройки', true); return; }
        await api('/test-telegram', { method: 'POST' }); toast('Отправлено — проверьте Telegram'); break;
    }
  });
  addEventListener('beforeunload', (e) => { if (state.content && dirty()) { e.preventDefault(); e.returnValue = ''; } });
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); document.querySelector('[data-action=save]')?.click(); }
  });

  async function refreshCounts() {
    const me = await api('/me');
    state.counts = me.counts; state.defaultPassword = me.defaultPassword;
    const total = Object.values(me.counts).reduce((a, b) => a + b, 0);
    document.title = (total ? `(${total}) ` : '') + 'Админка — Chat Caféiné';
    return me;
  }
  setInterval(async () => {
    if (!state.content || document.hidden) return;
    const before = JSON.stringify(state.counts);
    try { await refreshCounts(); } catch { return; }
    if (JSON.stringify(state.counts) !== before) {
      if (['orders', 'cakes', 'messages'].includes(state.view)) rerender();
      else document.querySelectorAll('.side [data-view]').forEach(() => {});
      toast('Новая заявка!');
    }
  }, 30000);

  function renderLogin() {
    state.content = null;
    app.innerHTML = `<div class="login"><form data-login><img src="/img/logo-badge.webp" alt=""><h1>Вход в админку</h1>
      <input type="password" name="password" placeholder="Пароль" autofocus required autocomplete="current-password"><p class="hint" data-err style="color:#b3261e;margin:0"></p><button class="btn btn--dark" type="submit" style="justify-content:center">Войти</button></form></div>`;
    app.querySelector('[data-login]').addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await api('/login', { method: 'POST', body: { password: e.target.password.value } }); start(); }
      catch (ex) { app.querySelector('[data-err]').textContent = ex.message; }
    });
  }

  async function start() {
    try {
      await refreshCounts();
      state.content = await api('/content');
      state.saved = JSON.stringify(state.content);
      render();
    } catch (ex) { if (ex.message !== 'auth') renderLogin(); }
  }
  start();
})();
