import { HEROES, ENEMIES, BOSSES, RELICS, createCombatant } from './combat.js';

const FLOOR_SCALING = {
  1: 1.0,
  2: 1.15,
  3: 1.3,
  4: 1.5,
  5: 1.0,
};

const FLOOR_ROSTER = {
  1: ['rat', 'worn', 'goblin'],
  2: ['goblin', 'mushroom', 'flyingEye'],
  3: ['flyingEye', 'rat', 'skeleton'],
  4: ['skeleton', 'mimic', 'mushroom'],
  5: ['boss'],
};

const STAT_LABELS = {
  strength: 'FUERZA',
  defense: 'DEFENSA',
  speed: 'VELOCIDAD',
  intelligence: 'INTELIGENCIA',
};

export function createRun(heroClass) {
  const heroDef = HEROES[heroClass] || HEROES.warrior;
  return {
    floor: 1,
    kills: 0,
    rewards: [],
    hero: createCombatant(heroDef),
  };
}

export function getFloorEnemy(run, rng = Math.random) {
  const floor = run.floor;
  const roster = FLOOR_ROSTER[floor];
  const key = roster[Math.floor(rng() * roster.length)];

  if (key === 'boss') {
    const bossDef = Object.values(BOSSES)[0];
    return createCombatant(bossDef);
  }

  const def = ENEMIES[key];
  const mult = FLOOR_SCALING[floor] || 1.0;

  return createCombatant({
    ...def,
    maxHealth: Math.round(def.maxHealth * mult),
    strength: Math.round(def.strength * mult),
    defense: Math.round(def.defense * mult),
  });
}

export function nextFloor(run) {
  run.floor += 1;
  return run;
}

export function generateRewards(run, rng = Math.random) {
  const hero = run && run.hero ? run.hero : null;
  const heroClass = hero ? hero.characterClass : null;
  let statPool = ['strength', 'defense', 'speed'];
  if (heroClass === 'mage') {
    statPool = ['intelligence', 'defense', 'speed'];
  } else if (!heroClass) {
    statPool = ['strength', 'defense', 'speed', 'intelligence'];
  }
  const stat = statPool[Math.floor(rng() * statPool.length)];
  const statName = STAT_LABELS[stat] || stat.toUpperCase();

  const currentRelics = hero && hero.relics ? hero.relics : [];
  const availableRelicKeys = Object.keys(RELICS).filter((k) => !currentRelics.includes(k));

  let thirdReward;
  if (availableRelicKeys.length > 0 && rng() < 0.75) {
    const chosenKey = availableRelicKeys[Math.floor(rng() * availableRelicKeys.length)];
    const relic = RELICS[chosenKey];
    thirdReward = {
      type: 'relic',
      relicKey: chosenKey,
      label: relic.name,
      desc: relic.desc,
      icon: relic.icon,
      stat: null,
    };
  } else {
    thirdReward = { type: 'special', label: 'Enfoque', desc: 'Especial listo de inmediato', stat: null };
  }

  return [
    { type: 'heal', label: 'Poción', desc: 'Cura 40% de HP máximo', stat: null },
    { type: 'stat', label: 'Entrenamiento', desc: `+2 a ${statName}`, stat, amount: 2 },
    thirdReward,
  ];
}

export function applyReward(run, reward) {
  run.rewards.push(reward);
  const hero = run.hero;

  switch (reward.type) {
    case 'heal': {
      const heal = Math.round(hero.maxHealth * 0.4);
      hero.health = Math.min(hero.maxHealth, hero.health + heal);
      break;
    }
    case 'stat': {
      const key = reward.stat;
      hero[key] = (hero[key] || 0) + (reward.amount || 2);
      break;
    }
    case 'special': {
      hero.specialUnlocked = true;
      hero.hits = 0;
      break;
    }
    case 'relic': {
      if (!hero.relics) hero.relics = [];
      if (!hero.relics.includes(reward.relicKey)) {
        hero.relics.push(reward.relicKey);
      }
      break;
    }
  }

  return run;
}

export function isBossFloor(run) {
  return run.floor === 5;
}

export { FLOOR_SCALING, FLOOR_ROSTER };
