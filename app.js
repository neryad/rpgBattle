import { setPlayerEl, setEnemyEl, setIdle, play, playScript } from './animation.js';
import { flash, slash, particles, damageNumber, shake, screenShake } from './effects.js';
import {
  HEROES,
  buildHit,
  commitHit,
  tickStatuses,
  SPECIAL_HITS,
} from './combat.js';
import {
  createRun,
  getFloorEnemy,
  nextFloor,
  generateRewards,
  applyReward,
  isBossFloor,
} from './dungeon.js';

const STATUS_LABELS = { burn: 'Quemadura', bleed: 'Sangrado', poison: 'Veneno', frenzy: 'Frenesí' };

let hero = null;
let enemy = null;
let busy = false;
let battleOver = false;
let run = null;
let currentRewards = null;

const logText = document.querySelector('#text');
const sprite = document.querySelector('#sprite-image');
const enemySprite = document.querySelector('#sprite-image-enemy');
const playerStatusEl = document.querySelector('#player-status');
const enemyStatusEl = document.querySelector('#enemy-status');
const turnIndicator = document.querySelector('#turn-indicator');
const specialMeter = document.querySelector('#special-meter');

setPlayerEl(sprite);
setEnemyEl(enemySprite);

function generateText(text) {
  logText.innerHTML = text;
  return text;
}

function selectHero(characterClass) {
  run = createRun(characterClass);
  hero = run.hero;
  startGame();
}

function hideRestOfHeros() {
  document.getElementById('heroes').style.display = 'none';
  document.querySelector('.gametittle').style.display = 'none';
}

function setTurnIndicator(text) {
  if (turnIndicator) turnIndicator.textContent = text;
}

function updateSpecialMeter() {
  if (!specialMeter) return;
  const pips = specialMeter.querySelectorAll('.pip');
  const filled = hero && hero.specialUnlocked ? SPECIAL_HITS : (hero ? hero.hits : 0);
  pips.forEach((pip, i) => pip.classList.toggle('on', i < filled));
}

function setHeroStatus(unit) {
  const bar = document.getElementById('progresHealth');
  bar.max = unit.maxHealth;
  bar.value = unit.health;
  bar.style.setProperty('--bar-color', hpColor(unit.health, unit.maxHealth));
  document.querySelector('#player-name').textContent = unit.name;
  document.querySelector('#player-role').textContent = unit.role;
  renderStatuses(unit, playerStatusEl);
  setIdle('player', unit.spriteKey);
}

function setEnemyStatus(unit) {
  const bar = document.getElementById('enemy-hp');
  bar.max = unit.maxHealth;
  bar.value = unit.health;
  bar.style.setProperty('--bar-color', hpColor(unit.health, unit.maxHealth));
  document.getElementById('enemy-name').textContent = unit.name;
  document.querySelector('#enemy-role').textContent = unit.role;
  renderStatuses(unit, enemyStatusEl);
  setIdle('enemy', unit.spriteKey);
}

function updatePlayerBar(unit) {
  const bar = document.getElementById('progresHealth');
  bar.value = unit.health;
  bar.style.setProperty('--bar-color', hpColor(unit.health, unit.maxHealth));
}

function updateEnemyBar(unit) {
  const bar = document.getElementById('enemy-hp');
  bar.value = unit.health;
  bar.style.setProperty('--bar-color', hpColor(unit.health, unit.maxHealth));
}

function hpColor(hp, maxHp) {
  const pct = maxHp ? (hp / maxHp) * 100 : 0;
  if (pct > 60) return 'var(--hp-good)';
  if (pct > 30) return 'var(--hp-warn)';
  return 'var(--hp-low)';
}

function renderStatuses(unit, el) {
  if (!el) return;
  const active = unit.statusEffects.filter((s) => s.type !== 'frenzy');
  el.textContent = active
    .map((s) => `${STATUS_LABELS[s.type] || s.type} (${s.duration})`)
    .join(' · ');
}

function statusLabel(unit, statuses) {
  return statuses.map((s) => STATUS_LABELS[s.type] || s.type).join(', ');
}

