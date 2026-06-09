// Tests de la capa narrativa (lugar + comentarios de party + lore).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getNodeNarration, narrative } from '../src/data/narrative.js';
import { content } from '../src/data/index.js';

test('getNodeNarration devuelve null para nodos sin entrada', () => {
  assert.equal(getNodeNarration('nodo_inexistente', ['guerrera']), null);
});

test('todo nodo del Cap.1 tiene narración de lugar', () => {
  const cap1Nodes = content.chaptersById.cap1.nodes;
  for (const n of cap1Nodes) {
    const nar = getNodeNarration(n.id, []);
    assert.ok(nar, `falta entrada narrativa para ${n.id}`);
    assert.ok(nar.place && nar.place.length > 0, `${n.id} sin texto de lugar`);
  }
});

test('el bark solo aparece si el héroe está en la party', () => {
  // c1n01 tiene barks para picara y guerrera.
  const sinHeroe = getNodeNarration('c1n01', ['mago', 'sanadora']);
  assert.equal(sinHeroe.bark, null);
  const conHeroe = getNodeNarration('c1n01', ['picara']);
  assert.ok(conHeroe.bark);
  assert.equal(conHeroe.bark.heroId, 'picara');
});

test('la elección de bark es determinista (sin flicker)', () => {
  const a = getNodeNarration('c1n11', ['sanadora', 'caballero_oscuro']);
  const b = getNodeNarration('c1n11', ['sanadora', 'caballero_oscuro']);
  assert.deepEqual(a.bark, b.bark);
});

test('los nodos de lore exponen el trasfondo del Rey/Devorado', () => {
  const altar = getNodeNarration('c1n14', []);
  assert.ok(altar.lore && altar.lore.length > 0);
});

test('todos los heroId de barks existen en el roster', () => {
  for (const [nodeId, entry] of Object.entries(narrative)) {
    for (const heroId of Object.keys(entry.heroBarks ?? {})) {
      assert.ok(content.heroesById[heroId], `${nodeId}: héroe inexistente "${heroId}"`);
    }
  }
});
