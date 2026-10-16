/** Performance budgets (§13). Fails the build when any page exceeds them. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { DIST, htmlPages, routeOf, walk } from './dist-files.ts';

const KB = 1024;
export const BUDGET = { jsTarget: 35 * KB, jsCeiling: 50 * KB, css: 40 * KB, svg: 120 * KB } as const;

const gz = (s: string | Buffer): number => gzipSync(s, { level: 9 }).length;

// Every page loads the same module graph from main.js.
const jsFiles = walk(join(DIST, 'assets/js'), '.js');
const js = gz(Buffer.concat(jsFiles.map((f) => readFileSync(f))));
const css = gz(readFileSync(join(DIST, 'assets/css/site.css')));

const failures: string[] = [];
if (js > BUDGET.jsCeiling) failures.push(`JS ${js} B gzip exceeds hard ceiling ${BUDGET.jsCeiling}`);
if (js > BUDGET.jsTarget) failures.push(`JS ${js} B gzip exceeds target ${BUDGET.jsTarget}`);
if (css > BUDGET.css) failures.push(`CSS ${css} B gzip exceeds ${BUDGET.css}`);

let worst = { route: '', svg: 0 };
for (const file of htmlPages()) {
  const html = readFileSync(file, 'utf8');
  const svg = (html.match(/<svg[\s\S]*?<\/svg>/g) ?? []).join('');
  const size = gz(svg);
  if (size > worst.svg) worst = { route: routeOf(file), svg: size };
  if (size > BUDGET.svg) failures.push(`${routeOf(file)}: inline SVG ${size} B gzip exceeds ${BUDGET.svg}`);
}

console.log(`Budgets: JS ${(js / KB).toFixed(1)} KB, CSS ${(css / KB).toFixed(1)} KB, worst inline SVG ${(worst.svg / KB).toFixed(1)} KB (${worst.route}) — all gzip`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
