import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ContentError, hallsInBookOrder, parseHalls, parseNotices } from '../../src/lib/content.ts';
import { buildRoutes } from '../../src/lib/routes.ts';
import { createBookMap, moveBetween } from '../../src/lib/book.ts';
import { loadContent } from '../../scripts/load-content.ts';

const content = loadContent();

test('real content loads and validates', () => {
  assert.equal(content.halls.length, 9);
  assert.equal(content.exhibitions.length, 4);
  assert.equal(content.theaters.length, 3);
});
test('documentary halls never carry Specimen', () => {
  for (const h of content.halls) if (h.mood === 'documentary') assert.equal(h.pose, null);
  assert.throws(
    () => parseHalls([{ slug: 'x', name: 'X', floors: ['3'], floorLabel: 'F3', description: 'd', descriptionIsQuote: false, mood: 'documentary', pop: null, pose: 'digging', art: 'a' }]),
    ContentError,
  );
});
test('loaders reject malformed data', () => {
  assert.throws(() => parseHalls({}), ContentError);
  assert.throws(() => parseNotices([{ id: 'n', title: 't', hall: null, start: '2026-10-29', end: '2026-10-27', severity: 'closure' }]), ContentError);
  assert.throws(() => parseNotices([{ id: 'n', title: 't', hall: null, start: 'soon', end: '2026-10-27', severity: 'closure' }]), ContentError);
});
test('book order sorts halls by floor', () => {
  const order = hallsInBookOrder(content.halls).map((h) => h.slug);
  assert.equal(order[0], 'space-odyssey');
  assert.equal(order.at(-1), 'gems-and-minerals');
});
test('acceptance hops resolve to the specified camera moves', () => {
  const book = createBookMap(buildRoutes(content).map((r) => r.position));
  assert.equal(moveBetween(book, '/', '/halls/'), 'zoom-in');
  assert.equal(moveBetween(book, '/halls/', '/halls/prehistoric-journey/'), 'zoom-in');
  assert.equal(moveBetween(book, '/halls/prehistoric-journey/', '/halls/'), 'zoom-out');
  assert.match(moveBetween(book, '/halls/prehistoric-journey/', '/halls/egyptian-mummies/'), /^turn-(next|prev)$/);
  assert.equal(moveBetween(book, '/halls/', '/theaters/'), 'new-issue');
});
