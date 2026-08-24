export const MAX_EVASION = 35;
export const CRIT_MULTIPLIER = 2.0;
export const SPECIAL_HITS = 5;
export const DEFEND_REDUCTION = 0.5;
export const DEFEND_BONUS = 1.2;
export const ENEMY_DEFEND_CHANCE = 0.15;
export const FRENZY_THRESHOLD = 0.3;
export const FRENZY_DAMAGE_MULT = 1.25;

function variance(rng) {
  return rng() * 6 - 3;
}

function physicalDamage(attacker, target, rng, strMult, defFactor) {
  return Math.max(
    1,
    Math.floor(
      (attacker.strength || 0) * strMult - (target.defense || 0) * defFactor + variance(rng)
    )
  );
}

function magicDamage(attacker, rng, intMult) {
  return Math.max(1, Math.floor((attacker.intelligence || 0) * intMult + variance(rng)));
}

const BASIC_MAGIC_MULT = 1.4;

const basicStrike = {
  magic: false,
  compute(attacker, target, rng) {
    return {
      damage: physicalDamage(attacker, target, rng, 1.5, 0.6),
      damageType: 'physical',
      statuses: [],
    };
  },
};

const swordSlash = {
  magic: false,
  compute(attacker, target, rng) {
    const effectiveDefense = (target.defense || 0) * 0.6;
    return {
      damage: Math.max(
        1,
        Math.floor((attacker.strength || 0) * 2.2 - effectiveDefense * 0.6 + variance(rng))
      ),
      damageType: 'physical',
      statuses: [],
    };
  },
};

const mageBolt = {
  magic: true,
  compute(attacker, target, rng) {
    return { damage: magicDamage(attacker, rng, BASIC_MAGIC_MULT), damageType: 'magic', statuses: [] };
  },
};

const fireballMeteor = {
  magic: true,
  compute(attacker, target, rng) {
    const res = { damage: magicDamage(attacker, rng, 2.5), damageType: 'magic', statuses: [] };
    if (rng() < 0.25) {
      res.statuses.push({ type: 'burn', duration: 3, damage: 5 });
    }
    return res;
  },
};

const arrowOfBlood = {
  magic: false,
  extraCrit: 20,
  compute(attacker, target, rng) {
    return {
      damage: physicalDamage(attacker, target, rng, 1.8, 0.6),
      damageType: 'physical',
      statuses: [{ type: 'bleed', duration: 3, damage: 4 }],
    };
  },
};

const poisonSpores = {
  magic: false,
  compute(attacker, target, rng) {
    const res = {
      damage: physicalDamage(attacker, target, rng, 1.5, 0.6),
      damageType: 'physical',
      statuses: [],
    };
    if (rng() < 0.2) {
      res.statuses.push({ type: 'poison', duration: 3, damage: 4 });
    }
    return res;
  },
};

const warriorWarcry = {
  magic: false,
  compute(attacker, target, rng) {
    return {
      damage: physicalDamage(attacker, target, rng, 1.2, 0.5),
      damageType: 'physical',
      statuses: [],
      grantDefenseBuff: 2,
    };
  },
};

const arcaneBarrierSkill = {
  magic: true,
  compute(attacker, target, rng) {
    return {
      damage: magicDamage(attacker, rng, 1.2),
      damageType: 'magic',
      statuses: [],
      grantBarrier: Math.max(12, Math.round((attacker.intelligence || 20) * 0.8)),
    };
  },
};

const poisonTrapSkill = {
  magic: false,
  compute(attacker, target, rng) {
    return {
      damage: physicalDamage(attacker, target, rng, 1.3, 0.5),
      damageType: 'physical',
      statuses: [{ type: 'poison', duration: 3, damage: 4 }],
    };
  },
};

export const RELICS = {
  vampire_fang: {
    key: 'vampire_fang',
    name: 'Colmillo Vampírico',
    icon: '🧛',
    desc: 'Cura un 15% del daño infligido.',
  },
  shadow_cloak: {
    key: 'shadow_cloak',
    name: 'Capa de Sombras',
    icon: '🥋',
    desc: '+10% a la Evasión permanente.',
  },
  whetstone: {
    key: 'whetstone',
    name: 'Piedra de Afilar',
    icon: '⚔️',
    desc: '+10% a la Probabilidad de Crítico.',
  },
  thorn_shield: {
    key: 'thorn_shield',
    name: 'Escudo de Espinas',
    icon: '🛡️',
    desc: 'Devuelve 6 de daño al enemigo cuando te defiendes.',
  },
  fury_ring: {
    key: 'fury_ring',
    name: 'Anillo de Furia',
    icon: '💍',
    desc: '+25% de daño con vida menor al 35%.',
  },
};

