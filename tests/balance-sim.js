import { HEROES, ENEMIES, createCombatant, buildHit, commitHit, tickStatuses, SPECIAL_HITS } from '../combat.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runBattle(heroKey, enemyKey, rng) {
  const hero = createCombatant(HEROES[heroKey]);
  const enemy = createCombatant(ENEMIES[enemyKey]);
  let turns = 0;
  let heroWon = null;
  const stats = {
    heroHits: 0,
    enemyHits: 0,
    heroCrits: 0,
    enemyCrits: 0,
    heroEvades: 0,
    enemyEvades: 0,
    specialUses: 0,
    dotDeaths: 0,
    heroDamageDealt: 0,
    heroDamageTaken: 0,
  };

  let heroActs = hero.speed > enemy.speed;

  while (hero.health > 0 && enemy.health > 0 && turns < 500) {
    turns += 1;
    if (heroActs) {
      const useSpecial = hero.specialUnlocked;
      const pending = buildHit(hero, enemy, { useSpecial }, rng);
      const res = commitHit(pending);
      if (useSpecial) {
        hero.specialUnlocked = false;
        hero.hits = 0;
        stats.specialUses += 1;
      }
      if (!res.miss && !useSpecial) {
        hero.hits += 1;
        if (hero.hits >= SPECIAL_HITS) {
          hero.hits = 0;
          hero.specialUnlocked = true;
        }
      }
      if (res.miss) {
        stats.enemyEvades += 1;
      } else {
        stats.heroDamageDealt += res.damage;
        stats.heroHits += 1;
        if (res.isCrit) stats.heroCrits += 1;
      }
      const ticks = tickStatuses(hero);
      if (ticks.length) {
        stats.heroDamageTaken += ticks.reduce((s, t) => s + t.damage, 0);
        if (hero.health <= 0) {
          heroWon = false;
          break;
        }
      }
      heroActs = false;
    } else {
      const pending = buildHit(enemy, hero, { useSpecial: false }, rng);
      const res = commitHit(pending);
      if (res.miss) {
        stats.heroEvades += 1;
      } else {
        stats.heroDamageTaken += res.damage;
        stats.enemyHits += 1;
        if (res.isCrit) stats.enemyCrits += 1;
      }
      const ticks = tickStatuses(enemy);
      if (ticks.length) {
        stats.heroDamageDealt += ticks.reduce((s, t) => s + t.damage, 0);
        if (enemy.health <= 0) {
          stats.dotDeaths += 1;
          heroWon = true;
          break;
        }
      }
      heroActs = true;
    }
  }

  if (heroWon === null) heroWon = enemy.health <= 0 && hero.health > 0;
  return { heroWin: heroWon, turns, heroHpLeft: hero.health, enemyHpLeft: enemy.health, ...stats };
}

const SIMS = parseInt(process.argv[2] || '3000', 10);
const heroKeys = Object.keys(HEROES);
const enemyKeys = Object.keys(ENEMIES);

const results = {};
for (const hk of heroKeys) {
  for (const ek of enemyKeys) {
    const agg = {
      wins: 0,
      turnsSum: 0,
      heroHits: 0,
      enemyHits: 0,
      heroCrits: 0,
      enemyCrits: 0,
      heroEvades: 0,
      enemyEvades: 0,
      specialUses: 0,
      dotDeaths: 0,
      heroDamageDealt: 0,
      heroDamageTaken: 0,
      heroHpLeft: 0,
    };
    for (let i = 0; i < SIMS; i++) {
      const r = runBattle(hk, ek, mulberry32(i * 7919 + hk.length * 104729 + ek.length));
      agg.wins += r.heroWin ? 1 : 0;
      agg.turnsSum += r.turns;
      agg.heroHits += r.heroHits;
      agg.enemyHits += r.enemyHits;
      agg.heroCrits += r.heroCrits;
      agg.enemyCrits += r.enemyCrits;
      agg.heroEvades += r.heroEvades;
      agg.enemyEvades += r.enemyEvades;
      agg.specialUses += r.specialUses;
      agg.dotDeaths += r.dotDeaths;
      agg.heroDamageDealt += r.heroDamageDealt;
      agg.heroDamageTaken += r.heroDamageTaken;
      agg.heroHpLeft += r.heroWin ? r.heroHpLeft : 0;
    }
    results[hk] = results[hk] || {};
    results[hk][ek] = agg;
  }
}

function pct(n, d) {
  return ((n / Math.max(1, d)) * 100).toFixed(1);
}

console.log(`Simulación: ${SIMS} combates por enfrentamiento (${heroKeys.length}×${enemyKeys.length})`);
console.log('');
console.log('| Héroe vs Enemigo | Win % | Turnos | DPH héroe | DPH enemigo | Crít héroe | Crít enem | Evasión enem | Evasión héroe | Especial/comb. | Muertes por estados |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
for (const hk of heroKeys) {
  for (const ek of enemyKeys) {
    const a = results[hk][ek];
    const avgHeroHits = a.heroHits / SIMS;
    const avgEnemyHits = a.enemyHits / SIMS;
    const dphHero = a.heroDamageDealt / Math.max(1, a.heroHits);
    const dphEnemy = a.heroDamageTaken / Math.max(1, a.enemyHits);
    const avgTurns = (a.turnsSum / SIMS).toFixed(1);
    console.log(
      `| ${hk} vs ${ek} | ${pct(a.wins, SIMS)}% | ${avgTurns} | ${dphHero.toFixed(1)} | ${dphEnemy.toFixed(1)} | ${pct(a.heroCrits, a.heroHits)}% | ${pct(a.enemyCrits, a.enemyHits)}% | ${pct(a.enemyEvades, a.heroHits)}% | ${pct(a.heroEvades, a.enemyHits)}% | ${(a.specialUses / SIMS).toFixed(2)} | ${pct(a.dotDeaths, SIMS)}% |`
    );
  }
}
console.log('');
console.log('Promedio general por héroe:');
console.log('| Héroe | Win % media | HP restante (ganando) |');
console.log('|---|---|---|');
for (const hk of heroKeys) {
  let wins = 0;
  let hpLeft = 0;
  for (const ek of enemyKeys) {
    const a = results[hk][ek];
    wins += a.wins;
    hpLeft += a.heroHpLeft;
  }
  const total = SIMS * enemyKeys.length;
  console.log(`| ${hk} | ${pct(wins, total)}% | ${(hpLeft / Math.max(1, wins)).toFixed(0)} |`);
}