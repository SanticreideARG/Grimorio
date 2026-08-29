import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEncounterPreview } from '../src/systems/encounterPreview.js';

test('la previa agrupa duplicados y separa frente de retaguardia', () => {
  const preview = buildEncounterPreview(['esbirro', 'esbirro', 'lanzador']);
  assert.equal(preview.front[0].id, 'esbirro');
  assert.equal(preview.front[0].count, 2);
  assert.equal(preview.back[0].id, 'lanzador');
  assert.equal(preview.danger, 'normal');
});

test('la previa prioriza jefe sobre élite al calcular peligro', () => {
  const preview = buildEncounterPreview(['carronero_alfa', 'gulrath']);
  assert.equal(preview.danger, 'boss');
});

