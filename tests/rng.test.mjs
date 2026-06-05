// Tests del RNG con semilla: determinismo y reproducibilidad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng, seedFromString } from '../src/core/rng.js';

test('misma semilla → misma secuencia', () => {
  const a = createRng(12345);
  const b = createRng(12345);
  const seqA = Array.from({ length: 10 }, () => a.next());
  const seqB = Array.from({ length: 10 }, () => b.next());
  assert.deepEqual(seqA, seqB);
});

test('semillas distintas → secuencias distintas', () => {
  const a = createRng(1);
  const b = createRng(2);
  assert.notDeepEqual(
    Array.from({ length: 5 }, () => a.next()),
    Array.from({ length: 5 }, () => b.next())
  );
});

test('next() siempre en [0, 1)', () => {
  const r = createRng(99);
  for (let i = 0; i < 1000; i++) {
    const v = r.next();
    assert.ok(v >= 0 && v < 1, `valor fuera de rango: ${v}`);
  }
});

test('int(min,max) respeta los límites inclusive', () => {
  const r = createRng(7);
  for (let i = 0; i < 1000; i++) {
    const v = r.int(1, 6);
    assert.ok(Number.isInteger(v) && v >= 1 && v <= 6);
  }
});

test('getState/setState restauran la secuencia', () => {
  const r = createRng(555);
  r.next();
  r.next();
  const snapshot = r.getState();
  const after = [r.next(), r.next(), r.next()];
  r.setState(snapshot);
  assert.deepEqual([r.next(), r.next(), r.next()], after);
});

test('shuffle no muta el original y conserva elementos', () => {
  const r = createRng(42);
  const orig = [1, 2, 3, 4, 5];
  const shuffled = r.shuffle(orig);
  assert.deepEqual(orig, [1, 2, 3, 4, 5]);
  assert.deepEqual([...shuffled].sort(), [...orig].sort());
});

test('seedFromString es determinista', () => {
  assert.equal(seedFromString('gulrath'), seedFromString('gulrath'));
  assert.notEqual(seedFromString('gulrath'), seedFromString('tejedora'));
});
