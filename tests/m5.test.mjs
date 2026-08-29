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

// ---- Campaña completa (base + expansión) ----
test('la campaña tiene 6 capítulos, cada uno con start, jefe y enemigos válidos', () => {
  assert.equal(content.chapters.length, 6);
  for (const ch of content.chapters) {
    assert.equal(ch.nodes[0].type, 'start', `${ch.id}: primer nodo no es start`);
    assert.equal(ch.nodes.at(-1).type, 'boss', `${ch.id}: último nodo no es boss`);
    assert.ok(content.bossesById[ch.boss], `${ch.id}: jefe inexistente ${ch.boss}`);
    for (const node of ch.nodes) {
      for (const id of node.enemies ?? []) {
        assert.ok(lookup(id), `${ch.id}/${node.id}: enemigo inexistente ${id}`);
      }
    }
  }
});

test('los recuentos de nodos siguen el GDD base y expansión', () => {
  assert.deepEqual(content.chapters.map((c) => c.nodes.length), [16, 18, 20, 15, 18, 20]);
});

test('cada jefe que invoca lo hace con un enemigo existente', () => {
  for (const boss of content.bosses) {
    for (const card of boss.behaviorDeck ?? []) {
      if (card.effect?.type === 'summon') {
        assert.ok(lookup(card.effect.spawn), `${boss.id}/${card.id}: invoca ${card.effect.spawn} inexistente`);
      }
    }
  }
});

// ---- Combate de los jefes (todos terminan y usan su mazo) ----
for (const chId of ['cap1', 'cap2', 'cap3', 'cap4', 'cap5', 'cap6']) {
  test(`el jefe de ${chId} usa su mazo de comportamiento y el combate termina`, () => {
    const rng = createRng(123);
    const bossNode = content.chaptersById[chId].nodes.at(-1);
    let c = initCombat({ node: bossNode, party: ['guerrera', 'paladin', 'mago', 'sanadora'], difficulty: 'facil' });
    assert.ok(c.enemies.some((e) => e.isBoss), `${chId}: no se cargó el jefe`);
    let guard = 0;
    while (!isOver(c) && guard++ < 400) {
      if (c.phase === 'hero') {
        c = rollActiveHero(c, rng);
        c = endHeroTurn(c);
      } else {
        c = resolveEnemyPhase(c, rng);
      }
    }
    assert.ok(isOver(c), `${chId}: el combate del jefe no terminó`);
    assert.ok(c.log.some((l) => l.kind === 'bosscard'), `${chId}: no se usó el mazo del jefe`);
  });
}
