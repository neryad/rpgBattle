import { getSpeedMultiplier } from './animation.js';

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
  const dur = Math.round(700 / getSpeedMultiplier());
  setTimeout(() => d.remove(), dur);
}

export function slash(el) {
  const p = rectOf(el);
  if (!p) return;
  const d = document.createElement('div');
  d.className = 'fx-slash';
  d.style.left = `${p.x}px`;
  d.style.top = `${p.y - p.h / 2}px`;
  layer().appendChild(d);
  const dur = Math.round(500 / getSpeedMultiplier());
  setTimeout(() => d.remove(), dur);
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
  const dur = Math.round(800 / getSpeedMultiplier());
  setTimeout(() => d.remove(), dur);
}

export function damageNumber(el, value, side = 'enemy', prefix = '-') {
  const p = rectOf(el);
  if (!p) return;
  const d = document.createElement('div');
  d.className = `fx-dmg fx-dmg-${side}`;
  d.style.left = `${p.x}px`;
  d.style.top = `${p.y - p.h}px`;
  d.textContent = `${prefix}${value}`;
  layer().appendChild(d);
  const dur = Math.round(1000 / getSpeedMultiplier());
  setTimeout(() => d.remove(), dur);
}

export function shake(el, distance = 6) {
  if (!el) return;
  const base = getComputedStyle(el).transform;
  el.classList.add('fx-shake');
  el.style.setProperty('--base-shake', base && base !== 'none' ? base : 'scale(1)');
  el.style.setProperty('--shake-x', `${distance}px`);
  const dur = Math.round(450 / getSpeedMultiplier());
  setTimeout(() => {
    el.classList.remove('fx-shake');
    el.style.removeProperty('--base-shake');
    el.style.removeProperty('--shake-x');
  }, dur);
}

export function screenShake(strength = 6) {
  const c = document.querySelector('.container-battle');
  if (!c) return;
  c.classList.add('fx-screen');
  c.style.setProperty('--shake', `${strength}px`);
  const dur = Math.round(350 / getSpeedMultiplier());
  setTimeout(() => {
    c.classList.remove('fx-screen');
    c.style.removeProperty('--shake');
  }, dur);
}

export function fireProjectile({ fromEl, toEl, type = 'arrow', baseDuration = 320 }) {
  const p1 = rectOf(fromEl);
  const p2 = rectOf(toEl);
  if (!p1 || !p2) return Promise.resolve();

  const speed = getSpeedMultiplier();
  const dur = Math.max(80, Math.round(baseDuration / speed));

  const d = document.createElement('div');
  d.className = `fx-projectile fx-projectile--${type}`;
  d.style.left = `${p1.x}px`;
  d.style.top = `${p1.y}px`;
  d.style.setProperty('--target-x', `${p2.x - p1.x}px`);
  d.style.setProperty('--target-y', `${p2.y - p1.y}px`);
  d.style.setProperty('--flight-time', `${dur}ms`);

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  d.style.setProperty('--flight-angle', `${angle}deg`);

  layer().appendChild(d);

  return new Promise((resolve) => {
    setTimeout(() => {
      d.remove();
      resolve();
    }, dur);
  });
}