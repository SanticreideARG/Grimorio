import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/data/index.js';
import { createNewGame } from '../src/core/state.js';
import { canBuyItem, canBuyPotion, grantNodeRewards } from '../src/systems/progression.js';
import { getDiceBonus, getDoomReduction } from '../src/systems/pets.js';
import { unlockKeysForFlags } from '../src/systems/unlocks.js';

test('Mara y Elian tienen estadísticas, hechizos y perfiles FX completos', () => {
  for (const id of ['mara_salobre', 'elian_relojero']) {
    const hero = content.heroesById[id];
    assert.ok(hero?.unlockKey);
    assert.equal(hero.spells.length, 3);
    for (const spellId of hero.spells) {
      const spell = content.spellsById[spellId];
      assert.ok(spell, spellId);
      assert.ok(spell.fxId, `${spellId} sin fxId`);
    }
  }
});

test('equipo y pociones de expansión sólo se venden desde capítulo V', () => {
  const early = { ...createNewGame(), gold: 999, inventory: [] };
  const expansion = { ...early, chapterIndex: 4 };
  assert.equal(canBuyItem(early, 'sable_nacar'), false);
  assert.equal(canBuyPotion(early, 'esencia_marea'), false);
  assert.equal(canBuyItem(expansion, 'sable_nacar'), true);
  assert.equal(canBuyPotion(expansion, 'esencia_marea'), true);
  assert.equal(canBuyItem(expansion, 'astrolabio_negro'), false);
});

test('el Leviatán concede el Astrolabio Negro una sola vez', () => {
  const game = { inventory: [], log: [] };
  const node = { id: 'c5n18' };
  const rewarded = grantNodeRewards(game, node);
  assert.deepEqual(rewarded.inventory, ['astrolabio_negro']);
  assert.equal(grantNodeRewards(rewarded, node), rewarded);
  assert.equal(grantNodeRewards(game, { id: 'c5n17' }), game);
});

test('flags narrativas traducen los desbloqueos de ambos héroes', () => {
  assert.deepEqual(unlockKeysForFlags({ unlock_mara_salobre: true }),
    ['grimorio_mara_salobre_unlocked']);
  assert.deepEqual(unlockKeysForFlags({ unlock_elian_relojero: true }),
    ['grimorio_elian_relojero_unlocked']);
});

test('las mascotas nuevas usan sus hooks reales', () => {
  assert.equal(getDiceBonus({ pets: ['cangrejo_farol'] }), 1);
  assert.equal(getDoomReduction({ pets: ['polilla_reloj'] }), 1);
});
