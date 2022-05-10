let warrior = {
  name: 'Warrior',
  health: 100,
  strength: 17,
  defense: 16,
  speed: 13,
  intelligence: 11,
  heroClass: 'warrior',
  criticalChance: 15,
  specialAttack: 'Sword Slash',
};

let mage = {
  name: 'Mage',
  health: 100,
  strength: 7,
  defense: 17,
  speed: 16,
  intelligence: 17,
  heroClass: 'mage',
  criticalChance: 14,
  specialAttack: 'Fireball meteor',
};
let hero;

let assassins = {
  name: 'Assassins',
  health: 100,
  strength: 15,
  defense: 15,
  speed: 17,
  intelligence: 16,
  heroClass: 'assassins',
  criticalChance: 19,
  specialAttack: 'Blade of death',
};

let hunter = {
  name: 'Hunter',
  health: 100,
  strength: 13,
  defense: 16,
  speed: 16,
  intelligence: 11,
  heroClass: 'hunter',
  criticalChance: 14,
  specialAttack: 'Arrow of blood',
};

let enemies = [
  {
    name: 'Orc',
    health: 100,
    strength: 16,
    defense: 12,
    speed: 16,
    intelligence: 6,
    enemyImg:
      'https://thumbs.dreamstime.com/z/vector-pixel-art-wolf-head-isolated-cartoon-127963772.jpg',
  },
  {
    name: 'Goblin',
    health: 100,
    strength: 11,
    defense: 10,
    speed: 10,
    intelligence: 8,
    enemyImg:
      'https://thumbs.dreamstime.com/z/vector-pixel-art-wolf-head-isolated-cartoon-127963772.jpg',
  },
  {
    name: 'Gnoll',
    health: 100,
    strength: 16,
    defense: 12,
    speed: 10,
    intelligence: 6,
    enemyImg:
      'https://thumbs.dreamstime.com/z/vector-pixel-art-wolf-head-isolated-cartoon-127963772.jpg',
  },
  {
    name: 'Half orc',
    health: 100,
    strength: 14,
    defense: 13,
    speed: 11,
    intelligence: 8,
    enemyImg:
      'https://thumbs.dreamstime.com/z/vector-pixel-art-wolf-head-isolated-cartoon-127963772.jpg',
  },
];

function selectHero(heroClass) {
  console.log(`You have selected ${heroClass}`);

  switch (heroClass) {
    case 'warrior':
      hero = warrior;
      console.log(hero, 'warrior');

      break;

    case 'mage':
      hero = mage;
      console.log(hero, 'hide mage');
      break;

    case 'assassins':
      hero = assassins;
      console.log(hero, 'assassins');
      break;

    case 'hunter':
      hero = hunter;
      console.log(hero, 'hunter');
      break;

    default:
      hero = warrior;
      console.log(hero, 'default warrior');
      break;
  }
}

function hideRestOfHeros(heroClass) {
  switch (heroClass) {
    case 'warrior':
      document.getElementById('mage').style.display = 'none';
      // document.getElementById('assassins').style.display = 'none';
      // document.getElementById('hunter').style.display = 'none';
      console.log('hererere');
      break;
    case 'mage':
      document.getElementById('warrior').style.display = 'none';
      // document.getElementById('assassins').style.display = 'none';
      // document.getElementById('hunter').style.display = 'none';
      break;
    // case 'assassins':
    //   document.getElementById('warrior').style.display = 'none';
    //   document.getElementById('mage').style.display = 'none';
    //   document.getElementById('hunter').style.display = 'none';
    //   break;
    // case 'hunter':
    //   document.getElementById('warrior').style.display = 'none';
    //   document.getElementById('mage').style.display = 'none';
    //   document.getElementById('assassins').style.display = 'none';

    //   break;

    default:
      document.getElementById('warrior').style.display = 'inline-block';
      document.getElementById('mage').style.display = 'inline-block';
      // document.getElementById('assassins').style.display = 'inline-block';
      // document.getElementById('hunter').style.display = 'inline-block';
      break;
  }
}
let playerHits = 0;
let logText = document.querySelector('#text');
function startGame() {
  console.log('start game');
  if (hero == undefined) {
    hero = warrior;
    return;
  }
  hideRestOfHeros(hero.heroClass);
  let enemy = randomEnemy();
  document.querySelector('.enemies').style.display = 'inline-block';
  document.querySelector('#special').disabled = true;
  document.querySelector('#attack').addEventListener('click', function () {
    console.log('attack');
    playerAttack(hero, enemy);
  });
  document.querySelector('#defend').addEventListener('click', function () {
    console.log('defense');
    playerDefense(hero, enemy);
  });

  document.querySelector('#special').addEventListener('click', function () {
    console.log('special');
    playerSpecial(hero, enemy);
    document.querySelector('#special').disabled = true;
  });
}

