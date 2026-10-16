/**
 * Reading order = DOM order (WCAG 1.3.2 / 2.4.3). For every page at phone,
 * tablet and desktop container sizes, each panel must sit later in
 * top-then-left order than the panel before it in the DOM.
 */
import { chromium } from '@playwright/test';
import { htmlPages, routeOf } from './dist-files.ts';
import { withServer } from './with-server.ts';

const SIZES = [
  ['phone', 360],
  ['tablet', 820],
  ['desktop', 1440],
] as const;

interface Violation {
  readonly route: string;
  readonly size: string;
  readonly spread: string;
  readonly a: string;
  readonly b: string;
}

const routes = htmlPages().map(routeOf).filter((r) => !r.endsWith('404.html'));

const violations = await withServer(4399, async (origin) => {
  const browser = await chromium.launch();
  const found: Violation[] = [];
  try {
    for (const [size, width] of SIZES) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
          const s = document.createElement('style');
          s.textContent = 'dmns-spread{content-visibility:visible!important}';
          document.head.append(s);
        });
      });
      for (const route of routes) {
        await page.goto(origin + route);
        const v = await page.evaluate(() => {
          const out: { spread: string; a: string; b: string }[] = [];
          for (const grid of document.querySelectorAll('.spread__grid')) {
            const panels = [...grid.children].filter((el) => el instanceof HTMLElement && !el.hidden && el.offsetParent !== null);
            for (let i = 1; i < panels.length; i++) {
              const a = panels[i - 1]?.getBoundingClientRect();
              const b = panels[i]?.getBoundingClientRect();
              if (!a || !b) continue;
              const sameRow = Math.abs(a.top - b.top) < 2;
              const ok = sameRow ? b.left > a.left : b.top > a.top;
              if (!ok) out.push({ spread: grid.closest('dmns-spread')?.id ?? '?', a: panels[i - 1]?.id ?? '?', b: panels[i]?.id ?? '?' });
            }
          }
          return out;
        });
        found.push(...v.map((x) => ({ ...x, route, size })));
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return found;
});

console.log(`Reading order: ${routes.length} pages × ${SIZES.length} sizes checked`);
if (violations.length) {
  for (const v of violations) console.error(`${v.route} [${v.size}] ${v.spread}: ${v.b} reads before ${v.a}`);
  process.exit(1);
}
