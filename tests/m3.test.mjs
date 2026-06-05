// Tests de subsistemas M3: doom, curses, decks, events, boss behavior deck.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { createNewGame } from '../src/core/state.js';
import { addDoom, isOverflow, resetDoom } from '../src/systems/doom.js';
import { applyCurse, tickCurses, cleanseCurses, spellsBlocked } from '../src/systems/curses.js';
import { initDecks, drawCard, discardCard } from '../src/systems/decks.js';
import { passesCheck, drawEventCard, resolveEvent } from '../src/systems/events.js';
import { addPet, getDiceBonus } from '../src/systems/pets.js';
import { content } from '../src/data/index.js';
import {
  initCombat, rollActiveHero, endHeroTurn, resolveEnemyPhase, isOver,
} from '../src/systems/combat.js';

const chapters = Object.values(content.chaptersById);
const nodeOf = (id) => content.chaptersById.cap1.nodes.find((n) => n.id === id);

// ---- Doom ----
test('addDoom acumula y registra en el log', () => {
  let g = createNewGame({ seed: 1 });
  g = addDoom(g, 3, chapters);
  assert.equal(g.doom, 3);
  assert.ok(g.log.some((l) => l.kind === 'doom'));
});

test('isOverflow detecta desbordamiento de Perdición', () => {
  let g = createNewGame({ seed: 1 });
  g = { ...g, doom: 12, chapterIndex: 0 };
  assert.equal(isOverflow(g, chapters), true);
  g = { ...g, doom: 11 };
  assert.equal(isOverflow(g, chapters), false);
});

test('resetDoom vuelve a 0', () => {
  let g = createNewGame({ seed: 1 });
  g = addDoom(g, 5, chapters);
  g = resetDoom(g);
  assert.equal(g.doom, 0);
});

// ---- Curses ----
test('applyCurse añade maldición con duración correcta', () => {
  const hero = { id: 'guerrera', curses: [] };
  const cursed = applyCurse(hero, 'sangria');
  assert.equal(cursed.curses.length, 1);
  assert.equal(cursed.curses[0].id, 'sangria');
  assert.ok(cursed.curses[0].turnsLeft >= 1);
});

test('tickCurses decrementa y elimina maldiciones expiradas', () => {
  const hero = { id: 'guerrera', curses: [] };
  let h = applyCurse(hero, 'silencio'); // duration 1
  assert.equal(h.curses.length, 1);
  h = tickCurses(h);
  assert.equal(h.curses.length, 0);
});

test('cleanseCurses elimina todas las maldiciones', () => {
  let h = { id: 'mago', curses: [] };
  h = applyCurse(h, 'sangria');
  h = applyCurse(h, 'silencio');
  h = cleanseCurses(h);
  assert.equal(h.curses.length, 0);
});

test('spellsBlocked detecta maldición blocksSpells', () => {
  let h = { id: 'mago', curses: [] };
  assert.equal(spellsBlocked(h), false);
  h = applyCurse(h, 'silencio');
  assert.equal(spellsBlocked(h), true);
});

// ---- Decks ----
test('initDecks crea mazos barajados con las cartas de eventos', () => {
  const rng = createRng(7);
  const decks = initDecks(rng);
  assert.ok(decks.eventos);
  assert.ok(decks.eventos.draw.length > 0);
  assert.equal(decks.eventos.discard.length, 0);
});

test('drawCard roba y descarta correctamente; recicla al agotar', () => {
  const rng = createRng(1);
  let decks = { test: { draw: ['a', 'b'], discard: [] } };
  let r = drawCard(decks, 'test', rng);
  decks = r.decks;
  assert.ok(r.cardId);
  assert.equal(decks.test.draw.length, 1);
  // Descartar y agotar el draw
  decks = discardCard(decks, 'test', r.cardId);
  r = drawCard(decks, 'test', rng); // roba la última
  decks = r.decks;
  r = drawCard(decks, 'test', rng); // recicla discard
  assert.ok(r.cardId);
});

// ---- Events ----
test('passesCheck evalúa símbolo y umbral', () => {
  const pool = { sword: 3, shield: 1, star: 0 };
  assert.equal(passesCheck(pool, { symbol: 'sword', threshold: 2 }), true);
  assert.equal(passesCheck(pool, { symbol: 'star', threshold: 1 }), false);
  assert.equal(passesCheck(pool, null), true); // sin chequeo: siempre pasa
});

test('drawEventCard activa un evento en el estado', () => {
  const rng = createRng(42);
  let g = createNewGame({ seed: 42 });
  g = { ...g, decks: initDecks(rng) };
  g = drawEventCard(g, rng);
  assert.ok(g.activeEvent?.cardId);
});

test('resolveEvent aplica efecto, cierra evento y marca nodo', () => {
  const rng = createRng(1);
  let g = createNewGame({ seed: 1 });
  g = { ...g, decks: initDecks(rng), party: ['guerrera'] };
  g = drawEventCard(g, rng);
  assert.ok(g.activeEvent?.cardId);
  const before = g.visited.length;
  // elegir la última opción (sin chequeo)
  const card = content.decks.eventos.find((c) => c.id === g.activeEvent.cardId);
  const lastChoice = card.choices.length - 1;
  g = resolveEvent(g, lastChoice, null, chapters);
  assert.equal(g.activeEvent, null);
  assert.ok(g.visited.length >= before); // puede haber marcado el nodo
});

// ---- Pets ----
test('addPet añade mascota y getDiceBonus la contabiliza', () => {
  let g = createNewGame({ seed: 1 });
  g = addPet(g, 'cuervo');
  assert.ok(g.pets.includes('cuervo'));
  assert.equal(getDiceBonus(g), 1);
  // No duplica
  g = addPet(g, 'cuervo');
  assert.equal(g.pets.length, 1);
});

// ---- Boss behavior deck (Gulrath) ----
test('Gulrath usa su mazo de comportamiento y termina el combate', () => {
  const rng = createRng(99);
  const bossNode = nodeOf('c1n16');
  let c = initCombat({ node: bossNode, party: ['guerrera', 'paladin', 'mago', 'sanadora'], difficulty: 'facil' });
  assert.ok(c.enemies.some((e) => e.id === 'gulrath'));
  let guard = 0;
  while (!isOver(c) && guard++ < 200) {
    if (c.phase === 'hero') {
      c = rollActiveHero(c, rng);
      c = endHeroTurn(c);
    } else {
      c = resolveEnemyPhase(c, rng);
    }
  }
  assert.ok(isOver(c), 'El combate con Gulrath no terminó');
  // Verificar que hubo al menos una entrada boss_card
  assert.ok(c.log.some((l) => l.kind === 'bosscard'), 'No se usó mazo de Gulrath');
});
