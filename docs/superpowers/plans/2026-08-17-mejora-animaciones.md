# Mejora de animaciones — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir, darle fluidez y añadir impacto (movimiento híbrido + efectos combo) a las animaciones de los personajes del juego Dungeons & Code.

**Architecture:** Un controlador JS (`animation.js`) con API basada en Promises (`play`/`playScript`/`setIdle`) que reproduce animaciones de spritesheet, desliza al atacante hacia el rival y dispara el daño/efectos en el momento del impacto (`hitAt`). El CSS renderiza los frames con una técnica unificada (`@keyframes spriteStep` + variables `--frames`, `--sheet-w`, `--dur`) en lugar de keyframes manuales rotos. Los efectos (`effects.js`) crean nodos efímeros en un overlay `#fx-layer`.

**Tech Stack:** HTML5, CSS3, JavaScript (ESM, sin dependencias). Tests con `node --test` (incluido en Node 18+).

**Precondiciones:** Rama `feature/animations-improvement` (ya creada). Servidor local para pruebas: `python3 -m http.server 8000` (¿corriendo?) en `http://localhost:8000`.

**Spec de referencia:** `docs/superpowers/specs/2026-08-17-mejora-animaciones-design.md`

---

### Task 1: Configuración de sprites + infraestructura de tests

**Files:**
- Create: `package.json`
- Create: `sprites.js`
- Create: `tests/sprites.test.js`

La configuración es la única fuente de verdad de frames/anchos de hoja/duraciones. Incluye un test de invariante para detectar errores de tipeo en los datos.

- [ ] **Step 1: Crear `package.json` para habilitar ESM en Node**

```json
{
  "name": "rpg-battle",
  "version": "1.0.0",
  "private": true,
  "type": "module"
}
```

- [ ] **Step 2: Escribir el test que falla (TDD)**

Crear `tests/sprites.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPRITES, ANIMS } from '../sprites.js';

const CELL = {
  warrior: 135, mage: 231, hunter: 100,
  worm: 90, flyingeye: 150, goblin: 150, mushroom: 150, skeleton: 150,
};

test('todas las animaciones requeridas existen y tienen datos válidos', () => {
  for (const [name, anims] of Object.entries(SPRITES)) {
    for (const anim of ANIMS) {
      const cfg = anims[anim];
      assert.ok(cfg, `${name} no tiene la animación "${anim}"`);
      assert.ok(Number.isInteger(cfg.frames) && cfg.frames > 0, `${name}.${anim} frames inválido`);
      assert.ok(Number.isFinite(cfg.sheetW), `${name}.${anim} sheetW inválido`);
      assert.ok(Number.isFinite(cfg.dur), `${name}.${anim} dur inválido`);
      assert.equal(typeof cfg.loop, 'boolean', `${name}.${anim} loop inválido`);
    }
  }
});

test('el ancho de hoja coincide con frames × celda (evita errores de tipeo)', () => {
  for (const [name, anims] of Object.entries(SPRITES)) {
    for (const [anim, cfg] of Object.entries(anims)) {
      assert.equal(cfg.sheetW, cfg.frames * CELL[name], `${name}.${anim} hoja=${cfg.sheetW} pero frames*celda=${cfg.frames * CELL[name]}`);
    }
  }
});
```

- [ ] **Step 3: Ejecutar el test y verificar que falla**

Run: `node --test`
Expected: FAIL con `Cannot find module '../sprites.js'`.

- [ ] **Step 4: Crear `sprites.js`**

