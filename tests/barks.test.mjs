// Tests del contenido de diálogos de combate (barks). Solo se valida el CONTENIDO
// (los selectores puros); el timing/probabilidad vive en la UI y no se testea aquí.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/data/index.js';
import {
  heroLines, enemyLines, enemyPersonality, personalityBarks,
} from '../src/data/barks.js';

const HERO_TRIGGERS = ['attack', 'hurt', 'idle'];
const BOSS_TRIGGERS = ['attack', 'hurt', 'taunt', 'idle'];

test('cada héroe tiene líneas para todos sus triggers', () => {
  for (const hero of content.heroes) {
    for (const t of HERO_TRIGGERS) {
      const lines = heroLines(hero.id, t);
      assert.ok(Array.isArray(lines) && lines.length > 0,
        `${hero.id}/${t} sin líneas`);
      assert.ok(lines.every((l) => typeof l === 'string' && l.length > 0));
    }
  }
});

test('cada jefe tiene líneas propias para todos sus triggers', () => {
  for (const boss of content.bosses) {
    for (const t of BOSS_TRIGGERS) {
      const lines = enemyLines(boss.id, true, boss.behavior, t);
      assert.ok(lines.length > 0, `jefe ${boss.id}/${t} sin líneas`);
    }
  }
});

test('todo enemigo común resuelve a líneas (mapeo o fallback)', () => {
  for (const enemy of content.enemies) {
    for (const t of ['attack', 'hurt', 'idle']) {
      const lines = enemyLines(enemy.id, false, enemy.behavior, t);
      assert.ok(lines.length > 0, `enemigo ${enemy.id}/${t} sin líneas`);
    }
  }
});

test('todos los enemigos tienen personalidad asignada explícitamente', () => {
  for (const enemy of content.enemies) {
    assert.ok(
      enemyPersonality[enemy.id],
      `enemigo ${enemy.id} sin personalidad en enemyPersonality`,
    );
    assert.ok(
      personalityBarks[enemyPersonality[enemy.id]],
      `personalidad '${enemyPersonality[enemy.id]}' de ${enemy.id} no existe`,
    );
  }
});

test('trigger inexistente cae a idle', () => {
  const lines = heroLines('guerrera', 'noexiste');
  assert.deepEqual(lines, heroLines('guerrera', 'idle'));
});
