// Tests de contenido M5: Capítulo 2 + transición entre capítulos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { createNewGame } from '../src/core/state.js';
import { content } from '../src/data/index.js';
import {
  hasNextChapter, advanceToNextChapter, isChapterComplete,
} from '../src/systems/board.js';
import { resetDoom } from '../src/systems/doom.js';
import { restParty, initPartyHp } from '../src/systems/progression.js';
import {
  initCombat, rollActiveHero, endHeroTurn, resolveEnemyPhase, isOver,
} from '../src/systems/combat.js';

const cap2 = content.chaptersById.cap2;
const lookup = (id) => content.enemiesById[id] ?? content.bossesById[id] ?? null;

// ---- Integridad del contenido ----
test('el Cap.2 está registrado con su jefe y ~18 nodos', () => {
  assert.ok(cap2, 'cap2 no registrado');
  assert.equal(cap2.nodes.length, 18);
  assert.equal(cap2.boss, 'la_tejedora');
  assert.ok(content.bossesById.la_tejedora, 'falta el jefe la_tejedora');
});

test('todos los enemigos referenciados en el Cap.2 existen en los datos', () => {
  for (const node of cap2.nodes) {
    for (const id of node.enemies ?? []) {
      assert.ok(lookup(id), `enemigo inexistente: ${id} (nodo ${node.id})`);
    }
  }
});

test('los ids de nodo del Cap.2 son únicos y no chocan con el Cap.1', () => {
  const ids = content.chapters.flatMap((c) => c.nodes.map((n) => n.id));
  assert.equal(ids.length, new Set(ids).size, 'hay ids de nodo duplicados');
});

test('el primer nodo es start y el último es el jefe', () => {
  assert.equal(cap2.nodes[0].type, 'start');
  assert.equal(cap2.nodes.at(-1).type, 'boss');
});

// ---- Transición entre capítulos ----
test('hasNextChapter es true en el Cap.1 y false en el último', () => {
  assert.equal(hasNextChapter({ chapterIndex: 0 }), true);
  assert.equal(hasNextChapter({ chapterIndex: content.chapters.length - 1 }), false);
});

test('advanceToNextChapter incrementa el capítulo y reinicia el nodo', () => {
  const s = advanceToNextChapter({ chapterIndex: 0, nodeIndex: 15 });
  assert.equal(s.chapterIndex, 1);
  assert.equal(s.nodeIndex, 0);
  // en el último capítulo es no-op
  const last = content.chapters.length - 1;
  const noop = advanceToNextChapter({ chapterIndex: last, nodeIndex: 3 });
  assert.equal(noop.chapterIndex, last);
});

test('el campamento (transición) cura a tope y reinicia la Perdición', () => {
  let g = { ...createNewGame({ seed: 1 }), party: ['guerrera', 'mago'], chapterIndex: 0 };
  g = initPartyHp(g);
  g = { ...g, doom: 9, partyHp: { guerrera: 2, mago: 1 } };
  // composición que hace la store en advanceChapter:
  let s = advanceToNextChapter(g);
  s = resetDoom(s);
  s = restParty(s, null);
  assert.equal(s.chapterIndex, 1);
  assert.equal(s.doom, 0);
  assert.equal(s.partyHp.guerrera, content.heroesById.guerrera.maxHp);
  assert.equal(s.partyHp.mago, content.heroesById.mago.maxHp);
});

// ---- Combate del jefe del Cap.2 ----
test('La Tejedora usa su mazo de comportamiento y el combate termina', () => {
  const rng = createRng(123);
  const bossNode = cap2.nodes.at(-1);
  let c = initCombat({ node: bossNode, party: ['guerrera', 'paladin', 'mago', 'sanadora'], difficulty: 'facil' });
  assert.ok(c.enemies.some((e) => e.id === 'la_tejedora'));
  let guard = 0;
  while (!isOver(c) && guard++ < 300) {
    if (c.phase === 'hero') {
      c = rollActiveHero(c, rng);
      c = endHeroTurn(c);
    } else {
      c = resolveEnemyPhase(c, rng);
    }
  }
  assert.ok(isOver(c), 'el combate con La Tejedora no terminó');
  assert.ok(c.log.some((l) => l.kind === 'bosscard'), 'no se usó el mazo de La Tejedora');
});
