import { SPRITES, CELLS } from './sprites.js';

const PREFIXES = Object.keys(SPRITES);

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
  const el = elOf(entity);
  if (!el) return;
  const cfg = SPRITES[key] && SPRITES[key].idle;
  if (!cfg) return;
  setIdentity(entity, key);
  applyAnim(el, key, 'idle', cfg);
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
  if (!el) { running.delete(entity); return; }
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
    el.classList.remove('motion');
    el.style.transform = baseTransform(entity);
    running.delete(entity);
  }
}
