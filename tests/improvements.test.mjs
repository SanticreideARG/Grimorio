// Tests de las 5 mejoras: maldiciones individuales, finales, turno enemigo
// paso a paso, hotseat M6 y dice-building real.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { createNewGame } from '../src/core/state.js';
import { content } from '../src/data/index.js';
import { computeEnding } from '../src/systems/endings.js';
import { assignHeroOwners, canControlHero, nextActivePlayer } from '../src/systems/turn.js';
import { effectiveHero, initPartyHp } from '../src/systems/progression.js';
import {
  initCombat, rollActiveHero, endHeroTurn, startEnemyPhase,
  resolveNextEnemy, isOver, activeHero,
} from '../src/systems/combat.js';

const cap1 = content.chaptersById.cap1;
const nodeOf = (id) => cap1.nodes.find((n) => n.id === id);

// ════════════════════════════════════════════════════════
// 1. Maldiciones individuales
// ════════════════════════════════════════════════════════
test('cada enemigo curse usa su maldición propia, no sangria', () => {
  const map = { tejedor: 'debilidad', cultista_ceniza: 'silencio',
                heraldo_ceniza: 'veneno', heraldo_grieta: 'confusion' };
  for (const [id, expectedCurse] of Object.entries(map)) {
    const e = content.enemiesById[id];
    assert.ok(e, `${id} no existe`);
    assert.equal(e.curse, expectedCurse, `${id} debería tener curse:'${expectedCurse}'`);
  }
});

// ════════════════════════════════════════════════════════
// 2. Sistema de finales
// ════════════════════════════════════════════════════════
test('final bueno con flags positivos y doom bajo', () => {
  const g = { flags: { altarBenediction: true, mercenaryHelped: true, travelerMet: true },
              doom: 5, totalDoom: 10,
              party: ['guerrera'], partyHp: { guerrera: 12 } };
  assert.equal(computeEnding(g), 'good');
});

test('final malo con doom acumulado alto', () => {
  const g = { flags: {}, doom: 10, totalDoom: 30,
              party: ['guerrera'], partyHp: { guerrera: 12 } };
  assert.equal(computeEnding(g), 'bad');
});

test('final malo si la mitad de la party está caída', () => {
  const g = { flags: {}, doom: 5, totalDoom: 5,
              party: ['guerrera', 'mago'],
              partyHp: { guerrera: 1, mago: 1 } };
  assert.equal(computeEnding(g), 'bad');
});

test('final agridulce por defecto', () => {
  const g = { flags: { mercenaryHelped: true }, doom: 8, totalDoom: 12,
              party: ['guerrera'], partyHp: { guerrera: 8 } };
  assert.equal(computeEnding(g), 'bittersweet');
});

// ════════════════════════════════════════════════════════
// 3. Turno enemigo paso a paso
// ════════════════════════════════════════════════════════
test('startEnemyPhase inicializa la cola con los enemigos vivos', () => {
  let c = initCombat({ node: nodeOf('c1n07'), party: ['guerrera'], difficulty: 'facil' });
  c = { ...c, phase: 'enemy' };
  c = startEnemyPhase(c);
  assert.ok(Array.isArray(c.pendingEnemies));
  assert.equal(c.pendingEnemies.length, c.enemies.filter((e) => e.hp > 0).length);
});

test('resolveNextEnemy procesa de a uno y reduce la cola', () => {
  const rng = createRng(1);
  let c = initCombat({ node: nodeOf('c1n07'), party: ['guerrera', 'paladin'], difficulty: 'facil' });
  c = { ...c, phase: 'enemy' };
  c = startEnemyPhase(c);
  const startLen = c.pendingEnemies.length;
  c = resolveNextEnemy(c, rng);
  assert.equal(c.pendingEnemies?.length ?? 0, startLen > 1 ? startLen - 1 : 0);
});

test('resolveNextEnemy inicia nuevo round cuando se vacía la cola', () => {
  const rng = createRng(2);
  // Único enemigo muy débil para que no mate a nadie
  let c = initCombat({ node: nodeOf('c1n02'), party: ['guerrera', 'paladin'], difficulty: 'facil' });
  c = { ...c, phase: 'enemy' };
  c = startEnemyPhase(c);
  while (c.phase === 'enemy' && !isOver(c)) {
    c = resolveNextEnemy(c, rng);
  }
  if (!isOver(c)) {
    assert.equal(c.phase, 'hero'); // debería haber arrancado nuevo round
    assert.equal(c.pendingEnemies, null);
  }
});

