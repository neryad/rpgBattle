let sprite = document.querySelector('#sprite-image');
let spriteEnemy = document.querySelector('#sprite-image-enemy');

export function action(character, type) {
  const entity = (character === 'player') ? sprite : spriteEnemy

  entity.classList.add(type)
  setTimeout(() => { entity.classList.remove(type) }, 1000)
}