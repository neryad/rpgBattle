import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPRITES, ANIMS } from '../sprites.js';

const CELL = {
  warrior: 135, mage: 231, hunter: 100,
  worm: 90, flyingeye: 150, goblin: 150, mushroom: 150, skeleton: 150,
};

test('todas las animaciones requeridas existen y tienen datos válidos', () => {
  for (const [name, anims] of Object.entries(SPRITES)) {
    for (const anim of ANIMS) {
      const cfg = anims[anim];
      assert.ok(cfg, `${name} no tiene la animación "${anim}"`);
      assert.ok(Number.isInteger(cfg.frames) && cfg.frames > 0, `${name}.${anim} frames inválido`);
      assert.ok(Number.isFinite(cfg.sheetW), `${name}.${anim} sheetW inválido`);
      assert.ok(Number.isFinite(cfg.dur), `${name}.${anim} dur inválido`);
      assert.equal(typeof cfg.loop, 'boolean', `${name}.${anim} loop inválido`);
    }
  }
});

test('el ancho de hoja coincide con frames × celda (evita errores de tipeo)', () => {
  for (const [name, anims] of Object.entries(SPRITES)) {
    for (const [anim, cfg] of Object.entries(anims)) {
      assert.equal(cfg.sheetW, cfg.frames * CELL[name], `${name}.${anim} hoja=${cfg.sheetW} pero frames*celda=${cfg.frames * CELL[name]}`);
    }
  }
});