const ratBite = {
  magic: false,
  compute(attacker, target, rng) {
    return {
      damage: physicalDamage(attacker, target, rng, 1.4, 0.5),
      damageType: 'physical',
      statuses: [],
    };
  },
};

const mimicChomp = {
  magic: false,
  compute(attacker, target, rng) {
    const res = {
      damage: physicalDamage(attacker, target, rng, 1.6, 0.6),
      damageType: 'physical',
      statuses: [],
    };
    if (rng() < 0.25) {
      if (rng() < 0.5) {
        res.statuses.push({ type: 'bleed', duration: 3, damage: 4 });
      } else {
        res.statuses.push({ type: 'poison', duration: 3, damage: 4 });
      }
    }
    return res;
  },
};

const bossStrike = {
  magic: true,
  compute(attacker, target, rng) {
    const res = {
      damage: magicDamage(attacker, rng, 1.5),
      damageType: 'magic',
      statuses: [],
    };
    if (rng() < 0.25) {
      res.statuses.push({ type: 'burn', duration: 3, damage: 5 });
    }
    return res;
  },
};

export const HEROES = {
  warrior: {
    key: 'warrior',
    name: 'Warrior',
    characterClass: 'warrior',
    spriteKey: 'warrior',
    role: 'Tank / Melee',
    specialName: 'Sword Slash',
    secondaryName: 'Grito de Guerra',
    secondaryDesc: 'Golpea y reduce el daño recibido un 30% por 2 turnos (recarga: 3 turnos).',
    maxHealth: 120,
    strength: 16,
    defense: 16,
    speed: 10,
    intelligence: 8,
    criticalChance: 10,
    evasion: 5,
    abilities: { basic: basicStrike, secondary: warriorWarcry, special: swordSlash },
  },
  mage: {
    key: 'mage',
    name: 'Mage',
    characterClass: 'mage',
    spriteKey: 'mage',
    role: 'Magic DPS / Debuff',
    specialName: 'Fireball Meteor',
    secondaryName: 'Barrera Arcana',
    secondaryDesc: 'Golpea y genera un escudo mágico que absorbe daño (recarga: 3 turnos).',
    maxHealth: 70,
    strength: 8,
    defense: 10,
    speed: 14,
    intelligence: 20,
    criticalChance: 8,
    evasion: 8,
    abilities: { basic: mageBolt, secondary: arcaneBarrierSkill, special: fireballMeteor },
  },
  hunter: {
    key: 'hunter',
    name: 'Hunter',
    characterClass: 'hunter',
    spriteKey: 'hunter',
    role: 'Physical DPS / Crit / Evasion',
    specialName: 'Arrow of Blood',
    secondaryName: 'Trampa Venenosa',
    secondaryDesc: 'Disparo que envenena 100% al objetivo por 3 turnos (recarga: 3 turnos).',
    maxHealth: 90,
    strength: 14,
    defense: 11,
    speed: 19,
    intelligence: 12,
    criticalChance: 20,
    evasion: 15,
    abilities: { basic: basicStrike, secondary: poisonTrapSkill, special: arrowOfBlood },
  },
};

