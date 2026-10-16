import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Pull every @keyframes body out of a stylesheet. */
function keyframes(file: string): Map<string, string> {
  const css = readFileSync(join(process.cwd(), 'src', 'styles', file), 'utf8');
  const out = new Map<string, string>();
  for (const match of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    let depth = 0;
    const start = (match.index) + match[0].length - 1;
    for (let i = start; i < css.length; i++) {
      if (css[i] === '{') depth++;
      if (css[i] === '}' && --depth === 0) {
        out.set(match[1] ?? '', css.slice(start + 1, i));
        break;
      }
    }
  }
  return out;
}

const ALLOWED = new Set(['transform', 'opacity', 'filter']);

describe('motion caps (§3.3, §11)', () => {
  for (const file of ['transitions.css', 'scroll.css']) {
    it(`${file} animates only transform, opacity and filter`, () => {
      for (const [name, body] of keyframes(file)) {
        for (const m of body.matchAll(/([a-z-]+)\s*:/g)) assert.ok(ALLOWED.has(m[1] ?? ''), `${name} animates ${m[1]}`);
      }
    });
  }

  it('transitions keep scale within 1.4× and rotate only on Y, ≤ 8deg', () => {
    for (const [name, body] of keyframes('transitions.css')) {
      for (const m of body.matchAll(/scale\(([\d.]+)\)/g)) {
        const s = Number(m[1]);
        assert.ok(s <= 1.4 && s >= 1 / 1.4, `${name} scale(${s})`);
      }
      for (const m of body.matchAll(/rotate([XYZ]?)\((-?[\d.]+)deg\)/g)) {
        assert.equal(m[1], 'Y', `${name} rotates on ${m[1] || 'Z'}`);
        assert.ok(Math.abs(Number(m[2])) <= 8, `${name} rotates ${m[2]}deg`);
      }
    }
  });

  it('defines a calm substitute for every transition type', () => {
    const css = readFileSync(join(process.cwd(), 'src', 'styles', 'transitions.css'), 'utf8');
    for (const type of ['enter', 'exit', 'lateral-l', 'lateral-r', 'ascend', 'descend', 'sealed', 'floor-up', 'floor-down', 'filter', 'vitrine-open', 'vitrine-close']) {
      const calm = css.match(/html\[data-stillness='on'\]:active-view-transition-type\(([^)]+)\)::view-transition-old\(root\)/)?.[1] ?? '';
      assert.ok(calm.split(',').map((t) => t.trim()).includes(type), `Stillness misses ${type}`);
    }
  });
});
