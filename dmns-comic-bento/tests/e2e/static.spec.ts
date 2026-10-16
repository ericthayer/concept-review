import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { dateInZone, isExpired } from '../../src/lib/dates.ts';
import { content, ROUTES } from './routes.ts';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function revealAll(page: Page): Promise<void> {
  await page.addStyleTag({ content: 'dmns-spread{content-visibility:visible!important}' });
}

for (const path of ROUTES) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    await revealAll(page);
    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const path of ROUTES) {
    test(`renders and navigates: ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main#main')).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    });
  }
});

test.describe('without site JavaScript (axe needs page JS, so site modules are blocked instead)', () => {
  test('axe on the Cover and a hall', async ({ page }) => {
    await page.route('**/assets/js/**', (route) => route.abort());
    for (const path of ['/', '/halls/prehistoric-journey/']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
    }
  });
});

test.describe('360px phone', () => {
  test.use({ viewport: { width: 360, height: 640 } });
  for (const path of ROUTES) {
    test(`hours, tickets and notice above the fold: ${path}`, async ({ page }) => {
      await page.goto(path);
      for (const selector of ['.info-strip__hours', '.btn-tickets', '.info-strip__notice']) {
        if ((await page.locator(selector).count()) === 0) continue;
        const box = await page.locator(selector).first().boundingBox();
        expect(box, selector).not.toBeNull();
        expect((box?.y ?? 9999) + (box?.height ?? 0), selector).toBeLessThanOrEqual(640);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test('Gems and Minerals is a To Be Continued page', async ({ page }) => {
  await page.goto('/halls/gems-and-minerals/');
  await expect(page.locator('.tbc-banner')).toHaveText('To be continued…');
  await expect(page.locator('#splash')).toContainText('Closed for major renovation and expansion');
  await expect(page.locator('#splash dmns-specimen[data-pose="hardhat"]')).toHaveCount(1);
});

test('Egyptian Mummies has no Specimen, balloons or SFX', async ({ page }) => {
  await page.goto('/halls/egyptian-mummies/');
  await expect(page.locator('#splash dmns-specimen, #splash dmns-balloon, dmns-sfx')).toHaveCount(0);
  await expect(page.locator('dmns-page')).toHaveAttribute('data-documentary', '');
});

test('expired notices are absent and live ones present', async ({ page }) => {
  const today = dateInZone(new Date(), content.site.hours.timeZone);
  await page.goto('/');
  const body = await page.locator('body').innerText();
  for (const n of content.notices) {
    if (isExpired(n, today)) expect(body).not.toContain(n.title);
    else expect(body).toContain(n.title);
  }
});

test('TODO and Sketch placeholders are visibly marked', async ({ page }) => {
  for (const path of ['/', '/halls/prehistoric-journey/', '/theaters/gates-planetarium/']) {
    await page.goto(path);
    await revealAll(page);
    for (const tag of await page.locator('.todo__tag').all()) await expect(tag).toBeVisible();
    for (const stamp of await page.locator('.sketch-stamp').all()) await expect(stamp).toHaveText('Sketch');
  }
});