```js
export const ANIMS = ['idle', 'attack', 'hit', 'death'];

export const SPRITES = {
  warrior: {
    idle:   { frames: 10, sheetW: 1350, dur: 800,  loop: true },
    attack: { frames: 4,  sheetW: 540,  dur: 600,  loop: false },
    hit:    { frames: 3,  sheetW: 405,  dur: 450,  loop: false },
    death:  { frames: 9,  sheetW: 1215, dur: 1000, loop: false },
  },
  mage: {
    idle:   { frames: 6,  sheetW: 1386, dur: 800,  loop: true },
    attack: { frames: 8,  sheetW: 1848, dur: 600,  loop: false },
    hit:    { frames: 4,  sheetW: 924,  dur: 450,  loop: false },
    death:  { frames: 7,  sheetW: 1617, dur: 1000, loop: false },
  },
  hunter: {
    idle:   { frames: 10, sheetW: 1000, dur: 800,  loop: true },
    attack: { frames: 6,  sheetW: 600,  dur: 600,  loop: false },
    hit:    { frames: 3,  sheetW: 300,  dur: 450,  loop: false },
    death:  { frames: 10, sheetW: 1000, dur: 1000, loop: false },
  },
  worm: {
    idle:   { frames: 9,  sheetW: 810,  dur: 800,  loop: true },
    attack: { frames: 16, sheetW: 1440, dur: 700,  loop: false },
    hit:    { frames: 3,  sheetW: 270,  dur: 450,  loop: false },
    death:  { frames: 8,  sheetW: 720,  dur: 1000, loop: false },
  },
  flyingeye: {
    idle:   { frames: 8,  sheetW: 1200, dur: 800,  loop: true },
    attack: { frames: 8,  sheetW: 1200, dur: 700,  loop: false },
    hit:    { frames: 4,  sheetW: 600,  dur: 450,  loop: false },
    death:  { frames: 4,  sheetW: 600,  dur: 1000, loop: false },
  },
  goblin: {
    idle:   { frames: 4,  sheetW: 600,  dur: 800,  loop: true },
    attack: { frames: 8,  sheetW: 1200, dur: 700,  loop: false },
    hit:    { frames: 4,  sheetW: 600,  dur: 450,  loop: false },
    death:  { frames: 4,  sheetW: 600,  dur: 1000, loop: false },
  },
  mushroom: {
    idle:   { frames: 4,  sheetW: 600,  dur: 800,  loop: true },
    attack: { frames: 8,  sheetW: 1200, dur: 700,  loop: false },
    hit:    { frames: 4,  sheetW: 600,  dur: 450,  loop: false },
    death:  { frames: 4,  sheetW: 600,  dur: 1000, loop: false },
  },
  skeleton: {
    idle:   { frames: 4,  sheetW: 600,  dur: 800,  loop: true },
    attack: { frames: 8,  sheetW: 1200, dur: 700,  loop: false },
    hit:    { frames: 4,  sheetW: 600,  dur: 450,  loop: false },
    death:  { frames: 4,  sheetW: 600,  dur: 1000, loop: false },
  },
};
```

- [ ] **Step 5: Ejecutar el test y verificar que pasa**

Run: `node --test`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json sprites.js tests/sprites.test.js
git commit -m "feat: sprite config and invariant tests"
```

---

### Task 2: CSS unificado de animaciones

**Files:**
- Modify: `main.css` (bloques `#sprite-image`, `#sprite-image-enemy`, keyframes por porcentajes; añadir técnica `spriteStep` y clases base)
- Rewrite: `css/heros/warrior.css`, `css/heros/mage.css`, `css/heros/hunter.css`
- Rewrite: `css/enemines/worn.css`, `css/enemines/flyingeye.css`, `css/enemines/goblin.css`, `css/enemines/mushroom.css`, `css/enemines/skeleton.css`

Sustituir keyframes manuales por la técnica unificada. Las clases por animación solo fijan `background-image` y la variable de transformación base; JS aplica `sprite-anim-base` + `sprite-loop`/`sprite-one` y las variables `--frames`, `--sheet-w`, `--dur`.

- [ ] **Step 1: En `main.css`**, reemplazar el bloque `#sprite-image` (líneas ~122-130) por:

```css
#sprite-image {
  height: var(--cell-h, 135px);
  width: var(--cell-w, 135px);
  transform: var(--player-base, scale(2));
  image-rendering: pixelated;
  background-repeat: no-repeat;
}
```

- [ ] **Step 2: En `main.css`**, reemplazar `#sprite-image-enemy` (líneas ~132-139) por:

```css
#sprite-image-enemy {
  height: var(--cell-h, 90px);
  width: var(--cell-w, 90px);
  transform: var(--enemy-base, scaleX(-1.5));
  image-rendering: pixelated;
  background-repeat: no-repeat;
}
```

- [ ] **Step 3: En `main.css`**, reemplazar TODO el bloque de keyframes y clases del warrior (`.idle`, `.attackPlayer`, `.deathPlayer`, `.playerGetHit`, `@keyframes play/death/attack/hit`, líneas ~141-296) por:

