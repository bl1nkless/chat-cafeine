// Chat Caféiné — Le chat grincheux (mascotte officielle illustrée, ordinateur uniquement).
// Il marche sur les arches des produits et les blocs de la page, saute d'une carte à l'autre,
// boit son café d'un air mauvais, fait la sieste, se vautre (« повафлился ») et râle quand on le touche.
(() => {
  if (typeof window === 'undefined') return;
  const mq = window.matchMedia('(min-width: 960px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  const GRAVITY = 1650;
  const STORAGE_KEY = 'cc-grumpy-cat-v1';

  const SPRITES = {
    walk_a: { src: '/img/cat/walk_a.webp', w: 100, h: 88 },
    walk_b: { src: '/img/cat/walk_b.webp', w: 100, h: 88 },
    sit:    { src: '/img/cat/sit.webp',    w: 78,  h: 68 },
    doze:   { src: '/img/cat/doze.webp',   w: 78,  h: 68 },
  };

  const QUOTES = {
    idle: [
      'Pff… encore des clients.',
      'Pas avant mon troisième espresso.',
      'Achetez un roulé ou circulez.',
      'Je surveille les brioches.',
      'Чего смотришь? Синнабон бери.',
      'Без кофе ко мне не подходить.',
    ],
    sip: [
      'Enfin du vrai café…',
      'Chut. Je déguste.',
      'Мой эспрессо. Не трогать.',
    ],
    waffle: [
      'Je fais la crêpe. Dégage.',
      'Перерыв на повафлиться.',
      'Не кантовать. Кот отдыхает.',
      'Pff… cinq minutes de pause.',
    ],
    poke1: [
      'Bas les pattes !',
      'Touche pas à mon béret.',
      'Руки убрал от бариста.',
      'T’as commandé au moins ?',
      'Мяу, бл… то есть, bonjour.',
    ],
    poke2: [
      'Tu cherches la bagarre ?!',
      'Je vais griffer ton curseur.',
      'Щас кусь сделаю.',
      'Laisse mon café tranquille !',
    ],
    flee: [
      'C’est bon, tu m’as gonflé. Je bouge.',
      'Всё, достал. Ухожу на другую булку.',
      'Adieu. Vous êtes fatigants.',
    ],
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let root = null;
  let catEl = null;
  let bodyEl = null;
  let bubbleEl = null;
  let frames = {};
  let activeFrame = '';
  let bubbleTimer = null;
  let rafId = null;
  let platforms = [];

  const state = {
    x: 320,
    y: 420,
    vx: 0,
    vy: 0,
    dir: 1,
    slope: 0,

    plat: null,
    targetPlat: null,
    targetX: 460,
    targetY: 420,

    // 'walk' | 'sit' | 'sip' | 'sleep' | 'waffle' | 'wiggle' | 'jump' | 'land' | 'angry'
    mode: 'sit',
    modeTime: 0,
    modeDuration: 4.0,
    strideDist: 0,
    flightTime: 0,
    flightDuration: 0.55,

    pokeCount: 0,
    lastPokeTime: 0,
    offscreenTime: 0,
    lastFxTime: 0,
    mouseX: 0,
    mouseY: 0,
  };

  function showFrame(name) {
    if (activeFrame === name) return;
    if (frames[activeFrame]) frames[activeFrame].classList.remove('is-on');
    if (frames[name]) frames[name].classList.add('is-on');
    activeFrame = name;
  }

  function say(text, duration = 2600) {
    if (!bubbleEl) return;
    clearTimeout(bubbleTimer);
    bubbleEl.textContent = text;
    bubbleEl.classList.add('is-on');
    bubbleTimer = setTimeout(() => bubbleEl.classList.remove('is-on'), duration);
  }

  function spawnFx(symbol, angry = false) {
    if (!catEl) return;
    const el = document.createElement('span');
    el.className = 'gc__fx' + (angry ? ' gc__fx--angry' : '');
    el.textContent = symbol;
    el.style.setProperty('--dx', `${ rand(-18, 22).toFixed(1) }px`);
    catEl.appendChild(el);
    setTimeout(() => el.remove(), 1750);
  }

  // =========================================================
  // SCAN DES BLOCS ET ARCHES DE LA PAGE (en coordonnées document)
  // =========================================================
  function scanPlatforms() {
    const sx = window.scrollX;
    const sy = window.scrollY;
    const list = [];

    // 1. Arches des cartes produits (.pc__img), gâteaux (.cake__img), fiche produit (.pd__media)
    document.querySelectorAll('.pc__img, .cake__img, .pd__media, .hero--arch .hero__media').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 110 || r.height < 100) return;
      const left = r.left + sx;
      const right = r.right + sx;
      const top = r.top + sy;
      const rx = r.width * 0.5;
      const ry = r.height * 0.463;
      const cx = left + rx;
      list.push({
        kind: 'arch',
        left,
        right,
        minX: left + 36,
        maxX: right - 36,
        top,
        getY(x) {
          const u = clamp((x - cx) / rx, -0.84, 0.84);
          return top + ry * (1 - Math.sqrt(Math.max(0, 1 - u * u))) + 4;
        },
        getSlope(x) {
          const u = clamp((x - cx) / rx, -0.78, 0.78);
          const d = Math.sqrt(Math.max(0.1, 1 - u * u));
          return Math.atan2((ry / rx) * (u / d), 1) * 0.48;
        },
      });
    });

    // 2. Blocs plats : boutons d'ajout, panneaux, lignes du menu, images split, pied de page
    document.querySelectorAll('.pc .add, .btn--dark, .panel, .note, .mi, .split__media, .ftr').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 28) return;
      const left = r.left + sx;
      const right = r.right + sx;
      const top = r.top + sy;
      const pad = Math.min(34, r.width * 0.2);
      if (right - left - pad * 2 < 44) return;
      list.push({
        kind: 'flat',
        left,
        right,
        minX: left + pad,
        maxX: right - pad,
        top,
        getY() { return top + 3; },
        getSlope() { return 0; },
      });
    });

    platforms = list;
  }

  function getVisiblePlatforms() {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    return platforms.filter((p) => p.top >= sy + 96 && p.top <= sy + vh - 24);
  }

  function setMode(mode, duration = 3.5) {
    state.mode = mode;
    state.modeTime = 0;
    state.modeDuration = duration;
    if (root) root.classList.toggle('is-air', mode === 'jump');
  }

  function prepareJump(plat, destX, destY) {
    state.targetPlat = plat;
    state.targetX = destX;
    state.targetY = destY;
    state.dir = destX >= state.x ? 1 : -1;
    setMode('wiggle', 0.34);
  }

  function launchJump() {
    const dx = state.targetX - state.x;
    const dy = state.targetY - state.y;
    const dist = Math.hypot(dx, dy);
    let T = clamp(0.42 + dist / 920, 0.44, 0.82);
    let vy = (dy - 0.5 * GRAVITY * T * T) / T;
    if (vy > -200) {
      T = clamp(T + 0.14, 0.5, 0.88);
      vy = (dy - 0.5 * GRAVITY * T * T) / T;
    }
    state.flightDuration = T;
    state.flightTime = 0;
    state.vx = dx / T;
    state.vy = vy;
    state.dir = dx >= 0 ? 1 : -1;
    setMode('jump', T);
  }

  function jumpToNeighbor() {
    if (!platforms.length) scanPlatforms();
    const visible = getVisiblePlatforms();
    if (!visible.length) return false;
    const others = visible.filter((p) => p !== state.plat);
    const pool = others.length ? others : visible;
    const sorted = [...pool].sort((a, b) => {
      const da = Math.hypot((a.minX + a.maxX) * 0.5 - state.x, (a.top - state.y) * 1.25);
      const db = Math.hypot((b.minX + b.maxX) * 0.5 - state.x, (b.top - state.y) * 1.25);
      return da - db;
    });
    const chosen = pick(sorted.slice(0, Math.min(4, sorted.length)));
    const destX = clamp(rand(chosen.minX, chosen.maxX), chosen.minX, chosen.maxX);
    prepareJump(chosen, destX, chosen.getY(destX));
    return true;
  }

  function decideNext() {
    if (!state.plat) {
      if (!jumpToNeighbor()) setMode('sit', 3.0);
      return;
    }

    const r = Math.random();
    const span = state.plat.maxX - state.plat.minX;

    // 38% : sauter sur un autre bloc visible (ex: d'une brioche à sa voisine ou sur le bouton + Ajouter)
    if (r < 0.38) {
      if (jumpToNeighbor()) return;
    }

    // 32% : marcher d'un bout à l'autre du bloc actuel
    if (r < 0.70 && span > 48) {
      const mid = (state.plat.minX + state.plat.maxX) * 0.5;
      state.targetX = state.x < mid ? rand(mid, state.plat.maxX) : rand(state.plat.minX, mid);
      state.dir = state.targetX >= state.x ? 1 : -1;
      setMode('walk', 5.0);
      return;
    }

    // 30% : pause grincheuse (boire son café, râler, dormir, ou se vautrer « повафлиться »)
    const roll = Math.random();
    if (roll < 0.34) {
      if (Math.random() < 0.45) say(pick(QUOTES.idle), 2700);
      setMode('sit', rand(3.5, 6.2));
    } else if (roll < 0.60) {
      if (Math.random() < 0.5) say(pick(QUOTES.sip), 2500);
      setMode('sip', rand(3.2, 5.2));
    } else if (roll < 0.82) {
      if (Math.random() < 0.6) say(pick(QUOTES.waffle), 2700);
      setMode('waffle', rand(4.5, 7.2));
    } else {
      setMode('sleep', rand(5.5, 9.0));
    }
  }

  // =========================================================
  // BOUCLE D'ANIMATION ET DE PHYSIQUE (60 FPS)
  // =========================================================
  function update(dt, now) {
    state.modeTime += dt;
    const t = now * 0.001;

    // Particules d'ambiance
    if (now - state.lastFxTime > 1350) {
      if (state.mode === 'sleep') {
        spawnFx(pick(['z', 'Z', 'zZz']), false);
        state.lastFxTime = now;
      } else if (state.mode === 'sip') {
        spawnFx('☕', false);
        state.lastFxTime = now;
      } else if (state.mode === 'waffle') {
        spawnFx(pick(['~', '…', '💢']), false);
        state.lastFxTime = now;
      }
    }

    // Si l'utilisateur a fait défiler la page loin du chat, le chat saute sur un bloc visible
    if (state.mode !== 'jump' && state.mode !== 'wiggle') {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const out = state.y < sy + 40 || state.y > sy + vh + 40;
      if (out) {
        state.offscreenTime += dt;
        if (state.offscreenTime > 0.65) {
          state.offscreenTime = 0;
          const visible = getVisiblePlatforms();
          if (visible.length) {
            const chosen = pick(visible);
            const destX = clamp(rand(chosen.minX, chosen.maxX), chosen.minX, chosen.maxX);
            const destY = chosen.getY(destX);
            state.x = clamp(destX + rand(-110, 110), 80, window.innerWidth - 80);
            state.y = state.y < sy + 40 ? sy + 60 : sy + vh - 12;
            prepareJump(chosen, destX, destY);
            return;
          }
        }
      } else {
        state.offscreenTime = 0;
      }
    }

    let scaleX = 1;
    let scaleY = 1;
    let rotDeg = 0;
    let offsetY = 0;

    // 1. Préparation du saut (remue le popotin)
    if (state.mode === 'wiggle') {
      showFrame('walk_a');
      scaleX = 1.12 + Math.sin(t * 38) * 0.04;
      scaleY = 0.84 - Math.sin(t * 38) * 0.03;
      rotDeg = Math.sin(t * 38) * 3.5;
      if (state.modeTime >= state.modeDuration) launchJump();
    }
    // 2. Saut parabolique dans les airs
    else if (state.mode === 'jump') {
      state.flightTime += dt;
      state.x += state.vx * dt;
      state.vy += GRAVITY * dt;
      state.y += state.vy * dt;

      const phase = state.flightTime / (state.flightDuration || 0.5);
      showFrame(phase < 0.55 ? 'walk_b' : 'walk_a');
      scaleX = 1.07;
      scaleY = 0.94;
      rotDeg = clamp(Math.atan2(state.vy, Math.abs(state.vx) || 1) * (180 / Math.PI) * 0.38 * state.dir, -26, 26);

      if (state.flightTime >= state.flightDuration) {
        state.x = state.targetX;
        state.y = state.targetY;
        state.vx = 0;
        state.vy = 0;
        if (state.targetPlat) state.plat = state.targetPlat;
        setMode('land', 0.18);
      }
    }
    // 3. Réception souple à l'atterrissage
    else if (state.mode === 'land') {
      showFrame('walk_a');
      const k = 1 - clamp(state.modeTime / state.modeDuration, 0, 1);
      scaleX = 1 + 0.14 * k;
      scaleY = 1 - 0.14 * k;
      if (state.plat) {
        state.y = state.plat.getY(state.x);
        rotDeg = state.plat.getSlope(state.x) * (180 / Math.PI);
      }
      if (state.modeTime >= state.modeDuration) {
        setMode(pick(['sit', 'sip', 'waffle']), rand(3.2, 5.8));
      }
    }
    // 4. Marche grincheuse sur le bloc / l'arche
    else if (state.mode === 'walk') {
      const dx = state.targetX - state.x;
      const speed = 72;
      const step = speed * dt;
      if (Math.abs(dx) <= step + 2 || state.modeTime >= state.modeDuration) {
        state.x = state.targetX;
        if (state.plat) state.y = state.plat.getY(state.x);
        decideNext();
      } else {
        state.dir = dx >= 0 ? 1 : -1;
        state.x += Math.sign(dx) * step;
        state.strideDist += step;
        if (state.plat) {
          state.y = state.plat.getY(state.x);
          rotDeg = state.plat.getSlope(state.x) * (180 / Math.PI);
        }
        // Alterne walk_a et walk_b tous les 18px parcourus + léger rebond de patte
        const cycle = (state.strideDist / 18) % 2;
        showFrame(cycle < 1 ? 'walk_a' : 'walk_b');
        offsetY = -Math.abs(Math.sin((state.strideDist / 18) * Math.PI)) * 2.5;
      }
    }
    // 5. Assis avec son gobelet de café (cligne parfois des yeux)
    else if (state.mode === 'sit') {
      const blink = (state.modeTime % 3.8) > 3.62;
      showFrame(blink ? 'doze' : 'sit');
      scaleY = 1 + Math.sin(t * 2.2) * 0.018;
      if (state.plat) {
        state.y = state.plat.getY(state.x);
        rotDeg = state.plat.getSlope(state.x) * (180 / Math.PI) * 0.35;
      }
      if (state.modeTime >= state.modeDuration) decideNext();
    }
    // 6. Sirote son café les yeux fermés
    else if (state.mode === 'sip') {
      showFrame('doze');
      scaleY = 1 + Math.sin(t * 2.6) * 0.022;
      rotDeg = -3 * state.dir + Math.sin(t * 2.6) * 2;
      if (state.plat) state.y = state.plat.getY(state.x);
      if (state.modeTime >= state.modeDuration) decideNext();
    }
    // 7. Dort en boule / grogne en dormant
    else if (state.mode === 'sleep') {
      showFrame('doze');
      scaleX = 1.08 + Math.sin(t * 1.8) * 0.025;
      scaleY = 0.86 - Math.sin(t * 1.8) * 0.02;
      if (state.plat) state.y = state.plat.getY(state.x);
      if (state.modeTime >= state.modeDuration) decideNext();
    }
    // 8. « Повафлился » — se vautre / se dandine paresseusement sur le bloc
    else if (state.mode === 'waffle') {
      showFrame((Math.floor(t * 2.2) % 2 === 0) ? 'doze' : 'sit');
      const roll = Math.sin(t * 3.6);
      scaleX = 1.12 + roll * 0.04;
      scaleY = 0.84 - Math.abs(roll) * 0.04;
      rotDeg = roll * 14;
      if (state.plat) state.y = state.plat.getY(state.x);
      if (state.modeTime >= state.modeDuration) decideNext();
    }
    // 9. Énervé quand on l'a cliqué
    else if (state.mode === 'angry') {
      showFrame('sit');
      const k = 1 - clamp(state.modeTime / state.modeDuration, 0, 1);
      offsetY = -Math.sin(k * Math.PI) * 14;
      scaleX = 1 - 0.08 * Math.sin(k * Math.PI);
      scaleY = 1 + 0.14 * Math.sin(k * Math.PI);
      rotDeg = Math.sin(t * 45) * 6 * k;
      if (state.modeTime >= state.modeDuration) {
        if (state.pokeCount >= 3) {
          state.pokeCount = 0;
          jumpToNeighbor();
        } else {
          setMode('sit', 3.5);
        }
      }
    }

    catEl.style.transform = `translate3d(${ Math.round(state.x) }px, ${ Math.round(state.y + offsetY) }px, 0)`;
    bodyEl.style.transform = `rotate(${ rotDeg.toFixed(1) }deg) scale(${ (state.dir * scaleX).toFixed(3) }, ${ scaleY.toFixed(3) })`;
  }

  function onPoke(e) {
    e.stopPropagation();
    const now = performance.now();
    if (now - state.lastPokeTime > 5000) state.pokeCount = 0;
    state.lastPokeTime = now;
    state.pokeCount++;

    spawnFx('💢', true);
    if (state.pokeCount === 1) {
      say(pick(QUOTES.poke1), 2500);
      setMode('angry', 0.48);
    } else if (state.pokeCount === 2) {
      spawnFx('⚡', true);
      say(pick(QUOTES.poke2), 2500);
      setMode('angry', 0.52);
    } else {
      spawnFx('💢', true);
      say(pick(QUOTES.flee), 2600);
      setMode('angry', 0.38);
    }
  }

  function buildDOM() {
    root = document.createElement('div');
    root.className = 'gc';
    root.setAttribute('aria-hidden', 'true');

    catEl = document.createElement('div');
    catEl.className = 'gc__cat';

    const shadow = document.createElement('div');
    shadow.className = 'gc__shadow';

    bodyEl = document.createElement('div');
    bodyEl.className = 'gc__body';

    Object.entries(SPRITES).forEach(([key, cfg]) => {
      const img = document.createElement('img');
      img.className = 'gc__img';
      img.src = cfg.src;
      img.width = cfg.w;
      img.height = cfg.h;
      img.alt = '';
      img.draggable = false;
      img.addEventListener('click', onPoke);
      bodyEl.appendChild(img);
      frames[key] = img;
    });

    bubbleEl = document.createElement('div');
    bubbleEl.className = 'gc__bubble';

    catEl.appendChild(shadow);
    catEl.appendChild(bodyEl);
    catEl.appendChild(bubbleEl);
    root.appendChild(catEl);
    document.body.appendChild(root);

    showFrame('sit');
  }

  let lastTime = 0;
  function loop(now) {
    if (!root) return;
    if (!lastTime) lastTime = now;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt, now);
    rafId = requestAnimationFrame(loop);
  }

  function init() {
    if (!mq.matches || root) return;
    buildDOM();
    scanPlatforms();

    const visible = getVisiblePlatforms();
    const startPlat = visible.find((p) => p.kind === 'arch') || visible[0] || platforms[0];
    if (startPlat) {
      state.plat = startPlat;
      state.x = (startPlat.minX + startPlat.maxX) * 0.5;
      state.y = startPlat.getY(state.x);
    }

    window.addEventListener('load', scanPlatforms, { once: true });
    window.addEventListener('resize', () => {
      if (mq.matches) scanPlatforms();
    }, { passive: true });

    // Double-clic sur n'importe quel bloc de la page : le chat y saute en râlant
    window.addEventListener('dblclick', (e) => {
      if (!root) return;
      scanPlatforms();
      const docX = e.clientX + window.scrollX;
      const docY = e.clientY + window.scrollY;
      let best = null;
      let bestDist = Infinity;
      platforms.forEach((p) => {
        const cx = clamp(docX, p.minX, p.maxX);
        const cy = p.getY(cx);
        const d = Math.hypot(cx - docX, cy - docY);
        if (d < bestDist) { bestDist = d; best = { p, x: cx, y: cy }; }
      });
      if (best) {
        say(pick(['Bon, j’arrive…', 'Ладно, прыгаю туда.', 'Pff… si tu insistes.']), 2000);
        prepareJump(best.p, best.x, best.y);
      }
    });

    setTimeout(() => say(pick(QUOTES.idle), 2800), 900);
    setMode('sit', 3.2);
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function destroy() {
    if (!root) return;
    cancelAnimationFrame(rafId);
    root.remove();
    root = null;
    frames = {};
    activeFrame = '';
  }

  mq.addEventListener('change', (e) => {
    if (e.matches) init();
    else destroy();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
