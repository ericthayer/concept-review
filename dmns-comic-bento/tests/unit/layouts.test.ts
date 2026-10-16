import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateLayoutCss,
  LAYOUTS,
  readingOrderOfAreas,
  slotCount,
  spanForSlot,
  validateLayouts,
} from '../../src/lib/layouts.ts';

test('every area layout is rectangular, column-correct and in reading order', () => {
  assert.deepEqual(validateLayouts(), []);
});
test('reading order detects a violation', () => {
  assert.deepEqual(readingOrderOfAreas(['b a', 'b a']), ['b', 'a']);
  const bad = { ...LAYOUTS, trio: { kind: 'areas' as const, slots: ['t', 't'] as const, areas: { desktop: ['b b b b b b a a a a a a'], tablet: ['a a a b b b'], phone: ['a a', 'b b'] } } };
  const problems = validateLayouts(bad);
  assert.ok(problems.some((p) => p.layout === 'trio' && p.size === 'desktop'));
});
test('non-rectangular areas are rejected', () => {
  const bad = { ...LAYOUTS, trio: { kind: 'areas' as const, slots: ['t', 't'] as const, areas: { desktop: ['a a a a a a b b b b b b', 'b b b b b b a a a a a a'], tablet: ['a a a b b b'], phone: ['a a', 'b b'] } } };
  assert.ok(validateLayouts(bad).some((p) => p.message.includes('rectangle')));
});
test('slot counts and spans', () => {
  assert.equal(slotCount('cover'), 4);
  assert.equal(slotCount('strip'), null);
  assert.equal(spanForSlot('mosaic', 0, 's'), 'xl');
  assert.equal(spanForSlot('strip', 0, 'm'), 'm');
});
test('generated css covers every area layout at every size', () => {
  const css = generateLayoutCss();
  for (const name of ['cover', 'trio', 'mosaic']) assert.match(css, new RegExp(`data-layout="${name}"`));
  assert.match(css, /@container page \(min-width: 600px\)/);
  assert.match(css, /@container page \(min-width: 1000px\)/);
  assert.doesNotMatch(css, /\border\s*:/);
});