```css
.sprite-anim-base {
  animation-name: spriteStep;
  animation-duration: var(--dur);
  animation-timing-function: steps(var(--steps), end);
  background-size: auto;
}
.sprite-loop { animation-iteration-count: infinite; }
.sprite-one {
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

@keyframes spriteStep {
  from { background-position: 0 0; }
  to { background-position: calc(-1 * var(--sheet-w) + var(--cell-w)) 0; }
}

#fx-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
}
.fx-flash {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  border-radius: 50%;
  opacity: 0;
  animation: fxFlash 0.6s ease-out forwards;
}
@keyframes fxFlash {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.7); }
}
.fx-slash {
  position: absolute;
  transform: translate(-50%, -50%) rotate(38deg);
  width: 16px;
  height: 80px;
  background: linear-gradient(to bottom, #fff, #ffd23f);
  border-radius: 8px;
  opacity: 0;
  animation: fxSlash 0.45s ease-out forwards;
}
@keyframes fxSlash {
  0% { opacity: 1; transform: translate(-50%, -50%) translateX(24px) rotate(38deg); }
  100% { opacity: 0; transform: translate(-50%, -50%) translateX(-38px) rotate(22deg); }
}
.fx-burst { position: absolute; width: 0; height: 0; }
.fx-burst span {
  position: absolute;
  width: 7px;
  height: 7px;
  animation: fxP 0.7s ease-out forwards;
}
@keyframes fxP {
  0% { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.4); }
}
.fx-dmg {
  position: absolute;
  transform: translate(-50%, 0);
  font-family: 'Macondo', cursive;
  font-weight: 700;
  text-shadow: 0 0 3px #000;
  opacity: 0;
  animation: fxDmg 0.9s ease-out forwards;
}
.fx-dmg-enemy { color: #ffd23f; font-size: 20px; }
.fx-dmg-player { color: #ff5a4d; font-size: 20px; }
@keyframes fxDmg {
  0% { opacity: 0; transform: translate(-50%, 0); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -24px); }
}
.character-image.fx-shake,
.enemy-image.fx-shake {
  animation: fxShake 0.4s steps(2, end);
}
@keyframes fxShake {
  0% { transform: var(--base-shake, none) translateX(0); }
  25% { transform: var(--base-shake, none) translateX(var(--shake-x)); }
  50% { transform: var(--base-shake, none) translateX(calc(var(--shake-x) * -1)); }
  75% { transform: var(--base-shake, none) translateX(calc(var(--shake-x) * 0.5)); }
  100% { transform: var(--base-shake, none) translateX(0); }
}
.container-battle.fx-screen {
  animation: fxScreen 0.35s steps(2, end);
}
@keyframes fxScreen {
  0% { transform: translate(0, 0); }
  25% { transform: translate(var(--shake), calc(var(--shake) * -1)); }
  50% { transform: translate(calc(var(--shake) * -1), var(--shake)); }
  75% { transform: translate(var(--shake), var(--shake)); }
  100% { transform: translate(0, 0); }
}
```

- [ ] **Step 4: En `main.css`**, asegurar que `.characters` sea contexto de posicionamiento para `#fx-layer`. Añadir `position: relative;` a la regla `.characters` (líneas ~333-343).

- [ ] **Step 5: Reescribir `css/heros/warrior.css`** con:

```css
.warrior { --player-base: scale(4); }
.warrior-idle   { background-image: url('../../assets/characters/heros/warrior/Idle.png'); }
.warrior-attack { background-image: url('../../assets/characters/heros/warrior/Attack1.png'); }
.warrior-hit    { background-image: url('../../assets/characters/heros/warrior/GetHit.png'); }
.warrior-death  { background-image: url('../../assets/characters/heros/warrior/Death.png'); }
```

- [ ] **Step 6: Reescribir `css/heros/mage.css`** con:

```css
.mage { --player-base: scale(2); }
.mage-idle   { background-image: url('../../assets/characters/heros/mage/Idle.png'); }
.mage-attack { background-image: url('../../assets/characters/heros/mage/Attack1.png'); }
.mage-hit    { background-image: url('../../assets/characters/heros/mage/Hit.png'); }
.mage-death  { background-image: url('../../assets/characters/heros/mage/Death.png'); }
```

- [ ] **Step 7: Reescribir `css/heros/hunter.css`** con:

```css
.hunter { --player-base: scale(4); }
.hunter-idle   { background-image: url('../../assets/characters/heros/hunter/Idle.png'); }
.hunter-attack { background-image: url('../../assets/characters/heros/hunter/Attack.png'); }
.hunter-hit    { background-image: url('../../assets/characters/heros/hunter/GetHit.png'); }
.hunter-death  { background-image: url('../../assets/characters/heros/hunter/Death.png'); }
```

- [ ] **Step 8: Reescribir `css/enemines/worn.css`** con:

```css
.worm-idle   { background-image: url('../../assets/characters/enemies/Worm/Idle.png'); }
.worm-attack { background-image: url('../../assets/characters/enemies/Worm/Attack.png'); }
.worm-hit    { background-image: url('../../assets/characters/enemies/Worm/GetHit.png'); }
.worm-death  { background-image: url('../../assets/characters/enemies/Worm/Death.png'); }
```

- [ ] **Step 9: Reescribir `css/enemines/flyingeye.css`** con:

