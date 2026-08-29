import test from 'node:test';
import assert from 'node:assert/strict';

import { content } from '../src/data/index.js';
import {
  BOARD_VIEWBOX,
  buildRouteSegments,
  getCameraTarget,
  toViewPoint,
  validateBoardLayout,
} from '../src/systems/boardGeometry.js';

test('la ruta produce exactamente N-1 curvas finitas', () => {
  for (const chapter of content.chapters) {
    const segments = buildRouteSegments(chapter.nodes);
    assert.equal(segments.length, chapter.nodes.length - 1);
    assert.ok(segments.every((segment) => !segment.d.includes('NaN')));
  }
});

test('las posiciones porcentuales se convierten al viewBox 16:9', () => {
  assert.deepEqual(toViewPoint({ x: 50, y: 50 }), {
    x: BOARD_VIEWBOX.width / 2,
    y: BOARD_VIEWBOX.height / 2,
  });
});

test('la cámara devuelve objetivos válidos en inicio, medio y final', () => {
  for (const chapter of content.chapters) {
    for (const index of [0, Math.floor(chapter.nodes.length / 2), chapter.nodes.length - 1]) {
      const target = getCameraTarget(chapter.nodes, index);
      assert.ok(Number.isFinite(target.x));
      assert.ok(Number.isFinite(target.y));
      assert.ok(target.x >= 0 && target.x <= BOARD_VIEWBOX.width);
      assert.ok(target.y >= 0 && target.y <= BOARD_VIEWBOX.height);
    }
  }
});

test('los capítulos actuales no tienen errores estructurales de layout', () => {
  for (const chapter of content.chapters) {
    assert.deepEqual(validateBoardLayout(chapter).errors, [], chapter.id);
  }
});

test('un tablero con un solo nodo no genera ruta ni rompe', () => {
  assert.deepEqual(buildRouteSegments([{ pos: { x: 50, y: 50 } }]), []);
});

