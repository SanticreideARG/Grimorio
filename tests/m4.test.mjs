// Tests de progresión y campamento (M4): equipo, vida persistente, tienda.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import {
  effectiveHero, effectiveMaxHp, partyMods,
  initPartyHp, combatHeroState, persistCombatHp,
  restPartyFraction, canBuyItem, buyItem, canBuyPotion, buyPotion,
} from '../src/systems/progression.js';
import { initCombat } from '../src/systems/combat.js';
import { content } from '../src/data/index.js';

const nodeOf = (id) => content.chaptersById.cap1.nodes.find((n) => n.id === id);
const GUER = content.heroesById.guerrera;

function gameWith(party, patch = {}) {
  return initPartyHp({ ...createNewGame({ seed: 1 }), party, ...patch });
}

// ---- Equipo ----
test('effectiveHero suma modificadores de dados de los ítems', () => {
  const g = gameWith(['guerrera'], { inventory: ['daga_afilada'] }); // +1 dado
  const eff = effectiveHero('guerrera', g);
  assert.equal(eff.dice, GUER.dice + 1);
  assert.equal(eff.maxHp, GUER.maxHp); // este ítem no toca la vida
});

test('amuleto sube maxHp y partyMods lo refleja', () => {
  const g = gameWith(['guerrera'], { inventory: ['amuleto_vigor'] });
  assert.equal(partyMods(g).maxHp, 3);
  assert.equal(effectiveMaxHp('guerrera', g), GUER.maxHp + 3);
});

// ---- Tienda ----
test('buyItem descuenta oro, añade al inventario y sube HP si aplica', () => {
  let g = gameWith(['guerrera'], { gold: 100 });
  const baseHp = g.partyHp.guerrera;
  g = buyItem(g, 'amuleto_vigor'); // price 64, maxHp +3
  assert.equal(g.gold, 36);
  assert.ok(g.inventory.includes('amuleto_vigor'));
  assert.equal(g.partyHp.guerrera, baseHp + 3);
});

test('canBuyItem respeta oro y duplicados', () => {
  const pobre = gameWith(['guerrera'], { gold: 50 });
  assert.equal(canBuyItem(pobre, 'amuleto_vigor'), false); // poco oro (necesita 64)
  const rico = gameWith(['guerrera'], { gold: 200, inventory: ['amuleto_vigor'] });
  assert.equal(canBuyItem(rico, 'amuleto_vigor'), false); // ya lo posee
  assert.equal(canBuyItem(rico, 'daga_afilada'), true);
});

test('buyPotion cura y descuenta oro; no se compra a vida llena', () => {
  let g = gameWith(['guerrera'], { gold: 30 });
  assert.equal(canBuyPotion(g, 'vida_menor'), false); // party a tope
  g = { ...g, partyHp: { guerrera: 4 } };
  assert.equal(canBuyPotion(g, 'vida_menor'), true);
  g = buyPotion(g, 'vida_menor'); // price 10, power 6
  assert.equal(g.gold, 20);
  assert.equal(g.partyHp.guerrera, 10);
});

// ---- Vida persistente ----
test('restPartyFraction cura una fracción sin pasar maxHp', () => {
  let g = gameWith(['guerrera']);
  g = { ...g, partyHp: { guerrera: 4 } };
  g = restPartyFraction(g, 0.4); // +ceil(14*0.4)=6 → 10
  assert.equal(g.partyHp.guerrera, 10);
  g = restPartyFraction(g, 1); // cap a maxHp
  assert.equal(g.partyHp.guerrera, GUER.maxHp);
});

test('persistCombatHp guarda el HP final y revive a 1 a los caídos', () => {
  let g = gameWith(['guerrera', 'mago']);
  g = persistCombatHp(g, { heroes: [{ id: 'guerrera', hp: 7 }, { id: 'mago', hp: 0 }] });
  assert.equal(g.partyHp.guerrera, 7);
  assert.equal(g.partyHp.mago, 1); // sin permadeath: el caído queda a 1
});

test('combatHeroState refleja la vida persistente y los dados con equipo', () => {
  let g = gameWith(['guerrera'], { inventory: ['daga_afilada'] });
  g = { ...g, partyHp: { guerrera: 9 } };
  const st = combatHeroState(g).guerrera;
  assert.equal(st.hp, 9);
  assert.equal(st.maxHp, GUER.maxHp);
  assert.equal(st.dice, GUER.dice + 1);
});

test('initCombat arranca con la vida y los dados de heroState', () => {
  const heroState = { guerrera: { hp: 5, maxHp: 14, dice: 5 } };
  const c = initCombat({ node: nodeOf('c1n02'), party: ['guerrera'], difficulty: 'facil', heroState });
  const h = c.heroes[0];
  assert.equal(h.hp, 5);
  assert.equal(h.maxHp, 14);
  assert.equal(h.dice, 5);
});
