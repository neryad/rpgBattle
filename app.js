import { setPlayerEl, setEnemyEl, setIdle, play, playScript } from './animation.js';
import { flash, slash, particles, damageNumber, shake, screenShake } from './effects.js';
let warrior = {
  name: 'Warrior',
  health: 100,
  strength: 17,
  defense: 16,
  speed: 13,
  intelligence: 11,
  characterClass: 'warrior',
  criticalChance: 15,
  specialAttack: 'Sword Slash',
};

let mage = {
  name: 'Mage',
  health: 30,
  strength: 7,
  defense: 17,
  speed: 16,
  intelligence: 17,
  characterClass: 'mage',
  criticalChance: 14,
  specialAttack: 'Fireball meteor',
};
let hero;


let hunter = {
  name: 'Hunter',
  health: 100,
  strength: 13,
  defense: 16,
  speed: 16,
  intelligence: 11,
  characterClass: 'hunter',
  criticalChance: 14,
  specialAttack: 'Arrow of blood',
};

let enemies = [
  {
    name: 'Worn',
    characterClass: 'enemy',
    health: 100,
    strength: 20,
    defense: 12,
    speed: 16,
    intelligence: 6
  },
  {
    name: 'Flying eye',
    characterClass: 'enemy',
    health: 100,
    strength: 20,
    defense: 10,
    speed: 10,
    intelligence: 8
  },
  {
    name: 'Goblin',
    characterClass: 'enemy',
    health: 100,
    strength: 20,
    defense: 12,
    speed: 10,
    intelligence: 6
  },
  {
    name: 'Mushroom',
    characterClass: 'enemy',
    health: 100,
    strength: 20,
    defense: 13,
    speed: 11,
    intelligence: 8
  },
  {
    name: 'Skeleton',
    characterClass: 'enemy',
    health: 100,
    strength: 20,
    defense: 13,
    speed: 11,
    intelligence: 8
  },
];

function selectHero(characterClass) {
  // console.log(`You have selected ${characterClass}`);

  switch (characterClass) {
    case 'warrior':
      hero = warrior;


      break;

    case 'mage':
      hero = mage;
      // console.log(hero, 'hide mage');
      break;


    case 'hunter':
      hero = hunter;
      // console.log(hero, 'hunter');
      break;

    default:
      hero = warrior;
      // console.log(hero, 'default warrior');
      break;
  }

  startGame();
}

function hideRestOfHeros() {

  document.getElementById('heroes').style.display = 'none';
  document.querySelector('.gametittle').style.display = 'none';
  // switch (characterClass) {
  //   case 'warrior':
  //     document.getElementById('mage').style.display = 'none';
  //     // document.getElementById('assassins').style.display = 'none';
  //     // document.getElementById('hunter').style.display = 'none';
  //     // console.log('hererere');
  //     break;
  //   case 'mage':
  //     document.getElementById('warrior').style.display = 'none';
  //     // document.getElementById('assassins').style.display = 'none';
  //     // document.getElementById('hunter').style.display = 'none';
  //     break;
  //   // case 'assassins':
  //   //   document.getElementById('warrior').style.display = 'none';
  //   //   document.getElementById('mage').style.display = 'none';
  //   //   document.getElementById('hunter').style.display = 'none';
  //   //   break;
  //   // case 'hunter':
  //   //   document.getElementById('warrior').style.display = 'none';
  //   //   document.getElementById('mage').style.display = 'none';
  //   //   document.getElementById('assassins').style.display = 'none';

  //   //   break;

  //   default:
  //     document.getElementById('warrior').style.display = 'inline-block';
  //     document.getElementById('mage').style.display = 'inline-block';
  //     // document.getElementById('assassins').style.display = 'inline-block';
  //     // document.getElementById('hunter').style.display = 'inline-block';
  //     break;
  // }
}
let playerHits = 0;
let turns;
let logText = document.querySelector('#text');
let sprite = document.querySelector('#sprite-image');
let enemySprite = document.querySelector('#sprite-image-enemy');
setPlayerEl(sprite);
setEnemyEl(enemySprite);

const ENEMY_KEYS = {
  'Worn': 'worm',
  'Flying eye': 'flyingeye',
  'Goblin': 'goblin',
  'Mushroom': 'mushroom',
  'Skeleton': 'skeleton',
};
let warriorDiv = document.getElementById('warrior');
// let startBtn = document.querySelector('#start');
let warriorBtn = document.querySelector('#warrior-btn');
let hunterBtn = document.querySelector('#hunter-btn');
let mageBtn = document.querySelector('#mage-btn');
function startGame() {
  if (hero == undefined) {
    hero = warrior;
    return;
  }
  setHeroStatus(hero);

  document.querySelector('.bodyCotent').style.height = '50rem';
  document.querySelector('.actions').style.display = 'inline-flex';
  document.querySelector('.log').style.display = 'inline-flex';
  document.querySelector('.characters').style.display = 'inline-flex';
  document.querySelector('#reset').style.display = 'none';

  document.querySelector('.container').classList.add('container-battle');
  hideRestOfHeros();
  let enemy = randomEnemy();
  setEnemyStatus(enemy);
  document.querySelector('.enemies').style.display = 'inline-flex';
  document.querySelector('#special').disabled = true;
  whoGoFirst(hero, enemy);
  // }
  document.querySelector('#attack').addEventListener('click', function () {

    heroTurn(hero, enemy);
  });
  document.querySelector('#defend').addEventListener('click', function () {

    characterDefense(hero, enemy);
  });

  document.querySelector('#special').addEventListener('click', function () {

    playerSpecial(hero, enemy);
    document.querySelector('#special').disabled = true;
  });

  document.querySelector('#reset').addEventListener('click', function () {

    resetGame();
  });
}
function resetGame() {


  location.reload();
}
function whoGoFirst(hero, enemy) {
  if (hero.speed > enemy.speed) {

    generateText(`${hero.name}, es su turno`);
  } else {
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    generateText(`${enemy.name} ha aparecido, es su turno!`);

    enemyAttack(enemy, hero);

  }
}

function setHeroStatus(hero) {
  document.getElementById('progresHealth').value = hero.health;
  setIdle('player', hero.characterClass);
}

function setEnemyStatus(enemy) {
  document.getElementById('enemy-hp').value = enemy.health;
  const key = ENEMY_KEYS[enemy.name] || 'worm';
  setIdle('enemy', key);
}

document.querySelector('.enemies').style.display = 'none';

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



warriorBtn.addEventListener('click', function (event) {

  selectHero('warrior');
});
hunterBtn.addEventListener('click', function (event) {

  selectHero('hunter');
});
mageBtn.addEventListener('click', function (event) {

  selectHero('mage');
});

function generateText(text) {
  logText.innerHTML = '';

  return (logText.innerHTML += text);
}

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




function randomEnemy() {
  let enemy = enemies[Math.floor(Math.random() * enemies.length)];

  setEnemyStatus(enemy);
  return enemy;
}

function randomNumber() {
  const number = Math.floor(Math.random() * 99);
  return number;
}

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


document.querySelector('.actions').style.display = 'none';
document.querySelector('.log').style.display = 'none';
document.querySelector('.characters').style.display = 'none';
