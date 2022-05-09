let warrior = {
  name: '',
  health: 100,
  strength: 10,
  defense: 9,
  speed: 6,
  intelligence: 2,
  heroClass: 'warrior',
};

let mage = {
  name: '',
  health: 110,
  strength: 6,
  defense: 7,
  speed: 7,
  intelligence: 10,
  heroClass: 'mage',
};
let hero;

let assassins = {
  name: '',
  health: 100,
  strength: 6,
  defense: 7,
  speed: 10,
  intelligence: 5,
  heroClass: 'assassins',
};

let hunter = {
  name: '',
  health: 100,
  strength: 7,
  defense: 5,
  speed: 8,
  intelligence: 7,
  heroClass: 'hunter',
};

let enemies = [
  {
    name: 'Goblin',
    health: 100,
    strength: 10,
    defense: 9,
    speed: 6,
    intelligence: 2,
    enemyImg:
      'https://thumbs.dreamstime.com/z/vector-pixel-art-wolf-head-isolated-cartoon-127963772.jpg',
  },
  {
    name: 'vampire',
    health: 100,
    strength: 10,
    defense: 9,
    speed: 6,
    intelligence: 2,
    enemyImg:
      'https://thumbs.dreamstime.com/z/vector-pixel-art-wolf-head-isolated-cartoon-127963772.jpg',
  },
  {
    name: 'wolf',
    health: 100,
    strength: 10,
    defense: 9,
    speed: 6,
    intelligence: 2,
    enemyImg:
      'https://thumbs.dreamstime.com/z/vector-pixel-art-wolf-head-isolated-cartoon-127963772.jpg',
  },
  {
    name: 'ifLoco',
    health: 100,
    strength: 10,
    defense: 9,
    speed: 6,
    intelligence: 2,
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

  document.querySelector('#attack').addEventListener('click', function () {
    console.log('attack');
    playerAttack(hero, enemy);
  });
  document.querySelector('#defend').addEventListener('click', function () {
    console.log('defense');
    playerDefense(hero, enemy);
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
  // logText.innerHTML = '';
  // let damage = Math.floor(Math.random() * 9) + 1;
  //let enemy = enemies[Math.floor(Math.random() * enemies.length)];
  let damage = Math.floor(Math.random() * player.strength) * 1.5;
  if (damage == 9) {
    console.info('critical hit');
    damage = Math.floor(Math.random() * player.strength) * 3;
  }
  target.health -= damage;
  document.querySelector('#enemy-hp').innerHTML = target.health;

  // logText.innerHTML += `Player hit ${target.name} for ${damage} damage.`;
  generateText(`Player hit ${target.name} for ${damage} damage.`);
  console.log('player damage', damage);
  // let critical = Math.floor(Math.random() * 5);
  enemyAttack(target, player);
  let rndNumber = randomNumber();
  // if (rndNumber > 7) {
  //   console.log('critical hit');
  // }
}
function generateText(text) {
  logText.innerHTML = '';

  return (logText.innerHTML = text);
}
function enemyAttack(enemy, target) {
  let damage = Math.floor(Math.random() * enemy.strength) * 1.5;
  target.health -= damage;
  console.log('enemy damage', damage);
  document.querySelector(`#${target.heroClass}-hp`).innerHTML = target.health;
}

function playerDefense(player, enemy) {
  let damage = enemy.strength - player.defense;
  player.health -= damage;
  document.querySelector(`#${player.heroClass}-hp`).innerHTML = player.health;

  generateText(`Player defended, take ${damage} damage.`);
  console.log('enemy damage on defense', damage);
}

function randomEnemy() {
  let enemy = enemies[Math.floor(Math.random() * enemies.length)];
  console.log(enemy);
  setEnemyStatus(enemy);
  return enemy;
}

function randomNumber() {
  const number = Math.floor(Math.random() * 13);
  return number;
}