```css
.flyingeye {
  --enemy-base: scale(-1.6, 1.6);
}
.flyingeye-idle   { background-image: url('../../assets/characters/enemies/Flying eye/Flight.png'); }
.flyingeye-attack { background-image: url('../../assets/characters/enemies/Flying eye/Attack.png'); }
.flyingeye-hit    { background-image: url('../../assets/characters/enemies/Flying eye/Take Hit.png'); }
.flyingeye-death  { background-image: url('../../assets/characters/enemies/Flying eye/Death.png'); }
```

- [ ] **Step 10: Reescribir `css/enemines/goblin.css`** con:

```css
.goblin {
  --enemy-base: scale(-1.6, 1.6);
}
.goblin-idle   { background-image: url('../../assets/characters/enemies/Goblin/Idle.png'); }
.goblin-attack { background-image: url('../../assets/characters/enemies/Goblin/Attack.png'); }
.goblin-hit    { background-image: url('../../assets/characters/enemies/Goblin/Take Hit.png'); }
.goblin-death  { background-image: url('../../assets/characters/enemies/Goblin/Death.png'); }
```

- [ ] **Step 11: Reescribir `css/enemines/mushroom.css`** con:

```css
.mushroom {
  --enemy-base: scale(-1.6, 1.6);
}
.mushroom-idle   { background-image: url('../../assets/characters/enemies/Mushroom/Idle.png'); }
.mushroom-attack { background-image: url('../../assets/characters/enemies/Mushroom/Attack.png'); }
.mushroom-hit    { background-image: url('../../assets/characters/enemies/Mushroom/Take Hit.png'); }
.mushroom-death  { background-image: url('../../assets/characters/enemies/Mushroom/Death.png'); }
```

- [ ] **Step 12: Reescribir `css/enemines/skeleton.css`** con:

```css
.skeleton {
  --enemy-base: scale(-1.6, 1.6);
}
.skeleton-idle   { background-image: url('../../assets/characters/enemies/Skeleton/Idle.png'); }
.skeleton-attack { background-image: url('../../assets/characters/enemies/Skeleton/Attack.png'); }
.skeleton-hit    { background-image: url('../../assets/characters/enemies/Skeleton/Take Hit.png'); }
.skeleton-death  { background-image: url('../../assets/characters/enemies/Skeleton/Death.png'); }
```

- [ ] **Step 13: Verificación manual rápida**

Servir la app (`python3 -m http.server 8000`) y abrir `http://localhost:8000`. En consola (devtools) ejecutar de prueba:

```js
const el = document.querySelector('#sprite-image-enemy');
el.classList.add('sprite-anim-base', 'sprite-loop', 'worm-idle');
el.style.setProperty('--steps', '8');
el.style.setProperty('--cell-w', '90px');
el.style.setProperty('--sheet-w', '810px');
el.style.setProperty('--dur', '800ms');
```
Expected: el enemigo (gusano) animando idle usando todos los frames. Limpiar con `el.classList.remove('sprite-anim-base','sprite-loop','worm-idle');`.

- [ ] **Step 14: Commit**

```bash
git add main.css css/heros css/enemines
git commit -m "feat: unified sprite sheet animation CSS"
```

---

### Task 3: Controlador de animación (`animation.js`)

**Files:**
- Create: `animation.js`

El controlador reproduce pasos, desliza al atacante y dispara `onHit` en el momento del impacto. Sin requesitos de test unitario (depende del DOM); se valida en Task 5 y Task 7.

- [ ] **Step 1: Crear `animation.js`**

