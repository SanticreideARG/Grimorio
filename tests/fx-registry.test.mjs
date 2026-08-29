import test from 'node:test';
import assert from 'node:assert/strict';

import { FX_PROFILES, resolveFxProfile } from '../src/ui/combat/fxRegistry.js';

test('las cinco familias nuevas tienen perfil visual completo', () => {
  for (const id of ['tide', 'pearl', 'eclipse', 'time', 'void']) {
    assert.ok(FX_PROFILES[id].color);
    assert.ok(FX_PROFILES[id].projectile);
    assert.ok(FX_PROFILES[id].signature);
  }
});

test('fxId prevalece sobre school y un id desconocido usa fallback arcano', () => {
  assert.equal(resolveFxProfile({ school: 'fire', fxId: 'tide' }).id, 'tide');
  assert.equal(resolveFxProfile({ fxId: 'missing' }).projectile, 'arcane');
});

