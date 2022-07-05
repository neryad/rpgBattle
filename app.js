import {action} from './helper.js';
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
    name: 'Orc',
    characterClass: 'enemy',
    health: 50,
    strength: 20,
    defense: 12,
    speed: 16,
    intelligence: 6
  },
  {
    name: 'Goblin',
    characterClass: 'enemy',
    health: 50,
    strength: 20,
    defense: 10,
    speed: 10,
    intelligence: 8
  },
  {
    name: 'Gnoll',
    characterClass: 'enemy',
    health: 50,
    strength: 20,
    defense: 12,
    speed: 10,
    intelligence: 6
  },
  {
    name: 'Half orc',
    characterClass: 'enemy',
    health: 50,
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
let warriorDiv = document.getElementById('warrior');
// let startBtn = document.querySelector('#start');
let warriorBtn = document.querySelector('#warrior-btn');
let hunterBtn = document.querySelector('#hunter-btn');
let mageBtn = document.querySelector('#mage-btn');
function startGame() {
  // startAnimation();
  // console.log('start game');
  if (hero == undefined) {
    hero = warrior;
    return;
  }
  setHeroStatus(hero);
  document.querySelector('.bodyCotent').style.height = '50rem';
  document.querySelector('.actions').style.display = 'inline-flex';
  document.querySelector('.log').style.display = 'inline-flex';
  document.querySelector('.characters').style.display = 'inline-flex';
  // document.querySelector('.start').style.display = 'none';
  document.querySelector('#reset').style.display = 'none';
  // document.querySelector('.container').style.backgroundImage =
  //   "url('./assets/images/battleback1-2.png')";

  document.querySelector('.container').classList.add('container-battle');
  hideRestOfHeros();
  let enemy = randomEnemy();
  document.querySelector('.enemies').style.display = 'inline-flex';
  document.querySelector('#special').disabled = true;
  whoGoFirst(hero, enemy);
  // }
  document.querySelector('#attack').addEventListener('click', function () {
    // console.log('attack');
    heroTurn(hero, enemy);
  });
  document.querySelector('#defend').addEventListener('click', function () {
    // console.log('defense');
    //playerDefense(hero, enemy);
    characterDefense(hero, enemy);
  });

  document.querySelector('#special').addEventListener('click', function () {
    // console.log('special');
    playerSpecial(hero, enemy);
    document.querySelector('#special').disabled = true;
  });

  document.querySelector('#reset').addEventListener('click', function () {
    // console.log('attack');
    resetGame();
  });
}
function resetGame(){


  location.reload();
}
function whoGoFirst(hero, enemy) {
  if (hero.speed > enemy.speed) {
    // console.log('turno del heroe');
    generateText(`${hero.name}, es su turno`);
  } else {
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    generateText(`${enemy.name} ha aparecido, es su turno!`);
    // console.log('turno del enemigo');
    enemyAttack(enemy, hero);
    // enemyTurn(enemy);
  }
}
function characterTurns(character, target) {
  // if (turns == 'enemy') {
  //   generateText(`Es el turno de ${character.name}!`);
  //   characterAttack(character, target);
  // } else {
  //   generateText(`Es el turno de ${target.name}!`);
  //   characterAttack(target, character);
  // }
  generateText(`Es el turno de ${character.name}!`);
  characterAttack(character, target);
}
function setHeroStatus(hero) {
  // let idleHero = document.querySelector('.idle');
  // let attackPlayer = document.querySelector('.attackPlayer');
  // let deathPlayer = document.querySelector('.deathPlayer');
  document.getElementById('progresHealth').value = hero.health;
  if(hero.characterClass ==='warrior'){
    sprite.classList.add('idle');
    sprite.style.transform = 'scale(4)';
  } else if (hero.characterClass ==='mage'){
    sprite.classList.add('idleMage');
  } else {
    sprite.classList.add('idleHunter');
    sprite.style.transform = 'scale(4)';
  }
  // document.getElementById('warrior-str').innerHTML = warrior.strength;
  // document.getElementById('warrior-def').innerHTML = warrior.defense;
  // document.getElementById('warrior-speed').innerHTML = warrior.speed;
  // if(hero.className ==='warrior'){
  //   idleHero.style.backgroundImage = './assets/characters/heros/warrior/Idle.png';
  //   attackPlayer.style.backgroundImage = './assets/characters/heros/warrior/Attack1.png'
  //   deathPlayer.style.backgroundImage = './assets/characters/heros/warrior/Death.png'
  // } else if (hero.className === 'mage') {

  // } else {

  // }
  // document.getElementById('mage-hp').innerHTML = mage.health;
  // document.getElementById('mage-str').innerHTML = mage.strength;
  // document.getElementById('mage-def').innerHTML = mage.defense;
  // document.getElementById('mage-speed').innerHTML = mage.speed;
}
function setEnemyStatus(enemy) {
  document.getElementById('enemy-hp').value = enemy.health;
  // document.getElementById('enemy-str').innerHTML = enemy.strength;
  // document.getElementById('enemy-def').innerHTML = enemy.defense;
  // document.getElementById('enemy-speed').innerHTML = enemy.speed;
  // document.getElementById('enemy-name').innerHTML = enemy.name;
 // document.getElementById('enemy-image').src = enemy.enemyImg;
}
// setHeroStatus(hero);
document.querySelector('.enemies').style.display = 'none';

async function heroTurn(player, target) {
  //aqui
  // action('player', 'attackPlayer');
  setAttackAnimationClass(player);
 let enemyDefendNumber = Math.floor(Math.random() * 9) + 1;

  if (enemyDefendNumber >= 7) {
    //action('player', 'attackPlayer');
    // action('player', 'idle');

     await sleep(1000);

    action('enemy', 'enemyGetHit');
    action('enemy', 'idleEnemy');
    await enemyDefend(target, player);
    return;
  }
  let damage = Math.floor(Math.random() * player.strength) * 1.5;


  action('enemy', 'enemyGetHit');
  playerHits++;

  if (playerHits === 7) {
    document.querySelector('#special').disabled = false;
    playerHits = 0;
  }


  if (damage === player.criticalChance) {
    // console.info('critical hit');
    damage = Math.floor(Math.random() * player.strength) * 3;
    generateText(
      `${player.name} hizo un golpe critico a ${target.name} por  ${damage} de daño`
    );
  }
  target.health -= damage;
  if(target.health <= 0){
    generateText(`${target.name} ha sido derrotado por ${player.name}, Has ganado valiente ${player.name}`);
      target.health = 0;
    document.querySelector('#enemy-hp').value = target.health;
    console.log(target.health,'we');
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';


    // action('enemy', 'deathEnemy');
    await sleep(1000);
    // sprite.classList.add('idle');
    if (player.characterClass === 'warrior') {

      sprite.classList.add('idle');
    } else if (player.characterClass === 'mage') {

      sprite.classList.add('idleMage');
    } else {

      sprite.classList.add('idleHunter');
    }
    // setIdleAnimationClass(player);
    enemySprite.classList.add('deathEnemy');
    // action('player', 'idle');
    // action('enemy', 'deathEnemy');
  //  setTimeout(() => {
  //    enemySprite.classList.remove('enemyGetHit');
  //    sprite.classList.remove('attackPlayer');

  //    sprite.classList.add('idle');
  //    enemySprite.classList.add('deathEnemy');
  //  }, 1000);
    return;
  }

  document.querySelector('#enemy-hp').value = target.health;

  await sleep(1000);
  action('enemy', 'idleEnemy');
  // action('player', 'idle');
  // setIdleAnimationClass(player);



  generateText(`Player hit ${target.name} for ${damage} damage.`);
  document.querySelector('#attack').disabled = true;
  document.querySelector('#defend').disabled = true;

 await sleep(1000);
  enemyAttack(target, player);

}

// warriorDiv.addEventListener('click', function () {

//   console.log('warrior');
//   selectHero('warrior');
// });

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

async function enemyAttack(enemy, target) {
  setHeroStatus(target);
  // enemySprite.classList.remove('idleEnemy');
  // sprite.classList.remove('idle');
  action('enemy', 'idleEnemy');
 // action('player', 'idle');
  setIdleAnimationClass(target);


  let damage = Math.floor(Math.random() * enemy.strength) * 1.5;
  generateText(`${enemy.name} hit ${target.characterClass} for ${damage} damage.`);
  target.health -= damage;


  // enemySprite.classList.add('attackEnemy');
  // sprite.classList.add('playerGetHit');
  action('enemy', 'attackEnemy');
  // action('player', 'playerGetHit');
  setHitAnimationClass(target);

  if(target.health <= 0){
    target.health = 0;

    enemySprite.classList.remove('attackEnemy');

      generateText(`${target.name} ha sido derrotado por ${enemy.name}, Game Over`);

        target.health = 0;

    document.querySelector('#progresHealth').value =target.health;
    // document.querySelector(`#${target.characterClass}-hp`).innerHTML = target.health;
      document.querySelector('#attack').disabled = true;
      document.querySelector('#defend').disabled = true;
      document.querySelector('#special').disabled = true;
      document.querySelector('#reset').style.display = 'inline-flex';
    await sleep(1000);
    // sprite.classList.remove('playerGetHit');
    setHitAnimationClass(target)
    enemySprite.classList.add('idleEnemy');
   // sprite.classList.add('deathPlayer');
    // setDeathAnimationClass(target);
    if (target.characterClass === 'warrior') {

      sprite.classList.add('deathPlayer');
    } else if (target.characterClass === 'mage') {

      sprite.classList.add('deathMage');
    } else {

      sprite.classList.add('deathHunter');
    }

      return;
  }


  document.querySelector('#progresHealth').value = target.health;
  // document.querySelector(`#${target.characterClass}-hp`).innerHTML = target.health;

  await sleep(1000);

  // sprite.classList.add('idle');
  // setIdleAnimationClass(target);
  if (target.characterClass === 'warrior') {

    sprite.classList.add('idle');
  } else if (target.characterClass === 'mage') {

    sprite.classList.add('idleMage');
  } else {

    sprite.classList.add('idleHunter');
  }
  enemySprite.classList.add('idleEnemy');
  document.querySelector('#attack').disabled = false;
  document.querySelector('#defend').disabled = false;

}
//?Por el momento se comenta
async function characterDefense(character, target) {
  action('player', 'idle');
  action('enemy', 'idleEnemy');
  action('enemy', 'attackEnemy');
  action('player', 'playerGetHit');

  await sleep(1000);
  generateText(`${character.name} Se esta defendiendo.`);
  let damage = target.strength -  character.defense ;
  generateText(`${target.name} golpeo ${character.name} con ${damage} daño.`);
  character.health -= damage;
  if( character.health <= 0){
    generateText(`${character.name} ha sido derrotado por ${target.name}, Game Over`);

    character.health = 0;
    sprite.classList.add('deathPlayer');
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';
  }

  enemySprite.classList.add('idleEnemy');
  sprite.classList.add('idle');



  document.querySelector(`#${character.characterClass}-hp`).innerHTML =
    character.health;

}




async function enemyDefend(enemy, player) {
  setHeroStatus(player);
//Todo enmy animation
  // sprite.classList.remove('idle');
  setIdleAnimationClass(player);
  enemySprite.classList.remove('idleEnemy');
  // sprite.classList.add('attackPlayer');
  setAttackAnimationClass(player);
  enemySprite.classList.add('enemyGetHit');

   generateText(`${enemy.name} se esta defendiendo.`);

  let damage = enemy.strength - player.defense ;
  generateText(`${enemy.name}  se defendió, tomo ${damage} de daño,turno de ${player.name}.`);
  enemies.health -= damage;
  await sleep(1000);
  // sprite.classList.remove('attackPlayer');
  setAttackAnimationClass(player);
  enemySprite.classList.remove('enemyGetHit');
  // sprite.classList.add('idle');
  // setIdleAnimationClass(player);
  if (player.characterClass === 'warrior') {

    sprite.classList.add('idle');
  } else if (player.characterClass === 'mage') {

    sprite.classList.add('idleMage');
  } else {

    sprite.classList.add('idleHunter');
  }
  enemySprite.classList.add('idleEnemy');

  validateLife(enemy, player.name);
  document.querySelector('#enemy-hp').innerHTML = enemy.health;
  document.querySelector('#attack').disabled = false;
  document.querySelector('#defend').disabled = false;

}

function randomEnemy() {
  let enemy = enemies[Math.floor(Math.random() * enemies.length)];
  // console.log(enemy);
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

  // validateLife(enemy, player.name);
  if(enemy.health <= 0){
    generateText(`${enemy.name} ha sido derrotado por ${player.name}, Has ganado valiente ${player.name}`);

    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';
    return;
  }
  document.querySelector('#enemy-hp').innerHTML = enemy.health;

  enemyAttack(enemy, player);
  // setTimeout(() => {
  //   enemyAttack(enemy, player);
  // }, 3000);
}

function validateLife(character, name) {

  if (character.health <= 0 && character.characterClass !== 'enemy') {


    generateText(`${character.name} ha sido derrotado por ${name}, Game Over`);

    character.health = 0;
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';
    return;
  } else {
    if (character.health <= 0 && character.characterClass === 'enemy') {


      generateText(`${character.name} ha sido derrotado por ${name}, Has ganado valiente ${name}`);
      character.health == 0;
      console.log(character.health,'erp');
      document.querySelector('#attack').disabled = true;
      document.querySelector('#defend').disabled = true;
      document.querySelector('#special').disabled = true;
      document.querySelector('#reset').style.display = 'inline-flex';
      return;
    }

  }

}
function sleep(time) {
  return new Promise((s) => setTimeout(s, time))
}

document.querySelector('.actions').style.display = 'none';
document.querySelector('.log').style.display = 'none';
document.querySelector('.characters').style.display = 'none';
//aca
function setAttackAnimationClass(hero){
  if (hero.characterClass === 'warrior') {
    action('player', 'attackPlayer');
  } else if (hero.characterClass === 'mage') {
    action('player', 'attackMage');
  } else {
    action('player', 'attackHunter');
  }
}

function setHitAnimationClass(hero) {
  if (hero.characterClass === 'warrior') {
    action('player', 'playerGetHit');
  } else if (hero.characterClass === 'mage') {
    action('player', 'mageGetHit');
  } else {
    action('player', 'hunterGetHit');
  }
}

function setDeathAnimationClass(hero) {
  if (hero.characterClass === 'warrior') {
    action('player', 'deathPlayer');
  } else if (hero.characterClass === 'mage') {
    action('player', 'deathMage');
  } else {
    action('player', 'deathHunter');
  }
}

function setIdleAnimationClass(hero) {
  if (hero.characterClass === 'warrior') {
    action('player', 'idle');
  } else if (hero.characterClass === 'mage') {
    action('player', 'idleMage');
  } else {
    action('player', 'idleHunter');
  }
}
// Helper
// function action(character, type) {
//   const entity = (character === 'player') ? sprite : spriteEnemy

//   entity.classList.add(type)
//   setTimeout(() => { entity.classList.remove(type) }, 1000)
// }

// action('enemy', 'attackEnemy')
// action('player', 'playerGetHit')
// await sleep(1000)
// action('enemy', 'idle')
// action('player', 'idle')