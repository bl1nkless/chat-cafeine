// Chat Caféiné — Le Chat du Café v2
// 4 versions de comportement en direct + cinématique inverse (IK) et colonne vertébrale souple sur Canvas 2D.
(() => {
  if (typeof window === 'undefined') return;
  const mq = window.matchMedia('(min-width: 960px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  const MODE_KEY = 'cc-cat-version-v2';
  const STATE_KEY = 'cc-cat-pos-v2';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Cinématique inverse à 2 segments (hanche/épaule -> genou/coude -> patte)
  function solveIK(hx, hy, fx, fy, l1, l2, bendDir) {
    let dx = fx - hx;
    let dy = fy - hy;
    const dist = Math.min(Math.hypot(dx, dy) || 0.001, l1 + l2 - 0.01);
    const baseAngle = Math.atan2(dy, dx);
    const cosA = clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1);
    const angle = baseAngle + bendDir * Math.acos(cosA);
    return {
      kx: hx + Math.cos(angle) * l1,
      ky: hy + Math.sin(angle) * l1,
      fx: hx + (dx / (Math.hypot(dx, dy) || 1)) * dist,
      fy: hy + (dy / (Math.hypot(dx, dy) || 1)) * dist,
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

  // État complet du chat
  const cat = {
    version: localStorage.getItem(MODE_KEY) || 'v1', // v1 | v2 | v3 | v4
    // Coordonnées écran (viewport) des pattes du chat (point d'appui au sol)
    x: 260,
    y: window.innerHeight - 10,
    // Pour le mode v1/v3 attaché à un élément du DOM (coordonnées page)
    anchorEl: null,
    anchorOffsetX: 0,
    surfaceMinX: 60,
    surfaceMaxX: window.innerWidth - 60,
    surfaceY: window.innerHeight - 8,

    vx: 0,
    vy: 0,
    dir: 1,
    targetX: 520,
    targetY: window.innerHeight - 10,

    // États d'animation :
    // 'idle' | 'walk' | 'run' | 'sit' | 'sleep' | 'waffle' | 'stretch' | 'groom' | 'wiggle' | 'jump' | 'coffee' | 'dangling'
    pose: 'sit',
    poseTime: 0,
    poseDuration: 3.5,
    stridePhase: 0,

    // Saut parabolique
    jumpStartX: 0,
    jumpStartY: 0,
    jumpEndX: 0,
    jumpEndY: 0,
    jumpT: 0,
    jumpDuration: 0.65,
    jumpPeak: 90,
    nextPlatform: null,

    // Souris
    mouseX: window.innerWidth * 0.5,
    mouseY: window.innerHeight * 0.4,
    mouseSpeed: 0,
    lastMouseMove: performance.now(),

    // Particules flottantes (zZz, ♥, ♪, !)
    fx: [],
    lastFxTime: 0,
    blinkTimer: 2.5,
    isBlinking: false,
    tailPokeCooldown: 0,
  };

  function showBubble(text, ms = 2400) {
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
      x: ox + rand(-8, 8),
      y: oy,
      vx: rand(-10, 10),
      vy: rand(-26, -18),
      life: 0,
      maxLife: 1.5,
    });
  }

  // Détecte toutes les « surfaces / étagères » visibles dans la page pour le mode v1 (Parkour) et v3 (Lounger)
  function getVisiblePlatforms(mode = cat.version) {
    const platforms = [];
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // En-tête collant (.hdr)
    const hdr = document.querySelector('.hdr');
    if (hdr) {
      const r = hdr.getBoundingClientRect();
      if (r.bottom > 40 && r.bottom < vh - 40) {
        platforms.push({
          kind: 'header',
          el: hdr,
          y: r.bottom - 2,
          minX: Math.max(70, r.left + 60),
          maxX: Math.min(vw - 70, r.right - 60),
        });
      }
    }

    if (mode === 'v1' || mode === 'v3') {
      const selectors = mode === 'v3'
        ? '.pc__img, .panel, .note, .ftr, .hero__content .btn--dark'
        : '.pc__img, .mi, .panel, .note, .hero__content .btn--dark, .sh h1, .sh h2, .ftr';
      const nodes = document.querySelectorAll(selectors);
      nodes.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 110 || r.height < 20) return;
        if (r.top < 78 || r.top > vh - 35) return;
        const minX = Math.max(55, r.left + 28);
        const maxX = Math.min(vw - 55, r.right - 28);
        if (maxX - minX < 50) return;
        platforms.push({
          kind: el.classList.contains('ftr') ? 'footer' : 'card',
          el,
          y: r.top + 3,
          minX,
          maxX,
        });
      });
    }

    // Sol du bas de l'écran (toujours disponible en secours)
    platforms.push({
      kind: 'floor',
      el: null,
      y: vh - 8,
      minX: 60,
      maxX: vw - 60,
    });

    return platforms;
  }

  function attachToPlatform(plat, targetX) {
    cat.anchorEl = plat.el || null;
    cat.surfaceMinX = plat.minX;
    cat.surfaceMaxX = plat.maxX;
    cat.surfaceY = plat.y;
    cat.x = clamp(targetX ?? cat.x, plat.minX, plat.maxX);
    cat.y = plat.y;
    if (cat.anchorEl) {
      const r = cat.anchorEl.getBoundingClientRect();
      cat.anchorOffsetX = cat.x - r.left;
      cat.anchorIsBottom = plat.kind === 'header';
    }
  }

  function syncAnchorPosition() {
    if (cat.pose === 'jump') return;
    if (cat.version === 'v2') return; // En mode chasseur 2D, il est libre sur l'écran
    if (cat.version === 'v4') {
      cat.surfaceMinX = 60;
      cat.surfaceMaxX = window.innerWidth - 60;
      cat.surfaceY = window.innerHeight - 8;
      cat.y = cat.surfaceY;
      return;
    }

    if (cat.anchorEl && document.body.contains(cat.anchorEl)) {
      const r = cat.anchorEl.getBoundingClientRect();
      const y = cat.anchorIsBottom ? r.bottom - 2 : r.top + 3;
      // Si l'élément sort de l'écran au scroll, le chat saute sur un bloc visible !
      if (y < 52 || y > window.innerHeight - 15) {
        triggerJumpToVisiblePlatform();
        return;
      }
      cat.surfaceMinX = Math.max(55, r.left + 26);
      cat.surfaceMaxX = Math.min(window.innerWidth - 55, r.right - 26);
      cat.surfaceY = y;
      cat.y = y;
      cat.x = clamp(r.left + cat.anchorOffsetX, cat.surfaceMinX, cat.surfaceMaxX);
    } else {
      cat.surfaceMinX = 60;
      cat.surfaceMaxX = window.innerWidth - 60;
      cat.surfaceY = window.innerHeight - 8;
      cat.y = cat.surfaceY;
    }
  }

  function updateAnchorOffset() {
    if (cat.anchorEl) {
      const r = cat.anchorEl.getBoundingClientRect();
      cat.anchorOffsetX = cat.x - r.left;
    }
  }

  function startJumpTo(plat, destX) {
    const endX = clamp(destX ?? rand(plat.minX + 10, plat.maxX - 10), plat.minX, plat.maxX);
    const endY = plat.y;
    cat.pose = 'wiggle'; // D'abord il remue le popotin avant de sauter !
    cat.poseTime = 0;
    cat.poseDuration = 0.48;
    cat.dir = endX >= cat.x ? 1 : -1;
    cat.nextPlatform = { plat, endX, endY };
  }

  function launchPreparedJump() {
    if (!cat.nextPlatform) {
      setPose('sit', 2.5);
      return;
    }
    const { plat, endX, endY } = cat.nextPlatform;
    cat.nextPlatform = null;
    cat.pose = 'jump';
    cat.poseTime = 0;
    cat.jumpStartX = cat.x;
    cat.jumpStartY = cat.y;
    cat.jumpEndX = endX;
    cat.jumpEndY = endY;
    cat.dir = endX >= cat.x ? 1 : -1;
    const dist = Math.hypot(endX - cat.x, endY - cat.y);
    cat.jumpDuration = clamp(0.42 + dist / 950, 0.44, 0.88);
    cat.jumpPeak = clamp(55 + Math.abs(endX - cat.x) * 0.18 + Math.max(0, cat.y - endY) * 0.25, 55, 150);
    cat.pendingPlat = plat;
  }

  function triggerJumpToVisiblePlatform() {
    const plats = getVisiblePlatforms();
    const candidates = plats.filter((p) => p.el !== cat.anchorEl);
    const chosen = candidates.length ? pick(candidates) : plats[0];
    if (chosen) startJumpTo(chosen, rand(chosen.minX, chosen.maxX));
  }

  function setPose(pose, duration = 3.5) {
    cat.pose = pose;
    cat.poseTime = 0;
    cat.poseDuration = duration;
  }

  // Choix autonome selon la version active
  function decideNextAction() {
    const v = cat.version;

    // ---------------- VERSION 1 : PARKOUR SUR LES CARTES DU SITE ----------------
    if (v === 'v1') {
      const plats = getVisiblePlatforms('v1');
      const r = Math.random();
      // 45% de chance de sauter sur une autre carte/bloc visible
      if (r < 0.45 && plats.length > 1) {
        const others = plats.filter((p) => p.el !== cat.anchorEl && Math.hypot((p.minX + p.maxX) / 2 - cat.x, p.y - cat.y) < 620);
        const targetPlat = others.length ? pick(others) : pick(plats);
        startJumpTo(targetPlat, rand(targetPlat.minX, targetPlat.maxX));
        return;
      }
      // 30% : marcher le long du bloc actuel
      if (r < 0.72 && cat.surfaceMaxX - cat.surfaceMinX > 70) {
        cat.targetX = rand(cat.surfaceMinX, cat.surfaceMaxX);
        if (Math.abs(cat.targetX - cat.x) < 45) {
          cat.targetX = cat.x < (cat.surfaceMinX + cat.surfaceMaxX) / 2 ? cat.surfaceMaxX : cat.surfaceMinX;
        }
        cat.dir = cat.targetX >= cat.x ? 1 : -1;
        setPose('walk', 4.0);
        return;
      }
      // Sinon : pose sur la carte (повафлиться, спать, свесить хвост, умыться)
      const idlePose = pick(['waffle', 'dangling', 'sleep', 'groom', 'stretch', 'sit']);
      if (idlePose === 'waffle') showBubble(pick(['Повафлился на карточке ~', 'Ммм, тёплая булочка ♥', 'Пузико кверху ~']), 2200);
      setPose(idlePose, idlePose === 'stretch' ? 1.8 : rand(3.8, 6.5));
      return;
    }

    // ---------------- VERSION 2 : CHASSEUR DE CURSEUR 2D ----------------
    if (v === 'v2') {
      const distToMouse = Math.hypot(cat.mouseX - cat.x, cat.mouseY - cat.y);
      const mouseActive = performance.now() - cat.lastMouseMove < 2600;
      if (mouseActive && distToMouse > 65) {
        // Wiggle du popotin puis sprint vers le curseur !
        cat.dir = cat.mouseX >= cat.x ? 1 : -1;
        setPose('wiggle', 0.42);
        return;
      }
      const r = Math.random();
      if (r < 0.32) {
        setPose('waffle', rand(4.0, 6.5));
      } else if (r < 0.58) {
        setPose('groom', rand(3.2, 5.0));
      } else if (r < 0.80) {
        setPose('sleep', rand(5.0, 8.0));
      } else {
        // Petite balade 2D
        cat.targetX = rand(90, window.innerWidth - 90);
        cat.targetY = rand(140, window.innerHeight - 25);
        cat.dir = cat.targetX >= cat.x ? 1 : -1;
        setPose('walk', 4.0);
      }
      return;
    }

    // ---------------- VERSION 3 : LOUNGER SUR L'EN-TÊTE ET LES ÉTAGÈRES ----------------
    if (v === 'v3') {
      const plats = getVisiblePlatforms('v3');
      const hdrPlat = plats.find((p) => p.kind === 'header');
      const r = Math.random();

      // S'il n'est pas sur l'en-tête ou une carte haute, il y grimpe souvent
      if (hdrPlat && cat.anchorEl !== hdrPlat.el && r < 0.52) {
        startJumpTo(hdrPlat, rand(hdrPlat.minX + 40, hdrPlat.maxX - 40));
        return;
      }
      if (r < 0.36 && cat.surfaceMaxX - cat.surfaceMinX > 90) {
        cat.targetX = rand(cat.surfaceMinX + 20, cat.surfaceMaxX - 20);
        cat.dir = cat.targetX >= cat.x ? 1 : -1;
        setPose('walk', 4.5);
        return;
      }
      if (r < 0.64) {
        // Allongé avec la queue et une patte qui pendent dans le vide !
        setPose('dangling', rand(5.5, 9.0));
        return;
      }
      if (r < 0.82) {
        setPose('waffle', rand(4.5, 7.5));
        return;
      }
      if (r < 0.93) {
        setPose('coffee', rand(4.2, 6.5));
        return;
      }
      // Parfois descend sur une carte
      if (plats.length > 1) {
        const other = pick(plats.filter((p) => p.el !== cat.anchorEl));
        if (other) { startJumpTo(other, rand(other.minX, other.maxX)); return; }
      }
      setPose('sleep', rand(5.5, 9.0));
      return;
    }

    // ---------------- VERSION 4 : PROMENEUR CINÉMATIQUE COMPLET ----------------
    const r = Math.random();
    if (r < 0.42) {
      cat.targetX = rand(80, window.innerWidth - 80);
      if (Math.abs(cat.targetX - cat.x) < 140) {
        cat.targetX = cat.x < window.innerWidth / 2 ? window.innerWidth - 110 : 110;
      }
      cat.dir = cat.targetX >= cat.x ? 1 : -1;
      setPose(Math.random() < 0.28 ? 'run' : 'walk', 6.0);
    } else if (r < 0.62) {
      setPose('waffle', rand(4.5, 7.5));
    } else if (r < 0.76) {
      setPose('sleep', rand(5.5, 9.0));
    } else if (r < 0.88) {
      setPose('coffee', rand(4.2, 6.5));
    } else {
      setPose(Math.random() < 0.5 ? 'stretch' : 'groom', rand(2.2, 4.2));
    }
  }

  // Mise à jour physique à chaque frame
  function updatePhysics(dt, now) {
    cat.poseTime += dt;
    if (cat.tailPokeCooldown > 0) cat.tailPokeCooldown -= dt;

    // Clignement naturel des yeux
    cat.blinkTimer -= dt;
    if (cat.blinkTimer <= 0) {
      cat.isBlinking = true;
      if (cat.blinkTimer <= -0.14) {
        cat.isBlinking = false;
        cat.blinkTimer = rand(2.4, 5.5);
      }
    }

    // Mise à jour des particules
    for (let i = cat.fx.length - 1; i >= 0; i--) {
      const p = cat.fx[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life >= p.maxLife) cat.fx.splice(i, 1);
    }

    // Particules d'ambiance selon la pose
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

    // Saut parabolique en cours
    if (cat.pose === 'jump') {
      cat.jumpT += dt / cat.jumpDuration;
      const t = clamp(cat.jumpT, 0, 1);
      cat.x = lerp(cat.jumpStartX, cat.jumpEndX, t);
      const linearY = lerp(cat.jumpStartY, cat.jumpEndY, t);
      const arc = 4 * cat.jumpPeak * t * (1 - t);
      cat.y = linearY - arc;

      if (t >= 1) {
        if (cat.pendingPlat) {
          attachToPlatform(cat.pendingPlat, cat.jumpEndX);
          cat.pendingPlat = null;
        }
        setPose(pick(['sit', 'dangling', 'waffle']), rand(3.0, 5.5));
      }
      return;
    }

    syncAnchorPosition();

    // En mode v3/v1 quand la queue pend (dangling), si la souris passe sur la queue qui pend sous le bloc !
    if (cat.pose === 'dangling' && cat.tailPokeCooldown <= 0) {
      const tailTipX = cat.x - cat.dir * 26;
      const tailTipY = cat.y + 34;
      if (Math.hypot(cat.mouseX - tailTipX, cat.mouseY - tailTipY) < 28) {
        cat.tailPokeCooldown = 2.0;
        addFx('!', '#c84b31', 0, -52);
        showBubble(pick(['Эй, за хвост не дёргать! 🐾', 'Miaou ! Ma queue !', 'Ой! Щас кусь сделаю!']), 2200);
        setPose('waffle', 3.8);
        return;
      }
    }

    // En mode v2 (Chasseur 2D), s'il voit la souris bouger vite alors qu'il faisait rien, il se prépare à bondir
    if (cat.version === 'v2' && cat.pose !== 'run' && cat.pose !== 'wiggle') {
      const dist = Math.hypot(cat.mouseX - cat.x, cat.mouseY - cat.y);
      if (performance.now() - cat.lastMouseMove < 400 && dist > 95) {
        cat.dir = cat.mouseX >= cat.x ? 1 : -1;
        setPose('wiggle', 0.36);
        return;
      }
    }

    // Fin du wiggle -> soit saut préparé (v1/v3), soit sprint vers le curseur (v2)
    if (cat.pose === 'wiggle') {
      if (cat.poseTime >= cat.poseDuration) {
        if (cat.nextPlatform) {
          launchPreparedJump();
        } else if (cat.version === 'v2') {
          setPose('run', 3.5);
        } else {
          setPose('run', 2.5);
        }
      }
      return;
    }

    // Déplacement en marche ou course
    if (cat.pose === 'walk' || cat.pose === 'run') {
      if (cat.version === 'v2' && cat.pose === 'run') {
        // Poursuite 2D fluide vers le curseur
        cat.targetX = clamp(cat.mouseX - cat.dir * 28, 60, window.innerWidth - 60);
        cat.targetY = clamp(cat.mouseY + 12, 95, window.innerHeight - 12);
        const dx = cat.targetX - cat.x;
        const dy = cat.targetY - cat.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 18 || cat.poseTime > cat.poseDuration) {
          addFx('🐾', '#b47a4b', cat.dir * 22, -24);
          showBubble(pick(['Цап за курсор! 🐾', 'Поймал мышку!', 'Ronron ~']), 1900);
          setPose(pick(['sit', 'waffle', 'groom']), rand(3.0, 5.0));
          return;
        }
        const speed = 240;
        const step = Math.min(dist, speed * dt);
        if (Math.abs(dx) > 6) cat.dir = dx >= 0 ? 1 : -1;
        cat.x += (dx / dist) * step;
        cat.y += (dy / dist) * step;
        cat.stridePhase += step * 0.11;
        return;
      }

      // Déplacement 1D sur la plateforme ou en 2D calme
      const dx = cat.targetX - cat.x;
      const dy = cat.version === 'v2' ? cat.targetY - cat.y : 0;
      const dist = Math.hypot(dx, dy);
      const speed = cat.pose === 'run' ? 165 : 68;
      if (dist <= speed * dt + 2 || cat.poseTime > cat.poseDuration) {
        cat.x = cat.targetX;
        if (cat.version === 'v2') cat.y = cat.targetY;
        updateAnchorOffset();
        decideNextAction();
      } else {
        cat.dir = dx >= 0 ? 1 : -1;
        const step = speed * dt;
        cat.x += (dx / dist) * step;
        if (cat.version === 'v2') cat.y += (dy / dist) * step;
        updateAnchorOffset();
        cat.stridePhase += step * (cat.pose === 'run' ? 0.1 : 0.095);
      }
      return;
    }

    // Autres poses temporisées
    if (cat.poseTime >= cat.poseDuration) {
      decideNextAction();
    }
  }

  // =========================================================
  // RENDU CANVAS 2D : Cinématique inverse + colonne vertébrale
  // =========================================================
  function drawCat(now) {
    if (!ctx) return;
    const t = now * 0.001;
    ctx.clearRect(0, 0, 150, 140);

    ctx.save();
    // Point d'ancrage au sol au centre du canvas : (75, 102)
    ctx.translate(75, 102);

    // Ombre douce sous le chat
    const jumpLift = cat.pose === 'jump' ? Math.sin(clamp(cat.jumpT, 0, 1) * Math.PI) : 0;
    const shadowScale = clamp(1 - jumpLift * 0.45, 0.45, 1.1);
    ctx.fillStyle = 'rgba(43, 20, 10, 0.17)';
    ctx.beginPath();
    ctx.ellipse(0, 1, 28 * shadowScale, 4.5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orientation gauche / droite
    ctx.scale(cat.dir, 1);

    const ESPRESSO = '#2b140a';
    const ESPRESSO_DARK = '#1a0b05';
    const MOCHA = '#4a2514';
    const CARAMEL = '#7a3b1e';
    const CREAM = '#fffaf3';
    const LATTE = '#e4d3c0';
    const PINK = '#e58b7b';

    // Calcul de la posture selon l'état
    let hipX = -15, hipY = -22;
    let shX = 14, shY = -23;
    let spineArch = -3;
    let headX = 23, headY = -36, headRot = 0;
    let tailBaseX = -21, tailBaseY = -23;

    if (cat.pose === 'walk' || cat.pose === 'run') {
      const p = cat.stridePhase;
      const bob = Math.sin(p * 2) * (cat.pose === 'run' ? 2.8 : 1.5);
      hipY = -22 + bob;
      shY = -23 - bob * 0.6;
      spineArch = cat.pose === 'run' ? -5 * Math.sin(p) : -2;
      headX = 24;
      headY = -36 + bob * 0.5;
      headRot = 0.05 * Math.sin(p);
    } else if (cat.pose === 'sit' || cat.pose === 'groom' || cat.pose === 'coffee') {
      hipX = -11; hipY = -12;
      shX = 7; shY = -27;
      spineArch = -4;
      headX = 12; headY = -42;
      headRot = Math.sin(t * 1.6) * 0.06;
    } else if (cat.pose === 'sleep') {
      const breathe = Math.sin(t * 2.1) * 1.1;
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
      // Étirement félin : avant très bas, arrière haut et cambré !
      const st = clamp(cat.poseTime / 0.6, 0, 1);
      hipX = -16; hipY = -27 * st - 20 * (1 - st);
      shX = 14; shY = -12 * st - 22 * (1 - st);
      spineArch = 5 * st;
      headX = 24; headY = -21 * st - 34 * (1 - st);
      headRot = -0.14;
    } else if (cat.pose === 'wiggle') {
      // Popotin qui frétille avant le saut !
      const wig = Math.sin(t * 34) * 3.2;
      hipX = -16; hipY = -18 + wig;
      shX = 14; shY = -13;
      spineArch = -2;
      headX = 24; headY = -22;
      headRot = -0.08;
    } else if (cat.pose === 'jump') {
      const jt = clamp(cat.jumpT, 0, 1);
      const pitch = (jt - 0.5) * 0.95;
      hipX = -16; hipY = -24 - Math.sin(jt * Math.PI) * 5;
      shX = 16; shY = hipY + Math.sin(pitch) * 18;
      spineArch = -9 * Math.sin(jt * Math.PI);
      headX = shX + 10; headY = shY - 12;
      headRot = pitch * 0.6;
    } else if (cat.pose === 'waffle') {
      // « Повафлился » — sur le dos, ventre en l'air, gigote de bonheur !
      const roll = Math.sin(t * 3.4) * 2.2;
      hipX = -13; hipY = -11 + roll * 0.4;
      shX = 12; shY = -12 - roll * 0.4;
      spineArch = 6; // dos contre le sol
      headX = 21; headY = -21 + Math.sin(t * 3.4) * 1.8;
      headRot = -0.25 + Math.sin(t * 3.4) * 0.14;
    }

    tailBaseX = hipX - 5;
    tailBaseY = hipY;

    // ---------------- 1. QUEUE MULTI-SEGMENTS FLUIDE ----------------
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ESPRESSO;
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.moveTo(tailBaseX, tailBaseY);

    if (cat.pose === 'dangling') {
      // Queue qui pend vers le bas sous la carte ou l'en-tête !
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

    // Fonction utilitaire pour dessiner une patte articulée (IK)
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

      // Petit coussinet / bout de patte
      ctx.fillStyle = pawColor;
      ctx.beginPath();
      ctx.ellipse(ik.fx + 1.2, ik.fy, 4.2, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Calcul des positions de pieds selon la pose
    function computeFoot(baseX, phaseOffset, isFront) {
      if (cat.pose === 'walk' || cat.pose === 'run') {
        const p = cat.stridePhase + phaseOffset;
        const stride = cat.pose === 'run' ? 12.5 : 9.5;
        const lift = Math.max(0, Math.sin(p)) * (cat.pose === 'run' ? 9 : 6.5);
        return { x: baseX + Math.cos(p) * stride, y: -2 - lift };
      }
      if (cat.pose === 'jump') {
        const jt = clamp(cat.jumpT, 0, 1);
        return isFront
          ? { x: baseX + 12 * (1 - jt * 0.3), y: -12 + jt * 8 }
          : { x: baseX - 12 * (1 - jt * 0.3), y: -10 + jt * 6 };
      }
      if (cat.pose === 'stretch') {
        return isFront ? { x: baseX + 13, y: -2 } : { x: baseX - 4, y: -2 };
      }
      return { x: baseX, y: -2 };
    }

    // ---------------- 2. PATTES ARRIÈRE-PLAN (gauche) ----------------
    if (cat.pose === 'waffle') {
      // Sur le dos : les 4 petites pattes gigotent en l'air !
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

    // ---------------- 3. CORPS / COLONNE VERTÉBRALE SOUPLE ----------------
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

    // Ventre doux caramel-latte quand il se roule (« повафлился »)
    if (cat.pose === 'waffle') {
      ctx.strokeStyle = '#6e4228';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(hipX + 4, hipY - 5);
      ctx.quadraticCurveTo(midX, midY - 6, shX - 3, shY - 5);
      ctx.stroke();
    }
    ctx.restore();

    // ---------------- 4. PATTES PREMIER PLAN (droite) ----------------
    if (cat.pose === 'waffle') {
      const w1 = Math.cos(t * 7.5) * 4.5;
      const w2 = Math.sin(t * 7.5) * 4.5;
      drawLeg(hipX + 2, hipY - 3, hipX - 2 + w1, hipY - 22 + w2, 1, ESPRESSO, PINK);
      drawLeg(shX + 2, shY - 3, shX + 6 - w2, shY - 21 - w1, -1, ESPRESSO, PINK);
    } else if (cat.pose === 'dangling') {
      // Patte avant qui pend dans le vide et balance doucement !
      const swing = Math.sin(t * 2.8) * 5;
      drawLeg(shX + 2, shY + 2, shX + 6 + swing, shY + 25, 1, ESPRESSO, MOCHA);
    } else if (cat.pose === 'groom') {
      const br = computeFoot(hipX + 2, 0, false);
      drawLeg(hipX, hipY, br.x, br.y, -1, ESPRESSO);
      // Patte avant qui frotte sa joue / son oreille
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

    // ---------------- 5. TÊTE, OREILLES, VISAGE & BÉRET ----------------
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(headRot);

    // Oreille arrière
    ctx.fillStyle = ESPRESSO_DARK;
    ctx.beginPath();
    ctx.moveTo(-7, -7);
    ctx.lineTo(-11, -21);
    ctx.lineTo(1, -13);
    ctx.closePath();
    ctx.fill();

    // Oreille avant
    ctx.fillStyle = ESPRESSO;
    ctx.beginPath();
    ctx.moveTo(3, -12);
    ctx.lineTo(12, -22);
    ctx.lineTo(13, -7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6e3b23';
    ctx.beginPath();
    ctx.moveTo(5, -11);
    ctx.lineTo(10.5, -18.5);
    ctx.lineTo(11, -8.5);
    ctx.closePath();
    ctx.fill();

    // Tête ronde et touffue
    ctx.fillStyle = ESPRESSO;
    ctx.beginPath();
    ctx.ellipse(2, -1, 14.5, 12.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Joues touffues
    ctx.beginPath();
    ctx.moveTo(-11, 0); ctx.lineTo(-16, -1); ctx.lineTo(-12, 3);
    ctx.moveTo(15, 0); ctx.lineTo(20, -1); ctx.lineTo(15, 3);
    ctx.fill();

    // Yeux selon l'état
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
      // Yeux grands ouverts qui suivent le curseur
      ctx.fillStyle = CREAM;
      ctx.beginPath();
      ctx.ellipse(-1, -1, 3.8, 4.3, 0, 0, Math.PI * 2);
      ctx.ellipse(8.5, -1, 3.8, 4.3, 0, 0, Math.PI * 2);
      ctx.fill();

      const dx = (cat.mouseX - cat.x) * cat.dir;
      const dy = cat.mouseY - (cat.y - 35);
      const ang = Math.atan2(dy, dx);
      const px = Math.cos(ang) * 1.2;
      const py = Math.sin(ang) * 1.2;

      ctx.fillStyle = ESPRESSO_DARK;
      ctx.beginPath();
      ctx.ellipse(-0.6 + px, -1 + py, 2.1, 2.8, 0, 0, Math.PI * 2);
      ctx.ellipse(8.9 + px, -1 + py, 2.1, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Reflet blanc
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-1.4 + px * 0.5, -2.2 + py * 0.5, 0.9, 0, Math.PI * 2);
      ctx.arc(8.1 + px * 0.5, -2.2 + py * 0.5, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Petit nez rose & bouche ω
    ctx.fillStyle = PINK;
    ctx.beginPath();
    ctx.moveTo(2.4, 3);
    ctx.lineTo(5.4, 3);
    ctx.lineTo(3.9, 4.9);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(1.9, 5.2, 2.1, 0, 0.85 * Math.PI);
    ctx.moveTo(3.9, 5.2);
    ctx.arc(5.9, 5.2, 2.1, 0.15 * Math.PI, Math.PI);
    ctx.stroke();

    // Petite langue rose (« blep ») quand il « повафлился »
    if (cat.pose === 'waffle') {
      ctx.fillStyle = '#e57368';
      ctx.beginPath();
      ctx.arc(3.9, 7.2, 2.1, 0, Math.PI);
      ctx.fill();
    }

    // Moustaches
    ctx.strokeStyle = LATTE;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(-6, 3); ctx.lineTo(-14, 1.5);
    ctx.moveTo(-6, 5); ctx.lineTo(-15, 5.2);
    ctx.moveTo(12, 3); ctx.lineTo(20, 1.5);
    ctx.moveTo(12, 5); ctx.lineTo(21, 5.2);
    ctx.stroke();

    // Béret français signature Chat Caféiné
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
    // Queue du béret
    ctx.beginPath();
    ctx.moveTo(-1, -5.2);
    ctx.quadraticCurveTo(0, -9, 2.5, -7.5);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // fin tête

    // ---------------- 6. TASSE D'ESPRESSO (mode pause-café) ----------------
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
      // Anse
      ctx.beginPath();
      ctx.arc(6, 1, 2.8, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();
      // Petit cœur sur la tasse
      ctx.fillStyle = CARAMEL;
      ctx.beginPath();
      ctx.arc(0.5, 1, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ---------------- 7. PARTICULES FLOTTANTES ----------------
    cat.fx.forEach((p) => {
      const alpha = clamp(1 - p.life / p.maxLife, 0, 1);
      ctx.save();
      ctx.scale(cat.dir, 1); // remet le texte à l'endroit
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
    const y = Math.round(cat.y - 102);
    wrap.style.transform = `translate3d(${ x }px, ${ y }px, 0)`;
  }

  function setVersion(ver, announce = true) {
    cat.version = ver;
    try { localStorage.setItem(MODE_KEY, ver); } catch {}
    if (switcherEl) {
      switcherEl.querySelectorAll('[data-ver]').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.ver === ver);
      });
    }

    const plats = getVisiblePlatforms(ver);
    if (ver === 'v1') {
      const cardPlat = plats.find((p) => p.kind === 'card') || plats[0];
      startJumpTo(cardPlat, (cardPlat.minX + cardPlat.maxX) * 0.5);
      if (announce) showBubble('В1: Паркур по карточкам и блокам сайта!', 2400);
    } else if (ver === 'v2') {
      cat.anchorEl = null;
      setPose('wiggle', 0.35);
      if (announce) showBubble('В2: Охотник за курсором 2D (поводи мышкой!)', 2600);
    } else if (ver === 'v3') {
      const hdrPlat = plats.find((p) => p.kind === 'header') || plats[0];
      startJumpTo(hdrPlat, (hdrPlat.minX + hdrPlat.maxX) * 0.5);
      if (announce) showBubble('В3: На шапке и полках (свешивает хвост над меню)', 2600);
    } else {
      cat.anchorEl = null;
      cat.surfaceY = window.innerHeight - 8;
      cat.y = cat.surfaceY;
      setPose('walk', 4.0);
      if (announce) showBubble('В4: Вольный гуляка вдоль экрана', 2400);
    }
  }

  function buildUI() {
    layer = document.createElement('div');
    layer.className = 'cc-cat-layer';
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
    hitEl.title = 'Кликни, чтобы погладить или повафлить кота';

    wrap.appendChild(bubbleEl);
    wrap.appendChild(canvas);
    wrap.appendChild(hitEl);
    layer.appendChild(wrap);
    document.body.appendChild(layer);

    // Barre de sélection des 4 versions en direct
    switcherEl = document.createElement('div');
    switcherEl.className = 'cc-cat-switcher';
    switcherEl.innerHTML = `
      <span class="cc-cat-switcher__title">🐾 Поведение кота:</span>
      <button type="button" class="cc-cat-switcher__btn" data-ver="v1">1 · Паркур по блокам</button>
      <button type="button" class="cc-cat-switcher__btn" data-ver="v2">2 · Охотник за мышкой</button>
      <button type="button" class="cc-cat-switcher__btn" data-ver="v3">3 · На шапке и полках</button>
      <button type="button" class="cc-cat-switcher__btn" data-ver="v4">4 · Свободный низ</button>
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
        showBubble('Режим ватрушки / повафлился ~', 2400);
        setPose('waffle', 6.0);
      } else if (act === 'jump') {
        triggerJumpToVisiblePlatform();
      } else if (act === 'coffee') {
        showBubble('Un petit espresso à Chartres ☕', 2400);
        setPose('coffee', 5.5);
      }
    });

    hitEl.addEventListener('click', (e) => {
      e.stopPropagation();
      addFx('♥', '#c84b31', -8, -42);
      addFx('♥', '#c84b31', 10, -48);
      if (cat.pose !== 'waffle' && Math.random() < 0.5) {
        showBubble(pick(['Мррр… повафлился ♥', 'Чеши пузико ~', 'Ronron suprême ♥']), 2400);
        setPose('waffle', 5.5);
      } else if (cat.version === 'v1' || cat.version === 'v3') {
        showBubble('Прыг на соседний блок!', 1800);
        triggerJumpToVisiblePlatform();
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

    window.addEventListener('mousemove', (e) => {
      cat.mouseSpeed = Math.hypot(e.clientX - cat.mouseX, e.clientY - cat.mouseY);
      cat.mouseX = e.clientX;
      cat.mouseY = e.clientY;
      cat.lastMouseMove = performance.now();
    }, { passive: true });

    // Double-clic sur n'importe quel endroit de la page : le chat y saute ou y court !
    window.addEventListener('dblclick', (e) => {
      if (!layer) return;
      if (e.target.closest('.cc-cat-switcher')) return;
      const plats = getVisiblePlatforms('v1');
      let best = null;
      let bestDist = Infinity;
      plats.forEach((p) => {
        const cx = clamp(e.clientX, p.minX, p.maxX);
        const d = Math.hypot(cx - e.clientX, p.y - e.clientY);
        if (d < bestDist) { bestDist = d; best = { p, x: cx }; }
      });
      if (best && (cat.version === 'v1' || cat.version === 'v3')) {
        showBubble('Прыгаю туда! 🐾', 1800);
        startJumpTo(best.p, best.x);
      } else {
        cat.targetX = clamp(e.clientX, 60, window.innerWidth - 60);
        cat.targetY = clamp(e.clientY, 90, window.innerHeight - 10);
        cat.dir = cat.targetX >= cat.x ? 1 : -1;
        showBubble('Бегу! 🐾', 1800);
        setPose('run', 3.5);
      }
    });

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
