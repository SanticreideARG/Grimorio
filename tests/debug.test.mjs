import test from 'node:test';
import assert from 'node:assert/strict';

import { content } from '../src/data/index.js';
import {
  createDebugSession,
  jumpDebugSession,
  setDebugResources,
  healDebugParty,
} from '../src/systems/debug.js';

test('la sesión debug nace completa, reproducible y sin pertenecer a un slot', () => {
  const a = createDebugSession({ seed: 42 });
  const b = createDebugSession({ seed: 42 });
  assert.equal(a.debugSession, true);
  assert.equal(a.view, 'map');
  assert.deepEqual(a.party, b.party);
  assert.deepEqual(a.decks, b.decks);
  assert.deepEqual(a.partyHp, b.partyHp);
});

test('el salto marca sólo el camino anterior y limpia estados transitorios', () => {
  const base = { ...createDebugSession(), combat: {}, activeEvent: {}, view: 'combat' };
  const chapterIndex = Math.min(2, content.chapters.length - 1);
  const nodeIndex = Math.min(5, content.chapters[chapterIndex].nodes.length - 1);
  const next = jumpDebugSession(base, chapterIndex, nodeIndex);
  const expectedVisited = content.chapters.slice(0, chapterIndex)
    .flatMap((chapter) => chapter.nodes.map((node) => node.id))
    .concat(content.chapters[chapterIndex].nodes.slice(0, nodeIndex).map((node) => node.id));
  assert.deepEqual(next.visited, expectedVisited);
  assert.equal(next.chapterIndex, chapterIndex);
  assert.equal(next.nodeIndex, nodeIndex);
  assert.equal(next.view, 'map');
  assert.equal(next.combat, null);
  assert.equal(next.activeEvent, null);
});

test('un salto inválido falla de forma explícita', () => {
  const game = createDebugSession();
  assert.throws(() => jumpDebugSession(game, 999, 0), RangeError);
  assert.throws(() => jumpDebugSession(game, 0, 999), RangeError);
});

test('los recursos debug se limitan y la curación restaura la party', () => {
  const game = createDebugSession();
  const hurt = {
    ...game,
    partyHp: Object.fromEntries(game.party.map((id) => [id, 1])),
  };
  const resourced = setDebugResources(hurt, { gold: 20000, doom: 20000 });
  assert.equal(resourced.gold, 9999);
  assert.equal(resourced.doom, content.chapters[0].doomMax);
  const healed = healDebugParty(resourced);
  assert.ok(healed.party.every((id) => healed.partyHp[id] > 1));
});

