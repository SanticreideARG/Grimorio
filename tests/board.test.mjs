// Tests del motor de tablero: selectores y avance lineal por el Cap.1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import {
  getChapter,
  getNodes,
  getCurrentNode,
  isCurrentResolved,
  isLastNode,
  isChapterComplete,
  resolveNode,
  advanceNode,
} from '../src/systems/board.js';

test('Cap.1 está cargado con 16 nodos y empieza en start', () => {
  const g = createNewGame();
  const ch = getChapter(g);
  assert.equal(ch.id, 'cap1');
  assert.equal(getNodes(g).length, 16);
  assert.equal(getCurrentNode(g).type, 'start');
  assert.equal(getNodes(g).at(-1).type, 'boss');
});

test('todos los nodos tienen pos en rango 0..100 y id único', () => {
  const g = createNewGame();
  const ids = new Set();
  for (const n of getNodes(g)) {
    assert.ok(n.pos.x >= 0 && n.pos.x <= 100, `x fuera de rango en ${n.id}`);
    assert.ok(n.pos.y >= 0 && n.pos.y <= 100, `y fuera de rango en ${n.id}`);
    assert.ok(!ids.has(n.id), `id duplicado: ${n.id}`);
    ids.add(n.id);
  }
});

test('resolver marca visitado y registra log (idempotente)', () => {
  let g = createNewGame();
  assert.equal(isCurrentResolved(g), false);
  const r1 = resolveNode(g);
  g = r1.state;
  assert.equal(isCurrentResolved(g), true);
  assert.equal(g.visited.length, 1);
  assert.equal(g.log.length, 1);
  // resolver de nuevo no duplica
  const r2 = resolveNode(g);
  assert.equal(r2.entry, null);
  assert.equal(r2.state.visited.length, 1);
});

test('no se puede avanzar sin resolver el nodo actual', () => {
  const g = createNewGame();
  const same = advanceNode(g);
  assert.equal(same.nodeIndex, 0);
});

test('recorrido completo del Cap.1 de punta a punta', () => {
  let g = createNewGame({ seed: 1 });
  let guard = 0;
  while (!isChapterComplete(g) && guard++ < 100) {
    g = resolveNode(g).state;
    if (!isLastNode(g)) g = advanceNode(g);
  }
  assert.equal(isChapterComplete(g), true);
  assert.equal(g.visited.length, 16);
  assert.equal(getCurrentNode(g).type, 'boss');
});

test('avanzar en el último nodo no se sale del rango', () => {
  let g = createNewGame();
  // llevar al último nodo
  let guard = 0;
  while (!isLastNode(g) && guard++ < 100) {
    g = resolveNode(g).state;
    g = advanceNode(g);
  }
  g = resolveNode(g).state;
  const after = advanceNode(g);
  assert.equal(after.nodeIndex, getNodes(g).length - 1);
});
