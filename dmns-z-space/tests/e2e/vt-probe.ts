import type { Page } from '@playwright/test';

export interface RevealRecord {
  readonly path: string;
  readonly types: string[];
  readonly animations: { readonly pseudo: string; readonly name: string; readonly props: string[] }[];
}

/**
 * Records, on every page, the transition types and the pseudo-element animations that run
 * for the incoming page. Registered before the site's own scripts; samples one frame later.
 */
export async function probeTransitions(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __reveals: unknown[] };
    const key = 'dmns-test:reveals';
    w.__reveals = JSON.parse(sessionStorage.getItem(key) ?? '[]') as unknown[];
    window.addEventListener('pagereveal', (event) => {
      const vt = event.viewTransition;
      if (!vt) return;
      requestAnimationFrame(() => {
        const animations = document.documentElement.getAnimations({ subtree: true }).map((a) => {
          const effect = a.effect as KeyframeEffect | null;
          const props = new Set<string>();
          for (const frame of effect?.getKeyframes() ?? []) for (const k of Object.keys(frame)) if (!['offset', 'computedOffset', 'easing', 'composite'].includes(k)) props.add(k);
          return { pseudo: effect?.pseudoElement ?? '', name: (a as CSSAnimation).animationName ?? '', props: [...props] };
        });
        w.__reveals.push({ path: location.pathname, types: [...vt.types], animations });
        sessionStorage.setItem(key, JSON.stringify(w.__reveals));
      });
    });
  });
}

export async function lastReveal(page: Page): Promise<RevealRecord | undefined> {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const list = JSON.parse(sessionStorage.getItem('dmns-test:reveals') ?? '[]') as RevealRecord[];
    return list.at(-1);
  });
}

/** Clicks a link the way a visitor would (focus + Enter keeps pointer position out of it). */
export async function follow(page: Page, href: string): Promise<void> {
  const link = page.locator(`main a[href="${href}"]`).first();
  await link.scrollIntoViewIfNeeded();
  await link.focus();
  await Promise.all([page.waitForURL(`**${href}`), page.keyboard.press('Enter')]);
}
