import { expect, type Page } from '@playwright/test';

/** Press Tab until `selector` has focus, asserting a visible focus indicator at every stop. */
export async function tabTo(page: Page, selector: string, max = 250): Promise<void> {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const state = await page.evaluate((sel) => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return { match: false, visible: true, desc: 'body' };
      const style = getComputedStyle(el);
      const visible = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2;
      return { match: el.matches(sel), visible, desc: `${el.tagName.toLowerCase()} ${el.getAttribute('href') ?? el.textContent.trim().slice(0, 30)}` };
    }, selector);
    expect(state.visible, `focus indicator on ${state.desc}`).toBe(true);
    if (state.match) return;
  }
  throw new Error(`Never reached ${selector} with Tab`);
}
