// Tests de hechizos nuevos (efectos damageAll, healAll, shieldAlly, cleanse).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { content } from '../src/data/index.js';
import { applyCurse } from '../src/systems/curses.js';
import {
  initCombat, rollActiveHero, heroCast, activeHero,
} from '../src/systems/combat.js';

const node = content.chaptersById.cap1.nodes.find((n) => n.id === 'c1n07');
// Nodo c1n07: lanzador(back) + esbirro x3 → varios objetivos para AoE

function makeCombat(party, difficulty = 'facil') {
  return initCombat({ node, party, difficulty });
}

// ---- AoE (damageAll) ----

test('tormenta_arcana daña a TODOS los enemigos vivos', () => {
  const rng = createRng(1);
  let c = makeCombat(['mago']);
  c = rollActiveHero(c, rng);
  c.heroes[0].energy = 5; // forzar energía
  const before = c.enemies.map((e) => e.hp);
  c = heroCast(c, 'tormenta_arcana', 'irrelevant');
  // Todos los enemigos recibieron daño
  assert.ok(c.enemies.every((e, i) => e.hp < before[i]));
  assert.ok(c.log.some((l) => l.kind === 'spell' && l.anim === 'aoe'));
});

test('lluvia_cuchillos daña a TODOS los enemigos desde retaguardia', () => {
  const rng = createRng(2);
  let c = makeCombat(['picara']);
  c = rollActiveHero(c, rng);
  c.heroes[0].energy = 5;
  const enemyCount = c.enemies.filter((e) => e.hp > 0).length;
  c = heroCast(c, 'lluvia_cuchillos', 'irrelevant');
  const hit = c.log.filter((l) => l.kind === 'spell' && l.anim === 'aoe');
  assert.ok(hit.length > 0);
  // AoE log lleva targets array con todos los enemigos
  const targets = hit[0].targets;
  assert.equal(targets.length, enemyCount);
});

// ---- Heal-all (healAll) ----

test('aura_curativa cura a TODOS los aliados vivos', () => {
  const rng = createRng(3);
  let c = makeCombat(['sanadora', 'guerrera', 'mago']);
  // Herir a todos
  c.heroes.forEach((h) => { h.hp = 3; });
  c = rollActiveHero(c, rng);
  c.heroes[0].energy = 5;
  c = heroCast(c, 'aura_curativa', 'irrelevant');
  // Todos los aliados vivos recibieron curación
  assert.ok(c.heroes.every((h) => h.hp >= 3 + 3)); // +3 de aura
  assert.ok(c.log.some((l) => l.anim === 'heal_all'));
});

test('aura_curativa no supera el maxHp', () => {
  const rng = createRng(3);
  let c = makeCombat(['sanadora']);
  c = rollActiveHero(c, rng);
  c.heroes[0].energy = 5;
  const maxHp = c.heroes[0].maxHp;
  c = heroCast(c, 'aura_curativa', 'irrelevant');
  assert.equal(c.heroes[0].hp, maxHp);
});

// ---- Shield ally (shieldAlly) ----

test('escudo_sagrado concede bloqueo a un aliado', () => {
  const rng = createRng(4);
  let c = makeCombat(['paladin', 'mago']);
  c = rollActiveHero(c, rng);
  c.heroes[0].energy = 5;
  const magoBefore = c.heroes.find((h) => h.id === 'mago').block;
  c = heroCast(c, 'escudo_sagrado', 'mago');
  const magoAfter = c.heroes.find((h) => h.id === 'mago').block;
  assert.equal(magoAfter, magoBefore + 3);
  assert.ok(c.log.some((l) => l.anim === 'shield'));
});

// ---- Cleanse ----

test('purificar elimina todas las maldiciones de un aliado', () => {
  const rng = createRng(5);
  let c = makeCombat(['paladin', 'mago']);
  c.heroes[1] = applyCurse(c.heroes[1], 'sangria');
  c.heroes[1] = applyCurse(c.heroes[1], 'debilidad');
  assert.equal(c.heroes[1].curses.length, 2);
  c = rollActiveHero(c, rng);
  c.heroes[0].energy = 5;
  c = heroCast(c, 'purificar', 'mago');
  assert.equal(c.heroes.find((h) => h.id === 'mago').curses.length, 0);
  assert.ok(c.log.some((l) => l.anim === 'cleanse'));
});

test('purificar en aliado sin maldiciones no causa error', () => {
  const rng = createRng(6);
  let c = makeCombat(['sanadora', 'guerrera']);
  c = rollActiveHero(c, rng);
  c.heroes[0].energy = 5;
  assert.doesNotThrow(() => { c = heroCast(c, 'purificar', 'guerrera'); });
});

// ---- Todos los héroes tienen al menos 2 hechizos ----
test('cada héroe tiene al menos 2 hechizos asignados', () => {
  for (const hero of content.heroes) {
    assert.ok(
      hero.spells.length >= 2,
      `${hero.id} solo tiene ${hero.spells.length} hechizo(s)`,
    );
    for (const sid of hero.spells) {
      assert.ok(content.spellsById[sid], `${hero.id}: hechizo '${sid}' no existe`);
    }
  }
});