function setHeroStatus() {
  document.getElementById('warrior-hp').innerHTML = warrior.health;
  document.getElementById('warrior-str').innerHTML = warrior.strength;
  document.getElementById('warrior-def').innerHTML = warrior.defense;
  document.getElementById('warrior-speed').innerHTML = warrior.speed;

  document.getElementById('mage-hp').innerHTML = mage.health;
  document.getElementById('mage-str').innerHTML = mage.strength;
  document.getElementById('mage-def').innerHTML = mage.defense;
  document.getElementById('mage-speed').innerHTML = mage.speed;
}
function setEnemyStatus(enemy) {
  document.getElementById('enemy-hp').innerHTML = enemy.health;
  document.getElementById('enemy-str').innerHTML = enemy.strength;
  document.getElementById('enemy-def').innerHTML = enemy.defense;
  document.getElementById('enemy-speed').innerHTML = enemy.speed;
  document.getElementById('enemy-name').innerHTML = enemy.name;
  document.getElementById('enemy-image').src = enemy.enemyImg;
}
setHeroStatus();
document.querySelector('.enemies').style.display = 'none';

function playerAttack(player, target) {
  let damage = Math.floor(Math.random() * player.strength) * 1.5;
  let enemyDefendNumber = Math.floor(Math.random() * 9) + 1;
  if (enemyDefendNumber >= 7) {
    enemyDefend(target, player);
  }
  console.log(playerHits, '1');
  playerHits++;
  if (playerHits == 7) {
    document.querySelector('#special').disabled = false;
    console.log('se dispara el especial');
    playerHits = 0;
  }

  console.log(playerHits, '2');
  if (damage == player.criticalChance) {
    console.info('critical hit');
    damage = Math.floor(Math.random() * player.strength) * 3;
    generateText(
      `${player.name} critically hit ${target.name} for ${damage} damage`
    );
  }
  target.health -= damage;
  document.querySelector('#enemy-hp').innerHTML = target.health;

  generateText(`Player hit ${target.name} for ${damage} damage.`);

  setTimeout(() => {
    enemyAttack(target, player);
  }, 3000);
  let rndNumber = randomNumber();
}

function generateText(text) {
  logText.innerHTML = '';

  return (logText.innerHTML = text);
}

function enemyAttack(enemy, target) {
  let damage = Math.floor(Math.random() * enemy.strength) * 1.5;
  generateText(`${enemy.name} hit ${target.heroClass} for ${damage} damage.`);
  target.health -= damage;

  document.querySelector(`#${target.heroClass}-hp`).innerHTML = target.health;
}

function playerDefense(player, enemy) {
  generateText(`${player.name} is defending.`);
  let damage = player.defense - enemy.strength;

  setTimeout(() => {
    generateText(`${enemy.name} hit ${player.name} for ${damage} damage.`);
    player.health -= damage;
    document.querySelector(`#${player.heroClass}-hp`).innerHTML = player.health;
  }, 4000);
}

function enemyDefend(enemy, player) {
  // generateText(`${enemy.name} is defending.`);
  // let damage = enemy.defense - player.strength;
  let damage = player.defense - enemy.strength;
  setTimeout(() => {
    generateText(`${enemy.name}  is defending, get ${damage} damage.`);
    enemies.health -= damage;
    document.querySelector('#enemy-hp').innerHTML = enemy.health;
  }, 5000);
}

function randomEnemy() {
  let enemy = enemies[Math.floor(Math.random() * enemies.length)];
  console.log(enemy);
  setEnemyStatus(enemy);
  return enemy;
}

function randomNumber() {
  const number = Math.floor(Math.random() * 99);
  return number;
}

function playerSpecial(player, enemy) {
  let damage = player.strength * 2.5;
  generateText(
    `${player.name} is using special : ${player.specialAttack}, generate ${damage}  damage to ${enemy.name}.`
  );
  let enemyDefendNumber = Math.floor(Math.random() * 9) + 1;
  if (enemyDefendNumber >= 7) {
    enemyDefend(enemy, player);
  }
  enemy.health -= damage;
  document.querySelector('#enemy-hp').innerHTML = enemy.health;

  setTimeout(() => {
    enemyAttack(enemy, player);
  }, 3000);
}