```js
import { SPRITES, CELLS } from './sprites.js';

const PREFIXES = ['warrior', 'mage', 'hunter', 'worm', 'flyingeye', 'goblin', 'mushroom', 'skeleton'];

let playerEl = null;
let enemyEl = null;
const running = new Set();

export function setPlayerEl(el) { playerEl = el; }
export function setEnemyEl(el) { enemyEl = el; }

function elOf(entity) { return entity === 'player' ? playerEl : enemyEl; }

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function clearAnimClasses(el) {
  for (const cls of Array.from(el.classList)) {
    if (cls === 'sprite-anim-base' || cls === 'sprite-loop' || cls === 'sprite-one') {
      el.classList.remove(cls);
    } else if (PREFIXES.some((p) => cls.startsWith(p + '-'))) {
      el.classList.remove(cls);
    }
  }
}

function applyAnim(el, key, anim, cfg) {
  clearAnimClasses(el);
  el.classList.add('sprite-anim-base', `${key}-${anim}`, cfg.loop ? 'sprite-loop' : 'sprite-one');
  el.style.setProperty('--frames', String(cfg.frames));
  el.style.setProperty('--steps', String(cfg.frames - 1));
  el.style.setProperty('--cell-w', `${(CELLS[key] && CELLS[key].w) || 0}px`);
  el.style.setProperty('--cell-h', `${(CELLS[key] && CELLS[key].h) || 0}px`);
  el.style.setProperty('--sheet-w', `${cfg.sheetW}px`);
  el.style.setProperty('--dur', `${cfg.dur}ms`);
  void el.offsetWidth;
}

export function setIdentity(entity, key) {
  const el = elOf(entity);
  if (!el) return;
  for (const p of PREFIXES) el.classList.remove(p);
  el.classList.add(key);
}

export async function setIdle(entity, key) {
  const cfg = SPRITES[key] && SPRITES[key].idle;
  if (!cfg) return;
  setIdentity(entity, key);
  applyAnim(elOf(entity), key, 'idle', cfg);
}

function baseTransform(entity) {
  return entity === 'player' ? 'var(--player-base, none)' : 'var(--enemy-base, none)';
}

export async function play(entity, step) {
  return playScript(entity, [step]);
}

export async function playScript(entity, steps) {
  if (running.has(entity)) return;
  running.add(entity);
  const el = elOf(entity);
  try {
    for (const step of steps) {
      const cfg = SPRITES[step.key] && SPRITES[step.key][step.anim];
      if (!cfg) {
        if (step.onHit) step.onHit();
        continue;
      }
      applyAnim(el, step.key, step.anim, cfg);
      const dir = entity === 'player' ? 1 : -1;
      const moveX = step.moveX || 0;
      const hitAt = step.hitAt != null ? step.hitAt : 1;
      const rest = cfg.dur * (1 - hitAt);
      if (moveX) {
        el.classList.add('motion');
        el.style.transform = `${baseTransform(entity)} translateX(${dir * moveX}px)`;
      }
      await sleep(cfg.dur * hitAt);
      if (step.onHit) step.onHit();
      if (moveX) {
        el.style.transform = baseTransform(entity);
        await sleep(rest);
        el.classList.remove('motion');
      } else {
        await sleep(rest);
      }
    }
  } finally {
    running.delete(entity);
  }
}
```

Nota: la clase `motion` no existe todavía en CSS; se añade en Task 4 (para el dash suave). Debe ser:

```css
.motion { transition: transform 0.12s linear; }
```

- [ ] **Step 2: Commit**

```bash
git add animation.js
git commit -m "feat: animation controller with hitAt sequencing"
```

---

### Task 4: Efectos (combo completo) + overlay `#fx-layer`

**Files:**
- Create: `effects.js`
- Modify: `index.html` (añadir `#fx-layer`)
- Modify: `main.css` (añadir `.motion`, `.character-image`/`.enemy-image` con `position: relative` para los efectos)

- [ ] **Step 1: Añadir `#fx-layer` en `index.html`**

En el div `.characters` (líneas ~110-214), justo antes de su cierre, insertar:

```html
<div id="fx-layer"></div>
```

El `.characters` ya tendrá `position: relative` (Task 2, Step 4), por lo que `#fx-layer` (absoluto) lo cubrirá.

- [ ] **Step 2: Añadir al final de `main.css`** el complemento del dash (necesario para `animation.js`) y posición relativa de los contenedores de sprite:

```css
.motion { transition: transform 0.12s linear; }

.character-image,
.enemy-image {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 3: Crear `effects.js`**

```js
function layer() {
  return document.getElementById('fx-layer');
}

function rectOf(el) {
  const l = layer();
  if (!l || !el) return null;
  const lr = l.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    x: r.left - lr.left + r.width / 2,
    y: r.top - lr.top + r.height / 2,
    w: r.width,
    h: r.height,
  };
}

export function flash(el, color = 'rgba(255,240,180,.95)') {
  const p = rectOf(el);
  if (!p) return;
  const d = document.createElement('div');
  d.className = 'fx-flash';
  d.style.left = `${p.x}px`;
  d.style.top = `${p.y - p.h}px`;
  d.style.background = `radial-gradient(circle, ${color}, rgba(255,180,60,.4) 60%, transparent 72%)`;
  layer().appendChild(d);
  setTimeout(() => d.remove(), 700);
}

export function slash(el) {
  const p = rectOf(el);
  if (!p) return;
  const d = document.createElement('div');
  d.className = 'fx-slash';
  d.style.left = `${p.x}px`;
  d.style.top = `${p.y - p.h / 2}px`;
  layer().appendChild(d);
  setTimeout(() => d.remove(), 500);
}