export const ENEMIES = {
  rat: {
    key: 'rat',
    name: 'Rata de Mazmorra',
    characterClass: 'enemy',
    spriteKey: 'rat',
    role: 'Rápida / Ágil',
    maxHealth: 65,
    strength: 14,
    defense: 6,
    speed: 18,
    intelligence: 4,
    criticalChance: 5,
    evasion: 12,
    abilities: { basic: ratBite },
  },
  worn: {
    key: 'worn',
    name: 'Worn',
    characterClass: 'enemy',
    spriteKey: 'worm',
    role: 'Aggressive DPS',
    maxHealth: 75,
    strength: 19,
    defense: 8,
    speed: 15,
    intelligence: 6,
    criticalChance: 0,
    evasion: 5,
    abilities: { basic: basicStrike },
  },
  flyingEye: {
    key: 'flyingEye',
    name: 'Flying Eye',
    characterClass: 'enemy',
    spriteKey: 'flyingeye',
    role: 'Evasive Enemy',
    maxHealth: 65,
    strength: 16,
    defense: 7,
    speed: 20,
    intelligence: 8,
    criticalChance: 0,
    evasion: 20,
    abilities: { basic: basicStrike },
  },
  goblin: {
    key: 'goblin',
    name: 'Goblin',
    characterClass: 'enemy',
    spriteKey: 'goblin',
    role: 'Basic / Balanced',
    maxHealth: 90,
    strength: 15,
    defense: 11,
    speed: 12,
    intelligence: 6,
    criticalChance: 0,
    evasion: 8,
    abilities: { basic: basicStrike },
  },
  mushroom: {
    key: 'mushroom',
    name: 'Mushroom',
    characterClass: 'enemy',
    spriteKey: 'mushroom',
    role: 'Tank',
    maxHealth: 120,
    strength: 10,
    defense: 14,
    speed: 6,
    intelligence: 8,
    criticalChance: 0,
    evasion: 3,
    abilities: { basic: poisonSpores },
  },
  skeleton: {
    key: 'skeleton',
    name: 'Skeleton',
    characterClass: 'enemy',
    spriteKey: 'skeleton',
    role: 'Glass Cannon',
    maxHealth: 70,
    strength: 23,
    defense: 8,
    speed: 13,
    intelligence: 8,
    criticalChance: 15,
    evasion: 5,
    abilities: { basic: basicStrike },
  },
  mimic: {
    key: 'mimic',
    name: 'Mímico',
    characterClass: 'enemy',
    spriteKey: 'mimic',
    role: 'Tanque / Emboscada',
    maxHealth: 95,
    strength: 17,
    defense: 10,
    speed: 9,
    intelligence: 8,
    criticalChance: 10,
    evasion: 6,
    abilities: { basic: mimicChomp },
  },
};

export const BOSSES = {
  boss: {
    key: 'boss',
    name: 'Hechicero Oscuro',
    characterClass: 'enemy',
    spriteKey: 'boss',
    role: 'Boss / Mago Supremo',
    maxHealth: 210,
    strength: 14,
    defense: 12,
    speed: 12,
    intelligence: 22,
    criticalChance: 10,
    evasion: 8,
    abilities: { basic: bossStrike },
  },
};

export function getEnemyKey(name) {
  for (const def of Object.values(ENEMIES)) {
    if (def.name === name) return def.key;
  }
  return null;
}

export function computeEvasion(unit) {
  let eva = (unit.evasion || 0) + (unit.speed || 0) * 0.5;
  if (unit.relics && unit.relics.includes('shadow_cloak')) {
    eva += 10;
  }
  return Math.min(MAX_EVASION, eva);
}

export function createCombatant(def) {
  return {
    ...def,
    health: def.maxHealth,
    hits: 0,
    specialUnlocked: false,
    defending: false,
    defendBonus: false,
    statusEffects: [],
    secondaryCooldown: 0,
    relics: def.relics ? [...def.relics] : [],
    barrier: 0,
    defenseBuffTurns: 0,
  };
}

function getAbility(unit, actionType) {
  const abilities = unit.abilities || {};
  if (actionType === 'special' && abilities.special) return abilities.special;
  if (actionType === 'secondary' && abilities.secondary) return abilities.secondary;
  return abilities.basic;
}

export function hasFrenzy(unit) {
  return !!(unit.statusEffects && unit.statusEffects.some((s) => s.type === 'frenzy'));
}

export function buildHit(attacker, target, opts = {}, rng = Math.random) {
  const actionType = opts.actionType || (opts.useSpecial ? 'special' : opts.useSecondary ? 'secondary' : 'basic');
  const pending = {
    attacker,
    target,
    actionType,
    useSpecial: actionType === 'special',
    useSecondary: actionType === 'secondary',
    miss: false,
    evaded: false,
    isCrit: false,
    damage: 0,
    rawDamage: 0,
    damageType: 'physical',
    statuses: [],
    targetDefended: false,
    defendBonusConsumed: false,
    grantBarrier: 0,
    grantDefenseBuff: 0,
  };

  if (target.characterClass === 'enemy' && rng() < ENEMY_DEFEND_CHANCE) {
    pending.targetDefended = true;
  }

  if (rng() * 100 < computeEvasion(target)) {
    pending.miss = true;
    pending.evaded = true;
    return pending;
  }

  const ability = getAbility(attacker, actionType);
  let critChance = (attacker.criticalChance || 0) + (ability.extraCrit || 0);
  if (attacker.relics && attacker.relics.includes('whetstone')) {
    critChance += 10;
  }
  pending.isCrit = rng() * 100 < critChance;

  const result = ability.compute(attacker, target, rng);
  pending.rawDamage = result.damage;
  pending.damageType = result.damageType || 'physical';
  pending.statuses = result.statuses || [];
  if (result.grantBarrier) pending.grantBarrier = result.grantBarrier;
  if (result.grantDefenseBuff) pending.grantDefenseBuff = result.grantDefenseBuff;

  let dmg = result.damage;
  if (pending.targetDefended) dmg *= 1 - DEFEND_REDUCTION;
  if (target.defending) dmg *= 1 - DEFEND_REDUCTION;
  if (target.defenseBuffTurns > 0) dmg *= 0.70;
  if (attacker.defendBonus) {
    dmg *= DEFEND_BONUS;
    pending.defendBonusConsumed = true;
  }
  if (attacker.relics && attacker.relics.includes('fury_ring') && attacker.health < attacker.maxHealth * 0.35) {
    dmg *= 1.25;
  }
  if (hasFrenzy(attacker)) dmg *= FRENZY_DAMAGE_MULT;
  if (pending.isCrit) dmg *= CRIT_MULTIPLIER;

  pending.damage = Math.max(1, Math.floor(dmg));
  return pending;
}

