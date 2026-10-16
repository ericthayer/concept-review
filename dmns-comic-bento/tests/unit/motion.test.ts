import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cameraDuration, parseStillPanels, parseTheme, resolveMotionLevel } from '../../src/lib/motion.ts';

const all = { sameDocument: true, crossDocument: true, scrollTimeline: true };
const none = { sameDocument: false, crossDocument: false, scrollTimeline: false };

test('full when supported and no preference', () => {
  assert.equal(resolveMotionLevel({ prefersReducedMotion: false, stillPanels: false, support: all }), 'full');
  assert.equal(resolveMotionLevel({ prefersReducedMotion: false, stillPanels: false, support: { ...none, scrollTimeline: true } }), 'full');
});
test('reduced for OS preference or Still Panels, regardless of support', () => {
  assert.equal(resolveMotionLevel({ prefersReducedMotion: true, stillPanels: false, support: all }), 'reduced');
  assert.equal(resolveMotionLevel({ prefersReducedMotion: false, stillPanels: true, support: all }), 'reduced');
  assert.equal(resolveMotionLevel({ prefersReducedMotion: false, stillPanels: true, support: none }), 'reduced');
});
test('none when nothing is supported', () => {
  assert.equal(resolveMotionLevel({ prefersReducedMotion: false, stillPanels: false, support: none }), 'none');
});
test('durations', () => {
  assert.equal(cameraDuration('full', 640), 640);
  assert.equal(cameraDuration('reduced', 640), 150);
  assert.equal(cameraDuration('none', 640), 0);
});
test('storage parsing', () => {
  assert.equal(parseStillPanels('1'), true);
  assert.equal(parseStillPanels(null), false);
  assert.equal(parseTheme('dark'), 'dark');
  assert.equal(parseTheme('sepia'), null);
});