export function particles(el, n = 9) {
  const p = rectOf(el);
  if (!p) return;
  const colors = ['#ffd23f', '#ff8c5a', '#ffffff'];
  const d = document.createElement('div');
  d.className = 'fx-burst';
  d.style.left = `${p.x}px`;
  d.style.top = `${p.y - p.h / 2}px`;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    const ang = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 26;
    s.style.setProperty('--tx', `${Math.cos(ang) * dist}px`);
    s.style.setProperty('--ty', `${Math.sin(ang) * dist}px`);
    s.style.background = colors[i % colors.length];
    d.appendChild(s);
  }
  layer().appendChild(d);
  setTimeout(() => d.remove(), 800);
}

export function damageNumber(el, value, side = 'enemy') {
  const p = rectOf(el);
  if (!p) return;
  const d = document.createElement('div');
  d.className = `fx-dmg fx-dmg-${side}`;
  d.style.left = `${p.x}px`;
  d.style.top = `${p.y - p.h}px`;
  d.textContent = `-${value}`;
  layer().appendChild(d);
  setTimeout(() => d.remove(), 1000);
}

export function shake(el, distance = 6) {
  if (!el) return;
  const base = getComputedStyle(el).transform;
  el.classList.add('fx-shake');
  el.style.setProperty('--base-shake', base === 'none' ? 'none' : base);
  el.style.setProperty('--shake-x', `${distance}px`);
  setTimeout(() => el.classList.remove('fx-shake'), 450);
}

export function screenShake(strength = 6) {
  const c = document.querySelector('.container-battle');
  if (!c) return;
  c.classList.add('fx-screen');
  c.style.setProperty('--shake', `${strength}px`);
  setTimeout(() => c.classList.remove('fx-screen'), 350);
}
```

- [ ] **Step 4: Commit**

```bash
git add effects.js index.html main.css
git commit -m "feat: combo impact effects and fx layer"
```

---

### Task 5: Integración en `app.js`

**Files:**
- Modify: `app.js`

Reemplazar el toggling de clases + `sleep()` por `await` de animaciones con daño disparado en el impacto. La lógica de combate (daños, críticas, chance de defenderse, contador de special) permanece intacta.

- [ ] **Step 1: Reemplazar imports** (línea 1)

De:
```js
import { action } from './helper.js';
```
A:
```js
import { setPlayerEl, setEnemyEl, setIdle, play, playScript } from './animation.js';
import { flash, slash, particles, damageNumber, shake, screenShake } from './effects.js';
```

- [ ] **Step 2: Inicializar el controlador**

Justo después de la definición de `enemySprite` (línea 158, `let enemySprite = ...;`), insertar:

```js
setPlayerEl(sprite);
setEnemyEl(enemySprite);

const ENEMY_KEYS = {
  'Worn': 'worm',
  'Flying eye': 'flyingeye',
  'Goblin': 'goblin',
  'Mushroom': 'mushroom',
  'Skeleton': 'skeleton',
};
```

- [ ] **Step 3: Reemplazar `setHeroStatus`** (funciones completas `setHeroStatus` y `setEnemyStatus`) por:

```js
function setHeroStatus(hero) {
  document.getElementById('progresHealth').value = hero.health;
  setIdle('player', hero.characterClass);
}

