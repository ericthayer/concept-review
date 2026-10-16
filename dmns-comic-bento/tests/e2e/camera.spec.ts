import { expect, test, type Page } from '@playwright/test';

/** Follow a link on the current page and return the camera move the new page recorded. */
async function follow(page: Page, selector: string, path: string): Promise<string | null> {
  const before = new URL(page.url()).pathname;
  const link = page.locator(selector).first();
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await page.waitForURL((url) => url.pathname !== before && new RegExp(`^${path.replace('*', '[^/]+')}$`).test(url.pathname));
  await page.waitForLoadState('domcontentloaded');
  return page.locator('html').getAttribute('data-camera');
}

test.describe('full motion', () => {
  test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'no-preference' }));

  test('zoom in, turn the page, zoom out, new issue', async ({ page }) => {
    await page.goto('/halls/#floor-3');
    expect(await follow(page, 'a.panel__link[href="/halls/prehistoric-journey/"]', '/halls/prehistoric-journey/')).toBe('zoom-in');
    expect(await follow(page, '#p-next a.panel__link', '/halls/*/')).toBe('turn-next');
    expect(await follow(page, '#p-prev a.panel__link', '/halls/prehistoric-journey/')).toBe('turn-prev');
    expect(await follow(page, '#p-back a.panel__link', '/halls/')).toBe('zoom-out');
    expect(await follow(page, 'nav[aria-label="Primary"] a[href="/theaters/"]', '/theaters/')).toBe('new-issue');
  });

  test('wayfinding chrome is named so it never moves with the page', async ({ page }) => {
    await page.goto('/');
    const names = await page.evaluate(() =>
      ['.masthead', '.info-strip'].map((s) => getComputedStyle(document.querySelector(s) as Element).viewTransitionName),
    );
    expect(names).toEqual(['masthead', 'info-strip']);
  });
});

test.describe('reduced motion', () => {
  test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }));

  test('every move becomes a calm crossfade', async ({ page }) => {
    await page.goto('/halls/#floor-3');
    expect(await follow(page, 'a.panel__link[href="/halls/prehistoric-journey/"]', '/halls/prehistoric-journey/')).toBe('calm');
    await expect(page.locator('[style*="view-transition-name"]')).toHaveCount(0);
  });
});
