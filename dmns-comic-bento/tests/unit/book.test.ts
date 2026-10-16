import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBookMap,
  decodeBook,
  encodeBook,
  moveBetween,
  normalisePath,
  pageCounter,
  resolveCameraMove,
  type PagePosition,
} from '../../src/lib/book.ts';

const cover: PagePosition = { path: '/', issue: 'cover', depth: 0, order: 0 };
const halls: PagePosition = { path: '/halls/', issue: 'halls', depth: 1, order: 0 };
const theaters: PagePosition = { path: '/theaters/', issue: 'theaters', depth: 1, order: 2 };
const egypt: PagePosition = { path: '/halls/egyptian-mummies/', issue: 'halls', depth: 2, order: 4 };
const prehistoric: PagePosition = { path: '/halls/prehistoric-journey/', issue: 'halls', depth: 2, order: 6 };
const planetarium: PagePosition = { path: '/theaters/gates-planetarium/', issue: 'theaters', depth: 2, order: 0 };

test('same path is none', () => {
  assert.equal(resolveCameraMove(halls, halls), 'none');
});
test('depth increase zooms in', () => {
  assert.equal(resolveCameraMove(cover, halls), 'zoom-in');
  assert.equal(resolveCameraMove(halls, prehistoric), 'zoom-in');
});
test('depth decrease zooms out', () => {
  assert.equal(resolveCameraMove(prehistoric, halls), 'zoom-out');
  assert.equal(resolveCameraMove(halls, cover), 'zoom-out');
});
test('same issue and depth turns by order', () => {
  assert.equal(resolveCameraMove(egypt, prehistoric), 'turn-next');
  assert.equal(resolveCameraMove(prehistoric, egypt), 'turn-prev');
});
test('same issue, depth and order but different path is none', () => {
  assert.equal(resolveCameraMove(egypt, { ...egypt, path: '/halls/other/' }), 'none');
});
test('issue change at equal depth is new-issue', () => {
  assert.equal(resolveCameraMove(halls, theaters), 'new-issue');
  assert.equal(resolveCameraMove(prehistoric, planetarium), 'new-issue');
});
test('depth wins over issue change when depth differs', () => {
  assert.equal(resolveCameraMove(halls, planetarium), 'zoom-in');
  assert.equal(resolveCameraMove(planetarium, halls), 'zoom-out');
});
test('normalisePath', () => {
  assert.equal(normalisePath('/halls'), '/halls/');
  assert.equal(normalisePath('/halls/index.html'), '/halls/');
  assert.equal(normalisePath('halls/'), '/halls/');
});
test('book map lookups and wire round-trip', () => {
  const all = [cover, halls, theaters, egypt, prehistoric, planetarium];
  const map = createBookMap(decodeBook(JSON.parse(JSON.stringify(encodeBook(all)))));
  assert.equal(moveBetween(map, '/', '/halls'), 'zoom-in');
  assert.equal(moveBetween(map, '/halls/', '/theaters/'), 'new-issue');
  assert.equal(moveBetween(map, '/nope/', '/halls/'), 'none');
  assert.throws(() => createBookMap([cover, cover]));
});
test('decodeBook skips malformed rows', () => {
  assert.deepEqual(decodeBook([['/', 0, 0, 0], ['/x/', 99, 1, 0], ['/y/', 1, 7, 0], 'bad']), [cover]);
  assert.deepEqual(decodeBook(null), []);
});
test('page counter', () => {
  assert.equal(pageCounter(cover, 1), 'The Cover');
  assert.equal(pageCounter(halls, 9), 'Halls · Issue 1 of 9');
  assert.equal(pageCounter(prehistoric, 9), 'Halls · Page 7 of 9');
});
