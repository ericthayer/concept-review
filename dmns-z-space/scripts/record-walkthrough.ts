/**
 * Records the §14 keyboard-only walkthrough to dist-media/walkthrough.webm (Playwright video).
 * Usage: npm run build && npx serve dist -l 4321 & node .build/scripts/record-walkthrough.js
 * Convert: ffmpeg -i walkthrough.webm -vf "fps=12,scale=960:-1:flags=lanczos" walkthrough.gif
 */
import { mkdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Page } from '@playwright/test';
import { ROOT } from './build.js';

const BASE = process.env['BASE_URL'] ?? 'http://localhost:4321';
const OUT = join(ROOT, 'dist-media');

async function tabTo(page: Page, selector: string, back = false): Promise<void> {
  for (let i = 0; i < 250; i++) {
    await page.keyboard.press(back ? 'Shift+Tab' : 'Tab');
    await page.waitForTimeout(90);
    if (await page.evaluate((sel) => document.activeElement?.matches(sel) ?? false, selector)) return;
  }
  throw new Error(`Never reached ${selector}`);
}

async function enter(page: Page, url: string | ((url: URL) => boolean)): Promise<void> {
  await Promise.all([page.waitForURL(url), page.keyboard.press('Enter')]);
  await page.waitForTimeout(1300);
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark', recordVideo: { dir: OUT, size: { width: 1280, height: 800 } } });
const page = await context.newPage();
await page.goto(`${BASE}/`);
await page.waitForTimeout(1800);
await tabTo(page, 'main a[href="/halls/"]');
await page.waitForTimeout(500);
await enter(page, '**/halls/');
await tabTo(page, '[data-show-floor="2"]');
await page.keyboard.press('Enter');
await page.waitForTimeout(1100);
await tabTo(page, '[data-show-floor="3"]', true);
await page.keyboard.press('Enter');
await page.waitForTimeout(1100);
await tabTo(page, 'main a[href="/halls/prehistoric-journey/"]');
await page.waitForTimeout(400);
await enter(page, '**/halls/prehistoric-journey/');
await tabTo(page, '[data-open]');
await page.keyboard.press('Enter');
await page.waitForTimeout(1500);
await page.keyboard.press('Escape');
await page.waitForTimeout(1100);
await tabTo(page, 'a.exit-door[rel="prev"]');
await page.waitForTimeout(400);
await enter(page, '**/halls/konovalenko/');
await page.keyboard.press('Alt+ArrowLeft');
await page.waitForTimeout(1300);
await tabTo(page, 'a.exit-door--atrium');
await page.waitForTimeout(400);
await enter(page, (url: URL) => url.pathname === '/');
const video = page.video();
await context.close();
await browser.close();
const path = await video?.path();
if (path) renameSync(path, join(OUT, 'walkthrough.webm'));
console.log(`Saved ${join(OUT, 'walkthrough.webm')}`);
