import { expect, test } from '@playwright/test';

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`${reducedMotion} motion`, () => {
    test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion }));

    test('Look closer works by keyboard; Escape steps back and returns focus', async ({ page }) => {
      await page.goto('/');
      const button = page.locator('.lean-btn').first();
      const panel = page.locator(`#${await button.getAttribute('aria-controls')}`);
      const grid = panel.locator('xpath=ancestor::*[contains(@class, "spread__grid")]');
      await button.focus();
      await page.keyboard.press('Enter');
      await expect(grid).toHaveAttribute('data-lean', '');
      await expect(panel).toHaveAttribute('data-focused', '');
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(panel.locator('h2, h3').first()).toBeFocused();
      await expect(page.locator('#announcer')).toContainText('Press Escape');
      await page.keyboard.press('Escape');
      await expect(grid).not.toHaveAttribute('data-lean', '');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(button).toBeFocused();
      await expect(page.locator('[style*="view-transition-name"]')).toHaveCount(0);
    });

    test('floor tabs are a tablist with arrow keys', async ({ page }) => {
      await page.goto('/halls/');
      const tabs = page.getByRole('tab');
      await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel')).toHaveCount(1);
      await tabs.first().focus();
      await page.keyboard.press('ArrowRight');
      await expect(tabs.nth(1)).toBeFocused();
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator(`#${await tabs.nth(1).getAttribute('aria-controls')}`)).toBeVisible();
      await expect(page.locator(`#${await tabs.first().getAttribute('aria-controls')}`)).toBeHidden();
      await page.keyboard.press('End');
      await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
    });

    test('a floor hash opens that floor', async ({ page }) => {
      await page.goto('/halls/#floor-2');
      await expect(page.locator('#tab-floor-2')).toHaveAttribute('aria-selected', 'true');
    });

    test('filters press, hide and announce', async ({ page }) => {
      await page.goto('/special-exhibitions/');
      const filter = page.locator('dmns-filter');
      await expect(filter).toBeVisible();
      const all = page.locator('#spread-exhibitions dmns-panel[data-filter]');
      const total = await all.count();
      await filter.getByRole('button', { name: 'Coming soon' }).click();
      await expect(filter.getByRole('button', { name: 'Coming soon' })).toHaveAttribute('aria-pressed', 'true');
      await expect(filter.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('#announcer')).toContainText(`of ${total}`);
      const shown = await page.locator('#spread-exhibitions dmns-panel[data-filter]:not([hidden])').count();
      expect(shown).toBeLessThan(total);
      await filter.getByRole('button', { name: 'All' }).click();
      await expect(page.locator('#spread-exhibitions dmns-panel[data-filter]:not([hidden])')).toHaveCount(total);
    });
  });
}
