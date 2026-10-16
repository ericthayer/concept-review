import { expect, test, type Page } from '@playwright/test';

const FORBIDDEN = ['transform', 'translate', 'scale', 'rotate', 'clipPath', '--ink', 'strokeDashoffset'];

/** Names of every running animation plus the properties each one animates. */
async function animationReport(page: Page): Promise<{ names: string[]; props: string[] }> {
  return page.evaluate(() => {
    const anims = document.getAnimations();
    const props = anims.flatMap((a) => {
      const effect = a.effect as KeyframeEffect | null;
      return effect ? effect.getKeyframes().flatMap((k) => Object.keys(k).filter((p) => !['offset', 'easing', 'composite', 'computedOffset'].includes(p))) : [];
    });
    return { names: anims.map((a) => (a as CSSAnimation).animationName ?? 'transition'), props: [...new Set(props)] };
  });
}

async function scrollThrough(page: Page): Promise<void> {
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(120);
  }
}

test.describe('full motion', () => {
  test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'no-preference' }));

  test('ink, boil and beats run', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    await page.mouse.wheel(0, -2100);
    await expect.poll(() => page.locator('[data-live]').count()).toBeGreaterThan(0);
    const { names } = await animationReport(page);
    expect(names).toContain('boil-frame');
    expect(names).toContain('ink-stroke');
  });

  test('beat strip plays once and rests on the final beat', async ({ page }) => {
    await page.goto('/');
    const strip = page.locator('dmns-beat-strip').first();
    await strip.scrollIntoViewIfNeeded();
    await expect(strip).toHaveAttribute('data-current', /\d/);
    await expect(strip).not.toHaveAttribute('data-current', /\d/, { timeout: 6000 });
    await page.waitForTimeout(1500);
    await expect(strip).not.toHaveAttribute('data-current', /\d/);
    await expect(strip.locator('.beat').last()).toBeVisible();
  });

  test('at most six panels boil at once', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 2400 });
    await page.goto('/halls/');
    await page.waitForTimeout(400);
    const live = await page.locator('[data-live]').count();
    expect(live).toBeLessThanOrEqual(6);
  });
});

test.describe('reduced motion', () => {
  test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }));

  test('no transform, clip-path or stroke animations and no boil', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    const { names, props } = await animationReport(page);
    expect(names).not.toContain('boil-frame');
    expect(props.filter((p) => FORBIDDEN.includes(p)), names.join(' ')).toEqual([]);
  });

  test('beats rest on the final beat; Replay still plays on request', async ({ page }) => {
    await page.goto('/');
    const strip = page.locator('dmns-beat-strip').first();
    await strip.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await expect(strip).not.toHaveAttribute('data-current', /\d/);
    await strip.getByRole('button', { name: 'Replay' }).click();
    await expect(strip).toHaveAttribute('data-current', '1');
  });
});

test.describe('Still Panels', () => {
  test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'no-preference' }));

  test('gives the reduced result and persists across navigation', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Still Panels' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.goto('/halls/');
    await expect(page.getByRole('button', { name: 'Still Panels' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
    await scrollThrough(page);
    const { names, props } = await animationReport(page);
    expect(names).not.toContain('boil-frame');
    expect(props.filter((p) => FORBIDDEN.includes(p)), names.join(' ')).toEqual([]);
  });
});