function setSpecialReady(ready) {
  const btn = document.querySelector('#special');
  btn.classList.toggle('ready', ready);
  btn.textContent = ready ? 'Special READY!' : 'Special';
  updateSpecialMeter();
}

function setTurnControls(disabled) {
  document.querySelector('#attack').disabled = disabled;
  document.querySelector('#defend').disabled = disabled;
  document.querySelector('#special').disabled = disabled || !hero.specialUnlocked;
  setSpecialReady(hero.specialUnlocked);
}

function runTurn(fn) {
  if (busy || battleOver) return;
  busy = true;
  setTurnControls(true);
  Promise.resolve()
    .then(fn)
    .finally(() => {
      if (!battleOver) setTurnControls(false);
      busy = false;
    });
}

function trackHit(player, pending, parts) {
  if (pending.miss) return;
  player.hits += 1;
  if (player.hits >= SPECIAL_HITS) {
    player.hits = 0;
    player.specialUnlocked = true;
    setSpecialReady(true);
    parts.push(`¡SPECIAL READY!`);
  }
  updateSpecialMeter();
}

function applyHitVisuals(el, pending, side) {
  if (side === 'player') {
    flash(el, 'rgba(255,90,77,.95)');
    particles(el, pending.isCrit ? 14 : 7);
    damageNumber(el, pending.damage, 'player');
    shake(el.parentElement, -10);
    screenShake();
    return;
  }
  flash(el);
  slash(el);
  particles(el, pending.isCrit ? 16 : 9);
  damageNumber(el, pending.damage, 'enemy');
  shake(el.parentElement, pending.isCrit ? 14 : 10);
  screenShake();
}

function updateFloorBanner() {
  const banner = document.querySelector('#floor-banner');
  if (banner && run) {
    const bossText = isBossFloor(run) ? ' — BOSS' : '';
    banner.textContent = `PISO ${run.floor}/5${bossText}`;
    banner.style.display = 'block';
  }
}

function victory(player, target) {
  battleOver = true;
  run.kills += 1;
  generateText(`${target.name} ha sido derrotado por ${player.name}, Has ganado valiente ${player.name}`);
  setTurnIndicator('Victory!');
  setTurnControls(true);
  play('enemy', { key: target.spriteKey, anim: 'death' });
  setIdle('player', player.spriteKey);

  if (isBossFloor(run)) {
    setTimeout(() => showVictoryScreen(), 1200);
  } else {
    setTimeout(() => showRewardScreen(), 1200);
  }
}

function defeat(player, attacker) {
  battleOver = true;
  generateText(`${player.name} ha sido derrotado por ${attacker.name}, Game Over`);
  setTurnIndicator('Defeat');
  setTurnControls(true);
  play('player', { key: player.spriteKey, anim: 'death' });
  setIdle('enemy', attacker.spriteKey);

  setTimeout(() => showGameOverScreen(), 1200);
}

function resetGame() {
  location.reload();
}

function showRewardScreen() {
  currentRewards = generateRewards(run);
  const screen = document.querySelector('#reward-screen');
  const cardsContainer = screen.querySelector('.reward-cards');
  cardsContainer.innerHTML = '';

  currentRewards.forEach((reward, i) => {
    const card = document.createElement('button');
    card.className = 'reward-card';
    card.dataset.index = i;
    card.innerHTML = `
      <span class="reward-icon">${reward.type === 'heal' ? '❤️' : reward.type === 'stat' ? '⚔️' : '⭐'}</span>
      <span class="reward-label">${reward.label}</span>
      <span class="reward-desc">${reward.desc}</span>
    `;
    card.addEventListener('click', () => selectReward(i));
    cardsContainer.appendChild(card);
  });

  screen.querySelector('.reward-continue').disabled = true;
  screen.style.display = 'flex';
}

function selectReward(index) {
  const cards = document.querySelectorAll('.reward-card');
  cards.forEach((c, i) => c.classList.toggle('selected', i === index));
  const continueBtn = document.querySelector('#reward-screen .reward-continue');
  continueBtn.disabled = false;
  continueBtn.onclick = () => {
    applyReward(run, currentRewards[index]);
    document.querySelector('#reward-screen').style.display = 'none';
    startNextFloor();
  };
}

