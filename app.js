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
  health: 100,
  strength: 7,
  defense: 17,
  speed: 16,
  intelligence: 17,
  characterClass: 'mage',
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
  characterClass: 'assassins',
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
  characterClass: 'hunter',
  criticalChance: 14,
  specialAttack: 'Arrow of blood',
};

let enemies = [
  {
    name: 'Orc',
    characterClass: 'enemy',
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
    characterClass: 'enemy',
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
    characterClass: 'enemy',
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
    characterClass: 'enemy',
    health: 100,
    strength: 14,
    defense: 13,
    speed: 11,
    intelligence: 8,
    enemyImg:
      'https://thumbs.dreamstime.com/z/vector-pixel-art-wolf-head-isolated-cartoon-127963772.jpg',
  },
];
var spriteSheet = document.getElementById("sprite-image");
var animationInterval;
var widthOfSpriteSheet = 1472;
var widthOfEachSprite = 184;
function stopAnimation() {
  clearInterval(animationInterval);
}
function startAnimation() {
  var position = widthOfEachSprite; //start position for the image
  const speed = 100; //in millisecond(ms)
  const diff = widthOfEachSprite; //difference between two sprites

  animationInterval = setInterval(() => {
    spriteSheet.style.backgroundPosition = `-${position}px 0px`;

    if (position < widthOfSpriteSheet) {
      position = position + diff;
    } else {
      //increment the position by the width of each sprite each time
      position = widthOfEachSprite;
    }
    //reset the position to show first sprite after the last one
  }, speed);
}

const playerImage = new Image();
// playerImage.src = './assets/images/Idle.png';

