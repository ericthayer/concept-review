/**
 * Project lint rules (no third-party linter needed):
 *  - TS: no `any`, no innerHTML/outerHTML/insertAdjacentHTML, no console.log in src
 *  - Every file under src/ stays under 300 lines
 *  - CSS: raw hex colors only in tokens.css; animate only allowed properties
 *  - Components never import from scripts/ or templates/
 */
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { walk } from './dist-files.ts';
import { ROOT } from './load-content.ts';

const problems: string[] = [];
const rel = (f: string): string => relative(ROOT, f);

const tsFiles = [...walk(join(ROOT, 'src'), '.ts'), ...walk(join(ROOT, 'scripts'), '.ts'), ...walk(join(ROOT, 'art'), '.ts'), ...walk(join(ROOT, 'tests'), '.ts')];
for (const f of tsFiles) {
  const src = readFileSync(f, 'utf8');
  const lines = src.split('\n');
  if (!f.endsWith('scripts/lint.ts')) lines.forEach((line, i) => {
    if (/(:\s*any\s*[;,)=\]>|]|<any>|\bas any\b|\bany\[\])/.test(line)) problems.push(`${rel(f)}:${i + 1} uses any`);
  });
  if (f.includes('/src/')) {
    if (lines.length > 300) problems.push(`${rel(f)} has ${lines.length} lines (max 300)`);
    if (/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML/.test(src)) problems.push(`${rel(f)} writes HTML strings into the DOM`);
    if (/console\.log/.test(src)) problems.push(`${rel(f)} has console.log`);
  }
  if (/\/src\/(components|runtime)\//.test(f) && /from '\.\.\/(\.\.\/)?(scripts|templates)\//.test(src)) {
    problems.push(`${rel(f)} imports build-time code`);
  }
}

const ALLOWED_ANIMATED = new Set(['transform', 'translate', 'rotate', 'scale', 'opacity', 'clip-path', 'stroke-dashoffset', 'visibility', '--ink', 'offset']);
for (const f of walk(join(ROOT, 'src/styles'), '.css')) {
  const src = readFileSync(f, 'utf8');
  if (!f.endsWith('tokens.css')) {
    src.split('\n').forEach((line, i) => {
      if (/#[0-9a-fA-F]{3,8}\b/.test(line) && !/url\(#/.test(line)) problems.push(`${rel(f)}:${i + 1} hard-codes a color`);
    });
  }
  for (const kf of src.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\n\}/g)) {
    for (const prop of (kf[2] ?? '').matchAll(/([\w-]+)\s*:/g)) {
      const name = prop[1] ?? '';
      if (!ALLOWED_ANIMATED.has(name)) problems.push(`${rel(f)}: @keyframes ${kf[1]} animates ${name}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Lint: ${tsFiles.length} TS files and styles clean`);