function startNextFloor() {
  nextFloor(run);
  battleOver = false;
  busy = false;
  currentRewards = null;

  enemy = getFloorEnemy(run);
  setEnemyStatus(enemy);
  renderStatuses(hero, playerStatusEl);
  updateFloorBanner();
  updatePlayerBar(hero);
  setSpecialReady(hero.specialUnlocked);
  updateSpecialMeter();

  document.querySelector('#reset').style.display = 'none';
  document.querySelector('.enemies').style.display = 'inline-flex';
  generateText(`Piso ${run.floor}: ${enemy.name} aparece.`);
  whoGoFirst(hero, enemy);
}

function showVictoryScreen() {
  const screen = document.querySelector('#victory-screen');
  screen.querySelector('.summary-floors').textContent = run.floor;
  screen.querySelector('.summary-kills').textContent = run.kills;
  screen.style.display = 'flex';
  document.querySelector('#floor-banner').style.display = 'none';
}

function showGameOverScreen() {
  const screen = document.querySelector('#gameover-screen');
  screen.querySelector('.summary-floors').textContent = run.floor;
  screen.querySelector('.summary-kills').textContent = run.kills;
  screen.style.display = 'flex';
  document.querySelector('#floor-banner').style.display = 'none';
}

function startGame() {
  setHeroStatus(hero);

  document.querySelector('.actions').style.display = 'inline-flex';
  document.querySelector('.log').style.display = 'inline-flex';
  document.querySelector('.characters').style.display = 'inline-flex';
  document.querySelector('#reset').style.display = 'none';
  document.querySelector('.container').classList.add('container-battle');
  hideRestOfHeros();

  enemy = getFloorEnemy(run);
  setEnemyStatus(enemy);
  updateFloorBanner();

  document.querySelector('.enemies').style.display = 'inline-flex';
  setSpecialReady(false);

  whoGoFirst(hero, enemy);
}

function whoGoFirst(unit, foe) {
  if (unit.speed > foe.speed) {
    generateText(`${unit.name} es más rápido, es su turno.`);
    setTurnIndicator(`${unit.name}: Your Turn`);
    setTurnControls(false);
  } else {
    busy = true;
    setTurnControls(true);
    generateText(`${foe.name} ha aparecido, ¡es su turno!`);
    setTurnIndicator(`${foe.name}: Enemy Turn`);
    enemyAttack(foe, unit).finally(() => {
      busy = false;
      if (!battleOver) setTurnControls(false);
    });
  }
}

async function heroTurn(player, target) {
  const playerKey = player.spriteKey;
  const enemyKey = target.spriteKey;

  setTurnIndicator(`${player.name}: Your Turn`);
  const pending = buildHit(player, target, { useSpecial: false });

  await playScript('player', [
    {
      key: playerKey,
      anim: 'attack',
      moveX: 46,
      hitAt: 0.6,
      onHit: () => {
        const res = commitHit(pending);
        const parts = [];
        if (res.miss) {
          parts.push(`${target.name} esquivó el ataque.`);
        } else {
          if (pending.targetDefended) {
            parts.push(`${target.name} se defendió y recibió ${res.damage} de daño.`);
          } else if (res.isCrit) {
            parts.push(`¡CRÍTICO! ${player.name} golpeó a ${target.name} por ${res.damage} de daño.`);
          } else {
            parts.push(`${player.name} golpeó a ${target.name} por ${res.damage} de daño.`);
          }
          applyHitVisuals(enemySprite, pending, 'enemy');
        }
        trackHit(player, pending, parts);
        if (res.appliedStatuses.length) {
          parts.push(`(${statusLabel(target, res.appliedStatuses)} aplicado a ${target.name})`);
        }
        if (res.frenzyTriggered) {
          parts.push(`${target.name} ¡entra en FRENESÍ! (+25% de daño)`);
        }
        if (res.defendBonusConsumed) {
          parts.push(`(${player.name} aprovecha el bonus de DEFENSA: +20% de daño)`);
        }
        generateText(parts.join(' '));
        updateEnemyBar(target);
        renderStatuses(target, enemyStatusEl);
      },
    },
  ]);

  if (target.health <= 0) {
    victory(player, target);
    return;
  }

  await setIdle('player', playerKey);

  const ticks = tickStatuses(player);
  if (ticks.length) {
    renderStatuses(player, playerStatusEl);
    generateText(
      `${player.name} sufre ${ticks.map((t) => `${t.damage} de ${STATUS_LABELS[t.type]}`).join(' y ')}.`
    );
    if (player.health <= 0) {
      defeat(player, enemy);
      return;
    }
  }

  await enemyAttack(enemy, player);
}