function selectHero(characterClass) {
  // console.log(`You have selected ${characterClass}`);

  switch (characterClass) {
    case 'warrior':
      hero = warrior;
      // console.log(hero, 'warrior');

      break;

    case 'mage':
      hero = mage;
      // console.log(hero, 'hide mage');
      break;

    case 'assassins':
      hero = assassins;
      // console.log(hero, 'assassins');
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
}

function hideRestOfHeros(characterClass) {
  switch (characterClass) {
    case 'warrior':
      document.getElementById('mage').style.display = 'none';
      // document.getElementById('assassins').style.display = 'none';
      // document.getElementById('hunter').style.display = 'none';
      // console.log('hererere');
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
let turns;
let logText = document.querySelector('#text');

function startGame() {
  startAnimation();
  // console.log('start game');
  if (hero == undefined) {
    hero = warrior;
    return;
  }

  document.querySelector('.actions').style.display = 'inline-flex';
  document.querySelector('.log').style.display = 'inline-flex';
  document.querySelector('.start').style.display = 'none';
  document.querySelector('#reset').style.display = 'none';
  document.querySelector('.container').style.backgroundImage =
    "url('./assets/images/battleback1-2.png')";
  hideRestOfHeros(hero.characterClass);
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

function characterAttack(character, target) {
  let damage = Math.floor(Math.random() * character.strength) * 1.5;
  //?comentado por el momento
  // let enemyDefendNumber = Math.floor(Math.random() * 9) + 1;
  // if (enemyDefendNumber >= 7) {
  //   console.log(character, 'sds');
  //   characterDefense(target, character);
  // }

  // playerHits++;
  // if (playerHits == 7) {
  //   document.querySelector('#special').disabled = false;
  //   console.log('se dispara el especial');
  //   playerHits = 0;
  // }

  // if (damage == character.criticalChance) {
  //   console.info('critical hit');
  //   damage = Math.floor(Math.random() * character.strength) * 3;
  //   generateText(
  //     `${character.name} critically hit ${target.name} for ${damage} damage`
  //   );
  // }
  target.health -= damage;

  document.querySelector(`#${target.characterClass}-hp`).innerHTML =
    target.health;

  generateText(`${character.name} hit ${target.name} for ${damage} damage.`);

  // characterTurns(target, character);
  characterTurns(target, character);
  // setTimeout(() => {
  //   // enemyAttack(target, character);
  //   characterTurns(target, character);
  // }, 3000);
  let rndNumber = randomNumber();
}

function heroTurn(player, target) {
  let sprite = document.querySelector('#sprite-image');
  // sprite.style.backgroundImage = `url('./assets/images/${player.characterClass}-attack.png')`;
  // sprite.style.backgroundImage = `url('./assets/characters/heros/warrior/Attack1.png')`;
  // sprite.style.animation = 'attack 1s steps(4) infinite';
  sprite.classList.remove('idle');
  sprite.classList.add('attackPlayer');
 let enemyDefendNumber = Math.floor(Math.random() * 9) + 1;
  if (enemyDefendNumber >= 7) {
    enemyDefend(target, player);
    return;
  }
  let damage = Math.floor(Math.random() * player.strength) * 1.5;

  // console.log(playerHits, '1');
  playerHits++;
  console.log(playerHits, 'playerHits');
  if (playerHits === 7) {
    document.querySelector('#special').disabled = false;
    // console.log('se dispara el especial');
    playerHits = 0;
  }


  if (damage === player.criticalChance) {
    // console.info('critical hit');
    damage = Math.floor(Math.random() * player.strength) * 3;
    generateText(
      `${player.name} critically hit ${target.name} for ${damage} damage`
    );
  }
  target.health -= damage;
  if(target.health <= 0){
    generateText(`${target.name} ha sido derrotado por ${player.name}, Has ganado valiente ${player.name}`);

    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';
    return;
  }
  //validateLife(target, player.name);
  document.querySelector('#enemy-hp').innerHTML = target.health;

  generateText(`Player hit ${target.name} for ${damage} damage.`);
  document.querySelector('#attack').disabled = true;
  document.querySelector('#defend').disabled = true;
  // sprite.classList.remove('attackPlayer');
  // sprite.classList.add('idle');
setTimeout(() => {
  sprite.classList.remove('attackPlayer');
  sprite.classList.add('idle');
}, 1000);
  setTimeout(() => {

    enemyAttack(target, player);
  }, 1500);
  let rndNumber = randomNumber();
}

function generateText(text) {
  logText.innerHTML = '';

  return (logText.innerHTML += text);
}

function enemyAttack(enemy, target) {

  let damage = Math.floor(Math.random() * enemy.strength) * 1.5;
  generateText(`${enemy.name} hit ${target.characterClass} for ${damage} damage.`);
  target.health -= damage;
  // validateLife(target, enemy.name);

  if(target.health <= 0){


      generateText(`${target.name} ha sido derrotado por ${enemy.name}, Game Over`);

      target.health = 0;
      document.querySelector('#attack').disabled = true;
      document.querySelector('#defend').disabled = true;
      document.querySelector('#special').disabled = true;
      document.querySelector('#reset').style.display = 'inline-flex';

      return;
  }
  document.querySelector('#health').style.width = `${target.health}%`;

  document.querySelector(`#${target.characterClass}-hp`).innerHTML = target.health;
  document.querySelector('#attack').disabled = false;
  document.querySelector('#defend').disabled = false;
}
//?Por el momento se comenta
function characterDefense(character, target) {
  // console.log(character.characterClass, 'character.characterClass');
  generateText(`${character.name} is defending.`);
  let damage = character.defense - target.strength;
  generateText(`${target.name} hit ${character.name} for ${damage} damage.`);
  character.health -= damage;
  if( character.health <= 0){
    generateText(`${character.name} ha sido derrotado por ${target.name}, Game Over`);

    character.health = 0;
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';
  }
  document.querySelector(`#${character.characterClass}-hp`).innerHTML =
    character.health;
  // setTimeout(() => {
  //   generateText(`${target.name} hit ${character.name} for ${damage} damage.`);
  //   character.health -= damage;
  //   document.querySelector(`#${character.characterClass}-hp`).innerHTML =
  //     character.health;
  // }, 4000);
}


function enemyDefend(enemy, player) {
   generateText(`${enemy.name} is defending.`);
  // let damage = enemy.defense - player.strength;
  let damage = player.defense - enemy.strength;
  generateText(`${enemy.name}  is defending, get ${damage} damage.`);
  enemies.health -= damage;
  validateLife(enemy, player.name);
  document.querySelector('#enemy-hp').innerHTML = enemy.health;
  document.querySelector('#attack').disabled = false;
  document.querySelector('#defend').disabled = false;
  generateText(`${enemy.name} se defendió ahora es turno de ${player.name}.`);
  // setTimeout(() => {
  //   generateText(`${player.name} turn.`);
  // }, 1000);
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
  // alert(`${character.name} ha sido derrotado por ${name}, Game Over`);

    generateText(`${character.name} ha sido derrotado por ${name}, Game Over`);

    character.health = 0;
    document.querySelector('#attack').disabled = true;
    document.querySelector('#defend').disabled = true;
    document.querySelector('#special').disabled = true;
    document.querySelector('#reset').style.display = 'inline-flex';
    return;
  } else {
    if (character.health <= 0 && character.characterClass === 'enemy') {
      //alert(`${character.name} ha sido derrotado por ${name}, Has ganado valiente ${name}`);

      generateText(`${character.name} ha sido derrotado por ${name}, Has ganado valiente ${name}`);

      document.querySelector('#attack').disabled = true;
      document.querySelector('#defend').disabled = true;
      document.querySelector('#special').disabled = true;
      document.querySelector('#reset').style.display = 'inline-flex';
      return;
    }

  }

}
document.querySelector('.actions').style.display = 'none';
document.querySelector('.log').style.display = 'none';
