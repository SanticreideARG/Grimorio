// Tests del estado central: creación, (de)serialización y migración.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createNewGame,
  serialize,
  deserialize,
  migrate,
  SAVE_VERSION,
} from '../src/core/state.js';

test('createNewGame produce un estado válido por defecto', () => {
  const g = createNewGame();
  assert.equal(g.version, SAVE_VERSION);
  assert.equal(g.difficulty, 'normal');
  assert.equal(g.chapterIndex, 0);
  assert.equal(g.doom, 0);
  assert.equal(g.gold, 0);
  assert.deepEqual(g.party, []);
  assert.equal(typeof g.seed, 'number');
  assert.equal(g.rngState, g.seed >>> 0);
});

test('createNewGame respeta opciones', () => {
  const g = createNewGame({ seed: 777, difficulty: 'dificil', players: ['A', 'B'] });
  assert.equal(g.seed, 777);
  assert.equal(g.difficulty, 'dificil');
  assert.deepEqual(g.players, ['A', 'B']);
});

test('dificultad inválida cae a normal', () => {
  const g = createNewGame({ difficulty: 'imposible' });
  assert.equal(g.difficulty, 'normal');
});

test('serialize/deserialize es round-trip', () => {
  const g = createNewGame({ seed: 123 });
  const back = deserialize(serialize(g));
  assert.deepEqual(back, g);
});

test('deserialize de objeto inválido lanza', () => {
  assert.throws(() => deserialize('null'));
});

test('migrate completa version faltante', () => {
  const m = migrate({ foo: 'bar' });
  assert.equal(m.version, SAVE_VERSION);
});
