import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ContentError, loadContent, parseExhibitions, parseHalls, parseNotices } from '../../src/lib/content.js';
import { TODO_MARK, isTodo } from '../../src/lib/content-types.js';

describe('content loaders', () => {
  const content = loadContent(join(process.cwd(), 'content'));

  it('loads the seed halls from §5', () => {
    assert.deepEqual(
      content.halls.halls.map((h) => h.slug),
      ['space-odyssey', 'discovery-zone', 'expedition-health', 'wildlife-halls', 'egyptian-mummies', 'konovalenko', 'prehistoric-journey', 'gems-and-minerals', 'nature-play'],
    );
    assert.equal(content.halls.halls.find((h) => h.slug === 'gems-and-minerals')?.status, 'sealed');
  });

  it('marks unknown copy as TODO instead of inventing it', () => {
    assert.ok(isTodo(content.halls.halls.find((h) => h.slug === 'gems-and-minerals')?.floorLabel));
    assert.ok(content.events.every((e) => e.name === TODO_MARK));
    assert.ok([...content.media.values()].every((m) => m.placeholder));
  });

  it('rejects malformed halls', () => {
    assert.throws(() => parseHalls({ halls: [{ slug: 'x' }], objectPlates: 1 }), ContentError);
    assert.throws(() => parseHalls({ halls: [{ slug: 'Bad Slug', name: 'n', floor: 1, floorLabel: 'f', wing: 'space', status: 'open', description: 'd', media: 'm' }] }), ContentError);
  });

  it('rejects impossible dates', () => {
    assert.throws(() => parseExhibitions({ exhibitions: [{ slug: 'x', name: 'n', kind: 'exhibition', opens: '2026-13-01', closes: null, dateLabel: 'd', description: 'd', media: 'm' }] }), ContentError);
    assert.throws(() => parseNotices({ notices: [{ id: 'n', message: 'm', start: '2026-10-30', end: '2026-10-01' }] }), ContentError);
  });
});
