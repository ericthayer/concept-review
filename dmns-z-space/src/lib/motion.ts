/** Motion preference and capability detection. Feature-detect, never UA-sniff. */

export const STILLNESS_KEY = 'dmns:stillness';

export interface MotionSupport {
  readonly sameDocument: boolean;
  readonly crossDocument: boolean;
  readonly transitionClass: boolean;
  readonly scrollTimeline: boolean;
}

export function detectMotionSupport(doc: Document = document): MotionSupport {
  const css = (rule: string): boolean => typeof CSS !== 'undefined' && CSS.supports(rule);
  return {
    sameDocument: 'startViewTransition' in doc,
    // Cross-document VT ships with the pagereveal event; there is no CSS.supports for @view-transition.
    crossDocument: 'onpagereveal' in window,
    transitionClass: css('view-transition-class: a'),
    scrollTimeline: css('animation-timeline: view()'),
  };
}

export function readStillness(storage: Pick<Storage, 'getItem'> | null): boolean {
  try {
    return storage?.getItem(STILLNESS_KEY) === 'on';
  } catch {
    return false;
  }
}

export function writeStillness(storage: Pick<Storage, 'setItem' | 'removeItem'> | null, on: boolean): void {
  try {
    if (on) storage?.setItem(STILLNESS_KEY, 'on');
    else storage?.removeItem(STILLNESS_KEY);
  } catch {
    // Storage blocked (private mode, policy): the toggle still applies for this page.
  }
}

/** Theatrical motion is allowed only when neither the OS nor the Stillness toggle asks for calm. */
export function motionAllowed(reducedMotionQuery: boolean, stillness: boolean): boolean {
  return !reducedMotionQuery && !stillness;
}
