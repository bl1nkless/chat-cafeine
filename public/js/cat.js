// Chat Caféiné — Le chat grincheux (squelette illustré 60 FPS, physique à ressorts).
// Toutes les parties (4 pattes, queue touffue, corps, gobelet de café, vapeur, clignements)
// sont interpolées en continu à 60 FPS sans coupure.
(() => {
  if (typeof window === 'undefined') return;
  const mq = window.matchMedia('(min-width: 960px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  const GRAVITY = 1580;

  // Atlas haute définition (/img/cat/rig.webp) contenant toutes les pièces illustrées
  const PARTS = {
    walk_body:      { sx: 0,   sy: 0, sw: 186, sh: 139, w: 93.0, h: 69.5, px: 37.62, py: 44.75, ax: -1.5,  ay: -38.5 },
    walk_body_doze: { sx: 190, sy: 0, sw: 186, sh: 139, w: 93.0, h: 69.5, px: 37.62, py: 44.75, ax: -1.5,  ay: -38.5 },
    walk_tail:      { sx: 380, sy: 0, sw: 54,  sh: 96,  w: 27.0, h: 48.0, px: 21.38, py: 42.38, ax: -32.5, ay: -51.62 },
    leg_bl:         { sx: 438, sy: 0, sw: 26,  sh: 63,  w: 13.0, h: 31.5, px: 7.25,  py: 4.75,  ax: -36.0, ay: -26.62 },
    leg_br:         { sx: 468, sy: 0, sw: 38,  sh: 59,  w: 19.0, h: 29.5, px: 6.62,  py: 4.75,  ax: -13.38, ay: -26.62 },
    leg_fl:         { sx: 510, sy: 0, sw: 29,  sh: 60,  w: 14.5, h: 30.0, px: 6.0,   py: 4.5,   ax: 12.0,  ay: -26.62 },
    leg_fr:         { sx: 543, sy: 0, sw: 48,  sh: 60,  w: 24.0, h: 30.0, px: 5.75,  py: 4.75,  ax: 28.0,  ay: -26.62 },
    sit_body:       { sx: 595, sy: 0, sw: 131, sh: 154, w: 65.5, h: 77.0, px: 34.52, py: 49.73, ax: 0.0,   ay: -27.3 },
    sit_body_doze:  { sx: 730, sy: 0, sw: 131, sh: 154, w: 65.5, h: 77.0, px: 34.52, py: 49.73, ax: 0.0,   ay: -27.3 },
    sit_tail:       { sx: 865, sy: 0, sw: 48,  sh: 81,  w: 24.0, h: 40.5, px: 19.5,  py: 35.88, ax: -24.86, ay: -12.19 },
    sit_cup:        { sx: 917, sy: 0, sw: 45,  sh: 51,  w: 22.5, h: 25.5, px: 3.71,  py: 18.82, ax: 24.57, ay: -26.81 },
    sit_steam:      { sx: 966, sy: 0, sw: 31,  sh: 37,  w: 15.5, h: 18.5, px: 8.19,  py: 13.26, ax: 33.64, ay: -50.7 },
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
    stretch: [
      'Mrrr… mes pattes.',
      'Потянулся — и дальше ворчать.',
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
  const deg = (d) => d * (Math.PI / 180);
  // Interpolation exponentielle indépendante du framerate (effet ressort doux)
  const damp = (cur, target, lambda, dt) => cur + (target - cur) * (1 - Math.exp(-lambda * dt));

  let root = null;
  let catEl = null;
  let canvas = null;
  let ctx = null;
  let hitEl = null;
  let bubbleEl = null;
  let bubbleTimer = null;
  let rafId = null;
  let platforms = [];

  const rigImg = new Image();
  let rigLoaded = false;
  rigImg.onload = () => { rigLoaded = true; };
  rigImg.src = '/img/cat/rig.webp';

  const state = {
    x: 320,
    y: 420,
    vx: 0,
    vy: 0,
    dir: 1,
    dirSmooth: 1, // Interpolation fluide lors des demi-tours (-1 <-> +1)
    slope: 0,
    slopeSmooth: 0,

    plat: null,
    targetPlat: null,
    targetX: 460,
    targetY: 420,

    // 'walk' | 'sit' | 'sip' | 'loaf' | 'stretch' | 'waffle' | 'wiggle' | 'jump' | 'land' | 'angry'
    mode: 'sit',
    modeTime: 0,
    modeDuration: 4.0,
    stridePhase: 0,
    walkSpeed: 0,
    flightTime: 0,
    flightDuration: 0.55,

    // Quel rig afficher ('walk' = profil 4 pattes, 'sit' = 3/4 avec café) + transition douce
    activeRig: 'sit',
    targetRig: 'sit',
    rigSwitchDip: 0,

    // Paramètres articulés lissés en continu à 60 FPS
    pose: {
      bodyY: 0,
      bodyRot: 0,
      scaleX: 1,
      scaleY: 1,
      bl: 0,
      br: 0,
      fl: 0,
      fr: 0,
      blLift: 0,
      brLift: 0,
      flLift: 0,
      frLift: 0,
      walkTail: 0,
      sitTail: 0,
      cupRot: 0,
      cupLift: 0,
      eyesClosed: false,
    },

    blinkTimer: 3.2,
    isBlinking: false,
    pokeCount: 0,
    lastPokeTime: 0,
    offscreenTime: 0,
    lastFxTime: 0,
  };

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
    setTimeout(() => el.remove(), 1850);
  }

  // =========================================================
  // SCAN DES BLOCS ET ARCHES DE LA PAGE (coordonnées document)
  // =========================================================
  function scanPlatforms() {
    const sx = window.scrollX;
    const sy = window.scrollY;
    const list = [];

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
          return Math.atan2((ry / rx) * (u / d), 1) * 0.45;
        },
      });
    });

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
    const wantRig = (mode === 'sit' || mode === 'sip' || mode === 'angry') ? 'sit' : 'walk';
    if (wantRig !== state.targetRig) {
      state.targetRig = wantRig;
      state.rigSwitchDip = 1.0; // Déclenche un petit amorti souple lors du changement de posture
    }
    if (root) root.classList.toggle('is-air', mode === 'jump');
  }

  function prepareJump(plat, destX, destY) {
    state.targetPlat = plat;
    state.targetX = destX;
    state.targetY = destY;
    state.dir = destX >= state.x ? 1 : -1;
    setMode('wiggle', 0.38);
  }

  function launchJump() {
    const dx = state.targetX - state.x;
    const dy = state.targetY - state.y;
    const dist = Math.hypot(dx, dy);
    let T = clamp(0.45 + dist / 880, 0.46, 0.85);
    let vy = (dy - 0.5 * GRAVITY * T * T) / T;
    if (vy > -210) {
      T = clamp(T + 0.14, 0.52, 0.90);
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
    prepareJump(chosen, destX, destY(chosen, destX));
    return true;
  }

  function destY(plat, x) {
    return plat ? plat.getY(x) : state.y;
  }

  function decideNext() {
    if (!state.plat) {
      if (!jumpToNeighbor()) setMode('sit', 3.5);
      return;
    }

    // Après s'être étiré, il se couche en « буханочка » ou part marcher
    if (state.mode === 'stretch') {
      if (Math.random() < 0.55) {
        setMode('loaf', rand(5.5, 8.5));
      } else {
        setMode('waffle', rand(4.8, 7.5));
      }
      return;
    }

    const r = Math.random();
    const span = state.plat.maxX - state.plat.minX;

    // 34% : sauter sur une carte voisine
    if (r < 0.34) {
      if (jumpToNeighbor()) return;
    }

    // 32% : marcher avec accélération et freinage fluides
    if (r < 0.66 && span > 46) {
      const mid = (state.plat.minX + state.plat.maxX) * 0.5;
      state.targetX = state.x < mid ? rand(mid + 10, state.plat.maxX) : rand(state.plat.minX, mid - 10);
      state.dir = state.targetX >= state.x ? 1 : -1;
      setMode('walk', 6.0);
      return;
    }

    // 34% : animations expressives variées
    const roll = Math.random();
    if (roll < 0.25) {
      if (Math.random() < 0.4) say(pick(QUOTES.idle), 2700);
      setMode('sit', rand(3.6, 6.0));
    } else if (roll < 0.52) {
      if (Math.random() < 0.5) say(pick(QUOTES.sip), 2500);
      setMode('sip', rand(3.8, 5.8));
    } else if (roll < 0.74) {
      if (Math.random() < 0.55) say(pick(QUOTES.waffle), 2700);
      setMode('waffle', rand(4.8, 7.5));
    } else if (roll < 0.90) {
      if (Math.random() < 0.4) say(pick(QUOTES.stretch), 2300);
      setMode('stretch', 2.2);
    } else {
      setMode('loaf', rand(5.5, 8.8));
    }
  }

  // =========================================================
  // MISE À JOUR PHYSIQUE & SQUELETTE 60 FPS
  // =========================================================
  function update(dt, now) {
    state.modeTime += dt;
    const t = now * 0.001;
    const P = state.pose;

    // Clignement naturel des yeux
    state.blinkTimer -= dt;
    if (state.blinkTimer <= 0) {
      state.isBlinking = true;
      if (state.blinkTimer <= -0.15) {
        state.isBlinking = false;
        state.blinkTimer = rand(2.6, 5.8);
      }
    }

    // Transition douce lors du changement de rig (walk <-> sit)
    if (state.rigSwitchDip > 0) {
      state.rigSwitchDip = Math.max(0, state.rigSwitchDip - dt * 6.5);
      if (state.rigSwitchDip < 0.55 && state.activeRig !== state.targetRig) {
        state.activeRig = state.targetRig;
      }
    }

    // Demi-tour fluide (pas de retournement instantané en 1 frame)
    state.dirSmooth = damp(state.dirSmooth, state.dir, 14, dt);
    if (Math.abs(state.dirSmooth) < 0.08) state.dirSmooth = state.dir * 0.08;

    // Particules d'ambiance
    if (now - state.lastFxTime > 1400) {
      if (state.mode === 'loaf') {
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

    // Rattrapage si l'utilisateur scrolle loin du chat
    if (state.mode !== 'jump' && state.mode !== 'wiggle') {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      if (state.y < sy + 40 || state.y > sy + vh + 40) {
        state.offscreenTime += dt;
        if (state.offscreenTime > 0.65) {
          state.offscreenTime = 0;
          const visible = getVisiblePlatforms();
          if (visible.length) {
            const chosen = pick(visible);
            const dx = clamp(rand(chosen.minX, chosen.maxX), chosen.minX, chosen.maxX);
            state.x = clamp(dx + rand(-110, 110), 80, window.innerWidth - 80);
            state.y = state.y < sy + 40 ? sy + 60 : sy + vh - 12;
            prepareJump(chosen, dx, chosen.getY(dx));
            return;
          }
        }
      } else {
        state.offscreenTime = 0;
      }
    }

    // Cibles d'animation par défaut pour la frame courante
    let tBodyY = 0;
    let tBodyRot = 0;
    let tScaleX = 1;
    let tScaleY = 1;
    let tBL = 0, tBR = 0, tFL = 0, tFR = 0;
    let tBLLift = 0, tBRLift = 0, tFLLift = 0, tFRLift = 0;
    let tWalkTail = Math.sin(t * 2.6) * 9;
    let tSitTail = Math.sin(t * 2.3) * 11;
    let tCupRot = 0;
    let tCupLift = 0;
    let eyesClosed = state.isBlinking;

    // ---------------- 1. WALK (Marche fluide avec accélération, freinage et 4 pattes articulées) ----------------
    if (state.mode === 'walk') {
      const dx = state.targetX - state.x;
      const dist = Math.abs(dx);
      const maxSpeed = 76;
      // Ralentit doucement en approchant de la cible
      const desiredSpeed = dist < 42 ? maxSpeed * clamp(dist / 42, 0.18, 1) : maxSpeed;
      state.walkSpeed = damp(state.walkSpeed, desiredSpeed, 10, dt);

      const step = state.walkSpeed * dt;
      if (dist <= step + 1.5 || state.modeTime >= state.modeDuration) {
        state.x = state.targetX;
        state.walkSpeed = 0;
        if (state.plat) {
          state.y = state.plat.getY(state.x);
          state.slope = state.plat.getSlope(state.x);
        }
        decideNext();
      } else {
        state.dir = dx >= 0 ? 1 : -1;
        state.x += Math.sign(dx) * step;
        state.stridePhase += step * 0.088;
        if (state.plat) {
          state.y = state.plat.getY(state.x);
          state.slope = state.plat.getSlope(state.x);
        }
      }

      const amp = clamp(state.walkSpeed / maxSpeed, 0, 1);
      const ph = state.stridePhase;
      // Cycle de marche quadrupède naturel (amplitude proportionnelle à la vitesse réelle)
      tBL = Math.sin(ph) * 23 * amp;
      tBR = Math.sin(ph + Math.PI) * 23 * amp;
      tFL = Math.sin(ph + Math.PI + 0.35) * 23 * amp;
      tFR = Math.sin(ph + 0.35) * 23 * amp;

      tBLLift = Math.max(0, Math.cos(ph)) * 3.8 * amp;
      tBRLift = Math.max(0, Math.cos(ph + Math.PI)) * 3.8 * amp;
      tFLLift = Math.max(0, Math.cos(ph + Math.PI + 0.35)) * 3.8 * amp;
      tFRLift = Math.max(0, Math.cos(ph + 0.35)) * 3.8 * amp;

      tBodyY = -Math.abs(Math.sin(ph)) * 2.4 * amp;
      tBodyRot = Math.cos(ph) * 1.8 * amp;
      tWalkTail = Math.sin(ph - 0.7) * 11 * amp + Math.sin(t * 2.8) * 6;
    }

    // ---------------- 2. STRETCH (Grand étirement félin) ----------------
    else if (state.mode === 'stretch') {
      state.walkSpeed = 0;
      tBL = 24;
      tBR = 28;
      tFL = -28;
      tFR = -34;
      tBodyY = 5.5;
      tBodyRot = 6.5;
      tScaleX = 1.07;
      tScaleY = 0.92;
      tWalkTail = -22 + Math.sin(t * 4) * 5;
      eyesClosed = true;
      if (state.plat) {
        state.y = state.plat.getY(state.x);
        state.slope = state.plat.getSlope(state.x) * 0.5;
      }
      if (state.modeTime >= state.modeDuration) decideNext();
    }

    // ---------------- 3. LOAF / SLEEP (Couché en « буханочка », pattes repliées, respiration lente) ----------------
    else if (state.mode === 'loaf') {
      state.walkSpeed = 0;
      const breathe = Math.sin(t * 2.0);
      tBL = -38;
      tBR = -42;
      tFL = 44;
      tFR = 40;
      tBLLift = 17;
      tBRLift = 17;
      tFLLift = 17;
      tFRLift = 17;
      tBodyY = 14.5;
      tBodyRot = -1.5;
      tScaleX = 1.04 + breathe * 0.02;
      tScaleY = 0.91 - breathe * 0.016;
      tWalkTail = 25 + Math.sin(t * 1.7) * 5;
      eyesClosed = true;
      if (state.plat) {
        state.y = state.plat.getY(state.x);
        state.slope = state.plat.getSlope(state.x) * 0.35;
      }
      if (state.modeTime >= state.modeDuration) decideNext();
    }

    // ---------------- 4. WAFFLE (« Повафлился » — se dandine et pédale des 4 pattes) ----------------
    else if (state.mode === 'waffle') {
      state.walkSpeed = 0;
      const roll = Math.sin(t * 3.2);
      const kick = t * 6.4;
      tBodyY = 11.5;
      tBodyRot = roll * 10;
      tScaleX = 1.08 + roll * 0.035;
      tScaleY = 0.88 - Math.abs(roll) * 0.04;
      tBLLift = 14;
      tBRLift = 14;
      tFLLift = 14;
      tFRLift = 14;
      tBL = Math.sin(kick) * 28;
      tBR = Math.cos(kick) * 28;
      tFL = -Math.sin(kick) * 28;
      tFR = -Math.cos(kick) * 28;
      tWalkTail = Math.sin(t * 5.2) * 18;
      eyesClosed = Math.sin(t * 1.8) > -0.2;
      if (state.plat) {
        state.y = state.plat.getY(state.x);
        state.slope = state.plat.getSlope(state.x) * 0.3;
      }
      if (state.modeTime >= state.modeDuration) decideNext();
    }

    // ---------------- 5. WIGGLE (Frétillement du popotin avant de bondir) ----------------
    else if (state.mode === 'wiggle') {
      state.walkSpeed = 0;
      const w = Math.sin(t * 38);
      tBodyY = 6.5;
      tBodyRot = -3 + w * 2.5;
      tScaleX = 1.11 + w * 0.03;
      tScaleY = 0.85 - w * 0.025;
      tBL = 16;
      tBR = 12;
      tFL = -14;
      tFR = -18;
      tBLLift = 5;
      tBRLift = 5;
      tFLLift = 5;
      tFRLift = 5;
      tWalkTail = w * 16;
      if (state.modeTime >= state.modeDuration) launchJump();
    }

    // ---------------- 6. JUMP (Vol parabolique souple) ----------------
    else if (state.mode === 'jump') {
      state.flightTime += dt;
      state.x += state.vx * dt;
      state.vy += GRAVITY * dt;
      state.y += state.vy * dt;
      state.slope = 0;

      const u = clamp(state.flightTime / (state.flightDuration || 0.5), 0, 1);
      // En montée : pattes avant tendues vers l'avant, pattes arrière poussant derrière
      // En descente : pattes avant prêtes à réceptionner
      tBL = 28 * (1 - u * 0.5);
      tBR = 22 * (1 - u * 0.5);
      tFL = -24;
      tFR = -30;
      tScaleX = 1.07;
      tScaleY = 0.94;
      tBodyRot = clamp(Math.atan2(state.vy, Math.abs(state.vx) || 1) * (180 / Math.PI) * 0.42, -26, 26);
      tWalkTail = -18 + u * 24;

      if (state.flightTime >= state.flightDuration) {
        state.x = state.targetX;
        state.y = state.targetY;
        state.vx = 0;
        state.vy = 0;
        if (state.targetPlat) state.plat = state.targetPlat;
        setMode('land', 0.24);
      }
    }

    // ---------------- 7. LAND (Amorti élastique à l'atterrissage) ----------------
    else if (state.mode === 'land') {
      const k = 1 - clamp(state.modeTime / state.modeDuration, 0, 1);
      tBodyY = 6 * k;
      tScaleX = 1 + 0.13 * k;
      tScaleY = 1 - 0.14 * k;
      if (state.plat) {
        state.y = state.plat.getY(state.x);
        state.slope = state.plat.getSlope(state.x);
      }
      if (state.modeTime >= state.modeDuration) {
        setMode(pick(['sit', 'sip', 'walk']), rand(3.5, 5.8));
      }
    }

    // ---------------- 8. SIT (Assis avec son café, queue qui ondule) ----------------
    else if (state.mode === 'sit') {
      const breathe = Math.sin(t * 2.1);
      tScaleX = 1 - breathe * 0.01;
      tScaleY = 1 + breathe * 0.018;
      tSitTail = Math.sin(t * 2.3) * 12;
      tCupRot = Math.sin(t * 1.7) * 2.5;
      if (state.plat) {
        state.y = state.plat.getY(state.x);
        state.slope = state.plat.getSlope(state.x) * 0.35;
      }
      if (state.modeTime >= state.modeDuration) decideNext();
    }

    // ---------------- 9. SIP (Porte doucement son gobelet de café à la bouche et sirote) ----------------
    else if (state.mode === 'sip') {
      // Courbe en cloche fluide : lève la tasse -> boit -> repose la tasse
      const u = clamp(state.modeTime / state.modeDuration, 0, 1);
      const liftCurve = Math.sin(u * Math.PI);
      const sipping = liftCurve > 0.45;
      tCupRot = -20 * liftCurve;
      tCupLift = -3.5 * liftCurve;
      tBodyRot = 3.2 * liftCurve;
      tSitTail = Math.sin(t * 1.9) * 8;
      tScaleY = 1 + Math.sin(t * 2.5) * 0.018;
      eyesClosed = sipping || state.isBlinking;
      if (state.plat) {
        state.y = state.plat.getY(state.x);
        state.slope = state.plat.getSlope(state.x) * 0.35;
      }
      if (state.modeTime >= state.modeDuration) decideNext();
    }

    // ---------------- 10. ANGRY (Sursaut agacé au clic) ----------------
    else if (state.mode === 'angry') {
      const k = 1 - clamp(state.modeTime / state.modeDuration, 0, 1);
      tBodyY = -Math.sin(k * Math.PI) * 13;
      tScaleX = 1 - 0.08 * Math.sin(k * Math.PI);
      tScaleY = 1 + 0.14 * Math.sin(k * Math.PI);
      tBodyRot = Math.sin(t * 42) * 5.5 * k;
      tSitTail = Math.sin(t * 28) * 22;
      tCupRot = -10 * k;
      if (state.modeTime >= state.modeDuration) {
        if (state.pokeCount >= 3) {
          state.pokeCount = 0;
          jumpToNeighbor();
        } else {
          setMode('sit', 3.6);
        }
      }
    }

    // Amorti supplémentaire lors d'un changement de rig ou d'un demi-tour
    const turnSquash = 1 - Math.abs(state.dirSmooth);
    const switchDip = Math.sin(state.rigSwitchDip * Math.PI);
    tScaleX *= 1 + switchDip * 0.08;
    tScaleY *= 1 - switchDip * 0.10 - turnSquash * 0.06;
    tBodyY += switchDip * 3.5;

    // Lissage exponentiel de chaque paramètre articulé (zéro saccade)
    const speed = state.mode === 'walk' || state.mode === 'jump' || state.mode === 'wiggle' ? 18 : 11;
    P.bodyY    = damp(P.bodyY,    tBodyY,    speed, dt);
    P.bodyRot  = damp(P.bodyRot,  tBodyRot,  speed, dt);
    P.scaleX   = damp(P.scaleX,   tScaleX,   speed, dt);
    P.scaleY   = damp(P.scaleY,   tScaleY,   speed, dt);
    P.bl       = damp(P.bl,       tBL,       speed, dt);
    P.br       = damp(P.br,       tBR,       speed, dt);
    P.fl       = damp(P.fl,       tFL,       speed, dt);
    P.fr       = damp(P.fr,       tFR,       speed, dt);
    P.blLift   = damp(P.blLift,   tBLLift,   speed, dt);
    P.brLift   = damp(P.brLift,   tBRLift,   speed, dt);
    P.flLift   = damp(P.flLift,   tFLLift,   speed, dt);
    P.frLift   = damp(P.frLift,   tFRLift,   speed, dt);
    P.walkTail = damp(P.walkTail, tWalkTail, 14,    dt);
    P.sitTail  = damp(P.sitTail,  tSitTail,  14,    dt);
    P.cupRot   = damp(P.cupRot,   tCupRot,   12,    dt);
    P.cupLift  = damp(P.cupLift,  tCupLift,  12,    dt);
    P.eyesClosed = eyesClosed || switchDip > 0.6;

    state.slopeSmooth = damp(state.slopeSmooth, state.slope, 12, dt);

    catEl.style.transform = `translate3d(${ state.x.toFixed(1) }px, ${ state.y.toFixed(1) }px, 0)`;
  }

  // =========================================================
  // RENDU CANVAS 2D HAUTE DÉFINITION
  // =========================================================
  function drawPart(part, ox, oy, rotDeg) {
    ctx.save();
    ctx.translate(ox, oy);
    if (rotDeg) ctx.rotate(deg(rotDeg));
    ctx.drawImage(
      rigImg,
      part.sx, part.sy, part.sw, part.sh,
      -part.px, -part.py, part.w, part.h
    );
    ctx.restore();
  }

  function render(now) {
    if (!ctx || !rigLoaded) return;
    const t = now * 0.001;
    const P = state.pose;

    ctx.clearRect(0, 0, 160, 136);
    ctx.save();
    // Point de contact des pattes au sol dans le canvas : (80, 120)
    ctx.translate(80, 120);
    ctx.rotate(state.slopeSmooth);
    ctx.scale(state.dirSmooth * P.scaleX, P.scaleY);

    if (state.activeRig === 'walk') {
      const body = P.eyesClosed ? PARTS.walk_body_doze : PARTS.walk_body;
      ctx.save();
      ctx.translate(body.ax, body.ay + P.bodyY);
      ctx.rotate(deg(P.bodyRot));

      // 1. Pattes arrière-plan (gauche) + queue touffue
      drawPart(PARTS.leg_bl, PARTS.leg_bl.ax - body.ax, PARTS.leg_bl.ay - body.ay - P.blLift, P.bl);
      drawPart(PARTS.leg_fl, PARTS.leg_fl.ax - body.ax, PARTS.leg_fl.ay - body.ay - P.flLift, P.fl);
      drawPart(PARTS.walk_tail, PARTS.walk_tail.ax - body.ax, PARTS.walk_tail.ay - body.ay, P.walkTail);

      // 2. Corps + tête + béret
      ctx.drawImage(
        rigImg,
        body.sx, body.sy, body.sw, body.sh,
        -body.px, -body.py, body.w, body.h
      );

      // 3. Pattes premier plan (droite)
      drawPart(PARTS.leg_br, PARTS.leg_br.ax - body.ax, PARTS.leg_br.ay - body.ay - P.brLift, P.br);
      drawPart(PARTS.leg_fr, PARTS.leg_fr.ax - body.ax, PARTS.leg_fr.ay - body.ay - P.frLift, P.fr);

      ctx.restore();
    } else {
      const body = P.eyesClosed ? PARTS.sit_body_doze : PARTS.sit_body;
      ctx.save();
      ctx.translate(body.ax, body.ay + P.bodyY);
      ctx.rotate(deg(P.bodyRot));

      // 1. Queue assise qui ondule
      drawPart(PARTS.sit_tail, PARTS.sit_tail.ax - body.ax, PARTS.sit_tail.ay - body.ay, P.sitTail);

      // 2. Corps assis
      ctx.drawImage(
        rigImg,
        body.sx, body.sy, body.sw, body.sh,
        -body.px, -body.py, body.w, body.h
      );

      // 3. Bras + gobelet de café à emporter
      drawPart(PARTS.sit_cup, PARTS.sit_cup.ax - body.ax, PARTS.sit_cup.ay - body.ay + P.cupLift, P.cupRot);

      // 4. Vapeur animée qui flotte et ondule au-dessus du gobelet
      const steamBob = Math.sin(t * 3.0) * 2.2;
      const steamSway = Math.cos(t * 2.4) * 6;
      ctx.save();
      ctx.globalAlpha = 0.78 + Math.sin(t * 3.0) * 0.2;
      drawPart(
        PARTS.sit_steam,
        PARTS.sit_steam.ax - body.ax + P.cupRot * 0.22,
        PARTS.sit_steam.ay - body.ay + P.cupLift + steamBob,
        steamSway
      );
      ctx.restore();

      ctx.restore();
    }

    ctx.restore();
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
      setMode('angry', 0.36);
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

    canvas = document.createElement('canvas');
    canvas.className = 'gc__canvas';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 160 * dpr;
    canvas.height = 136 * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    hitEl = document.createElement('div');
    hitEl.className = 'gc__hit';
    hitEl.addEventListener('click', onPoke);

    bubbleEl = document.createElement('div');
    bubbleEl.className = 'gc__bubble';

    catEl.appendChild(shadow);
    catEl.appendChild(canvas);
    catEl.appendChild(hitEl);
    catEl.appendChild(bubbleEl);
    root.appendChild(catEl);
    document.body.appendChild(root);
  }

  let lastTime = 0;
  function loop(now) {
    if (!root) return;
    if (!lastTime) lastTime = now;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt, now);
    render(now);
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
    setMode('sit', 3.4);
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function destroy() {
    if (!root) return;
    cancelAnimationFrame(rafId);
    root.remove();
    root = null;
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
