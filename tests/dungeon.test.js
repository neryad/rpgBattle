import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES, BOSSES, createCombatant } from '../combat.js';
import {
  createRun,
  getFloorEnemy,
  nextFloor,
  generateRewards,
  applyReward,
  isBossFloor,
  FLOOR_SCALING,
  FLOOR_ROSTER,
} from '../dungeon.js';

function seq(...values) {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

test('createRun inicializa run con piso 1, kills 0 y héroe correcto', () => {
  const run = createRun('warrior');
  assert.equal(run.floor, 1);
  assert.equal(run.kills, 0);
  assert.deepEqual(run.rewards, []);
  assert.equal(run.hero.name, 'Warrior');
  assert.equal(run.hero.health, run.hero.maxHealth);
});

test('createRun usa warrior por defecto si la clase no existe', () => {
  const run = createRun('invalid');
  assert.equal(run.hero.name, 'Warrior');
});

test('getFloorEnemy en piso 1 aplica multiplicador ×1.0', () => {
  const run = createRun('warrior');
  const enemy = getFloorEnemy(run, seq(0));
  const baseEnemy = ENEMIES[FLOOR_ROSTER[1][0]];
  assert.equal(enemy.maxHealth, baseEnemy.maxHealth);
  assert.equal(enemy.strength, baseEnemy.strength);
  assert.equal(enemy.defense, baseEnemy.defense);
});

test('getFloorEnemy en piso 2 aplica multiplicador ×1.15', () => {
  const run = createRun('warrior');
  run.floor = 2;
  const enemy = getFloorEnemy(run, seq(0));
  const baseKey = FLOOR_ROSTER[2][0];
  const baseEnemy = ENEMIES[baseKey];
  assert.equal(enemy.maxHealth, Math.round(baseEnemy.maxHealth * 1.15));
  assert.equal(enemy.strength, Math.round(baseEnemy.strength * 1.15));
  assert.equal(enemy.defense, Math.round(baseEnemy.defense * 1.15));
});

test('getFloorEnemy en piso 3 aplica multiplicador ×1.30', () => {
  const run = createRun('warrior');
  run.floor = 3;
  const enemy = getFloorEnemy(run, seq(0));
  const baseKey = FLOOR_ROSTER[3][0];
  const baseEnemy = ENEMIES[baseKey];
  assert.equal(enemy.maxHealth, Math.round(baseEnemy.maxHealth * 1.3));
  assert.equal(enemy.strength, Math.round(baseEnemy.strength * 1.3));
  assert.equal(enemy.defense, Math.round(baseEnemy.defense * 1.3));
});

test('getFloorEnemy en piso 4 aplica multiplicador ×1.50', () => {
  const run = createRun('warrior');
  run.floor = 4;
  const enemy = getFloorEnemy(run, seq(0));
  const baseKey = FLOOR_ROSTER[4][0];
  const baseEnemy = ENEMIES[baseKey];
  assert.equal(enemy.maxHealth, Math.round(baseEnemy.maxHealth * 1.5));
  assert.equal(enemy.strength, Math.round(baseEnemy.strength * 1.5));
  assert.equal(enemy.defense, Math.round(baseEnemy.defense * 1.5));
});

test('escalado no afecta SPD ni evasión', () => {
  const run = createRun('warrior');
  run.floor = 3;
  const enemy = getFloorEnemy(run, seq(0));
  const baseKey = FLOOR_ROSTER[3][0];
  const baseEnemy = ENEMIES[baseKey];
  assert.equal(enemy.speed, baseEnemy.speed);
  assert.equal(enemy.evasion, baseEnemy.evasion);
});

test('getFloorEnemy en piso 5 devuelve boss sin escalado', () => {
  const run = createRun('warrior');
  run.floor = 5;
  const enemy = getFloorEnemy(run);
  const bossDef = Object.values(BOSSES)[0];
  assert.equal(enemy.name, bossDef.name);
  assert.equal(enemy.maxHealth, bossDef.maxHealth);
  assert.equal(enemy.strength, bossDef.strength);
  assert.equal(enemy.defense, bossDef.defense);
});

test('enemigos válidos por piso (roster)', () => {
  const rosterKeys = {
    1: ['rat', 'worn', 'goblin'],
    2: ['goblin', 'mushroom', 'flyingEye'],
    3: ['flyingEye', 'rat', 'skeleton'],
    4: ['skeleton', 'mimic', 'mushroom'],
  };
  for (const [floor, keys] of Object.entries(rosterKeys)) {
    for (const key of keys) {
      assert.ok(ENEMIES[key], `Enemigo ${key} debe existir en ENEMIES (piso ${floor})`);
    }
  }
  assert.ok(BOSSES.boss, 'Boss debe existir en BOSSES');
});

test('generateRewards devuelve exactamente 3 opciones, una de cada tipo', () => {
  const run = createRun('warrior');
  const rewards = generateRewards(run);
  assert.equal(rewards.length, 3);
  const types = rewards.map((r) => r.type).sort();
  assert.deepEqual(types, ['heal', 'special', 'stat']);
  for (const r of rewards) {
    assert.ok(r.label, 'recompensa debe tener label');
    assert.ok(r.desc, 'recompensa debe tener desc');
  }
});

test('applyReward heal cura 40% de HP máximo', () => {
  const run = createRun('warrior');
  run.hero.health = 50;
  const healReward = { type: 'heal', label: 'Poción', desc: 'Cura 40% HP', stat: null };
  applyReward(run, healReward);
  assert.equal(run.hero.health, 50 + Math.round(run.hero.maxHealth * 0.4));
  assert.equal(run.rewards.length, 1);
});

test('applyReward heal no supera maxHealth', () => {
  const run = createRun('warrior');
  run.hero.health = run.hero.maxHealth - 10;
  const healReward = { type: 'heal', label: 'Poción', desc: 'Cura 40% HP', stat: null };
  applyReward(run, healReward);
  assert.equal(run.hero.health, run.hero.maxHealth);
});

test('applyReward stat incrementa el stat indicado', () => {
  const run = createRun('warrior');
  const before = run.hero.strength;
  const statReward = { type: 'stat', label: 'Entrenamiento', desc: '+2 STR', stat: 'strength', amount: 2 };
  applyReward(run, statReward);
  assert.equal(run.hero.strength, before + 2);
});

test('applyReward special activa specialUnlocked y resetea hits', () => {
  const run = createRun('warrior');
  run.hero.hits = 3;
  const specialReward = { type: 'special', label: 'Enfoque', desc: 'Special listo', stat: null };
  applyReward(run, specialReward);
  assert.equal(run.hero.specialUnlocked, true);
  assert.equal(run.hero.hits, 0);
});

test('nextFloor incrementa el piso', () => {
  const run = createRun('warrior');
  assert.equal(run.floor, 1);
  nextFloor(run);
  assert.equal(run.floor, 2);
  nextFloor(run);
  assert.equal(run.floor, 3);
});

test('isBossFloor es true en piso 5 y false en otros', () => {
  const run = createRun('warrior');
  assert.equal(isBossFloor(run), false);
  run.floor = 5;
  assert.equal(isBossFloor(run), true);
  run.floor = 4;
  assert.equal(isBossFloor(run), false);
});
