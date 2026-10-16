import { expect, test } from '@playwright/test';

test('without startViewTransition, morphs still change state at once', async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(Document.prototype, 'startViewTransition');
  });
  await page.goto('/special-exhibitions/');
  await page.getByRole('button', { name: 'Coming soon' }).click();
  await expect(page.getByRole('button', { name: 'Coming soon' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#spread-exhibitions dmns-panel[data-filter="open"]').first()).toBeHidden();
});

test.describe('forced colors', () => {
  test.beforeEach(async ({ page }) => page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' }));

  /* axe's contrast rule reads unforced backgrounds under emulated forced colors, so it is not run here. */
  test('panels keep visible edges and only the current page is underlined', async ({ page }) => {
    await page.goto('/halls/');
    await expect(page.locator('.masthead__nav a[aria-current]')).not.toHaveCSS('border-bottom-color', await page.locator('.masthead__nav a:not([aria-current])').first().evaluate((el) => getComputedStyle(el).borderBottomColor));
    await expect(page.locator('dmns-panel .panel').first()).toHaveCSS('border-top-style', 'solid');
  });
});
