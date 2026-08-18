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
  setTimeout(() => {
    el.classList.remove('fx-shake');
    el.style.removeProperty('--base-shake');
    el.style.removeProperty('--shake-x');
  }, 450);
}

export function screenShake(strength = 6) {
  const c = document.querySelector('.container-battle');
  if (!c) return;
  c.classList.add('fx-screen');
  c.style.setProperty('--shake', `${strength}px`);
  setTimeout(() => {
    c.classList.remove('fx-screen');
    c.style.removeProperty('--shake');
  }, 350);
}