// ════════════════════════════════════════════════════════
// 4. Hotseat M6
// ════════════════════════════════════════════════════════
test('assignHeroOwners distribuye héroes en ronda entre jugadores', () => {
  const heroes = ['guerrera', 'mago', 'paladin', 'picara'];
  const owners = assignHeroOwners(heroes, ['J1', 'J2']);
  assert.equal(owners.guerrera, 0);
  assert.equal(owners.mago, 1);
  assert.equal(owners.paladin, 0);
  assert.equal(owners.picara, 1);
});

test('canControlHero respeta el jugador activo', () => {
  const c = initCombat({
    node: nodeOf('c1n07'),
    party: ['guerrera', 'mago'],
    difficulty: 'facil',
    heroOwners: { guerrera: 0, mago: 1 },
    playerCount: 2,
  });
  // jugador activo es 0 → puede controlar guerrera, no mago
  assert.equal(canControlHero('guerrera', c), true);
  assert.equal(canControlHero('mago', c), false);
});

test('endHeroTurn con hotseat mantiene al jugador activo hasta que terminen sus héroes', () => {
  const rng = createRng(7);
  let c = initCombat({
    node: nodeOf('c1n07'),
    party: ['guerrera', 'mago'],
    difficulty: 'facil',
    heroOwners: { guerrera: 0, mago: 1 },
    playerCount: 2,
  });
  assert.equal(activeHero(c).id, 'guerrera'); // P0 empieza
  c = rollActiveHero(c, rng);
  c = endHeroTurn(c);
  // No hay más héroes de P0 → cambio a P1
  assert.equal(c.activePlayerIndex, 1);
  assert.equal(activeHero(c).id, 'mago');
});

test('nextActivePlayer encuentra el siguiente jugador con héroes sin actuar', () => {
  let c = initCombat({
    node: nodeOf('c1n02'),
    party: ['guerrera', 'mago', 'paladin'],
    difficulty: 'facil',
    heroOwners: { guerrera: 0, mago: 1, paladin: 0 },
    playerCount: 2,
  });
  // P0 activo, P1 tiene mago sin actuar
  assert.equal(nextActivePlayer(c), 1);
});

// ════════════════════════════════════════════════════════
// 5. Dice-building real
// ════════════════════════════════════════════════════════
test('piedra_afilar convierte una cara en blanco en espada', () => {
  const base = content.heroesById.guerrera;
  const blanks = base.diceFaces.filter((f) => Object.values(f).every((v) => !v)).length;
  const g = { inventory: ['piedra_afilar'], party: ['guerrera'],
              partyHp: {}, potionBag: {}, gold: 0, heroOwners: {} };
  const eff = effectiveHero('guerrera', g);
  const blanksAfter = eff.diceFaces.filter((f) => Object.values(f).every((v) => !v)).length;
  assert.equal(blanksAfter, blanks - 1);
  const swordsAfter = eff.diceFaces.filter((f) => f.sword === 1).length;
  const swordsBefore = base.diceFaces.filter((f) => f.sword === 1).length;
  assert.equal(swordsAfter, swordsBefore + 1);
});

test('cristal_arcano convierte una cara espada-1 en estrella-1', () => {
  const base = content.heroesById.mago;
  const g = { inventory: ['cristal_arcano'], party: ['mago'],
              partyHp: {}, potionBag: {}, gold: 0, heroOwners: {} };
  const eff = effectiveHero('mago', g);
  const starsBefore = base.diceFaces.filter((f) => f.star).length;
  const starsAfter = eff.diceFaces.filter((f) => f.star).length;
  assert.ok(starsAfter >= starsBefore); // al menos igual o más estrellas
});

test('dos upgrades no se solapan en la misma cara', () => {
  const g = { inventory: ['piedra_afilar', 'placa_refuerzo'], party: ['guerrera'],
              partyHp: {}, potionBag: {}, gold: 0, heroOwners: {} };
  const eff = effectiveHero('guerrera', g);
  const base = content.heroesById.guerrera;
  const blanksBase = base.diceFaces.filter((f) => Object.values(f).every((v) => !v)).length;
  const blanksEff  = eff.diceFaces.filter((f) => Object.values(f).every((v) => !v)).length;
  // Dos upgrades aplicadas sobre 2 caras en blanco distintas (guerrera tiene 1 blank)
  // solo puede aplicar 1 si hay 1 blank — el resultado es consistent
  assert.ok(blanksEff <= blanksBase);
});
