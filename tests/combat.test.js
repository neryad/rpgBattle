import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEROES,
  ENEMIES,
  MAX_EVASION,
  CRIT_MULTIPLIER,
  ENEMY_DEFEND_CHANCE,
  createCombatant,
  computeEvasion,
  buildHit,
  commitHit,
  applyStatus,
  tickStatuses,
  hasFrenzy,
} from '../combat.js';

function seq(...values) {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

test('createCombatant reinicia salud a maxHealth y estados', () => {
  const hero = createCombatant(HEROES.warrior);
  assert.equal(hero.health, hero.maxHealth);
  assert.deepEqual(hero.statusEffects, []);
  assert.equal(hero.defending, false);
  assert.equal(hero.defendBonus, false);
});

test('computeEvasion = evasion base + speed * 0.5, con tope MAX_EVASION', () => {
  assert.equal(computeEvasion(createCombatant(ENEMIES.flyingEye)), 30);
  assert.equal(computeEvasion(createCombatant(HEROES.hunter)), 24.5);
  const unit = createCombatant({ evasion: 30, speed: 20 });
  assert.equal(computeEvasion(unit), MAX_EVASION);
});

test('la evasión hace fallar el ataque sin daño', () => {
  const hero = createCombatant(HEROES.warrior);
  const goblin = createCombatant(ENEMIES.goblin);
  const pending = buildHit(hero, goblin, {}, seq(0.5, 0.0, 0.9, 0.5));
  assert.equal(pending.miss, true);
  const res = commitHit(pending);
  assert.equal(res.damage, 0);
  assert.equal(goblin.health, goblin.maxHealth);
});

test('crítico aplica CRIT_MULTIPLIER sobre el daño base', () => {
  const hero = createCombatant(HEROES.warrior);
  const goblin = createCombatant(ENEMIES.goblin);
  const normal = buildHit(hero, goblin, {}, seq(0.5, 0.5, 0.9, 0.5));
  const crit = buildHit(hero, goblin, {}, seq(0.5, 0.5, 0.0, 0.5));
  assert.equal(normal.isCrit, false);
  assert.equal(crit.isCrit, true);
  assert.equal(crit.damage, Math.floor(normal.rawDamage * CRIT_MULTIPLIER));
});

test('el daño físico usa la fórmula estable y nunca baja de 1', () => {
  const hero = createCombatant(HEROES.warrior);
  const mushroom = createCombatant(ENEMIES.mushroom);
  const pending = buildHit(hero, mushroom, {}, seq(0.5, 0.5, 0.9, 0.5));
  assert.equal(pending.damage, Math.floor(16 * 1.5 - 14 * 0.6));
  const weak = createCombatant({ ...HEROES.mage, strength: 1 });
  const tanky = createCombatant({ ...ENEMIES.mushroom, defense: 90 });
  const dmg = buildHit(weak, tanky, {}, seq(0.5, 0.5, 0.9, 0.5));
  assert.ok(dmg.damage >= 1);
});

test('la magia del Mage usa intelligence e ignora la defensa física', () => {
  const mage = createCombatant(HEROES.mage);
  const mushroom = createCombatant(ENEMIES.mushroom);
  const pending = buildHit(mage, mushroom, {}, seq(0.5, 0.5, 0.9, 0.5));
  assert.equal(pending.damage, Math.floor(20 * 1.4));
  assert.equal(pending.damageType, 'magic');
});

test('Defend reduce el daño recibido un 50% y se consume', () => {
  const hero = createCombatant(HEROES.warrior);
  hero.defending = true;
  const goblin = createCombatant(ENEMIES.goblin);
  const pending = buildHit(goblin, hero, {}, seq(0.5, 0.5, 0.5));
  const base = Math.floor(15 * 1.5 - hero.defense * 0.6);
  assert.equal(pending.damage, Math.floor(base * 0.5));
  commitHit(pending);
  assert.equal(hero.defending, false);
});

test('el bonus de +20% tras Defend se aplica y se consume en el siguiente ataque', () => {
  const hero = createCombatant(HEROES.warrior);
  hero.defendBonus = true;
  const goblin = createCombatant(ENEMIES.goblin);
  const pending = buildHit(hero, goblin, {}, seq(0.5, 0.5, 0.9, 0.5));
  const base = Math.floor(16 * 1.5 - 11 * 0.6);
  assert.equal(pending.damage, Math.floor(base * 1.2));
  assert.equal(pending.defendBonusConsumed, true);
  commitHit(pending);
  assert.equal(hero.defendBonus, false);
});

test('la defensa aleatoria del enemigo reduce el daño a la mitad', () => {
  const hero = createCombatant(HEROES.warrior);
  const goblin = createCombatant(ENEMIES.goblin);
  const pending = buildHit(hero, goblin, {}, seq(0.0, 0.5, 0.9, 0.5));
  assert.equal(pending.targetDefended, true);
  const base = Math.floor(16 * 1.5 - 11 * 0.6);
  assert.equal(pending.damage, Math.floor(base * 0.5));
});

test('Fireball puede aplicar Burn con duración 3 y 5 de daño por turno', () => {
  const mage = createCombatant(HEROES.mage);
  const worn = createCombatant(ENEMIES.worn);
  const pending = buildHit(mage, worn, { useSpecial: true }, seq(0.5, 0.5, 0.9, 0.5, 0.0));
  assert.equal(pending.statuses.length, 1);
  assert.equal(pending.statuses[0].type, 'burn');
  commitHit(pending);
  assert.equal(worn.statusEffects.some((s) => s.type === 'burn'), true);
});

test('Arrow of Blood aplica Bleed y suma crítico', () => {
  const hunter = createCombatant(HEROES.hunter);
  const goblin = createCombatant(ENEMIES.goblin);
  const pending = buildHit(hunter, goblin, { useSpecial: true }, seq(0.5, 0.5, 0.0, 0.5));
  assert.equal(pending.isCrit, true);
  assert.equal(pending.statuses[0].type, 'bleed');
});

test('tickStatuses aplica daño, reduce duración y elimina al llegar a 0', () => {
  const worn = createCombatant(ENEMIES.worn);
  worn.statusEffects.push({ type: 'burn', duration: 3, damage: 5 });
  worn.health = 75;
  for (let i = 1; i <= 3; i++) {
    const ticks = tickStatuses(worn);
    assert.equal(ticks.length, 1);
    assert.equal(ticks[0].damage, 5);
  }
  assert.deepEqual(worn.statusEffects, []);
  assert.equal(worn.health, 75 - 15);
});

test('aplicar dos veces el mismo estado refresca duración sin duplicar', () => {
  const goblin = createCombatant(ENEMIES.goblin);
  applyStatus(goblin, { type: 'poison', duration: 3, damage: 4 });
  applyStatus(goblin, { type: 'poison', duration: 3, damage: 4 });
  assert.equal(goblin.statusEffects.filter((s) => s.type === 'poison').length, 1);
  assert.equal(goblin.statusEffects[0].duration, 3);
});

test('el daño de estados ignora la defensa (idéntico sobre tanques y no tanques)', () => {
  const burn = { type: 'burn', duration: 3, damage: 5 };
  const mushroom = createCombatant(ENEMIES.mushroom);
  const goblin = createCombatant(ENEMIES.goblin);
  applyStatus(mushroom, burn);
  applyStatus(goblin, burn);
  const beforeM = mushroom.health;
  const beforeG = goblin.health;
  tickStatuses(mushroom);
  tickStatuses(goblin);
  assert.equal(beforeM - mushroom.health, 5);
  assert.equal(beforeG - goblin.health, 5);
});

test('Worn entra en Frenesí bajo 30% HP y su daño sube un 25%', () => {
  const hero = createCombatant(HEROES.warrior);
  const worn = createCombatant(ENEMIES.worn);
  worn.health = 20;
  const pending = buildHit(hero, worn, {}, seq(0.5, 0.5, 0.9, 0.5));
  const res = commitHit(pending);
  assert.equal(res.frenzyTriggered, true);
  assert.equal(hasFrenzy(worn), true);

  const hero2 = createCombatant(HEROES.warrior);
  const p2 = buildHit(worn, hero2, {}, seq(0.5, 0.9, 0.5));
  assert.equal(p2.damage, Math.floor(Math.floor(19 * 1.5 - 16 * 0.6) * 1.25));
  commitHit(p2);
  assert.equal(hero2.health, hero2.maxHealth - p2.damage);
});

test('el enemigo no entra en Frenesí si no cruza el umbral', () => {
  const hero = createCombatant(HEROES.warrior);
  const worn = createCombatant(ENEMIES.worn);
  worn.health = 42;
  const pending = buildHit(hero, worn, {}, seq(0.5, 0.5, 0.9, 0.5));
  const res = commitHit(pending);
  assert.equal(res.frenzyTriggered, false);
  assert.equal(hasFrenzy(worn), false);
});

test('los enemigos con rol definido usan sus stats reales (skeleton crit, mushroom poison, rat speed, mimic)', () => {
  assert.equal(ENEMIES.skeleton.criticalChance, 15);
  assert.equal(ENEMIES.mushroom.maxHealth, 120);
  assert.equal(ENEMIES.mushroom.defense, 14);
  assert.equal(ENEMIES.worn.maxHealth, 75);
  assert.equal(ENEMIES.flyingEye.evasion, 20);
  assert.equal(ENEMIES.rat.speed, 18);
  assert.equal(ENEMIES.mimic.maxHealth, 95);
});

test('mushroom puede aplicar Poison en su ataque', () => {
  const mushroom = createCombatant(ENEMIES.mushroom);
  const hero = createCombatant(HEROES.warrior);
  const pending = buildHit(mushroom, hero, {}, seq(0.5, 0.5, 0.9, 0.0));
  assert.equal(pending.statuses.some((s) => s.type === 'poison'), true);
  commitHit(pending);
  assert.equal(hero.statusEffects.some((s) => s.type === 'poison'), true);
});

test('mimic puede aplicar Bleed o Poison en su ataque', () => {
  const mimic = createCombatant(ENEMIES.mimic);
  const hero = createCombatant(HEROES.warrior);
  const pending = buildHit(mimic, hero, {}, seq(0.5, 0.5, 0.9, 0.0, 0.0));
  assert.equal(pending.statuses.length, 1);
  assert.equal(pending.statuses[0].type, 'bleed');
});