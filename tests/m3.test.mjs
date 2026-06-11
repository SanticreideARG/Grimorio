// Tests de subsistemas M3: doom, curses, decks, events, boss behavior deck.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { createNewGame } from '../src/core/state.js';
import { addDoom, isOverflow, resetDoom } from '../src/systems/doom.js';
import { applyCurse, tickCurses, cleanseCurses, spellsBlocked, postRollReduction } from '../src/systems/curses.js';
import { initDecks, drawCard, discardCard } from '../src/systems/decks.js';
import { passesCheck, drawEventCard, resolveEvent } from '../src/systems/events.js';
import { addPet, getDiceBonus } from '../src/systems/pets.js';
import { content } from '../src/data/index.js';
import {
  initCombat, rollActiveHero, heroCast, endHeroTurn, resolveEnemyPhase,
  activeHero, isOver,
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
  let h = applyCurse(hero, 'silencio'); // duración 3
  assert.equal(h.curses.length, 1);
  h = tickCurses(h); // 2
  h = tickCurses(h); // 1
  assert.equal(h.curses.length, 1);
  h = tickCurses(h); // 0 → expira
  assert.equal(h.curses.length, 0);
});

test('cleanseCurses elimina todas las maldiciones', () => {
  let h = { id: 'mago', curses: [] };
  h = applyCurse(h, 'sangria');
  h = applyCurse(h, 'silencio');
  h = cleanseCurses(h);
  assert.equal(h.curses.length, 0);
});

test('postRollReduction suma las penalizaciones por hook', () => {
  let h = { id: 'mago', curses: [] };
  assert.equal(postRollReduction(h, 'reduceStar'), 0);
  h = applyCurse(h, 'silencio');  // reduceStar, power 1
  h = applyCurse(h, 'confusion'); // reduceSword, power 1
  assert.equal(postRollReduction(h, 'reduceStar'), 1);
  assert.equal(postRollReduction(h, 'reduceSword'), 1);
  assert.equal(spellsBlocked(h), false); // ninguna maldición bloquea hechizos ya
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
  const { cardId, poolId = 'eventos' } = g.activeEvent;
  const pool = content.decks[poolId] ?? content.decks.eventos;
  const card = pool.find((c) => c.id === cardId);
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

test('diceBonus de mascotas añade dados al pool en combate', () => {
  const rng = createRng(5);
  let c = initCombat({ node: nodeOf('c1n02'), party: ['guerrera'], difficulty: 'facil', diceBonus: 1 });
  c = rollActiveHero(c, rng);
  // guerrera tira 4 dados + 1 del Cuervo = 5
  assert.equal(activeHero(c).pool.faces.length, 5);
});

// ---- Efecto de maldiciones en combate (M3) ----
test('pendingCurses se aplican a toda la party al iniciar combate', () => {
  const c = initCombat({
    node: nodeOf('c1n02'), party: ['guerrera', 'mago'],
    difficulty: 'facil', pendingCurses: ['debilidad'],
  });
  assert.ok(c.heroes.every((h) => h.curses.some((cu) => cu.id === 'debilidad')));
  assert.ok(c.log.some((l) => l.kind === 'curse'));
});

test('maldición Confusión resta espadas tras la tirada (reduceSword)', () => {
  // Misma semilla → mismas caras; confusión solo resta del resultado, no quita dados.
  let base = initCombat({ node: nodeOf('c1n02'), party: ['guerrera'], difficulty: 'facil' });
  base = rollActiveHero(base, createRng(5));
  const baseSword = activeHero(base).pool.sword;

  let c = initCombat({ node: nodeOf('c1n02'), party: ['guerrera'], difficulty: 'facil' });
  c.heroes[0] = applyCurse(c.heroes[0], 'confusion'); // reduceSword power 1
  c = rollActiveHero(c, createRng(5));
  assert.equal(activeHero(c).pool.faces.length, 4); // no quita dados
  assert.equal(activeHero(c).pool.sword, Math.max(0, baseSword - 1));
});

test('maldición Silencio resta estrellas y ya no bloquea hechizos', () => {
  let base = initCombat({ node: nodeOf('c1n07'), party: ['mago'], difficulty: 'facil' });
  base = rollActiveHero(base, createRng(3));
  const baseStar = activeHero(base).pool.star;

  let c = initCombat({ node: nodeOf('c1n07'), party: ['mago'], difficulty: 'facil' });
  c.heroes[0] = applyCurse(c.heroes[0], 'silencio'); // reduceStar power 1
  c = rollActiveHero(c, createRng(3));
  assert.equal(activeHero(c).pool.star, Math.max(0, baseStar - 1));
  assert.equal(spellsBlocked(activeHero(c)), false);

  // El hechizo SÍ surte efecto: silencio ya no impide lanzar.
  c.heroes[0].energy = 5;
  const target = c.enemies.find((e) => e.hp > 0);
  const cast = heroCast(c, 'bola_fuego', target.uid);
  assert.notDeepEqual(cast.enemies, c.enemies);
});

test('maldición Sangría inflige daño al inicio del turno del héroe (dotDamage)', () => {
  const rng = createRng(2);
  let c = initCombat({ node: nodeOf('c1n02'), party: ['guerrera'], difficulty: 'facil' });
  c.heroes[0] = applyCurse(c.heroes[0], 'sangria'); // dotDamage power 2
  const before = c.heroes[0].hp;
  c = rollActiveHero(c, rng); // el daño por turno se aplica al tirar
  assert.equal(before - activeHero(c).hp, 2);
});

// ---- Habilidades pasivas/activas nuevas ----
test('Veyra (foco): endHeroTurn marca el bonus si termina con maná sobrante', () => {
  let c = initCombat({ node: nodeOf('c1n07'), party: ['mago'], difficulty: 'facil' });
  c = rollActiveHero(c, createRng(3));
  c.heroes[0].energy = 2; // le sobra maná
  c = endHeroTurn(c);
  assert.equal(c.heroes[0].focusBonus, 1);
});

test('Veyra (foco): el maná conservado suma +1 a la tirada siguiente', () => {
  // baseline sin foco
  let base = initCombat({ node: nodeOf('c1n07'), party: ['mago'], difficulty: 'facil' });
  base = rollActiveHero(base, createRng(3));
  const baseEnergy = base.heroes[0].energy;
  // misma semilla, con foco pendiente → +1 y se consume
  let c = initCombat({ node: nodeOf('c1n07'), party: ['mago'], difficulty: 'facil' });
  c.heroes[0].focusBonus = 1;
  c = rollActiveHero(c, createRng(3));
  assert.equal(c.heroes[0].energy, baseEnergy + 1);
  assert.equal(c.heroes[0].focusBonus, 0);
});

test('Guardia de Brenna otorga +1 de bloqueo al lanzador', () => {
  let c = initCombat({ node: nodeOf('c1n02'), party: ['guerrera'], difficulty: 'facil' });
  c = rollActiveHero(c, createRng(5));
  c.heroes[0].energy = 3; // asegurar maná para el coste
  const before = c.heroes[0].block;
  c = heroCast(c, 'guardia', c.heroes[0].id);
  assert.equal(c.heroes[0].block, before + 1);
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
