/**
 * Same-document transitions (§3.2). Runs `update()` directly when the API is missing or the
 * visitor is in calm mode, so callers never branch on support.
 */
import { isCalm } from './page-transitions.js';

export type SameDocumentType = 'floor-up' | 'floor-down' | 'vitrine-open' | 'vitrine-close' | 'filter';

let current: ViewTransition | null = null;

export async function transition(update: () => void | Promise<void>, types: readonly SameDocumentType[]): Promise<void> {
  if (!('startViewTransition' in document) || isCalm()) {
    await update();
    return;
  }
  // Never queue behind a running transition: skip it and start from the current state.
  current?.skipTransition();
  let vt: ViewTransition;
  try {
    vt = document.startViewTransition({ update, types: [...types] });
  } catch {
    // Engines with same-document VT but without the options form.
    vt = document.startViewTransition(update);
  }
  current = vt;
  try {
    await vt.finished;
  } finally {
    if (current === vt) current = null;
  }
}

/** Polite announcement through one shared live region per component. */
export function announce(region: Element | null, message: string): void {
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
