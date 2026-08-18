import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPRITES, ANIMS, CELLS } from '../sprites.js';

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
      const cell = CELLS[name].w;
      assert.equal(cfg.sheetW, cfg.frames * cell, `${name}.${anim} hoja=${cfg.sheetW} pero frames*celda=${cfg.frames * cell}`);
    }
  }
});

test('todas las celdas tienen cellH positivo y finito', () => {
  for (const [name, cell] of Object.entries(CELLS)) {
    assert.ok(Number.isFinite(cell.h) && cell.h > 0, `${name} cellH inválido`);
  }
});
