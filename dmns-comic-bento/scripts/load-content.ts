/** Reads content/*.json from disk and runs the typed loaders. Build-time only. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseEvents,
  parseExhibitions,
  parseHalls,
  parseMedia,
  parseNotices,
  parseSite,
  parseSpreads,
  parseTheaters,
  validateContent,
  type Content,
} from '../src/lib/content.ts';

export const ROOT = join(import.meta.dirname, '..');

function readJson(rel: string): unknown {
  return JSON.parse(readFileSync(join(ROOT, 'content', rel), 'utf8')) as unknown;
}

export function loadContent(): Content {
  const content: Content = {
    site: parseSite(readJson('site.json')),
    halls: parseHalls(readJson('halls.json')),
    exhibitions: parseExhibitions(readJson('exhibitions.json')),
    theaters: parseTheaters(readJson('theaters.json')),
    events: parseEvents(readJson('events.json')),
    notices: parseNotices(readJson('notices.json')),
    media: parseMedia(readJson('media.json')),
    coverSpreads: parseSpreads(readJson('spreads/cover.json'), 'spreads/cover'),
  };
  const problems = validateContent(content);
  if (problems.length > 0) throw new Error(`Content problems:\n${problems.join('\n')}`);
  return content;
}
