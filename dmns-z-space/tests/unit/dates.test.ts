import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Notice } from '../../src/lib/content-types.js';
import { activeNotices, exhibitionPhase, isIsoDate, isNoticeExpired, museumToday } from '../../src/lib/dates.js';

const notice = (start: Notice['start'], end: Notice['end']): Notice => ({ id: 'n', message: 'm', start, end });

describe('dates', () => {
  it('validates ISO calendar dates', () => {
    assert.ok(isIsoDate('2026-10-16'));
    assert.ok(!isIsoDate('2026-02-30'));
    assert.ok(!isIsoDate('10/16/2026'));
    assert.ok(!isIsoDate(null));
  });

  it('computes the museum day in Denver time', () => {
    // 05:00 UTC on Oct 17 is still Oct 16 in Denver (UTC−6 in October).
    assert.equal(museumToday(new Date('2026-10-17T05:00:00Z')), '2026-10-16');
  });

  it('expires notices the day after their end date', () => {
    assert.ok(!isNoticeExpired(notice('2026-10-27', '2026-10-29'), '2026-10-29'));
    assert.ok(isNoticeExpired(notice('2026-10-27', '2026-10-29'), '2026-10-30'));
  });

  it('keeps only notices whose window contains today', () => {
    const list = [notice('2026-10-01', '2026-10-10'), notice('2026-10-16', '2026-10-29'), notice('2026-11-01', '2026-11-02')];
    assert.deepEqual(activeNotices(list, '2026-10-16').map((n) => n.end), ['2026-10-29']);
  });

  it('classifies exhibition phases', () => {
    assert.equal(exhibitionPhase({ opens: '2026-10-16', closes: null }, '2026-10-16'), 'now');
    assert.equal(exhibitionPhase({ opens: null, closes: '2027-01-03' }, '2026-10-16'), 'now');
    assert.equal(exhibitionPhase({ opens: '2027-05-28', closes: null }, '2026-10-16'), 'coming');
    assert.equal(exhibitionPhase({ opens: null, closes: '2026-10-01' }, '2026-10-16'), 'closed');
  });
});