function setEnemyStatus(enemy) {
  document.getElementById('enemy-hp').value = enemy.health;
  const key = ENEMY_KEYS[enemy.name] || 'worm';
  setIdle('enemy', key);
}
```

- [ ] **Step 4: Reemplazar `heroTurn`** por:

```js
async function heroTurn(player, target) {
  const playerKey = player.characterClass;
  const enemyKey = ENEMY_KEYS[target.name] || 'worm';

  document.querySelector('#attack').disabled = true;
  document.querySelector('#defend').disabled = true;

  const enemyDefendNumber = Math.floor(Math.random() * 9) + 1;
  if (enemyDefendNumber === 7) {
    await playScript('enemy', [
      {
        key: enemyKey,
        anim: 'attack',
        moveX: 12,
        hitAt: 0.7,
        onHit: () => {
          const damage = target.strength - player.defense;
          target.health -= damage;
          document.querySelector('#enemy-hp').value = target.health;
          flash(enemySprite, 'rgba(160,200,255,.95)');
          damageNumber(enemySprite, damage, 'enemy');
          generateText(`${target.name} se defendió, tomó ${damage} de daño, turno de ${player.name}.`);
        },
      },
    ]);
    await setIdle('enemy', enemyKey);
    document.querySelector('#attack').disabled = false;
    document.querySelector('#defend').disabled = false;
    return;
  }

  let damage = Math.floor(Math.random() * player.strength) * 1.5;
  playerHits++;
  if (playerHits === 7) {
    document.querySelector('#special').disabled = false;
    playerHits = 0;
  }

  if (damage === player.criticalChance) {
    damage = Math.floor(Math.random() * player.strength) * 3;
    generateText(`${player.name} hizo un golpe crítico a ${target.name} por ${damage} de daño`);
  } else {
    generateText(`${player.name} golpeó a ${target.name} por ${damage} de daño.`);
  }

  await playScript('player', [
    {
      key: playerKey,
      anim: 'attack',
      moveX: 46,
      hitAt: 0.6,
      onHit: () => {
        target.health -= damage;
        if (target.health < 0) target.health = 0;
        document.querySelector('#enemy-hp').value = target.health;
        flash(enemySprite);
        slash(enemySprite);
        particles(enemySprite);
        damageNumber(enemySprite, damage, 'enemy');
        shake(enemySprite.parentElement, 10);
        screenShake();
      },
    },
  ]);

  if (target.health <= 0) {
    generateText(`${target.name} ha sido derrotado por ${player.name}, Has ganado valiente ${player.name}`);
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';
    play('enemy', { key: enemyKey, anim: 'death' });
    return;
  }

  await setIdle('enemy', enemyKey);
  await enemyAttack(target, player);
}
```

- [ ] **Step 5: Reemplazar `enemyAttack`** (la función que comienza en la línea 385, con firma `enemyAttack(enemy, target)`) por:

```js
async function enemyAttack(enemy, heroPlayer) {
  const playerKey = heroPlayer.characterClass;
  const enemyKey = ENEMY_KEYS[enemy.name] || 'worm';
  await setIdle('enemy', enemyKey);

  const damage = Math.floor(Math.random() * enemy.strength) * 1.5;

  await playScript('enemy', [
    {
      key: enemyKey,
      anim: 'attack',
      moveX: 12,
      hitAt: 0.6,
      onHit: () => {
        heroPlayer.health -= damage;
        if (heroPlayer.health < 0) heroPlayer.health = 0;
        document.querySelector('#progresHealth').value = heroPlayer.health;
        flash(sprite, 'rgba(255,90,77,.95)');
        damageNumber(sprite, damage, 'player');
        shake(sprite.parentElement, -10);
        screenShake();
      },
    },
  ]);

  if (heroPlayer.health <= 0) {
    generateText(`${heroPlayer.name} ha sido derrotado por ${enemy.name}, Game Over`);
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';
    play('player', { key: playerKey, anim: 'death' });
    return;
  }

  await setIdle('player', playerKey);
  document.querySelector('#attack').disabled = false;
  document.querySelector('#defend').disabled = false;
}
```

- [ ] **Step 6: Reemplazar `characterDefense`** por:

```js
async function characterDefense(character, target) {
  const enemyKey = ENEMY_KEYS[target.name] || 'worm';
  generateText(`${character.name} se está defendiendo.`);

  await playScript('enemy', [
    {
      key: enemyKey,
      anim: 'attack',
      moveX: 12,
      hitAt: 0.6,
      onHit: () => {
        const damage = target.strength - character.defense;
        character.health -= damage;
        if (character.health < 0) character.health = 0;
        document.querySelector('#progresHealth').value = character.health;
        flash(sprite, 'rgba(140,190,255,.9)');
        damageNumber(sprite, damage, 'player');
        generateText(`${target.name} golpeó a ${character.name} con ${damage} daño.`);
      },
    },
  ]);

  if (character.health <= 0) {
    generateText(`${character.name} ha sido derrotado por ${target.name}, Game Over`);
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';
    play('player', { key: character.characterClass, anim: 'death' });
    return;
  }
  await setIdle('player', character.characterClass);
}
```

- [ ] **Step 7: Reemplazar `playerSpecial`** por:

```js
async function playerSpecial(player, target) {
  const playerKey = player.characterClass;
  const enemyKey = ENEMY_KEYS[target.name] || 'worm';
  const damage = player.strength * 2.5;
  const enemyDefendNumber = Math.floor(Math.random() * 9) + 1;
  generateText(`${player.name} usa el especial: ${player.specialAttack}.`);

  await playScript('player', [
    {
      key: playerKey,
      anim: 'attack',
      moveX: 46,
      hitAt: 0.6,
      onHit: () => {
        let dmg = damage;
        if (enemyDefendNumber >= 7) dmg = Math.max(0, damage - 5);
        target.health -= dmg;
        if (target.health < 0) target.health = 0;
        document.querySelector('#enemy-hp').value = target.health;
        flash(enemySprite);
        slash(enemySprite);
        particles(enemySprite, 16);
        damageNumber(enemySprite, dmg, 'enemy');
        shake(enemySprite.parentElement, 14);
        screenShake(10);
      },
    },
  ]);

  if (target.health <= 0) {
    generateText(`${target.name} ha sido derrotado por ${player.name}, Has ganado valiente ${player.name}`);
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';
    play('enemy', { key: enemyKey, anim: 'death' });
    return;
  }

  await setIdle('enemy', enemyKey);
  await enemyAttack(target, player);
}
```

Nota: `playerSpecial` debe declararse `async` (hoy es síncrona). El listener de `#special` (líneas 194-198) se mantiene igual; la función puede no esperar el retorno.

