/** Fails the build when any page exceeds the §11 JS/CSS transfer budgets (gzip). */
import { readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { gzipSync } from 'node:zlib';
import { ROOT } from './build.js';
import { walk } from './dist-files.js';

const DIST = join(ROOT, 'dist');
export const BUDGET = { jsTarget: 30 * 1024, jsCeiling: 50 * 1024, css: 35 * 1024 } as const;

const gz = (path: string): number => gzipSync(readFileSync(join(DIST, path)), { level: 9 }).length;

function jsGraph(entry: string): Set<string> {
  const seen = new Set<string>();
  const visit = (file: string): void => {
    if (seen.has(file)) return;
    seen.add(file);
    const source = readFileSync(join(DIST, file), 'utf8');
    for (const m of source.matchAll(/(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g)) {
      const spec = m[1] ?? m[2];
      if (spec) visit(posix.normalize(posix.join(posix.dirname(file), spec)));
    }
  };
  visit(entry);
  return seen;
}

const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const failures: string[] = [];
let worst = { page: '', js: 0, css: 0 };
for (const page of pages) {
  const html = readFileSync(join(DIST, page), 'utf8');
  const scripts = [...html.matchAll(/<script type="module" src="\/([^"]+)"/g)].map((m) => m[1] ?? '');
  const styles = [...html.matchAll(/<link rel="stylesheet" href="\/([^"]+)"/g)].map((m) => m[1] ?? '');
  const files = new Set<string>();
  for (const s of scripts) for (const f of jsGraph(s)) files.add(f);
  const inline = [...html.matchAll(/<script(?: type="speculationrules")?>([\s\S]*?)<\/script>/g)].reduce((n, m) => n + gzipSync(m[1] ?? '').length, 0);
  const js = [...files].reduce((n, f) => n + gz(f), 0) + inline;
  const css = styles.reduce((n, f) => n + gz(f), 0);
  if (js > worst.js) worst = { page, js, css };
  if (js > BUDGET.jsCeiling) failures.push(`${page}: JS ${js} B gzip exceeds the ${BUDGET.jsCeiling} B ceiling`);
  else if (js > BUDGET.jsTarget) failures.push(`${page}: JS ${js} B gzip exceeds the ${BUDGET.jsTarget} B target`);
  if (css > BUDGET.css) failures.push(`${page}: CSS ${css} B gzip exceeds ${BUDGET.css} B`);
}
if (failures.length) {
  console.error(`Budget failures:\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log(`Budgets: ${pages.length} pages pass. Heaviest ${worst.page}: JS ${(worst.js / 1024).toFixed(1)} KB, CSS ${(worst.css / 1024).toFixed(1)} KB (gzip).`);
