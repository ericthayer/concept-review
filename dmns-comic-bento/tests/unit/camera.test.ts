import assert from 'node:assert/strict';
import { test } from 'node:test';
import { encodeBook, resolveCameraMove } from '../../src/lib/book.ts';
import { buildRoutes } from '../../src/lib/routes.ts';
import { cameraMoveFromWire, cameraScript } from '../../src/runtime/camera.ts';
import { loadContent } from '../../scripts/load-content.ts';

const positions = buildRoutes(loadContent()).map((r) => r.position);
const wire = encodeBook(positions);

test('inline camera resolves the same move as resolveCameraMove for every route pair', () => {
  positions.forEach((a, i) => {
    positions.forEach((b, j) => {
      const ra = wire[i];
      const rb = wire[j];
      assert.ok(ra && rb);
      assert.equal(cameraMoveFromWire(ra, rb), resolveCameraMove(a, b), `${a.path} → ${b.path}`);
    });
  });
});

test('inline camera script is a self-contained classic script', () => {
  const src = cameraScript();
  assert.doesNotMatch(src, /\bimport\b|\bexport\b/);
  assert.doesNotThrow(() => new Function(src));
});