export function applyStatus(unit, status) {
  const existing = unit.statusEffects.find((s) => s.type === status.type);
  if (existing) {
    existing.duration = Math.max(existing.duration, status.duration);
    return false;
  }
  unit.statusEffects.push({ type: status.type, duration: status.duration, damage: status.damage || 0 });
  return true;
}

function maybeTriggerFrenzy(target) {
  if (target.characterClass !== 'enemy') return false;
  if (hasFrenzy(target)) return false;
  if (target.health > 0 && target.health < target.maxHealth * FRENZY_THRESHOLD) {
    target.statusEffects.push({ type: 'frenzy', duration: -1, damage: 0 });
    return true;
  }
  return false;
}

export function commitHit(pending) {
  const { attacker, target } = pending;
  const res = {
    miss: pending.miss,
    evaded: pending.evaded,
    isCrit: pending.isCrit,
    damage: pending.miss ? 0 : pending.damage,
    rawDamage: pending.rawDamage,
    damageType: pending.damageType,
    targetDefended: pending.targetDefended,
    defendBonusConsumed: pending.defendBonusConsumed,
    appliedStatuses: [],
    frenzyTriggered: false,
    killed: false,
    absorbed: 0,
    vampireHeal: 0,
    thornReflected: 0,
    gainedBarrier: pending.grantBarrier || 0,
    gainedDefenseBuff: !!pending.grantDefenseBuff,
  };

  if (target.defending) target.defending = false;
  if (pending.defendBonusConsumed) attacker.defendBonus = false;

  if (pending.grantBarrier) {
    attacker.barrier = (attacker.barrier || 0) + pending.grantBarrier;
  }
  if (pending.grantDefenseBuff) {
    attacker.defenseBuffTurns = pending.grantDefenseBuff;
  }

  if (pending.miss) return res;

  let finalDmg = pending.damage;
  if (target.barrier > 0 && finalDmg > 0) {
    const absorb = Math.min(target.barrier, finalDmg);
    target.barrier -= absorb;
    finalDmg -= absorb;
    res.absorbed = absorb;
  }

  target.health = Math.max(0, (target.health || 0) - finalDmg);
  res.damage = finalDmg;

  if (attacker.relics && attacker.relics.includes('vampire_fang') && finalDmg > 0) {
    const healAmount = Math.max(1, Math.round(finalDmg * 0.15));
    attacker.health = Math.min(attacker.maxHealth, attacker.health + healAmount);
    res.vampireHeal = healAmount;
  }

  if (target.defending && target.relics && target.relics.includes('thorn_shield')) {
    attacker.health = Math.max(0, attacker.health - 6);
    res.thornReflected = 6;
  }

  for (const st of pending.statuses) {
    applyStatus(target, st);
    res.appliedStatuses.push({ type: st.type, duration: st.duration, damage: st.damage });
  }
  res.frenzyTriggered = maybeTriggerFrenzy(target);
  res.killed = target.health <= 0;
  return res;
}

export function tickStatuses(unit) {
  const ticks = [];
  if (unit.defenseBuffTurns > 0) {
    unit.defenseBuffTurns -= 1;
  }
  for (const st of unit.statusEffects) {
    if (st.duration === -1 || (st.damage || 0) <= 0) continue;
    unit.health = Math.max(0, (unit.health || 0) - st.damage);
    ticks.push({ type: st.type, damage: st.damage });
  }
  unit.statusEffects = unit.statusEffects.filter((st) => {
    if (st.duration === -1 || (st.damage || 0) <= 0) return true;
    st.duration -= 1;
    return st.duration > 0;
  });
  return ticks;
}