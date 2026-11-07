// Chat Caféiné — Mascotte animée (desktop) : marche, s'assoit, dort, se roule (« повафлился »), boit son café.
(() => {
  if (typeof window === 'undefined') return;
  const mq = window.matchMedia('(min-width: 960px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  const STORAGE_KEY = 'cc-cat-state-v1';

  const PHRASES = {
    pet: ['Ronron… ♥', 'Miaou ~', 'Encore des papouilles !', 'Prrrr… ♥', 'Un petit roulé à la cannelle ?'],
    coffee: ['Un bon café, toujours une bonne idée ☕', 'Pause espresso…', 'Hmmm, arabica torréfié !'],
    waffle: ['Mode brioche activé ~', 'Je fais la crêpe…', 'Ronron suprême ♥', 'La belle vie à Chartres ~'],
    sleep: ['Zzz… roulés à la cannelle…', 'Chut, sieste en cours…'],
    trot: ['Hop hop hop !', 'Attrape le grain de café !'],
  };

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function buildStage() {
    const stage = document.createElement('div');
    stage.className = 'cc-cat-stage';
    stage.setAttribute('aria-hidden', 'true');

    stage.innerHTML = `
      <div class="cc-cat is-sitting" data-cc-cat title="Cliquer pour caresser le chat du café">
        <div class="cc-cat__bubble" data-cc-bubble></div>
        <div class="cc-cat__fx" data-cc-fx></div>
        <div class="cc-cat__flip" data-cc-flip>
          <svg class="cc-cat__svg" viewBox="0 0 112 102" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Ombre au sol -->
            <ellipse class="cc-cat__shadow" cx="56" cy="95" rx="31" ry="4.5" />

            <g class="cc-cat__rig">
              <!-- Queue touffue -->
              <g class="cc-cat__tail">
                <path d="M33 66 C 18 62, 10 46, 15 32 C 18 24, 26 26, 25 36 C 24 46, 29 55, 36 61 Z"
                      fill="#2b140a" stroke="#1b0b05" stroke-width="1.2" stroke-linejoin="round"/>
                <path d="M16 35 C 14 42, 18 50, 24 55" stroke="#5a321e" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>
              </g>

              <!-- Pattes arrière (gauche = arrière-plan) -->
              <g class="cc-cat__leg cc-cat__leg--bl">
                <rect x="33" y="70" width="9" height="23" rx="4.5" fill="#1f0d06"/>
                <ellipse cx="38.5" cy="92.5" rx="5.5" ry="3" fill="#2b140a"/>
                <path d="M41 92h2M40 93.8h2" stroke="#cdb39a" stroke-width="1" stroke-linecap="round"/>
              </g>

              <!-- Pattes avant (gauche = arrière-plan) -->
              <g class="cc-cat__leg cc-cat__leg--fl">
                <rect x="61" y="70" width="9" height="23" rx="4.5" fill="#1f0d06"/>
                <ellipse cx="66.5" cy="92.5" rx="5.5" ry="3" fill="#2b140a"/>
                <path d="M69 92h2M68 93.8h2" stroke="#cdb39a" stroke-width="1" stroke-linecap="round"/>
              </g>

              <!-- Corps / Torse -->
              <g class="cc-cat__torso">
                <!-- Corps principal chocolat-espresso -->
                <path d="M30 66 C 26 53, 36 45, 54 46 C 70 46, 78 53, 77 67 C 76 77, 68 80, 53 80 C 37 80, 32 75, 30 66 Z"
                      fill="#2b140a" stroke="#1b0b05" stroke-width="1.2"/>
                <!-- Fourrure poitrine & ventre doux (visible surtout quand il « повафлился ») -->
                <ellipse class="cc-cat__belly-patch" cx="55" cy="69" rx="14" ry="7.5" fill="#6e4228" opacity="0.55"/>
                <path d="M67 57 C 71 61, 71 68, 66 73" stroke="#5c3520" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
                <path d="M46 58 L 48 62 M 53 60 L 54 64 M 60 58 L 61 62" stroke="#6e4228" stroke-width="1.2" stroke-linecap="round" opacity="0.65"/>
              </g>

              <!-- Pattes arrière (droite = premier plan) -->
              <g class="cc-cat__leg cc-cat__leg--br">
                <rect x="39" y="71" width="9.5" height="23" rx="4.7" fill="#2b140a" stroke="#1b0b05" stroke-width="1"/>
                <ellipse cx="44.8" cy="93.2" rx="5.8" ry="3.1" fill="#381b0e"/>
                <path d="M47.5 92.4h2M46.8 94.1h2" stroke="#e4d3c0" stroke-width="1.1" stroke-linecap="round"/>
              </g>

              <!-- Pattes avant (droite = premier plan) -->
              <g class="cc-cat__leg cc-cat__leg--fr">
                <rect x="67" y="71" width="9.5" height="23" rx="4.7" fill="#2b140a" stroke="#1b0b05" stroke-width="1"/>
                <ellipse cx="72.8" cy="93.2" rx="5.8" ry="3.1" fill="#381b0e"/>
                <path d="M75.5 92.4h2M74.8 94.1h2" stroke="#e4d3c0" stroke-width="1.1" stroke-linecap="round"/>
              </g>

              <!-- Patte qui fait sa toilette (état grooming) -->
              <g class="cc-cat__groom-paw">
                <path d="M68 66 C 76 62, 83 52, 79 46 C 76 42, 71 46, 70 53 Z" fill="#2b140a" stroke="#1b0b05" stroke-width="1"/>
                <circle cx="78" cy="47" r="4" fill="#3b1f12"/>
                <path d="M77 45.5h2M78 47.5h2" stroke="#e4d3c0" stroke-width="1" stroke-linecap="round"/>
              </g>

              <!-- Tête + Béret français -->
              <g class="cc-cat__head">
                <!-- Oreille gauche -->
                <g class="cc-cat__ear-l">
                  <path d="M56 36 L 58 20 L 68 29 Z" fill="#2b140a" stroke="#1b0b05" stroke-width="1.2" stroke-linejoin="round"/>
                  <path d="M58.5 34 L 59.8 23.5 L 65.5 30 Z" fill="#6e3b23"/>
                </g>

                <!-- Oreille droite -->
                <g class="cc-cat__ear-r">
                  <path d="M78 29 L 89 19 L 90 36 Z" fill="#2b140a" stroke="#1b0b05" stroke-width="1.2" stroke-linejoin="round"/>
                  <path d="M80.5 30 L 87 22.8 L 87.5 34 Z" fill="#6e3b23"/>
                </g>

                <!-- Tête touffue -->
                <path d="M54 45 C 53 33, 61 27, 73 27 C 85 27, 92 33, 92 45 C 94 47, 95 50, 91 52 C 93 55, 89 58, 84 59 C 78 61, 67 61, 61 59 C 56 58, 52 55, 54 52 C 51 50, 52 47, 54 45 Z"
                      fill="#2b140a" stroke="#1b0b05" stroke-width="1.2" stroke-linejoin="round"/>

                <!-- Mèches de joues -->
                <path d="M53 47 L 49 46 M 53 50 L 48 51 M 92 47 L 96 46 M 92 50 L 97 51"
                      stroke="#2b140a" stroke-width="2.2" stroke-linecap="round"/>

                <!-- Yeux ouverts -->
                <g class="cc-cat__eyes-open">
                  <ellipse cx="67" cy="44" rx="4.6" ry="5" fill="#fffaf3" stroke="#1b0b05" stroke-width="1"/>
                  <ellipse cx="81" cy="44" rx="4.6" ry="5" fill="#fffaf3" stroke="#1b0b05" stroke-width="1"/>
                  <g class="cc-cat__pupils" data-cc-pupils>
                    <ellipse cx="67.8" cy="44.2" rx="2.5" ry="3.2" fill="#1f0d06"/>
                    <circle cx="66.7" cy="42.7" r="1" fill="#fffaf3"/>
                    <ellipse cx="81.8" cy="44.2" rx="2.5" ry="3.2" fill="#1f0d06"/>
                    <circle cx="80.7" cy="42.7" r="1" fill="#fffaf3"/>
                  </g>
                  <!-- Paupières (clignement) -->
                  <g class="cc-cat__lid">
                    <ellipse cx="67" cy="44" rx="5" ry="5.3" fill="#2b140a"/>
                    <ellipse cx="81" cy="44" rx="5" ry="5.3" fill="#2b140a"/>
                  </g>
                </g>

                <!-- Yeux heureux (^ ^) -->
                <g class="cc-cat__eyes-happy">
                  <path d="M63 45 Q 67 39.5 71 45" stroke="#fffaf3" stroke-width="2.1" stroke-linecap="round" fill="none"/>
                  <path d="M77 45 Q 81 39.5 85 45" stroke="#fffaf3" stroke-width="2.1" stroke-linecap="round" fill="none"/>
                </g>

                <!-- Yeux endormis (u u) -->
                <g class="cc-cat__eyes-sleep">
                  <path d="M63 44 Q 67 48.5 71 44" stroke="#e4d3c0" stroke-width="1.9" stroke-linecap="round" fill="none"/>
                  <path d="M77 44 Q 81 48.5 85 44" stroke="#e4d3c0" stroke-width="1.9" stroke-linecap="round" fill="none"/>
                </g>

                <!-- Petit nez & bouche ω -->
                <path d="M72.3 48.5 L 75.7 48.5 L 74 50.8 Z" fill="#e59882"/>
                <path d="M74 50.6 C 72.5 53.2, 69.2 53, 68.5 50.8 M 74 50.6 C 75.5 53.2, 78.8 53, 79.5 50.8"
                      stroke="#fffaf3" stroke-width="1.5" stroke-linecap="round" fill="none"/>

                <!-- Petite langue rose (« blep » quand il se roule / est content) -->
                <path class="cc-cat__blep" d="M72.4 52.3 C 72.4 55.6, 75.8 55.6, 75.8 52.3 Z" fill="#e57f72"/>

                <!-- Moustaches -->
                <g stroke="#cdb39a" stroke-width="1.1" stroke-linecap="round" opacity="0.9">
                  <path d="M59 48 L 50 46.5"/>
                  <path d="M59 50.5 L 49 50.8"/>
                  <path d="M59 53 L 51 54.8"/>
                  <path d="M88 48 L 97 46.5"/>
                  <path d="M88 50.5 L 98 50.8"/>
                  <path d="M88 53 L 96 54.8"/>
                </g>

                <!-- Béret signature Chat Caféiné -->
                <g class="cc-cat__beret">
                  <path d="M55 30 C 52 22, 62 15, 75 16 C 87 17, 94 23, 89 29 C 83 31, 63 32, 55 30 Z"
                        fill="#7a3b1e" stroke="#2b140a" stroke-width="1.3" stroke-linejoin="round"/>
                  <path d="M58 29.5 C 65 27.5, 80 27.2, 87 28.8" stroke="#cdb39a" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/>
                  <path d="M72 16 C 71 12.5, 73.5 11.5, 75 13.5" stroke="#2b140a" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                  <path d="M62 21 C 67 18.5, 75 18.5, 81 20.5" stroke="#9b5432" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>
                </g>
              </g>

              <!-- Tasse de café (état pause-café) -->
              <g class="cc-cat__cup">
                <g class="cc-cat__steam" stroke="#b47a4b" stroke-width="1.3" stroke-linecap="round" fill="none">
                  <path d="M87 48 C 85 45, 89 43, 87 40"/>
                  <path d="M91 49 C 89 46, 93 44, 91 41"/>
                </g>
                <path d="M81 53 H 94 L 92.5 66 C 92.2 68, 90.8 69, 89 69 H 86 C 84.2 69, 82.8 68, 82.5 66 Z"
                      fill="#fffaf3" stroke="#2b140a" stroke-width="1.3" stroke-linejoin="round"/>
                <path d="M93.5 55.5 C 96.8 55.5, 96.8 62, 93 62" stroke="#fffaf3" stroke-width="2" fill="none"/>
                <path d="M93.5 55.5 C 96.8 55.5, 96.8 62, 93 62" stroke="#2b140a" stroke-width="1.1" fill="none"/>
                <ellipse cx="87.5" cy="53.5" rx="6.2" ry="1.8" fill="#51291a" stroke="#2b140a" stroke-width="1"/>
                <!-- Petite patte tenant la tasse -->
                <ellipse cx="81" cy="61" rx="4.2" ry="3.2" fill="#2b140a" stroke="#1b0b05" stroke-width="1"/>
                <!-- Petit cœur sur la tasse -->
                <path d="M87.5 63 C 85.5 61.2, 84.8 59.5, 86.2 58.6 C 87 58.1, 87.5 58.8, 87.5 59.3 C 87.5 58.8, 88 58.1, 88.8 58.6 C 90.2 59.5, 89.5 61.2, 87.5 63 Z"
                      fill="#8b4b2e"/>
              </g>

              <!-- Grain de café / jouet devant les pattes (état trot) -->
              <g class="cc-cat__toy" style="transform-origin: 99px 91px">
                <ellipse cx="99" cy="91" rx="4.8" ry="3.6" transform="rotate(-24 99 91)" fill="#51291a" stroke="#1b0b05" stroke-width="1"/>
                <path d="M96 92.5 C 98.5 90, 99.5 92, 102 89.5" stroke="#cdb39a" stroke-width="1" stroke-linecap="round" fill="none"/>
              </g>
            </g>
          </svg>
        </div>
      </div>
    `;

    document.body.appendChild(stage);
    return stage;
  }

  let stage = null;
  let catEl = null;
  let bubbleEl = null;
  let fxEl = null;
  let bubbleTimer = null;
  let stateTimer = null;
  let fxInterval = null;
  let rafId = null;

  // État interne du chat
  const state = {
    x: 140,
    targetX: 420,
    dir: 1, // 1 = regarde à droite, -1 = regarde à gauche
    mode: 'walk', // walk | trot | sit | sleep | waffle | stretch | groom | coffee | petted
    speed: 58, // px par seconde
    lastPawX: 140,
    lastTime: 0,
    mouseX: window.innerWidth * 0.5,
    mouseY: window.innerHeight * 0.5,
  };

  function loadSavedState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      const maxX = Math.max(160, window.innerWidth - 140);
      if (typeof s.x === 'number') state.x = clamp(s.x, 24, maxX);
      if (s.dir === 1 || s.dir === -1) state.dir = s.dir;
      if (typeof s.mode === 'string') state.mode = s.mode;
    } catch {}
  }

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        x: Math.round(state.x),
        dir: state.dir,
        mode: state.mode,
      }));
    } catch {}
  }

  function applyPosition() {
    if (!catEl) return;
    catEl.style.setProperty('--cat-x', `${ state.x.toFixed(1) }px`);
    catEl.style.setProperty('--cat-dir', String(state.dir));
  }

  function showBubble(text, duration = 2800) {
    if (!bubbleEl) return;
    clearTimeout(bubbleTimer);
    bubbleEl.textContent = text;
    bubbleEl.classList.add('is-visible');
    bubbleTimer = setTimeout(() => {
      bubbleEl.classList.remove('is-visible');
    }, duration);
  }

  function spawnFx(symbol, kind = '') {
    if (!fxEl) return;
    const item = document.createElement('span');
    item.className = `cc-fx-item ${ kind ? 'cc-fx-item--' + kind : '' }`;
    item.textContent = symbol;
    item.style.setProperty('--dx', `${ rand(-14, 16).toFixed(1) }px`);
    fxEl.appendChild(item);
    setTimeout(() => item.remove(), 2200);
  }

  function spawnPawprint(x, dir) {
    if (!stage) return;
    const paw = document.createElement('div');
    paw.className = 'cc-pawprint';
    paw.style.left = `${ x + 52 - dir * 14 }px`;
    paw.style.setProperty('--rot', `${ (dir > 0 ? 82 : -82) + rand(-10, 10) }deg`);
    paw.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor"><ellipse cx="8" cy="10.5" rx="3.4" ry="2.7"/><circle cx="4.2" cy="6.2" r="1.4"/><circle cx="6.7" cy="4.6" r="1.4"/><circle cx="9.5" cy="4.6" r="1.4"/><circle cx="11.9" cy="6.2" r="1.4"/></svg>`;
    stage.appendChild(paw);
    setTimeout(() => paw.remove(), 3300);
  }

  const MODE_CLASSES = [
    'is-walking',
    'is-trotting',
    'is-sitting',
    'is-sleeping',
    'is-waffling',
    'is-stretching',
    'is-grooming',
    'is-coffee',
    'is-petted',
  ];

  function setMode(mode, durationMs) {
    if (!catEl) return;
    clearTimeout(stateTimer);
    clearInterval(fxInterval);
    state.mode = mode;

    catEl.classList.remove(...MODE_CLASSES);
    const map = {
      walk: 'is-walking',
      trot: 'is-trotting',
      sit: 'is-sitting',
      sleep: 'is-sleeping',
      waffle: 'is-waffling',
      stretch: 'is-stretching',
      groom: 'is-grooming',
      coffee: 'is-coffee',
      petted: 'is-petted',
    };
    catEl.classList.add(map[mode] || 'is-sitting');

    if (mode === 'sleep') {
      fxInterval = setInterval(() => spawnFx(pick(['z', 'Z', 'zZz']), 'zzz'), 1350);
    } else if (mode === 'waffle') {
      fxInterval = setInterval(() => spawnFx(pick(['♪', '♥', '~']), 'heart'), 1100);
    } else if (mode === 'coffee') {
      fxInterval = setInterval(() => spawnFx('☕', ''), 1800);
    }

    saveState();

    if (durationMs) {
      stateTimer = setTimeout(decideNextBehavior, durationMs);
    }
  }

  function pickWalkTarget(minDist = 140) {
    const minX = 28;
    const maxX = Math.max(180, window.innerWidth - 140);
    let target = rand(minX, maxX);
    if (Math.abs(target - state.x) < minDist) {
      target = state.x < (minX + maxX) / 2 ? clamp(state.x + rand(160, 380), minX, maxX) : clamp(state.x - rand(160, 380), minX, maxX);
    }
    state.targetX = target;
    state.dir = target >= state.x ? 1 : -1;
    applyPosition();
  }

  // Choix autonome du prochain comportement
  function decideNextBehavior() {
    if (!catEl) return;
    const prev = state.mode;

    // Après s'être étiré, il marche ou s'allonge
    if (prev === 'stretch') {
      if (Math.random() < 0.55) {
        pickWalkTarget(180);
        state.speed = rand(52, 74);
        setMode('walk');
      } else {
        setMode('sleep', rand(7000, 12000));
      }
      return;
    }

    // Après une marche ou un trot, il fait une pause expressive
    if (prev === 'walk' || prev === 'trot') {
      const r = Math.random();
      if (r < 0.26) {
        setMode('sit', rand(4200, 7500));
      } else if (r < 0.48) {
        // « Повафлился » — se roule sur le dos en agitant les pattes
        if (Math.random() < 0.45) showBubble(pick(PHRASES.waffle), 2600);
        setMode('waffle', rand(5000, 8500));
      } else if (r < 0.66) {
        // « Полежал » — fait une petite sieste
        setMode('sleep', rand(6500, 11000));
      } else if (r < 0.80) {
        // Fait sa toilette
        setMode('groom', rand(3800, 6000));
      } else if (r < 0.92) {
        // Pause café
        if (Math.random() < 0.5) showBubble(pick(PHRASES.coffee), 2800);
        setMode('coffee', rand(4800, 7200));
      } else {
        // S'étire
        setMode('stretch', 2100);
      }
      return;
    }

    // Après une pause (assis, couché, « повафлился », café, toilette) → repart se promener ou change de pose
    const r = Math.random();
    if (r < 0.54) {
      pickWalkTarget(160);
      state.speed = rand(50, 72);
      setMode('walk');
    } else if (r < 0.68) {
      pickWalkTarget(260);
      state.speed = rand(110, 142);
      if (Math.random() < 0.4) showBubble(pick(PHRASES.trot), 2000);
      setMode('trot');
    } else if (r < 0.80 && prev !== 'waffle') {
      setMode('waffle', rand(4800, 7800));
    } else if (r < 0.90 && prev !== 'coffee') {
      setMode('coffee', rand(4500, 6800));
    } else {
      setMode('stretch', 2000);
    }
  }

  function updateEyeTracking() {
    if (!catEl) return;
    if (state.mode === 'walk' || state.mode === 'trot') {
      catEl.style.setProperty('--eye-x', '0.8px');
      catEl.style.setProperty('--eye-y', '0px');
      return;
    }
    const rect = catEl.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.45;
    const dx = (state.mouseX - cx) * state.dir;
    const dy = state.mouseY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const maxOffset = 1.6;
    const ex = clamp((dx / dist) * maxOffset, -maxOffset, maxOffset);
    const ey = clamp((dy / dist) * maxOffset, -maxOffset, maxOffset);
    catEl.style.setProperty('--eye-x', `${ ex.toFixed(2) }px`);
    catEl.style.setProperty('--eye-y', `${ ey.toFixed(2) }px`);
  }

  function tick(now) {
    if (!stage) return;
    if (!state.lastTime) state.lastTime = now;
    const dt = Math.min(0.06, (now - state.lastTime) / 1000);
    state.lastTime = now;

    if (state.mode === 'walk' || state.mode === 'trot') {
      const diff = state.targetX - state.x;
      const step = state.speed * dt;
      if (Math.abs(diff) <= step + 2) {
        state.x = state.targetX;
        applyPosition();
        decideNextBehavior();
      } else {
        state.dir = diff >= 0 ? 1 : -1;
        state.x += Math.sign(diff) * step;
        applyPosition();
        if (Math.abs(state.x - state.lastPawX) >= 48) {
          state.lastPawX = state.x;
          spawnPawprint(state.x, state.dir);
        }
      }
    }

    updateEyeTracking();
    rafId = requestAnimationFrame(tick);
  }

  function onPetClick(e) {
    e.stopPropagation();
    spawnFx('♥', 'heart');
    setTimeout(() => spawnFx('♥', 'heart'), 180);

    // Cycle d'interactions amusantes au clic
    const roll = Math.random();
    if (state.mode === 'sleep') {
      showBubble('Mrrrow… bien dormi !', 2400);
      setMode('stretch', 2200);
    } else if (roll < 0.38) {
      showBubble(pick(PHRASES.waffle), 2800);
      setMode('waffle', 6200);
    } else if (roll < 0.68) {
      showBubble(pick(PHRASES.pet), 2600);
      setMode('petted', 650);
      setTimeout(() => {
        if (state.mode === 'petted') setMode('sit', 4500);
      }, 620);
    } else {
      showBubble(pick(PHRASES.coffee), 2800);
      setMode('coffee', 5500);
    }
  }

  function init() {
    if (!mq.matches || stage) return;
    loadSavedState();
    stage = buildStage();
    catEl = stage.querySelector('[data-cc-cat]');
    bubbleEl = stage.querySelector('[data-cc-bubble]');
    fxEl = stage.querySelector('[data-cc-fx]');

    applyPosition();
    catEl.addEventListener('click', onPetClick);

    // Double-clic en bas de page : appelle le chat vers ce point
    window.addEventListener('dblclick', (e) => {
      if (!stage || e.clientY < window.innerHeight - 220) return;
      const minX = 28;
      const maxX = Math.max(180, window.innerWidth - 140);
      state.targetX = clamp(e.clientX - 56, minX, maxX);
      state.dir = state.targetX >= state.x ? 1 : -1;
      state.speed = 128;
      showBubble('J’arrive !', 1800);
      setMode('trot');
    });

    window.addEventListener('mousemove', (e) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (!mq.matches) return;
      const maxX = Math.max(160, window.innerWidth - 140);
      state.x = clamp(state.x, 24, maxX);
      state.targetX = clamp(state.targetX, 24, maxX);
      applyPosition();
    }, { passive: true });

    // Démarre par une promenade ou reprend son état
    if (state.mode === 'walk' || state.mode === 'trot') {
      pickWalkTarget(140);
      setMode('walk');
    } else {
      setMode(state.mode, rand(3200, 5200));
    }

    state.lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function destroy() {
    if (!stage) return;
    cancelAnimationFrame(rafId);
    clearTimeout(stateTimer);
    clearTimeout(bubbleTimer);
    clearInterval(fxInterval);
    stage.remove();
    stage = null;
    catEl = null;
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
