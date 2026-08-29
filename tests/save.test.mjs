// Tests de persistencia en slots usando un backend en memoria (sin localStorage).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import {
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  listSlots,
  exportSave,
  importSave,
  saveTimestamp,
  SLOT_COUNT,
} from '../src/core/save.js';

/** Crea un backend de almacenamiento en memoria por test (aislado). */
function memStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
  };
}

test('save/load round-trip en un slot', () => {
  const store = memStorage();
  const g = createNewGame({ seed: 42 });
  saveToSlot(0, g, store);
  const loaded = loadFromSlot(0, store);
  assert.equal(loaded.seed, 42);
});

test('slot vacío devuelve null', () => {
  const store = memStorage();
  assert.equal(loadFromSlot(1, store), null);
});

test('listSlots refleja vacío/ocupado', () => {
  const store = memStorage();
  saveToSlot(2, createNewGame({ difficulty: 'facil' }), store);
  const slots = listSlots(store);
  assert.equal(slots.length, SLOT_COUNT);
  assert.equal(slots[0].empty, true);
  assert.equal(slots[2].empty, false);
  assert.equal(slots[2].meta.difficulty, 'facil');
});

test('deleteSlot vacía un slot', () => {
  const store = memStorage();
  saveToSlot(0, createNewGame(), store);
  deleteSlot(0, store);
  assert.equal(loadFromSlot(0, store), null);
});

test('slot fuera de rango lanza', () => {
  const store = memStorage();
  assert.throws(() => saveToSlot(5, createNewGame(), store));
  assert.throws(() => loadFromSlot(-1, store));
});

test('export/import preserva la partida', () => {
  const g = createNewGame({ seed: 999, difficulty: 'dificil' });
  const json = exportSave(g);
  const back = importSave(json);
  assert.equal(back.seed, 999);
  assert.equal(back.difficulty, 'dificil');
});

test('save actualiza updatedAt', () => {
  const store = memStorage();
  const g = createNewGame({ seed: 1 });
  const before = g.updatedAt;
  // forzamos un updatedAt anterior para verificar el touch
  g.updatedAt = before - 1000;
  saveToSlot(0, g, store);
  assert.ok(g.updatedAt >= before - 1000);
});

test('save puede cachear una copia remota sin alterar updatedAt', () => {
  const storage = memStorage();
  const game = createNewGame({ seed: 42 });
  game.updatedAt = 1767323045000;

  saveToSlot(0, game, storage, { touchUpdatedAt: false });

  assert.equal(loadFromSlot(0, storage).updatedAt, 1767323045000);
});

test('saveTimestamp compara epoch numérico y fechas ISO', () => {
  assert.equal(saveTimestamp(1767323045000), 1767323045000);
  assert.equal(saveTimestamp('2026-01-02T03:04:05.000Z'), 1767323045000);
  assert.equal(saveTimestamp('fecha-inválida'), 0);
});
