export const ANIMS = ['idle', 'attack', 'hit', 'death'];

export const CELLS = {
  warrior:   { w: 135, h: 135 },
  mage:      { w: 231, h: 190 },
  hunter:    { w: 100, h: 100 },
  worm:      { w: 90,  h: 90 },
  flyingeye: { w: 150, h: 150 },
  goblin:    { w: 150, h: 150 },
  mushroom:  { w: 150, h: 150 },
  skeleton:  { w: 150, h: 150 },
  rat:       { w: 70,  h: 70 },
  mimic:     { w: 146, h: 146 },
  boss:      { w: 140, h: 140 },
};

export const SPRITES = {
  warrior: {
    idle:   { frames: 10, sheetW: 1350, dur: 800,  loop: true },
    attack: { frames: 4,  sheetW: 540,  dur: 600,  loop: false },
    hit:    { frames: 3,  sheetW: 405,  dur: 450,  loop: false },
    death:  { frames: 9,  sheetW: 1215, dur: 1000, loop: false },
  },
  mage: {
    idle:   { frames: 6,  sheetW: 1386, dur: 800,  loop: true },
    attack: { frames: 8,  sheetW: 1848, dur: 600,  loop: false },
    hit:    { frames: 4,  sheetW: 924,  dur: 450,  loop: false },
    death:  { frames: 7,  sheetW: 1617, dur: 1000, loop: false },
  },
  hunter: {
    idle:   { frames: 10, sheetW: 1000, dur: 800,  loop: true },
    attack: { frames: 6,  sheetW: 600,  dur: 600,  loop: false },
    hit:    { frames: 3,  sheetW: 300,  dur: 450,  loop: false },
    death:  { frames: 10, sheetW: 1000, dur: 1000, loop: false },
  },
  worm: {
    idle:   { frames: 9,  sheetW: 810,  dur: 800,  loop: true },
    attack: { frames: 16, sheetW: 1440, dur: 700,  loop: false },
    hit:    { frames: 3,  sheetW: 270,  dur: 450,  loop: false },
    death:  { frames: 8,  sheetW: 720,  dur: 1000, loop: false },
  },
  flyingeye: {
    idle:   { frames: 8,  sheetW: 1200, dur: 800,  loop: true },
    attack: { frames: 8,  sheetW: 1200, dur: 700,  loop: false },
    hit:    { frames: 4,  sheetW: 600,  dur: 450,  loop: false },
    death:  { frames: 4,  sheetW: 600,  dur: 1000, loop: false },
  },
  goblin: {
    idle:   { frames: 4,  sheetW: 600,  dur: 800,  loop: true },
    attack: { frames: 8,  sheetW: 1200, dur: 700,  loop: false },
    hit:    { frames: 4,  sheetW: 600,  dur: 450,  loop: false },
    death:  { frames: 4,  sheetW: 600,  dur: 1000, loop: false },
  },
  mushroom: {
    idle:   { frames: 4,  sheetW: 600,  dur: 800,  loop: true },
    attack: { frames: 8,  sheetW: 1200, dur: 700,  loop: false },
    hit:    { frames: 4,  sheetW: 600,  dur: 450,  loop: false },
    death:  { frames: 4,  sheetW: 600,  dur: 1000, loop: false },
  },
  skeleton: {
    idle:   { frames: 4,  sheetW: 600,  dur: 800,  loop: true },
    attack: { frames: 8,  sheetW: 1200, dur: 700,  loop: false },
    hit:    { frames: 4,  sheetW: 600,  dur: 450,  loop: false },
    death:  { frames: 4,  sheetW: 600,  dur: 1000, loop: false },
  },
  rat: {
    idle:   { frames: 10, sheetW: 700,  dur: 800,  loop: true },
    attack: { frames: 12, sheetW: 840,  dur: 700,  loop: false },
    hit:    { frames: 3,  sheetW: 210,  dur: 450,  loop: false },
    death:  { frames: 6,  sheetW: 420,  dur: 1000, loop: false },
  },
  mimic: {
    idle:   { frames: 9,  sheetW: 1314, dur: 900,  loop: true },
    attack: { frames: 14, sheetW: 2044, dur: 750,  loop: false },
    hit:    { frames: 3,  sheetW: 438,  dur: 450,  loop: false },
    death:  { frames: 6,  sheetW: 876,  dur: 1000, loop: false },
  },
  boss: {
    idle:   { frames: 10, sheetW: 1400, dur: 800,  loop: true },
    attack: { frames: 13, sheetW: 1820, dur: 800,  loop: false },
    hit:    { frames: 3,  sheetW: 420,  dur: 450,  loop: false },
    death:  { frames: 18, sheetW: 2520, dur: 1200, loop: false },
  },
};
