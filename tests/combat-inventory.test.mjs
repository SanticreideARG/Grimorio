// Tests de inventario en combate y selección de héroe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { content } from '../src/data/index.js';
import {
  initCombat, rollActiveHero, endHeroTurn,
  selectHero, usePotionOnHero, activeHero, isOver,
} from '../src/systems/combat.js';
import { createNewGame } from '../src/core/state.js';
import { initPartyHp, buyPotion, consumePotion, potionCount } from '../src/systems/progression.js';

const node = content.chaptersById.cap1.nodes.find((n) => n.id === 'c1n07'); // 4 enemigos
const party = ['guerrera', 'paladin', 'mago', 'cazador'];

// ---- Selección de héroe ----

test('selectHero cambia el activo antes de tirar dados', () => {
  const rng = createRng(1);
  let c = initCombat({ node, party, difficulty: 'facil' });
  assert.equal(activeHero(c).id, 'guerrera'); // activo inicial
  c = selectHero(c, 2); // seleccionar mago (índice 2)
  assert.equal(activeHero(c).id, 'mago');
});

test('selectHero no funciona después de tirar dados', () => {
  const rng = createRng(1);
  let c = initCombat({ node, party, difficulty: 'facil' });
  c = rollActiveHero(c, rng); // guerrera ya tiró
  const before = c.activeHeroIndex;
  c = selectHero(c, 2); // intento de cambiar
  assert.equal(c.activeHeroIndex, before); // sin cambio
});

test('selectHero no puede seleccionar un héroe caído', () => {
  let c = initCombat({ node, party, difficulty: 'facil' });
  c.heroes[1].down = true; // paladin caído
  const before = c.activeHeroIndex;
  c = selectHero(c, 1);
  assert.equal(c.activeHeroIndex, before);
});

test('endHeroTurn encuentra al próximo sin importar el orden de actuación', () => {
  const rng = createRng(5);
  let c = initCombat({ node, party, difficulty: 'facil' });
  // Seleccionar mago (idx 2) y hacerlo actuar primero
  c = selectHero(c, 2);
  c = rollActiveHero(c, rng);
  c = endHeroTurn(c);
  // El siguiente debe ser el primero no-actuado: guerrera (idx 0)
  assert.equal(activeHero(c).id, 'guerrera');
});

// ---- Pociones en combate ----

test('usePotionOnHero cura al héroe objetivo y lo registra en el log', () => {
  let c = initCombat({ node, party, difficulty: 'facil' });
  c.heroes[0].hp = 4; // guerrera herida
  const before = c.heroes[0].hp;
  c = usePotionOnHero(c, 'vida_menor', 'guerrera');
  assert.ok(c.heroes[0].hp > before);
  assert.equal(c.heroes[0].hp, Math.min(c.heroes[0].maxHp, before + 6));
  assert.ok(c.log.some((l) => l.kind === 'potion'));
});

test('usePotionOnHero no cura por encima del maxHp', () => {
  let c = initCombat({ node, party, difficulty: 'facil' });
  // mago al máximo de vida
  c = usePotionOnHero(c, 'vida_menor', 'mago');
  assert.equal(c.heroes.find((h) => h.id === 'mago').hp,
               c.heroes.find((h) => h.id === 'mago').maxHp);
});

test('usePotionOnHero no funciona fuera de la fase de héroes', () => {
  let c = initCombat({ node, party, difficulty: 'facil' });
  c = { ...c, phase: 'enemy' };
  const before = JSON.stringify(c.heroes);
  c = usePotionOnHero(c, 'vida_menor', 'guerrera');
  assert.equal(JSON.stringify(c.heroes), before);
});

// ---- Bolsa de pociones (progression) ----

test('buyPotion almacena en la bolsa sin curar inmediatamente', () => {
  let g = { ...createNewGame({ seed: 1 }), party: ['guerrera'], gold: 50 };
  g = initPartyHp(g);
  const hpBefore = g.partyHp?.guerrera;
  g = buyPotion(g, 'vida_menor');
  assert.equal(g.gold, 40); // price 10
  assert.equal(g.potionBag?.vida_menor, 1);
  // La vida NO cambia al comprar (se guarda para combate)
  assert.equal(g.partyHp?.guerrera, hpBefore);
});

test('consumePotion decrementa el conteo y elimina cuando llega a 0', () => {
  let g = { ...createNewGame({ seed: 1 }), potionBag: { vida_menor: 2 } };
  g = consumePotion(g, 'vida_menor');
  assert.equal(potionCount(g, 'vida_menor'), 1);
  g = consumePotion(g, 'vida_menor');
  assert.equal(potionCount(g, 'vida_menor'), 0);
  assert.equal('vida_menor' in g.potionBag, false);
});

test('se puede comprar varias pociones del mismo tipo', () => {
  let g = { ...createNewGame({ seed: 1 }), gold: 100, potionBag: {} };
  g = buyPotion(g, 'vida_menor');
  g = buyPotion(g, 'vida_menor');
  assert.equal(g.potionBag.vida_menor, 2);
  assert.equal(g.gold, 80);
});
