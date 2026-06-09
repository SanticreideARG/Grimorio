// sprintb.test.mjs — Tests de Sprint B:
//   • Pools de eventos por capítulo
//   • drawEventCard usa el eventPool del nodo (no hardcoded)
//   • Sistema de finales ampliado (nuevos flags)
//   • Estructura y coherencia de las cartas nuevas

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { createNewGame } from '../src/core/state.js';
import { initDecks } from '../src/systems/decks.js';
import { drawEventCard, resolveEvent } from '../src/systems/events.js';
import { computeEnding } from '../src/systems/endings.js';
import { content } from '../src/data/index.js';

// ---- Pools de eventos --------------------------------------------------------

test('todos los pools de evento existen en content.decks', () => {
  const expectedPools = ['eventos', 'eventos_cap2', 'eventos_cap3', 'eventos_cap4'];
  for (const pool of expectedPools) {
    assert.ok(
      Array.isArray(content.decks[pool]) && content.decks[pool].length > 0,
      `pool "${pool}" vacío o inexistente`,
    );
  }
});

test('cada pool tiene al menos 3 cartas', () => {
  const pools = ['eventos', 'eventos_cap2', 'eventos_cap3', 'eventos_cap4'];
  for (const pool of pools) {
    assert.ok(content.decks[pool].length >= 3, `pool "${pool}" tiene menos de 3 cartas`);
  }
});

test('todos los ids de cartas son únicos en cada pool', () => {
  const pools = ['eventos', 'eventos_cap2', 'eventos_cap3', 'eventos_cap4'];
  for (const pool of pools) {
    const ids = content.decks[pool].map((c) => c.id);
    const unique = new Set(ids);
    assert.equal(unique.size, ids.length, `pool "${pool}" tiene ids duplicados`);
  }
});

test('toda carta tiene title, text y al menos una elección', () => {
  const allPools = ['eventos', 'eventos_cap2', 'eventos_cap3', 'eventos_cap4'];
  for (const poolId of allPools) {
    for (const card of content.decks[poolId]) {
      assert.ok(card.title?.length > 0,    `${card.id}: sin título`);
      assert.ok(card.text?.length > 0,     `${card.id}: sin texto`);
      assert.ok(card.choices?.length >= 1, `${card.id}: sin elecciones`);
    }
  }
});

test('los capítulos 2-4 usan sus propios pools de evento', () => {
  const expectedPools = {
    cap2: 'eventos_cap2',
    cap3: 'eventos_cap3',
    cap4: 'eventos_cap4',
  };
  for (const [capId, expectedPool] of Object.entries(expectedPools)) {
    const chapter = content.chaptersById[capId];
    const eventNodes = chapter.nodes.filter((n) => n.type === 'event');
    assert.ok(eventNodes.length > 0, `${capId} no tiene nodos de evento`);
    for (const node of eventNodes) {
      assert.equal(
        node.eventPool,
        expectedPool,
        `${node.id} en ${capId} usa "${node.eventPool}" en lugar de "${expectedPool}"`,
      );
    }
  }
});

test('cap1 sigue usando el pool "eventos"', () => {
  const chapter = content.chaptersById.cap1;
  for (const node of chapter.nodes.filter((n) => n.type === 'event')) {
    assert.equal(node.eventPool, 'eventos', `${node.id} no usa "eventos"`);
  }
});

// ---- drawEventCard usa el pool del nodo actual -------------------------------

test('drawEventCard en cap1 roba del pool "eventos"', () => {
  const rng = createRng(42);
  let g = createNewGame({ seed: 42 });
  g = { ...g, decks: initDecks(rng) };
  // cap1, nodo índice 0 = start; avanzar al primer event node (índice 2 = c1n03)
  g = { ...g, chapterIndex: 0, nodeIndex: 2 }; // c1n03 eventPool:'eventos'
  g = drawEventCard(g, rng);
  assert.equal(g.activeEvent?.poolId, 'eventos');
  assert.ok(g.activeEvent?.cardId);
});

test('drawEventCard en cap2 roba del pool "eventos_cap2"', () => {
  const rng = createRng(10);
  let g = createNewGame({ seed: 10 });
  g = { ...g, decks: initDecks(rng) };
  // cap2, nodo índice 2 = c2n03 eventPool:'eventos_cap2'
  g = { ...g, chapterIndex: 1, nodeIndex: 2 };
  g = drawEventCard(g, rng);
  assert.equal(g.activeEvent?.poolId, 'eventos_cap2');
});

test('drawEventCard en cap4 roba del pool "eventos_cap4"', () => {
  const rng = createRng(5);
  let g = createNewGame({ seed: 5 });
  g = { ...g, decks: initDecks(rng) };
  // cap4, nodo índice 2 = c4n03 eventPool:'eventos_cap4'
  g = { ...g, chapterIndex: 3, nodeIndex: 2 };
  g = drawEventCard(g, rng);
  assert.equal(g.activeEvent?.poolId, 'eventos_cap4');
});

// ---- Sistema de finales mejorado --------------------------------------------

test('final malo automático si cap4_voidAccepted está activo', () => {
  const state = {
    party: ['guerrera', 'mago'],
    partyHp: { guerrera: 20, mago: 15 },
    totalDoom: 10,
    doom: 5,
    flags: { cap4_voidAccepted: true, cap4_voidRefused: false },
  };
  assert.equal(computeEnding(state), 'bad');
});

test('final malo si totalDoom >= 38', () => {
  const state = {
    party: ['guerrera'],
    partyHp: { guerrera: 20 },
    totalDoom: 40,
    doom: 0,
    flags: {},
  };
  assert.equal(computeEnding(state), 'bad');
});

test('final malo si más de la mitad de la party caída', () => {
  // 3 de 4 héroes con ≤1 HP → survivors (1) < partyTotal/2 (2) → bad
  const state = {
    party: ['guerrera', 'mago', 'sanadora', 'paladin'],
    partyHp: { guerrera: 0, mago: 0, sanadora: 1, paladin: 15 },
    totalDoom: 10,
    doom: 5,
    flags: {},
  };
  assert.equal(computeEnding(state), 'bad');
});

test('final bueno con todos los flags positivos y doom bajo', () => {
  const state = {
    party: ['guerrera', 'mago'],
    partyHp: { guerrera: 20, mago: 15 },
    totalDoom: 15,
    doom: 0,
    flags: {
      cap4_voidRefused: true,
      altarBenediction: true,
      mercenaryHelped: true,
      cap2_blessed: true,
      cap3_pactRefused: true,
    },
  };
  // positiveScore = 2(voidRefused×2) + 1+1+1+1 = 8; >= 5 ✓; doom 15 < 24 ✓
  assert.equal(computeEnding(state), 'good');
});

test('final agridulce sin flags notables y doom moderado', () => {
  const state = {
    party: ['guerrera'],
    partyHp: { guerrera: 10 },
    totalDoom: 20,
    doom: 5,
    flags: {},
  };
  assert.equal(computeEnding(state), 'bittersweet');
});

test('final agridulce si no rechazó el Vacío aunque tenga otros flags', () => {
  // sin cap4_voidRefused, no puede ser 'good' aunque tenga muchos flags
  const state = {
    party: ['guerrera', 'mago'],
    partyHp: { guerrera: 20, mago: 15 },
    totalDoom: 10,
    doom: 0,
    flags: {
      altarBenediction: true,
      mercenaryHelped: true,
      travelerMet: true,
      cap2_blessed: true,
      cap3_pactRefused: true,
    },
  };
  assert.equal(computeEnding(state), 'bittersweet');
});