- [ ] **Step 8: Eliminar funciones de animación obsoletas**

Eliminar estas funciones del archivo (ya no se usan):
- `enemyDefend` (líneas 468-490)
- `setAttackAnimationClass` (líneas 539-547)
- `setHitAnimationClass` (549-561)
- `setDeathAnimationClass` (563-574)
- `setIdleAnimationClass` (576-584)
- `setAttackAnimationClassEnemy` (587-599)
- `setHitAnimationClassEnemy` (601-616)
- `setDeathAnimationClassEnemy` (618-636)
- `setIdleAnimationClassEnemy` (638-651)

- [ ] **Step 9: Eliminar la función `sleep`** (líneas 531-533) si queda sin uso.

- [ ] **Step 10: Verificación manual de flujo**

Servir la app y probar: atacar (enemigo recibe combo completo), presionar Attack varias veces (7 hits → habilitar spécial), Defend (bloqueo azul), Special (destello intenso), y dejarse ganar/perder para ver las muertes. Revisar consola sin errores.

- [ ] **Step 11: Commit**

```bash
git add app.js
git commit -m "feat: rewire combat to animation controller"
```

---

### Task 6: Limpieza de `helper.js`

**Files:**
- Modify: `index.html`
- Delete: `helper.js`

- [ ] **Step 1: En `index.html`**, eliminar la línea del script de `helper.js` (línea 242: `<script src="helper.js" defer type="module"></script>`).

- [ ] **Step 2: Eliminar el archivo `helper.js`** (ya no se importa en ninguna parte tras Task 5).

```bash
rm helper.js
```

- [ ] **Step 3: Verificar que no quedan referencias**

Run: `rg -n "helper" --type-add 'web:*.{html,js}' -t web .`
Expected: sin resultados (o solo el comentario del old block al final de app.js, que también se puede eliminar: el bloque `// Helper` y su función `action` comentada, líneas 653-664).

- [ ] **Step 4: Commit**

```bash
git add -A index.html
git rm helper.js
git commit -m "chore: remove obsolete helper module"
```

---

### Task 7: Verificación integral manual

**Files:**
- None (verificación)

- [ ] **Step 1: Test unitario final**

Run: `node --test`
Expected: PASS (2 tests).

- [ ] **Step 2: Recorrido completo en navegador**

Con `python3 -m http.server 8000` corriendo, en `http://localhost:8000` verificar la matriz completa, anotando cualquier fallo:

| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Warrior vs cada enemigo (Worm, Flying eye, Goblin, Mushroom, Skeleton) | Idle fluido con todos los frames; ataque con dash + combo de efectos al impactar; el enemigo se sacude/retrocede; no se traban botones |
| 2 | Mage y Hunter (mismas 5 batallas) | Igual que anterior |
| 3 | 7 ataques → Special habilita | El especial tiene efectos intensificados |
| 4 | Defend al recibir golpe | Bloqueo azul, daño reducido, sin secuencia trabada |
| 5 | Derrotar al enemigo | Animación de muerte del enemigo (una vez, último frame), log de victoria, solo botón Reiniciar |
| 6 | Dejar morir al héroe | Animación de muerte del héroe, "Game Over", solo botón Reiniciar |
| 7 | Reiniciar | `location.reload()` vuelve a la selección de héroe |
| 8 | Consola (devtools) | Sin errores de JS en todo el recorrido |

- [ ] **Step 3: Commit final (si hubo ajustes)**

```bash
git add -A
git commit -m "fix: verification adjustments"
```

---

## Notas finales

- La lógica de combate (críticas, HP, chance de defender) no cambia; solo el momento en que se aplica daño/efectos se alinea al impacto visual.
- Los sprites Run/Walk/Jump de héroes y enemigos siguen sin usarse (fuera de alcance).
- El overlay `#fx-layer` y `.superpowers/` están ignorados por git (`.gitignore` ya creado).