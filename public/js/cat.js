// Chat Caféiné — Le Chat du Café v3
// Architecture sans lag inspirée de eSheep / Shimeji (DOM Platformer en coordonnées document + gravité balistique)
// et Oneko.js (chasseur de curseur fluide).
(() => {
  if (typeof window === 'undefined') return;
  const mq = window.matchMedia('(min-width: 960px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  const MODE_KEY = 'cc-cat-version-v3';
  const GRAVITY = 1650; // px/s² pour des sauts balistiques naturels

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Cinématique inverse à 2 segments (épaule/hanche -> coude/genou -> patte)
  function solveIK(hx, hy, fx, fy, l1, l2, bendDir) {
    const dx = fx - hx;
    const dy = fy - hy;
    const rawDist = Math.hypot(dx, dy) || 0.001;
    const dist = Math.min(rawDist, l1 + l2 - 0.01);
    const baseAngle = Math.atan2(dy, dx);
    const cosA = clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1);
    const angle = baseAngle + bendDir * Math.acos(cosA);
    return {
      kx: hx + Math.cos(angle) * l1,
      ky: hy + Math.sin(angle) * l1,
      fx: hx + (dx / rawDist) * dist,
      fy: hy + (dy / rawDist) * dist,
    };
  }

  let layer = null;
  let wrap = null;
  let canvas = null;
  let ctx = null;
  let hitEl = null;
  let bubbleEl = null;
  let switcherEl = null;
  let bubbleTimer = null;
  let rafId = null;

  // Cache des plateformes DOM en coordonnées DOCUMENT (zéro getBoundingClientRect pendant le scroll !)
  let cachedPlatforms = [];

  const cat = {
    version: localStorage.getItem(MODE_KEY) || 'v1', // v1 | v2 | v3 | v4
    isFixedMode: false, // false = coordonnées document (v1), true = coordonnées viewport (v2, v3, v4)

    x: 320,
    y: 400,
    vx: 0,
    vy: 0,
    dir: 1,
    slopeAngle: 0, // inclinaison sur les arches de produits (.pc__img)

    currentPlat: null,
    targetPlat: null,
    targetX: 480,
    targetY: 400,

    // États : 'walk' | 'run' | 'sit' | 'sleep' | 'waffle' | 'stretch' | 'groom' | 'wiggle' | 'jump' | 'coffee' | 'dangling' | 'alert'
    pose: 'sit',
    poseTime: 0,
    poseDuration: 3.5,
    stridePhase: 0,

    // Vol balistique (jump)
    flightTime: 0,
    flightDuration: 0.55,

    // Suivi souris (en coordonnées viewport clientX / clientY)
    mouseX: window.innerWidth * 0.5,
    mouseY: window.innerHeight * 0.4,
    lastMouseMove: performance.now(),
    offscreenTime: 0,
    tailPokeCooldown: 0,

    // Clignement & particules
    blinkTimer: 2.8,
    isBlinking: false,
    fx: [],
    lastFxTime: 0,
  };

  function showBubble(text, ms = 2300) {
    if (!bubbleEl) return;
    clearTimeout(bubbleTimer);
    bubbleEl.textContent = text;
    bubbleEl.classList.add('is-on');
    bubbleTimer = setTimeout(() => bubbleEl.classList.remove('is-on'), ms);
  }

  function addFx(text, color = '#b47a4b', ox = 0, oy = -42) {
    cat.fx.push({
      text,
      color,
      x: ox + rand(-6, 6),
      y: oy,
      vx: rand(-10, 10),
      vy: rand(-26, -18),
      life: 0,
      maxLife: 1.45,
    });
  }

  // =========================================================
  // SCAN DES PLATEFORMES DOM (mis en cache, hors boucle 60fps)
  // =========================================================
  function scanPlatforms() {
    const sx = window.scrollX;
    const sy = window.scrollY;
    const list = [];

    // 1. Cartes produits en arche (.pc__img) — le chat suit la courbe arrondie du dôme !
    document.querySelectorAll('.pc__img').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 100 || r.height < 100) return;
      const left = r.left + sx;
      const right = r.right + sx;
      const top = r.top + sy;
      const rx = r.width * 0.5;
      const ry = r.height * 0.463; // correspond au border-radius: 50% / 46.3%
      const cx = left + rx;
      list.push({
        id: 'arch-' + Math.round(left) + '-' + Math.round(top),
        kind: 'arch',
        left,
        right,
        minX: left + 34,
        maxX: right - 34,
        top,
        cx,
        rx,
        ry,
        getY(x) {
          const u = clamp((x - cx) / rx, -0.88, 0.88);
          return top + ry * (1 - Math.sqrt(Math.max(0, 1 - u * u))) + 3;
        },
        getSlope(x) {
          const u = clamp((x - cx) / rx, -0.82, 0.82);
          const denom = Math.sqrt(Math.max(0.08, 1 - u * u));
          return Math.atan2((ry / rx) * (u / denom), 1) * 0.55;
        },
      });
    });

    // 2. Boutons « + Ajouter », panneaux, lignes de menu, titres, pied de page (surfaces planes)
    document.querySelectorAll('.pc .add, .btn--dark, .panel, .note, .mi, .split__media, .ftr').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 115 || r.height < 28) return;
      const left = r.left + sx;
      const right = r.right + sx;
      const top = r.top + sy;
      const pad = Math.min(28, r.width * 0.18);
      if (right - left - pad * 2 < 40) return;
      list.push({
        id: 'flat-' + Math.round(left) + '-' + Math.round(top),
        kind: el.classList.contains('ftr') ? 'footer' : 'flat',
        left,
        right,
        minX: left + pad,
        maxX: right - pad,
        top,
        getY() { return top + 2; },
        getSlope() { return 0; },
      });
    });

    cachedPlatforms = list;
  }

  // Plateformes actuellement visibles à l'écran (pour choisir où sauter en v1)
  function getViewportPlatforms() {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    const minY = sy + 95;
    const maxY = sy + vh - 30;
    return cachedPlatforms.filter((p) => p.top >= minY && p.top <= maxY);
  }

  function setPose(pose, duration = 3.5) {
    cat.pose = pose;
    cat.poseTime = 0;
    cat.poseDuration = duration;
  }

  // Prépare et lance un vrai saut balistique de (cat.x, cat.y) vers (destX, destY)
  function initiateJump(targetPlat, destX, destY) {
    cat.targetPlat = targetPlat || null;
    cat.targetX = destX;
    cat.targetY = destY;
    cat.dir = destX >= cat.x ? 1 : -1;
    cat.slopeAngle = 0;
    // Petit frétillement du popotin avant le décollage
    setPose('wiggle', 0.36);
  }

  function launchBallisticJump() {
    const dx = cat.targetX - cat.x;
    const dy = cat.targetY - cat.y;
    const dist = Math.hypot(dx, dy);
    // Durée du vol proportionnelle à la distance, avec une belle arche
    const T = clamp(0.42 + dist / 950, 0.44, 0.82);
    cat.flightDuration = T;
    cat.flightTime = 0;
    cat.vx = dx / T;
    cat.vy = (dy - 0.5 * GRAVITY * T * T) / T;
    // S'assure que le saut monte toujours un minimum vers le haut
    if (cat.vy > -180) {
      const T2 = clamp(T + 0.12, 0.48, 0.86);
      cat.flightDuration = T2;
      cat.vx = dx / T2;
      cat.vy = (dy - 0.5 * GRAVITY * T2 * T2) / T2;
    }
    cat.dir = dx >= 0 ? 1 : -1;
    cat.pose = 'jump';
    cat.poseTime = 0;
  }

  function jumpToRandomVisiblePlatform() {
    if (!cachedPlatforms.length) scanPlatforms();
    const visible = getViewportPlatforms();
    if (!visible.length) return;
    // Privilégie une plateforme différente de l'actuelle et pas trop éloignée
    const others = visible.filter((p) => p !== cat.currentPlat);
    const pool = others.length ? others : visible;
    // Trie par proximité pour que le chat saute souvent d'une carte produit à sa voisine !
    const sorted = [...pool].sort((a, b) => {
      const da = Math.hypot((a.minX + a.maxX) * 0.5 - cat.x, (a.top - cat.y) * 1.3);
      const db = Math.hypot((b.minX + b.maxX) * 0.5 - cat.x, (b.top - cat.y) * 1.3);
      return da - db;
    });
    const candidates = sorted.slice(0, Math.min(4, sorted.length));
    const chosen = pick(candidates);
    const destX = clamp(rand(chosen.minX, chosen.maxX), chosen.minX, chosen.maxX);
    const destY = chosen.getY(destX);
    initiateJump(chosen, destX, destY);
  }

  // =========================================================
  // DÉCISION DU PROCHAIN COMPORTEMENT SELON LA VERSION (1..4)
  // =========================================================
  function decideNextAction() {
    const v = cat.version;

    // ---------------- VERSION 1 : PARKOUR DOM (eSheep / Shimeji) ----------------
    if (v === 'v1') {
      const r = Math.random();
      // 42% : sauter vers une carte / bouton voisin
      if (r < 0.42 || !cat.currentPlat) {
        jumpToRandomVisiblePlatform();
        return;
      }
      // 32% : marcher le long de la carte/arche actuelle
      const span = cat.currentPlat.maxX - cat.currentPlat.minX;
      if (r < 0.74 && span > 45) {
        cat.targetX = cat.x < (cat.currentPlat.minX + cat.currentPlat.maxX) * 0.5
          ? rand((cat.currentPlat.minX + cat.currentPlat.maxX) * 0.5, cat.currentPlat.maxX)
          : rand(cat.currentPlat.minX, (cat.currentPlat.minX + cat.currentPlat.maxX) * 0.5);
        cat.dir = cat.targetX >= cat.x ? 1 : -1;
        setPose('walk', 4.5);
        return;
      }
      // 26% : faire une animation mignonne sur la carte (повафлиться, свесить хвост, спать, кофе)
      const pose = pick(['waffle', 'dangling', 'sleep', 'coffee', 'groom', 'stretch', 'sit']);
      if (pose === 'waffle' && Math.random() < 0.5) {
        showBubble(pick(['Повафлился на булочке ~', 'Тёплый синнабон ♥', 'Ronron ~']), 2100);
      }
      setPose(pose, pose === 'stretch' ? 1.8 : rand(3.5, 6.0));
      return;
    }

    // ---------------- VERSION 2 : ONEKO.JS (Chasseur de curseur 2D) ----------------
    if (v === 'v2') {
      const dist = Math.hypot(cat.mouseX - cat.x, cat.mouseY - cat.y);
      if (dist > 68) {
        cat.dir = cat.mouseX >= cat.x ? 1 : -1;
        setPose('run', 4.0);
        return;
      }
      const pose = pick(['sit', 'waffle', 'groom', 'sleep', 'stretch', 'coffee']);
      setPose(pose, rand(3.2, 5.8));
      return;
    }

    // ---------------- VERSION 3 : SHIMEJI EN-TÊTE (.hdr) & ÉTAGÈRES ----------------
    if (v === 'v3') {
      const hdr = document.querySelector('.hdr');
      const hdrBottom = hdr ? Math.max(56, hdr.getBoundingClientRect().bottom - 2) : 70;
      cat.y = hdrBottom;
      cat.slopeAngle = 0;

      const r = Math.random();
      if (r < 0.42) {
        cat.targetX = rand(90, window.innerWidth - 90);
        if (Math.abs(cat.targetX - cat.x) < 100) {
          cat.targetX = cat.x < window.innerWidth * 0.5 ? window.innerWidth - 120 : 120;
        }
        cat.dir = cat.targetX >= cat.x ? 1 : -1;
        setPose('walk', 5.0);
      } else if (r < 0.68) {
        // Queue et patte qui pendent au-dessus du menu de navigation !
        setPose('dangling', rand(5.0, 8.5));
      } else if (r < 0.84) {
        setPose('waffle', rand(4.5, 7.0));
      } else {
        setPose(pick(['coffee', 'sleep', 'groom', 'stretch']), rand(3.5, 6.0));
      }
      return;
    }

    // ---------------- VERSION 4 : PROMENEUR BAS D'ÉCRAN ----------------
    cat.y = window.innerHeight - 8;
    cat.slopeAngle = 0;
    const r = Math.random();
    if (r < 0.48) {
      cat.targetX = rand(80, window.innerWidth - 80);
      if (Math.abs(cat.targetX - cat.x) < 150) {
        cat.targetX = cat.x < window.innerWidth * 0.5 ? window.innerWidth - 110 : 110;
      }
      cat.dir = cat.targetX >= cat.x ? 1 : -1;
      setPose(Math.random() < 0.28 ? 'run' : 'walk', 6.0);
    } else if (r < 0.68) {
      setPose('waffle', rand(4.5, 7.5));
    } else if (r < 0.82) {
      setPose('sleep', rand(5.5, 8.5));
    } else {
      setPose(pick(['coffee', 'groom', 'stretch', 'sit']), rand(3.2, 5.2));
    }
  }

  // =========================================================
  // BOUCLE PHYSIQUE (60 FPS constants, zéro reflow DOM)
  // =========================================================
  function updatePhysics(dt, now) {
    cat.poseTime += dt;
    if (cat.tailPokeCooldown > 0) cat.tailPokeCooldown -= dt;

    // Clignement des yeux
    cat.blinkTimer -= dt;
    if (cat.blinkTimer <= 0) {
      cat.isBlinking = true;
      if (cat.blinkTimer <= -0.14) {
        cat.isBlinking = false;
        cat.blinkTimer = rand(2.5, 5.4);
      }
    }

    // Particules flottantes
    for (let i = cat.fx.length - 1; i >= 0; i--) {
      const p = cat.fx[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life >= p.maxLife) cat.fx.splice(i, 1);
    }

    if (now - cat.lastFxTime > 1250) {
      if (cat.pose === 'sleep') {
        addFx(pick(['z', 'Z', 'zZz']), '#6e5a4c', cat.dir * 18, -32);
        cat.lastFxTime = now;
      } else if (cat.pose === 'waffle') {
        addFx(pick(['♥', '♪', '~']), '#c84b31', 0, -36);
        cat.lastFxTime = now;
      } else if (cat.pose === 'coffee') {
        addFx('☕', '#8b4b2e', cat.dir * 24, -44);
        cat.lastFxTime = now;
      }
    }

    // Coordonnées de la souris dans le même référentiel que le chat
    const mx = cat.isFixedMode ? cat.mouseX : cat.mouseX + window.scrollX;
    const my = cat.isFixedMode ? cat.mouseY : cat.mouseY + window.scrollY;

    // Interaction rigolote : si la souris touche la queue qui pend (mode dangling)
    if (cat.pose === 'dangling' && cat.tailPokeCooldown <= 0) {
      const tailTipX = cat.x - cat.dir * 22;
      const tailTipY = cat.y + 34;
      if (Math.hypot(mx - tailTipX, my - tailTipY) < 28) {
        cat.tailPokeCooldown = 2.0;
        addFx('!', '#c84b31', 0, -52);
        showBubble(pick(['Эй, за хвост не дёргать! 🐾', 'Miaou ! Ma queue !', 'Кусь сделаю!']), 2200);
        setPose('waffle', 4.0);
        return;
      }
    }

    // ---------------- VOL BALISTIQUE (JUMP) ----------------
    if (cat.pose === 'jump') {
      cat.flightTime += dt;
      cat.x += cat.vx * dt;
      cat.vy += GRAVITY * dt;
      cat.y += cat.vy * dt;
      cat.slopeAngle = clamp(Math.atan2(cat.vy, Math.abs(cat.vx) || 1) * 0.35 * cat.dir, -0.45, 0.45);

      if (cat.flightTime >= cat.flightDuration) {
        cat.x = cat.targetX;
        cat.y = cat.targetY;
        cat.vx = 0;
        cat.vy = 0;
        if (cat.targetPlat) {
          cat.currentPlat = cat.targetPlat;
          cat.slopeAngle = cat.currentPlat.getSlope(cat.x);
        } else {
          cat.slopeAngle = 0;
        }
        setPose(pick(['sit', 'dangling', 'waffle']), rand(2.8, 5.0));
      }
      return;
    }

    // ---------------- PRÉPARATION DU SAUT (WIGGLE) ----------------
    if (cat.pose === 'wiggle') {
      if (cat.poseTime >= cat.poseDuration) {
        launchBallisticJump();
      }
      return;
    }

    // ---------------- MODE V1 : VÉRIFICATION DE VISIBILITÉ À L'ÉCRAN ----------------
    if (cat.version === 'v1') {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const isOffscreen = cat.y < sy + 40 || cat.y > sy + vh + 30;
      if (isOffscreen) {
        cat.offscreenTime += dt;
        // Si l'utilisateur a scrollé plus loin depuis 0.7s, le chat rejoint les blocs visibles !
        if (cat.offscreenTime > 0.7) {
          cat.offscreenTime = 0;
          const visible = getViewportPlatforms();
          if (visible.length) {
            const chosen = pick(visible);
            const destX = clamp(rand(chosen.minX, chosen.maxX), chosen.minX, chosen.maxX);
            const destY = chosen.getY(destX);
            // Place le chat juste au bord de l'écran pour qu'on le voie bondir sur la carte
            cat.x = clamp(destX + rand(-120, 120), 80, window.innerWidth - 80);
            cat.y = cat.y < sy + 40 ? sy + 55 : sy + vh - 15;
            initiateJump(chosen, destX, destY);
            return;
          }
        }
      } else {
        cat.offscreenTime = 0;
      }
    }

    // ---------------- MODE V2 : ONEKO CHASSEUR DE CURSEUR ----------------
    if (cat.version === 'v2') {
      const dist = Math.hypot(mx - cat.x, my - cat.y);
      if (cat.pose !== 'run' && cat.pose !== 'alert' && dist > 78 && performance.now() - cat.lastMouseMove < 600) {
        cat.dir = mx >= cat.x ? 1 : -1;
        addFx('!', '#b47a4b', 0, -48);
        setPose('alert', 0.22);
        return;
      }
      if (cat.pose === 'alert' && cat.poseTime >= cat.poseDuration) {
        setPose('run', 5.0);
        return;
      }
      if (cat.pose === 'run') {
        // S'arrête à 42px du curseur pour ne jamais bloquer le clic de l'utilisateur
        const angle = Math.atan2(my - cat.y, mx - cat.x);
        const stopX = clamp(mx - Math.cos(angle) * 42, 55, window.innerWidth - 55);
        const stopY = clamp(my - Math.sin(angle) * 28, 85, window.innerHeight - 12);
        const dStop = Math.hypot(stopX - cat.x, stopY - cat.y);
        if (dStop < 10) {
          setPose(pick(['sit', 'waffle', 'groom']), rand(3.5, 6.0));
          return;
        }
        const speed = 210;
        const step = Math.min(dStop, speed * dt);
        if (Math.abs(mx - cat.x) > 8) cat.dir = mx >= cat.x ? 1 : -1;
        cat.x += ((stopX - cat.x) / dStop) * step;
        cat.y += ((stopY - cat.y) / dStop) * step;
        cat.stridePhase += step * 0.11;
        return;
      }
    }

    // ---------------- MARCHE / COURSE SUR UNE SURFACE (v1, v3, v4) ----------------
    if (cat.pose === 'walk' || cat.pose === 'run') {
      const dx = cat.targetX - cat.x;
      const speed = cat.pose === 'run' ? 155 : 66;
      const step = speed * dt;
      if (Math.abs(dx) <= step + 2 || cat.poseTime > cat.poseDuration) {
        cat.x = cat.targetX;
        if (cat.version === 'v1' && cat.currentPlat) {
          cat.y = cat.currentPlat.getY(cat.x);
          cat.slopeAngle = cat.currentPlat.getSlope(cat.x);
        }
        decideNextAction();
      } else {
        cat.dir = dx >= 0 ? 1 : -1;
        cat.x += Math.sign(dx) * step;
        cat.stridePhase += step * 0.095;
        if (cat.version === 'v1' && cat.currentPlat) {
          cat.y = cat.currentPlat.getY(cat.x);
          cat.slopeAngle = cat.currentPlat.getSlope(cat.x);
        } else if (cat.version === 'v3') {
          const hdr = document.querySelector('.hdr');
          cat.y = hdr ? Math.max(56, hdr.getBoundingClientRect().bottom - 2) : 70;
          cat.slopeAngle = 0;
        } else if (cat.version === 'v4') {
          cat.y = window.innerHeight - 8;
          cat.slopeAngle = 0;
        }
      }
      return;
    }

    // En mode v1, quand le chat dort ou se roule sur une arche, réduit l'inclinaison pour que ce soit joli
    if (cat.version === 'v1' && cat.currentPlat) {
      cat.y = cat.currentPlat.getY(cat.x);
      cat.slopeAngle = cat.currentPlat.getSlope(cat.x) * 0.35;
    }

    if (cat.poseTime >= cat.poseDuration) {
      decideNextAction();
    }
  }

  // =========================================================
  // RENDU CANVAS 2D (IK + colonne vertébrale souple)
  // =========================================================
  function drawCat(now) {
    if (!ctx) return;
    const t = now * 0.001;
    ctx.clearRect(0, 0, 150, 140);

    ctx.save();
    ctx.translate(75, 100);
    ctx.rotate(cat.slopeAngle);

    // Ombre douce au sol
    const airRatio = cat.pose === 'jump'
      ? Math.sin(clamp(cat.flightTime / (cat.flightDuration || 0.5), 0, 1) * Math.PI)
      : 0;
    const shScale = clamp(1 - airRatio * 0.45, 0.45, 1.1);
    ctx.fillStyle = 'rgba(43, 20, 10, 0.17)';
    ctx.beginPath();
    ctx.ellipse(0, 1.5, 27 * shScale, 4.2 * shScale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(cat.dir, 1);

    const ESPRESSO = '#2b140a';
    const ESPRESSO_DARK = '#1a0b05';
    const MOCHA = '#4a2514';
    const CARAMEL = '#7a3b1e';
    const CREAM = '#fffaf3';
    const LATTE = '#e4d3c0';
    const PINK = '#e58b7b';

    let hipX = -15, hipY = -22;
    let shX = 14, shY = -23;
    let spineArch = -3;
    let headX = 23, headY = -36, headRot = 0;

    if (cat.pose === 'walk' || cat.pose === 'run') {
      const p = cat.stridePhase;
      const bob = Math.sin(p * 2) * (cat.pose === 'run' ? 2.6 : 1.4);
      hipY = -22 + bob;
      shY = -23 - bob * 0.5;
      spineArch = cat.pose === 'run' ? -4.5 * Math.sin(p) : -2;
      headX = 24;
      headY = -36 + bob * 0.5;
      headRot = 0.04 * Math.sin(p);
    } else if (cat.pose === 'sit' || cat.pose === 'groom' || cat.pose === 'coffee' || cat.pose === 'alert') {
      hipX = -11; hipY = -12;
      shX = 7; shY = -27;
      spineArch = -4;
      headX = 12; headY = cat.pose === 'alert' ? -45 : -42;
      headRot = cat.pose === 'alert' ? -0.08 : Math.sin(t * 1.6) * 0.05;
    } else if (cat.pose === 'sleep') {
      const breathe = Math.sin(t * 2.1) * 1.0;
      hipX = -14; hipY = -10 + breathe * 0.5;
      shX = 11; shY = -11 + breathe;
      spineArch = -7 + breathe;
      headX = 18; headY = -18 + breathe * 0.6;
      headRot = 0.22;
    } else if (cat.pose === 'dangling') {
      const breathe = Math.sin(t * 2.0) * 0.9;
      hipX = -14; hipY = -12 + breathe * 0.4;
      shX = 12; shY = -13 + breathe;
      spineArch = -5;
      headX = 21; headY = -22 + breathe * 0.5;
      headRot = 0.12 + Math.sin(t * 1.2) * 0.05;
    } else if (cat.pose === 'stretch') {
      const st = clamp(cat.poseTime / 0.55, 0, 1);
      hipX = -16; hipY = -27 * st - 20 * (1 - st);
      shX = 14; shY = -12 * st - 22 * (1 - st);
      spineArch = 5 * st;
      headX = 24; headY = -21 * st - 34 * (1 - st);
      headRot = -0.14;
    } else if (cat.pose === 'wiggle') {
      const wig = Math.sin(t * 36) * 3.0;
      hipX = -16; hipY = -18 + wig;
      shX = 14; shY = -13;
      spineArch = -2;
      headX = 24; headY = -22;
      headRot = -0.08;
    } else if (cat.pose === 'jump') {
      const jt = clamp(cat.flightTime / (cat.flightDuration || 0.5), 0, 1);
      const pitch = (jt - 0.5) * 0.7;
      hipX = -16; hipY = -24;
      shX = 16; shY = -24 + Math.sin(pitch) * 12;
      spineArch = -8 * Math.sin(jt * Math.PI);
      headX = shX + 10; headY = shY - 12;
      headRot = pitch * 0.5;
    } else if (cat.pose === 'waffle') {
      const roll = Math.sin(t * 3.4) * 2.0;
      hipX = -13; hipY = -11 + roll * 0.4;
      shX = 12; shY = -12 - roll * 0.4;
      spineArch = 6;
      headX = 21; headY = -21 + Math.sin(t * 3.4) * 1.6;
      headRot = -0.25 + Math.sin(t * 3.4) * 0.14;
    }

    const tailBaseX = hipX - 5;
    const tailBaseY = hipY;

    // 1. Queue souple
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = ESPRESSO;
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.moveTo(tailBaseX, tailBaseY);
    if (cat.pose === 'dangling') {
      const sw = Math.sin(t * 2.3) * 7;
      ctx.bezierCurveTo(tailBaseX - 10, tailBaseY + 12, tailBaseX - 12 + sw * 0.5, tailBaseY + 28, tailBaseX - 6 + sw, tailBaseY + 42);
    } else if (cat.pose === 'sleep') {
      ctx.bezierCurveTo(tailBaseX - 14, tailBaseY + 4, tailBaseX - 8, tailBaseY + 11, tailBaseX + 6, tailBaseY + 9);
    } else if (cat.pose === 'waffle') {
      const wag = Math.sin(t * 6.5) * 12;
      ctx.bezierCurveTo(tailBaseX - 14, tailBaseY + 2, tailBaseX - 24, tailBaseY - 8 + wag * 0.5, tailBaseX - 28, tailBaseY - 16 + wag);
    } else {
      const wave1 = Math.sin(t * 3.4) * 8;
      const wave2 = Math.cos(t * 3.4) * 9;
      ctx.bezierCurveTo(tailBaseX - 14, tailBaseY - 10 + wave1 * 0.4, tailBaseX - 20, tailBaseY - 26 + wave1, tailBaseX - 10 + wave2, tailBaseY - 36);
    }
    ctx.stroke();
    ctx.restore();

    function drawLeg(hx, hy, fx, fy, bendDir, color, pawColor = color) {
      const ik = solveIK(hx, hy, fx, fy, 12.5, 12.5, bendDir);
      ctx.strokeStyle = color;
      ctx.lineWidth = 6.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(ik.kx, ik.ky);
      ctx.lineTo(ik.fx, ik.fy);
      ctx.stroke();

      ctx.fillStyle = pawColor;
      ctx.beginPath();
      ctx.ellipse(ik.fx + 1.2, ik.fy, 4.2, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function computeFoot(baseX, phaseOffset, isFront) {
      if (cat.pose === 'walk' || cat.pose === 'run') {
        const p = cat.stridePhase + phaseOffset;
        const stride = cat.pose === 'run' ? 12 : 9.2;
        const lift = Math.max(0, Math.sin(p)) * (cat.pose === 'run' ? 8.5 : 6.2);
        return { x: baseX + Math.cos(p) * stride, y: -2 - lift };
      }
      if (cat.pose === 'jump') {
        const jt = clamp(cat.flightTime / (cat.flightDuration || 0.5), 0, 1);
        return isFront
          ? { x: baseX + 11 * (1 - jt * 0.3), y: -11 + jt * 7 }
          : { x: baseX - 11 * (1 - jt * 0.3), y: -9 + jt * 5 };
      }
      if (cat.pose === 'stretch') {
        return isFront ? { x: baseX + 13, y: -2 } : { x: baseX - 4, y: -2 };
      }
      return { x: baseX, y: -2 };
    }

    // 2. Pattes arrière-plan
    if (cat.pose === 'waffle') {
      const w1 = Math.sin(t * 7.5) * 4;
      const w2 = Math.cos(t * 7.5) * 4;
      drawLeg(hipX - 2, hipY - 4, hipX - 8 + w1, hipY - 21 - w2, 1, ESPRESSO_DARK, MOCHA);
      drawLeg(shX - 2, shY - 4, shX - 4 - w2, shY - 22 + w1, -1, ESPRESSO_DARK, MOCHA);
    } else if (cat.pose !== 'sleep') {
      const bl = computeFoot(hipX - 2, Math.PI, false);
      const fl = computeFoot(shX - 1, 0, true);
      drawLeg(hipX, hipY, bl.x, bl.y, -1, ESPRESSO_DARK);
      if (cat.pose !== 'dangling') {
        drawLeg(shX, shY, fl.x, fl.y, 1, ESPRESSO_DARK);
      }
    }

    // 3. Corps
    const midX = (hipX + shX) * 0.5;
    const midY = (hipY + shY) * 0.5 + spineArch;
    ctx.save();
    ctx.strokeStyle = ESPRESSO;
    ctx.lineWidth = cat.pose === 'sleep' ? 21 : 19;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.quadraticCurveTo(midX, midY, shX, shY);
    ctx.stroke();

    if (cat.pose === 'waffle') {
      ctx.strokeStyle = '#6e4228';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(hipX + 4, hipY - 5);
      ctx.quadraticCurveTo(midX, midY - 6, shX - 3, shY - 5);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Pattes premier plan
    if (cat.pose === 'waffle') {
      const w1 = Math.cos(t * 7.5) * 4.5;
      const w2 = Math.sin(t * 7.5) * 4.5;
      drawLeg(hipX + 2, hipY - 3, hipX - 2 + w1, hipY - 22 + w2, 1, ESPRESSO, PINK);
      drawLeg(shX + 2, shY - 3, shX + 6 - w2, shY - 21 - w1, -1, ESPRESSO, PINK);
    } else if (cat.pose === 'dangling') {
      const swing = Math.sin(t * 2.8) * 5;
      drawLeg(shX + 2, shY + 2, shX + 6 + swing, shY + 25, 1, ESPRESSO, MOCHA);
    } else if (cat.pose === 'groom') {
      const br = computeFoot(hipX + 2, 0, false);
      drawLeg(hipX, hipY, br.x, br.y, -1, ESPRESSO);
      const lick = Math.sin(t * 8.5) * 3.5;
      drawLeg(shX + 2, shY, headX + 6, headY + 2 + lick, 1, ESPRESSO, MOCHA);
    } else if (cat.pose !== 'sleep') {
      const br = computeFoot(hipX + 2, 0, false);
      const fr = computeFoot(shX + 3, Math.PI, true);
      drawLeg(hipX, hipY, br.x, br.y, -1, ESPRESSO);
      if (cat.pose !== 'coffee') {
        drawLeg(shX, shY, fr.x, fr.y, 1, ESPRESSO);
      }
    }

    // 5. Tête, visage & béret
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(headRot);

    ctx.fillStyle = ESPRESSO_DARK;
    ctx.beginPath();
    ctx.moveTo(-7, -7); ctx.lineTo(-11, -21); ctx.lineTo(1, -13);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = ESPRESSO;
    ctx.beginPath();
    ctx.moveTo(3, -12); ctx.lineTo(12, -22); ctx.lineTo(13, -7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6e3b23';
    ctx.beginPath();
    ctx.moveTo(5, -11); ctx.lineTo(10.5, -18.5); ctx.lineTo(11, -8.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = ESPRESSO;
    ctx.beginPath();
    ctx.ellipse(2, -1, 14.5, 12.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-11, 0); ctx.lineTo(-16, -1); ctx.lineTo(-12, 3);
    ctx.moveTo(15, 0); ctx.lineTo(20, -1); ctx.lineTo(15, 3);
    ctx.fill();

    const happyEyes = cat.pose === 'waffle' || cat.pose === 'groom' || cat.pose === 'coffee' || cat.pose === 'stretch';
    const sleepEyes = cat.pose === 'sleep';

    if (sleepEyes || cat.isBlinking) {
      ctx.strokeStyle = LATTE;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-1, -1, 3.2, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.moveTo(11.5, -1);
      ctx.arc(8.5, -1, 3.2, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else if (happyEyes) {
      ctx.strokeStyle = CREAM;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(-1, 1, 3.3, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.moveTo(5.5, 1);
      ctx.arc(8.5, 1, 3.3, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = CREAM;
      ctx.beginPath();
      ctx.ellipse(-1, -1, 3.8, 4.3, 0, 0, Math.PI * 2);
      ctx.ellipse(8.5, -1, 3.8, 4.3, 0, 0, Math.PI * 2);
      ctx.fill();

      const viewX = cat.isFixedMode ? cat.x : cat.x - window.scrollX;
      const viewY = cat.isFixedMode ? cat.y : cat.y - window.scrollY;
      const dx = (cat.mouseX - viewX) * cat.dir;
      const dy = cat.mouseY - (viewY - 35);
      const ang = Math.atan2(dy, dx);
      const px = Math.cos(ang) * 1.2;
      const py = Math.sin(ang) * 1.2;

      ctx.fillStyle = ESPRESSO_DARK;
      ctx.beginPath();
      ctx.ellipse(-0.6 + px, -1 + py, 2.1, 2.8, 0, 0, Math.PI * 2);
      ctx.ellipse(8.9 + px, -1 + py, 2.1, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-1.4 + px * 0.5, -2.2 + py * 0.5, 0.9, 0, Math.PI * 2);
      ctx.arc(8.1 + px * 0.5, -2.2 + py * 0.5, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = PINK;
    ctx.beginPath();
    ctx.moveTo(2.4, 3); ctx.lineTo(5.4, 3); ctx.lineTo(3.9, 4.9);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(1.9, 5.2, 2.1, 0, 0.85 * Math.PI);
    ctx.moveTo(3.9, 5.2);
    ctx.arc(5.9, 5.2, 2.1, 0.15 * Math.PI, Math.PI);
    ctx.stroke();

    if (cat.pose === 'waffle') {
      ctx.fillStyle = '#e57368';
      ctx.beginPath();
      ctx.arc(3.9, 7.2, 2.1, 0, Math.PI);
      ctx.fill();
    }

    ctx.strokeStyle = LATTE;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(-6, 3); ctx.lineTo(-14, 1.5);
    ctx.moveTo(-6, 5); ctx.lineTo(-15, 5.2);
    ctx.moveTo(12, 3); ctx.lineTo(20, 1.5);
    ctx.moveTo(12, 5); ctx.lineTo(21, 5.2);
    ctx.stroke();

    // Béret français
    ctx.save();
    ctx.translate(1, -11);
    ctx.rotate(-0.1);
    ctx.fillStyle = CARAMEL;
    ctx.strokeStyle = ESPRESSO_DARK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1, -5.2);
    ctx.quadraticCurveTo(0, -9, 2.5, -7.5);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // fin tête

    // 6. Tasse de café
    if (cat.pose === 'coffee') {
      const sip = Math.sin(t * 2.6) * 2.5;
      ctx.save();
      ctx.translate(23, -24 + sip);
      ctx.fillStyle = CREAM;
      ctx.strokeStyle = ESPRESSO_DARK;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(-5, -5, 11, 12, 2.5);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6, 1, 2.8, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();
      ctx.fillStyle = CARAMEL;
      ctx.beginPath();
      ctx.arc(0.5, 1, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Particules
    cat.fx.forEach((p) => {
      const alpha = clamp(1 - p.life / p.maxLife, 0, 1);
      ctx.save();
      ctx.scale(cat.dir, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.font = '700 13px "Fraunces", Georgia, serif';
      ctx.fillText(p.text, p.x * cat.dir, p.y);
      ctx.restore();
    });

    ctx.restore();
  }

  function applyTransform() {
    if (!wrap) return;
    const x = Math.round(cat.x - 75);
    const y = Math.round(cat.y - 100);
    wrap.style.transform = `translate3d(${ x }px, ${ y }px, 0)`;
  }

  function setVersion(ver, announce = true) {
    // Convertit les coordonnées si on passe de document (v1) à fixed (v2/v3/v4) ou inversement
    const wasFixed = cat.isFixedMode;
    const nextFixed = ver !== 'v1';
    if (wasFixed && !nextFixed) {
      cat.x += window.scrollX;
      cat.y += window.scrollY;
    } else if (!wasFixed && nextFixed) {
      cat.x = clamp(cat.x - window.scrollX, 60, window.innerWidth - 60);
      cat.y = clamp(cat.y - window.scrollY, 70, window.innerHeight - 10);
    }

    cat.version = ver;
    cat.isFixedMode = nextFixed;
    cat.slopeAngle = 0;
    try { localStorage.setItem(MODE_KEY, ver); } catch {}

    if (layer) layer.classList.toggle('is-fixed', nextFixed);
    if (switcherEl) {
      switcherEl.querySelectorAll('[data-ver]').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.ver === ver);
      });
    }

    if (ver === 'v1') {
      scanPlatforms();
      const visible = getViewportPlatforms();
      const startPlat = visible.find((p) => p.kind === 'arch') || visible[0] || cachedPlatforms[0];
      if (startPlat) {
        cat.currentPlat = startPlat;
        const cx = (startPlat.minX + startPlat.maxX) * 0.5;
        initiateJump(startPlat, cx, startPlat.getY(cx));
      }
      if (announce) showBubble('В1 (eSheep/Shimeji): Паркур по карточкам и аркам без лагов!', 2400);
    } else if (ver === 'v2') {
      cat.currentPlat = null;
      setPose('run', 4.0);
      if (announce) showBubble('В2 (Oneko.js): Бегает за курсором мышки!', 2400);
    } else if (ver === 'v3') {
      cat.currentPlat = null;
      const hdr = document.querySelector('.hdr');
      const hdrY = hdr ? Math.max(56, hdr.getBoundingClientRect().bottom - 2) : 70;
      initiateJump(null, clamp(cat.x, 120, window.innerWidth - 120), hdrY);
      if (announce) showBubble('В3 (Shimeji Header): Гуляет и свешивает хвост на шапке!', 2500);
    } else {
      cat.currentPlat = null;
      initiateJump(null, clamp(cat.x, 100, window.innerWidth - 100), window.innerHeight - 8);
      if (announce) showBubble('В4: Свободно гуляет по нижней кромке экрана', 2400);
    }
  }

  function buildUI() {
    layer = document.createElement('div');
    layer.className = 'cc-cat-doc-layer';
    layer.setAttribute('aria-hidden', 'true');

    wrap = document.createElement('div');
    wrap.className = 'cc-cat-canvas-wrap';

    bubbleEl = document.createElement('div');
    bubbleEl.className = 'cc-cat-bubble';

    canvas = document.createElement('canvas');
    canvas.className = 'cc-cat-canvas';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 150 * dpr;
    canvas.height = 140 * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    hitEl = document.createElement('div');
    hitEl.className = 'cc-cat-hit';
    hitEl.title = 'Кликни, чтобы погладить кота';

    wrap.appendChild(bubbleEl);
    wrap.appendChild(canvas);
    wrap.appendChild(hitEl);
    layer.appendChild(wrap);
    document.body.appendChild(layer);

    switcherEl = document.createElement('div');
    switcherEl.className = 'cc-cat-switcher';
    switcherEl.innerHTML = `
      <span class="cc-cat-switcher__title">🐾 Поведение кота:</span>
      <button type="button" class="cc-cat-switcher__btn" data-ver="v1">1 · Паркур по блокам</button>
      <button type="button" class="cc-cat-switcher__btn" data-ver="v2">2 · Охотник (Oneko)</button>
      <button type="button" class="cc-cat-switcher__btn" data-ver="v3">3 · На шапке сайта</button>
      <button type="button" class="cc-cat-switcher__btn" data-ver="v4">4 · По низу экрана</button>
      <button type="button" class="cc-cat-switcher__act" data-act="waffle">Повафлиться</button>
      <button type="button" class="cc-cat-switcher__act" data-act="jump">Прыжок</button>
      <button type="button" class="cc-cat-switcher__act" data-act="coffee">Кофе ☕</button>
    `;
    document.body.appendChild(switcherEl);

    switcherEl.addEventListener('click', (e) => {
      const vb = e.target.closest('[data-ver]');
      if (vb) {
        setVersion(vb.dataset.ver, true);
        return;
      }
      const ab = e.target.closest('[data-act]');
      if (!ab) return;
      const act = ab.dataset.act;
      if (act === 'waffle') {
        addFx('♥', '#c84b31', 0, -40);
        showBubble('Повафлился пузиком кверху ~', 2300);
        setPose('waffle', 6.0);
      } else if (act === 'jump') {
        if (cat.version === 'v1') {
          jumpToRandomVisiblePlatform();
        } else {
          const destX = clamp(cat.x + rand(-240, 240), 90, window.innerWidth - 90);
          initiateJump(null, destX, cat.y);
        }
      } else if (act === 'coffee') {
        showBubble('Un petit espresso à Chartres ☕', 2300);
        setPose('coffee', 5.5);
      }
    });

    hitEl.addEventListener('click', (e) => {
      e.stopPropagation();
      addFx('♥', '#c84b31', -8, -42);
      addFx('♥', '#c84b31', 10, -48);
      if (cat.pose !== 'waffle' && Math.random() < 0.55) {
        showBubble(pick(['Мррр… повафлился ♥', 'Чеши пузико ~', 'Ronron suprême ♥']), 2300);
        setPose('waffle', 5.5);
      } else if (cat.version === 'v1') {
        showBubble('Прыг на соседнюю карточку! 🐾', 1800);
        jumpToRandomVisiblePlatform();
      } else {
        showBubble(pick(['Un petit café ? ☕', 'Miaou ♥', 'Потянууулся ~']), 2200);
        setPose(pick(['stretch', 'coffee', 'groom']), 4.2);
      }
    });
  }

  let lastFrame = 0;
  function loop(now) {
    if (!layer) return;
    if (!lastFrame) lastFrame = now;
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;

    updatePhysics(dt, now);
    applyTransform();
    drawCat(now);

    rafId = requestAnimationFrame(loop);
  }

  function init() {
    if (!mq.matches || layer) return;
    buildUI();
    scanPlatforms();

    window.addEventListener('load', scanPlatforms, { once: true });
    window.addEventListener('resize', () => {
      if (!mq.matches) return;
      scanPlatforms();
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      cat.mouseX = e.clientX;
      cat.mouseY = e.clientY;
      cat.lastMouseMove = performance.now();
    }, { passive: true });

    // Double-clic sur la page : le chat bondit sur la carte cliquée !
    window.addEventListener('dblclick', (e) => {
      if (!layer || e.target.closest('.cc-cat-switcher')) return;
      if (cat.version === 'v1') {
        scanPlatforms();
        const docX = e.clientX + window.scrollX;
        const docY = e.clientY + window.scrollY;
        let best = null;
        let bestDist = Infinity;
        cachedPlatforms.forEach((p) => {
          const cx = clamp(docX, p.minX, p.maxX);
          const cy = p.getY(cx);
          const d = Math.hypot(cx - docX, cy - docY);
          if (d < bestDist) { bestDist = d; best = { p, x: cx, y: cy }; }
        });
        if (best) {
          showBubble('Прыгаю туда! 🐾', 1800);
          initiateJump(best.p, best.x, best.y);
        }
      } else {
        const destX = clamp(e.clientX, 70, window.innerWidth - 70);
        const destY = cat.version === 'v2' ? clamp(e.clientY, 85, window.innerHeight - 12) : cat.y;
        showBubble('Прыг! 🐾', 1600);
        initiateJump(null, destX, destY);
      }
    });

    // Position initiale propre avant de lancer le mode
    cat.isFixedMode = cat.version !== 'v1';
    if (cat.version === 'v1') {
      const visible = getViewportPlatforms();
      const first = visible.find((p) => p.kind === 'arch') || visible[0] || cachedPlatforms[0];
      if (first) {
        cat.currentPlat = first;
        cat.x = (first.minX + first.maxX) * 0.5;
        cat.y = first.getY(cat.x);
      }
    }
    setVersion(cat.version, false);

    lastFrame = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function destroy() {
    if (!layer) return;
    cancelAnimationFrame(rafId);
    layer.remove();
    if (switcherEl) switcherEl.remove();
    layer = null;
    switcherEl = null;
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
