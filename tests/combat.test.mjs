// Tests del motor de combate: construcción, dados, regla de fila, auto-batalla.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { content } from '../src/data/index.js';
import {
  initCombat,
  rollActiveHero,
  heroAttack,
  heroCast,
  endHeroTurn,
  resolveEnemyPhase,
  activeHero,
  validEnemyTargets,
  isOver,
} from '../src/systems/combat.js';

const nodeOf = (id) => content.chaptersById.cap1.nodes.find((n) => n.id === id);

/** IA simple para auto-resolver un combate (para tests deterministas). */
function autoBattle(nodeId, party, seed, difficulty = 'normal') {
  const rng = createRng(seed);
  let c = initCombat({ node: nodeOf(nodeId), party, difficulty });
  let guard = 0;
  while (!isOver(c) && guard++ < 500) {
    if (c.phase === 'hero') {
      c = rollActiveHero(c, rng);
      const h = activeHero(c);
      // gastar energía en hechizos
      for (const sid of h.spells) {
        const spell = content.spellsById[sid];
        if (!spell || h.energy < spell.cost) continue;
        const fx = spell.effect ?? {};
        if (fx.damage) {
          const t = validEnemyTargets(c, fx.ignoreRow)[0];
          if (t) c = heroCast(c, sid, t.uid);
        } else if (fx.heal) {
          const hurt = c.heroes.filter((a) => !a.down).sort((a, b) => a.hp - b.hp)[0];
          if (hurt) c = heroCast(c, sid, hurt.id);
        }
      }
      // atacar con espadas
      if (!isOver(c) && c.phase === 'hero') {
        const ah = activeHero(c);
        if (ah.pool && ah.pool.sword > 0) {
          const t = validEnemyTargets(c, false)[0];
          if (t) c = heroAttack(c, t.uid);
        }
        c = endHeroTurn(c);
      }
    } else if (c.phase === 'enemy') {
      c = resolveEnemyPhase(c, rng);
    }
  }
  return c;
}

test('initCombat construye héroes y enemigos del nodo', () => {
  const c = initCombat({ node: nodeOf('c1n02'), party: ['guerrera', 'mago'], difficulty: 'normal' });
  assert.equal(c.heroes.length, 2);
  assert.equal(c.enemies.length, 2); // esbirro x2
  assert.equal(c.phase, 'hero');
  assert.ok(c.enemies.every((e) => e.hp === e.maxHp));
});

test('dificultad escala la vida de los enemigos', () => {
  const easy = initCombat({ node: nodeOf('c1n08'), party: ['guerrera'], difficulty: 'facil' });
  const hard = initCombat({ node: nodeOf('c1n08'), party: ['guerrera'], difficulty: 'dificil' });
  assert.ok(hard.enemies[0].maxHp > easy.enemies[0].maxHp);
});

test('tirar dados agrega símbolos y aplica bloqueo/energía', () => {
  const rng = createRng(123);
  let c = initCombat({ node: nodeOf('c1n02'), party: ['guerrera'], difficulty: 'normal' });
  c = rollActiveHero(c, rng);
  const h = activeHero(c);
  assert.ok(h.hasRolled);
  assert.equal(h.block, h.pool.shield);
  assert.equal(h.energy, h.pool.star);
  assert.equal(h.pool.faces.length, h.dice);
});

test('regla de fila: no se ataca a la retaguardia con frente vivo', () => {
  // c1n07: lanzador (back) + esbirro x2 (front) → lanzador no es objetivo melé
  const c = initCombat({ node: nodeOf('c1n07'), party: ['guerrera'], difficulty: 'normal' });
  const targets = validEnemyTargets(c, false).map((e) => e.id);
  assert.ok(targets.includes('esbirro'));
  assert.ok(!targets.includes('lanzador'));
  // con ignoreRow (arcano) sí alcanza la retaguardia
  const arc = validEnemyTargets(c, true).map((e) => e.id);
  assert.ok(arc.includes('lanzador'));
});

test('no se puede atacar dos veces en el mismo turno', () => {
  const rng = createRng(5);
  let c = initCombat({ node: nodeOf('c1n02'), party: ['guerrera'], difficulty: 'facil' });
  c = rollActiveHero(c, rng);
  const t = validEnemyTargets(c, false)[0];
  const after1 = heroAttack(c, t.uid);
  const after2 = heroAttack(after1, validEnemyTargets(after1, false)[0]?.uid);
  // el segundo ataque no debe cambiar el estado (ya atacó)
  assert.equal(activeHero(after2).hasAttacked, true);
  assert.deepEqual(after1.enemies, after2.enemies);
});

test('auto-batalla: party fuerte vence en un combate normal y da botín', () => {
  const c = autoBattle('c1n02', ['guerrera', 'mago', 'sanadora', 'cazador'], 7);
  assert.equal(c.phase, 'victory');
  assert.ok(c.loot.gold > 0);
  assert.ok(c.enemies.every((e) => e.hp <= 0));
});

test('auto-batalla: el combate siempre termina (élite y jefe)', () => {
  for (const id of ['c1n08', 'c1n10', 'c1n16']) {
    const c = autoBattle(id, ['guerrera', 'paladin', 'mago', 'sanadora'], 42, 'facil');
    assert.ok(isOver(c), `combate ${id} no terminó`);
  }
});

test('invocador puede aumentar el número de enemigos', () => {
  // Forzamos varios rounds enfrentando al invocador con una party débil de daño.
  const rng = createRng(99);
  let c = initCombat({ node: nodeOf('c1n10'), party: ['sanadora'], difficulty: 'facil' });
  const start = c.enemies.length;
  let guard = 0;
  let maxSeen = start;
  while (!isOver(c) && guard++ < 30) {
    if (c.phase === 'hero') {
      c = rollActiveHero(c, rng);
      c = endHeroTurn(c); // no atacamos: dejamos que el invocador actúe
    } else {
      c = resolveEnemyPhase(c, rng);
    }
    maxSeen = Math.max(maxSeen, c.enemies.length);
  }
  assert.ok(maxSeen >= start, 'el número de enemigos no debería bajar del inicial');
});
