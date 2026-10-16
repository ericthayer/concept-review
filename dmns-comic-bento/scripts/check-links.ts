/** Zero broken internal links: every internal href/src resolves, every #fragment exists. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, htmlPages, routeOf } from './dist-files.ts';

function fileFor(path: string): string | null {
  const clean = path.split('?')[0] ?? '/';
  const direct = join(DIST, clean);
  if (clean.endsWith('/')) return existsSync(join(direct, 'index.html')) ? join(direct, 'index.html') : null;
  return existsSync(direct) ? direct : null;
}

const ids = new Map<string, Set<string>>();
function idsOf(file: string): Set<string> {
  let set = ids.get(file);
  if (!set) {
    set = new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1] ?? ''));
    ids.set(file, set);
  }
  return set;
}

const failures: string[] = [];
let checked = 0;
for (const file of htmlPages()) {
  const html = readFileSync(file, 'utf8');
  const route = routeOf(file);
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const ref = m[1] ?? '';
    if (/^(https?:|mailto:|tel:)/.test(ref)) continue;
    checked += 1;
    const [path = '', frag] = ref.split('#');
    const target = path === '' ? file : fileFor(path.startsWith('/') ? path : route + path);
    if (!target) {
      failures.push(`${route}: broken link ${ref}`);
      continue;
    }
    if (frag && target.endsWith('.html') && !idsOf(target).has(frag)) failures.push(`${route}: missing #${frag} in ${ref}`);
  }
}
console.log(`Links: ${checked} internal references checked`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
