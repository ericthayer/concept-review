/** Step 6: same-document transitions and the §14 keyboard walkthrough. */
import { expect, test } from '@playwright/test';
import { tabTo } from './keyboard.js';

test('floor switcher shows one floor, slides it, then focuses and announces the new floor', async ({ page }) => {
  await page.goto('/halls/');
  await expect(page.locator('.floorplan__floor.is-active')).toHaveCount(1);
  await expect(page.locator('#floor-3')).toBeVisible();
  const button = page.locator('[data-show-floor="1"]');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#floor-1')).toBeVisible();
  await expect(page.locator('#floor-3')).toBeHidden();
  await expect(page.locator('#floor-1-title')).toBeFocused();
  await expect(page.locator('[data-floor-status]')).toContainText('Floor 1');
});

test('filter keeps matching exhibitions and announces the count', async ({ page }) => {
  await page.goto('/special-exhibitions/');
  await page.locator('[data-filter-value="coming"]').click();
  await expect(page.locator('[data-filter-status]')).toContainText('shown');
  const visible = page.locator('.exhibit-card:visible');
  expect(await visible.count()).toBeGreaterThan(0);
  for (const phase of await visible.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset['phase']))) expect(phase).toBe('coming');
  await expect(page.locator('[data-filter-status]')).toContainText('shown');
  await page.locator('[data-filter-value="all"]').click();
  await expect(page.locator('.exhibit-card:visible')).toHaveCount(await page.locator('.exhibit-card').count());
  await expect(page.locator('#floor-0')).toHaveCount(0);
});

test('vitrine dialog opens modally, closes on Escape and returns focus', async ({ page }) => {
  await page.goto('/halls/prehistoric-journey/');
  const opener = page.locator('[data-open]').first();
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('dialog[open]');
  await expect(dialog).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(opener).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await page.locator('dialog[open] button[value="close"]').press('Enter');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('keyboard-only walkthrough: Atrium → Directory → hall → vitrine → next hall → Atrium', async ({ page }) => {
  await page.goto('/');
  await tabTo(page, 'main a[href="/halls/"]');
  await Promise.all([page.waitForURL('**/halls/'), page.keyboard.press('Enter')]);
  await expect(page.locator('h1')).toHaveText('Directory');

  await tabTo(page, '[data-show-floor="3"]');
  await tabTo(page, 'main a[href="/halls/egyptian-mummies/"]');
  await Promise.all([page.waitForURL('**/halls/egyptian-mummies/'), page.keyboard.press('Enter')]);
  await expect(page.locator('h1')).toHaveText('Egyptian Mummies');

  await tabTo(page, '[data-open]');
  await page.keyboard.press('Enter');
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);

  await tabTo(page, 'a.exit-door[rel="next"]');
  await Promise.all([page.waitForURL('**/halls/konovalenko/'), page.keyboard.press('Enter')]);
  await expect(page.locator('h1')).toContainText('Konovalenko');

  await tabTo(page, 'a.exit-door--atrium');
  await Promise.all([page.waitForURL((url) => url.pathname === '/'), page.keyboard.press('Enter')]);
  await expect(page.locator('h1')).toHaveText('Denver Museum of Nature & Science');
});
