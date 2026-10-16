/**
 * Boil scheduler: hand-drawn frame cycling runs only on art that is on screen,
 * at most MAX_LIVE at once (the oldest pauses), and never while the tab is hidden.
 * CSS does the cycling; this only toggles data-live.
 */
export const MAX_LIVE = 6;

const live: Element[] = [];
let observer: IntersectionObserver | null = null;

function setLive(el: Element, on: boolean): void {
  const i = live.indexOf(el);
  if (on && i === -1) {
    live.push(el);
    el.setAttribute('data-live', '');
    while (live.length > MAX_LIVE) live.shift()?.removeAttribute('data-live');
  } else if (!on && i !== -1) {
    live.splice(i, 1);
    el.removeAttribute('data-live');
  }
}

function ensureObserver(): IntersectionObserver | null {
  if (observer || typeof IntersectionObserver === 'undefined') return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) setLive(e.target, e.isIntersecting);
    },
    { threshold: 0.25 },
  );
  document.addEventListener('visibilitychange', () => {
    document.documentElement.toggleAttribute('data-hidden', document.hidden);
  });
  return observer;
}

export function observeBoil(el: Element): void {
  ensureObserver()?.observe(el);
}

export function unobserveBoil(el: Element): void {
  observer?.unobserve(el);
  setLive(el, false);
}

export function liveCount(): number {
  return live.length;
}
