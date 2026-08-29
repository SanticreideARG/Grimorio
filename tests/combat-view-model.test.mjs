import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCombatViewModel, enemyIntent } from '../src/systems/combatViewModel.js';

const combat = {
  phase: 'hero', activeHeroIndex: 0,
  heroes: [
    { id: 'mara', name: 'Mara Salobre', down: false, hasRolled: false },
    { id: 'elian', name: 'Elian Relojero', down: false, hasRolled: true },
  ],
  enemies: [
    { uid: 'a#0', name: 'Ahogado', hp: 8, dmg: 3, behavior: 'curse' },
    { uid: 'b#1', name: 'Muerto', hp: 0, dmg: 4, behavior: 'tank' },
  ],
  pendingEnemies: null,
};

test('el adaptador marca héroe activo, actuados y omite enemigos caídos del orden', () => {
  const view = buildCombatViewModel(combat);
  assert.equal(view.actors.find((a) => a.key === 'mara').status, 'active');
  assert.equal(view.actors.find((a) => a.key === 'elian').status, 'done');
  assert.equal(view.actors.some((a) => a.key === 'b#1'), false);
});

test('la fase enemiga prioriza su cola sin mutar el combate', () => {
  const input = { ...combat, phase: 'enemy', pendingEnemies: ['a#0'] };
  const view = buildCombatViewModel(input);
  assert.equal(view.nextEnemyUid, 'a#0');
  assert.equal(view.actors[0].key, 'a#0');
  assert.equal(view.actors[0].status, 'active');
  assert.deepEqual(input.pendingEnemies, ['a#0']);
});

test('las intenciones comunican comportamiento y daño sin revelar el mazo', () => {
  assert.deepEqual(enemyIntent({ behavior: 'summon', dmg: 2 }), {
    icon: '♜', label: 'Puede invocar', tone: 'summon', damage: 2,
  });
  assert.equal(enemyIntent({ behavior: 'boss', dmg: 9 }).label, 'Patrón desconocido');
});