async function playerSpecial(player, target) {
  if (!player.specialUnlocked) return;
  const playerKey = player.spriteKey;
  const enemyKey = target.spriteKey;

  player.specialUnlocked = false;
  player.hits = 0;
  setSpecialReady(false);
  setTurnIndicator(`${player.name}: Special!`);

  const pending = buildHit(player, target, { useSpecial: true });
  generateText(`${player.name} usa el especial: ${player.specialName}!`);

  await playScript('player', [
    {
      key: playerKey,
      anim: 'attack',
      moveX: 46,
      hitAt: 0.6,
      onHit: () => {
        const res = commitHit(pending);
        const parts = [];
        if (res.miss) {
          parts.push(`${target.name} esquivó el ataque!`);
        } else {
          if (pending.targetDefended) {
            parts.push(`${target.name} se defendió y recibió ${res.damage} de daño.`);
          } else {
            parts.push(`${player.specialName} impactó por ${res.damage} de daño.`);
          }
          applyHitVisuals(enemySprite, pending, 'enemy');
        }
        if (res.appliedStatuses.length) {
          parts.push(`(${statusLabel(target, res.appliedStatuses)} aplicado a ${target.name})`);
        }
        if (res.frenzyTriggered) {
          parts.push(`${target.name} ¡entra en FRENESÍ! (+25% de daño)`);
        }
        if (res.defendBonusConsumed) {
          parts.push(`(${player.name} aprovecha el bonus de DEFENSA: +20% de daño)`);
        }
        generateText(parts.join(' '));
        updateEnemyBar(target);
        renderStatuses(target, enemyStatusEl);
      },
    },
  ]);

  if (target.health <= 0) {
    victory(player, target);
    return;
  }

  await setIdle('player', playerKey);

  const ticks = tickStatuses(player);
  if (ticks.length) {
    renderStatuses(player, playerStatusEl);
    generateText(
      `${player.name} sufre ${ticks.map((t) => `${t.damage} de ${STATUS_LABELS[t.type]}`).join(' y ')}.`
    );
    if (player.health <= 0) {
      defeat(player, enemy);
      return;
    }
  }

  await enemyAttack(enemy, player);
}

async function enemyAttack(unit, player) {
  const enemyKey = unit.spriteKey;
  const playerKey = player.spriteKey;
  const wasDefending = player.defending;

  await setIdle('enemy', enemyKey);
  setTurnIndicator(`${unit.name}: Enemy Turn`);

  const pending = buildHit(unit, player, { useSpecial: false });

  await playScript('enemy', [
    {
      key: enemyKey,
      anim: 'attack',
      moveX: 12,
      hitAt: 0.6,
      onHit: () => {
        const res = commitHit(pending);
        const parts = [];
        if (res.miss) {
          parts.push(`${player.name} esquivó el ataque de ${unit.name}.`);
        } else {
          if (res.isCrit) {
            parts.push(`¡CRÍTICO! ${unit.name} golpeó a ${player.name} por ${res.damage} de daño.`);
          } else if (wasDefending) {
            parts.push(`${unit.name} golpeó a ${player.name}, pero bloqueó parte del daño (${res.damage} de daño).`);
          } else {
            parts.push(`${unit.name} golpeó a ${player.name} por ${res.damage} de daño.`);
          }
          applyHitVisuals(sprite, pending, 'player');
        }
        if (res.appliedStatuses.length) {
          parts.push(`(${statusLabel(player, res.appliedStatuses)} aplicado a ${player.name})`);
        }
        generateText(parts.join(' '));
        updatePlayerBar(player);
        renderStatuses(player, playerStatusEl);
      },
    },
  ]);

  if (player.health <= 0) {
    defeat(player, unit);
    return;
  }

  const ticks = tickStatuses(unit);
  if (ticks.length) {
    renderStatuses(unit, enemyStatusEl);
    generateText(
      `${unit.name} sufre ${ticks.map((t) => `${t.damage} de ${STATUS_LABELS[t.type]}`).join(' y ')}.`
    );
    if (unit.health <= 0) {
      victory(player, unit);
      return;
    }
  }

  await setIdle('enemy', enemyKey);
  await setIdle('player', playerKey);
}

