import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dateInZone,
  describeOpenState,
  exhibitionPhase,
  formatApDate,
  formatClock,
  isExpired,
  isIsoDate,
  liveNotices,
  mostUrgentNotice,
  openState,
  type DatedNotice,
  type Hours,
} from '../../src/lib/dates.ts';

const hours: Hours = { open: '09:00', close: '17:00', fridayLateClose: '21:00', closedDates: ['12-25', '08-26'], timeZone: 'America/Denver' };
// Denver is UTC-6 (MDT) in October.
const denver = (iso: string): Date => new Date(`${iso}-06:00`);

test('iso date validation', () => {
  assert.ok(isIsoDate('2026-10-16'));
  assert.ok(!isIsoDate('2026-02-30'));
  assert.ok(!isIsoDate('10/16/2026'));
});
test('date in zone crosses midnight correctly', () => {
  assert.equal(dateInZone(new Date('2026-10-17T03:00:00Z'), 'America/Denver'), '2026-10-16');
});
test('expired notices are dropped', () => {
  const old: DatedNotice = { id: 'old', start: '2026-01-01', end: '2026-01-02', severity: 'closure' };
  const soon: DatedNotice = { id: 'soon', start: '2026-10-27', end: '2026-10-29', severity: 'closure' };
  assert.ok(isExpired(old, '2026-10-16'));
  assert.ok(!isExpired(soon, '2026-10-29'));
  assert.ok(isExpired(soon, '2026-10-30'));
  assert.deepEqual(liveNotices([old, soon], '2026-10-16').map((n) => n.id), ['soon']);
});
test('most urgent: in effect beats upcoming, closure beats advisory', () => {
  const upcoming: DatedNotice = { id: 'up', start: '2026-10-27', end: '2026-10-29', severity: 'closure' };
  const now: DatedNotice = { id: 'now', start: '2026-10-10', end: '2026-10-20', severity: 'advisory' };
  const nowClosure: DatedNotice = { id: 'nowc', start: '2026-10-12', end: '2026-10-20', severity: 'closure' };
  assert.equal(mostUrgentNotice([upcoming, now], '2026-10-16')?.id, 'now');
  assert.equal(mostUrgentNotice([upcoming, now, nowClosure], '2026-10-16')?.id, 'nowc');
  assert.equal(mostUrgentNotice([upcoming], '2026-11-01'), null);
});
test('AP dates and clocks', () => {
  assert.equal(formatApDate('2026-10-16'), 'Oct. 16, 2026');
  assert.equal(formatApDate('2027-05-28'), 'May 28, 2027');
  assert.equal(formatClock('09:00'), '9 a.m.');
  assert.equal(formatClock('21:00'), '9 p.m.');
  assert.equal(formatClock('12:30'), '12:30 p.m.');
});
test('exhibition phases', () => {
  assert.equal(exhibitionPhase('2027-05-28', null, '2026-10-16'), 'upcoming');
  assert.equal(exhibitionPhase('2026-10-16', null, '2026-10-16'), 'open');
  assert.equal(exhibitionPhase(null, '2027-01-03', '2027-01-04'), 'closed');
});
test('open state', () => {
  assert.deepEqual(openState(hours, denver('2026-10-16T08:00:00')), { kind: 'before-open', opens: '09:00' });
  assert.deepEqual(openState(hours, denver('2026-10-15T10:00:00')), { kind: 'open', until: '17:00' });
  assert.deepEqual(openState(hours, denver('2026-10-16T18:00:00')), { kind: 'friday-late', until: '21:00' });
  assert.deepEqual(openState(hours, denver('2026-10-15T18:00:00')), { kind: 'after-close' });
  assert.deepEqual(openState(hours, new Date('2026-12-25T17:00:00Z')), { kind: 'closed-day' });
  assert.match(describeOpenState({ kind: 'friday-late', until: '21:00' }), /Most Fridays/);
});
