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
    enemyImg: './assets/images/wolf.png',
  },
  {
    name: 'vampire',
    health: 100,
    strength: 10,
    defense: 9,
    speed: 6,
    intelligence: 2,
    enemyImg: './assets/images/wolf.png',
  },
  {
    name: 'wolf',
    health: 100,
    strength: 10,
    defense: 9,
    speed: 6,
    intelligence: 2,
    enemyImg: './assets/images/wolf.png',
  },
  {
    name: 'ifLoco',
    health: 100,
    strength: 10,
    defense: 9,
    speed: 6,
    intelligence: 2,
    enemyImg: './assets/images/wolf.png',
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
      document.getElementById('assassins').style.display = 'none';
      document.getElementById('hunter').style.display = 'none';
      console.log('hererere');
      break;
    case 'mage':
      document.getElementById('warrior').style.display = 'none';
      document.getElementById('assassins').style.display = 'none';
      document.getElementById('hunter').style.display = 'none';
      break;
    case 'assassins':
      document.getElementById('warrior').style.display = 'none';
      document.getElementById('mage').style.display = 'none';
      document.getElementById('hunter').style.display = 'none';
      break;
    case 'hunter':
      document.getElementById('warrior').style.display = 'none';
      document.getElementById('mage').style.display = 'none';
      document.getElementById('assassins').style.display = 'none';

      break;

    default:
      document.getElementById('warrior').style.display = 'inline-block';
      document.getElementById('mage').style.display = 'inline-block';
      document.getElementById('assassins').style.display = 'inline-block';
      document.getElementById('hunter').style.display = 'inline-block';
      break;
  }
}
function startGame() {
  console.log('start game');
  if (hero == undefined) {
    console.log('hero is undefined');
    return;
  }
  hideRestOfHeros(hero.heroClass);
}