async function characterDefense(player, target) {
  const playerKey = player.spriteKey;
  const enemyKey = target.spriteKey;

  player.defending = true;
  player.defendBonus = true;
  setTurnIndicator(`${player.name}: Defending`);
  generateText(`${player.name} se está defendiendo: −50% de daño y próximo ataque +20%.`);

  const pending = buildHit(target, player, { useSpecial: false });
  const wasDefending = player.defending;

  await playScript('enemy', [
    {
      key: enemyKey,
      anim: 'attack',
      moveX: 12,
      hitAt: 0.6,
      onHit: () => {
        const res = commitHit(pending);
        const parts = [];
        if (res.miss) {
          parts.push(`${player.name} esquivó el ataque de ${target.name}.`);
        } else if (wasDefending) {
          parts.push(`${player.name} bloqueó el golpe de ${target.name} (${res.damage} de daño, reducido).`);
        } else {
          parts.push(`${target.name} golpeó a ${player.name} por ${res.damage} de daño.`);
        }
        applyHitVisuals(sprite, pending, 'player');
        if (res.appliedStatuses.length) {
          parts.push(`(${statusLabel(player, res.appliedStatuses)} aplicado a ${player.name})`);
        }
        generateText(parts.join(' '));
        updatePlayerBar(player);
        renderStatuses(player, playerStatusEl);
      },
    },
  ]);

  if (player.health <= 0) {
    defeat(player, target);
    return;
  }

  const playerTicks = tickStatuses(player);
  if (playerTicks.length) {
    renderStatuses(player, playerStatusEl);
    updatePlayerBar(player);
    generateText(
      `${player.name} sufre ${playerTicks.map((t) => `${t.damage} de ${STATUS_LABELS[t.type]}`).join(' y ')}.`
    );
    if (player.health <= 0) {
      defeat(player, target);
      return;
    }
  }

  const ticks = tickStatuses(target);
  if (ticks.length) {
    renderStatuses(target, enemyStatusEl);
    generateText(
      `${target.name} sufre ${ticks.map((t) => `${t.damage} de ${STATUS_LABELS[t.type]}`).join(' y ')}.`
    );
    if (target.health <= 0) {
      victory(player, target);
      return;
    }
  }

  await setIdle('enemy', enemyKey);
  await setIdle('player', playerKey);
}

document.querySelector('#attack').addEventListener('click', function () {
  runTurn(() => heroTurn(hero, enemy));
});
document.querySelector('#defend').addEventListener('click', function () {
  runTurn(() => characterDefense(hero, enemy));
});
document.querySelector('#special').addEventListener('click', function () {
  runTurn(() => playerSpecial(hero, enemy));
});
document.querySelector('#reset').addEventListener('click', function () {
  resetGame();
});

document.querySelector('#warrior-btn').addEventListener('click', function () {
  selectHero('warrior');
});
document.querySelector('#hunter-btn').addEventListener('click', function () {
  selectHero('hunter');
});
document.querySelector('#mage-btn').addEventListener('click', function () {
  selectHero('mage');
});

document.querySelector('.actions').style.display = 'none';
document.querySelector('.log').style.display = 'none';
document.querySelector('.characters').style.display = 'none';
document.querySelector('.enemies').style.display = 'none';
document.querySelector('#floor-banner').style.display = 'none';

document.querySelector('#victory-restart').addEventListener('click', resetGame);
document.querySelector('#gameover-restart').addEventListener('click', resetGame);