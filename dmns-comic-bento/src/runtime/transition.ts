/**
 * Same-document morphs (step 6). One helper wraps document.startViewTransition:
 * it names the elements that should morph, starts the transition with types,
 * and clears the names when it finishes. Below full motion, or without the API,
 * the update runs at once and nothing animates.
 */
import { motionIsFull } from './motion-state.ts';

export interface Named {
  readonly el: HTMLElement;
  readonly name: string;
  /** view-transition-class, so one CSS rule styles a whole set */
  readonly cls?: string;
}

interface Running {
  readonly vt: ViewTransition;
  readonly cleanup: () => void;
}

let current: Running | null = null;

function applyNames(named: readonly Named[]): () => void {
  for (const { el, name, cls } of named) {
    el.style.viewTransitionName = name;
    if (cls) el.style.setProperty('view-transition-class', cls);
  }
  return () => {
    for (const { el } of named) {
      el.style.viewTransitionName = '';
      el.style.removeProperty('view-transition-class');
    }
  };
}

function start(update: () => void, types: readonly string[]): ViewTransition {
  try {
    return document.startViewTransition({ update, types: [...types] });
  } catch {
    return document.startViewTransition(update);
  }
}

/** Run `update` as a view transition of the given types. Resolves when the morph is over. */
export function morph(update: () => void, types: readonly string[], named: readonly Named[] = []): Promise<void> {
  if (current) {
    current.vt.skipTransition();
    current.cleanup();
    current = null;
  }
  if (!motionIsFull() || !('startViewTransition' in document)) {
    update();
    return Promise.resolve();
  }
  const cleanup = applyNames(named);
  const entry: Running = { vt: start(update, types), cleanup };
  current = entry;
  return entry.vt.finished
    .catch(() => undefined)
    .finally(() => {
      if (current !== entry) return;
      cleanup();
      current = null;
    });
}

/** Unique, valid view-transition-name from an element id. */
export function vtName(prefix: string, el: Element, index: number): string {
  const id = el.id.replace(/[^a-zA-Z0-9_-]/g, '');
  return id ? `${prefix}-${id}` : `${prefix}-${index}`;
}
