/** Step 2: every route is plain, accessible HTML that works with JavaScript disabled. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ROUTES } from './routes.js';

/** Let time-based entrance animations finish so axe measures the resting page. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().filter((a) => a.timeline instanceof DocumentTimeline).map((a) => a.finished.catch(() => undefined))),
  );
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const route of ROUTES) {
    test(`${route} renders with landmarks`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('header.site-header')).toHaveCount(1);
      await expect(page.locator('nav[aria-label="Primary"]')).toHaveCount(1);
      await expect(page.locator('main#main')).toHaveCount(1);
      await expect(page.locator('footer.site-footer')).toHaveCount(1);
      await expect(page.locator('a.skip-link[href="#main"]')).toHaveCount(1);
    });
  }

  test('heading levels never skip', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const levels = await page.locator('main h1, main h2, main h3, main h4').evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
      levels.reduce((prev, level) => {
        expect(level - prev, `${route}: h${prev} → h${level}`).toBeLessThanOrEqual(1);
        return level;
      }, 1);
    }
  });

  test('every TODO is a visible marker', async ({ page }) => {
    await page.goto('/');
    const marks = page.locator('mark.todo');
    expect(await marks.count()).toBeGreaterThan(0);
    await expect(marks.first()).toBeVisible();
  });

  test('Gems and Minerals renders the sealed-hall state', async ({ page }) => {
    await page.goto('/halls/gems-and-minerals/');
    await expect(page.locator('dmns-sealed-hall')).toBeVisible();
    await expect(page.getByText('Closed for major renovation and expansion.').first()).toBeVisible();
  });
});

// axe needs script injection, so the "no JS" axe pass blocks the site's own modules instead.
test.describe('axe on the static HTML', () => {
  for (const route of ROUTES) {
    test(`${route} has zero axe violations`, async ({ page }) => {
      await page.route('**/js/**', (r) => r.abort());
      await page.goto(route);
      await settle(page);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
});

test('axe passes in Daylight with JavaScript on', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  for (const route of ['/', '/halls/', '/halls/prehistoric-journey/']) {
    await page.goto(route);
    await settle(page);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${route} ${v.id}`)).toEqual([]);
  }
});

test('the skip link becomes visible on focus @mobile', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip-link');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
});

test('no horizontal page scroll from phone to wide desktop', async ({ page }) => {
  for (const width of [360, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/halls/', '/halls/prehistoric-journey/', '/special-exhibitions/', '/visit/']) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(0);
    }
  }
});
