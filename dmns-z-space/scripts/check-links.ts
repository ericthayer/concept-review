/**
 * Link checker over dist/: every internal href and fragment must resolve, every outbound link
 * is https and marked external, and every TODO string is rendered inside a visible marker.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { ROOT } from './build.js';
import { walk } from './dist-files.js';

const DIST = join(ROOT, 'dist');
const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const ids = new Map<string, Set<string>>();
const html = new Map<string, string>();
for (const page of pages) {
  const text = readFileSync(join(DIST, page), 'utf8');
  html.set(page, text);
  ids.set(page, new Set([...text.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1] ?? '')));
}

function targetFile(path: string): string | null {
  const clean = path.replace(/^\//, '');
  const candidates = clean === '' ? ['index.html'] : clean.endsWith('/') ? [`${clean}index.html`] : [clean, `${clean}/index.html`];
  return candidates.find((c) => existsSync(join(DIST, c))) ?? null;
}

const failures: string[] = [];
let checked = 0;
for (const [page, text] of html) {
  for (const m of text.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>/g)) {
    const tag = m[0];
    const href = m[1] ?? '';
    checked++;
    if (/^https?:\/\//.test(href)) {
      if (!href.startsWith('https://')) failures.push(`${page}: insecure link ${href}`);
      if (!/rel="external"/.test(tag)) failures.push(`${page}: outbound link without rel="external": ${href}`);
      continue;
    }
    if (href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    const [pathPart = '', fragment] = href.split('#');
    const resolved = pathPart === '' ? page : targetFile(pathPart.startsWith('/') ? pathPart : posix.join(posix.dirname(`/${page}`), pathPart));
    if (!resolved) {
      failures.push(`${page}: broken link ${href}`);
      continue;
    }
    if (fragment && !ids.get(resolved)?.has(fragment)) failures.push(`${page}: missing #${fragment} in ${resolved}`);
  }
  const stripped = text.replace(/<mark class="todo"[\s\S]*?<\/mark>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
  if (/TODO/.test(stripped.replace(/<[^>]+>/g, ''))) failures.push(`${page}: TODO text outside a visible .todo marker`);
}

const redirects = readFileSync(join(DIST, '_redirects'), 'utf8').trim().split('\n');
for (const line of redirects) {
  const [, to] = line.split(/\s+/);
  if (!to || !targetFile(to)) failures.push(`_redirects: target missing for "${line}"`);
}

if (failures.length) {
  console.error(`Link check failures:\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log(`Links: ${checked} links across ${pages.length} pages resolve; ${redirects.length} redirects valid.`);
