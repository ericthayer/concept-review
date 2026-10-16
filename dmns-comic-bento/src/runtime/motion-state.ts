/**
 * DOM side of motion preferences: reads OS settings, Still Panels and engine
 * support, resolves one MotionLevel and mirrors it on <html data-motion>.
 */
import { parseStillPanels, resolveMotionLevel, STILL_PANELS_KEY, type MotionLevel, type MotionSupport } from '../lib/motion.ts';

export const MOTION_EVENT = 'dmns:motion-change';

export function detectSupport(): MotionSupport {
  const css = (q: string): boolean => typeof CSS !== 'undefined' && CSS.supports(q);
  return {
    sameDocument: 'startViewTransition' in document,
    crossDocument: 'onpagereveal' in window && css('view-transition-class: a'),
    scrollTimeline: css('animation-timeline: view()'),
  };
}

export function readStillPanels(): boolean {
  try {
    return parseStillPanels(localStorage.getItem(STILL_PANELS_KEY));
  } catch {
    return false;
  }
}

export function writeStillPanels(on: boolean): void {
  try {
    if (on) localStorage.setItem(STILL_PANELS_KEY, '1');
    else localStorage.removeItem(STILL_PANELS_KEY);
  } catch {
    /* storage unavailable: the toggle still applies for this page */
  }
}

const reducedQuery = (): MediaQueryList => matchMedia('(prefers-reduced-motion: reduce)');

export function currentMotionLevel(): MotionLevel {
  return resolveMotionLevel({
    prefersReducedMotion: reducedQuery().matches,
    stillPanels: document.documentElement.hasAttribute('data-still'),
    support: detectSupport(),
  });
}

export function applyMotionLevel(): MotionLevel {
  const level = currentMotionLevel();
  const root = document.documentElement;
  if (root.dataset['motion'] !== level) {
    root.dataset['motion'] = level;
    document.dispatchEvent(new CustomEvent<MotionLevel>(MOTION_EVENT, { detail: level }));
  }
  return level;
}

export function setStillPanels(on: boolean): void {
  writeStillPanels(on);
  document.documentElement.toggleAttribute('data-still', on);
  applyMotionLevel();
}

export function watchMotionPreferences(): void {
  if (readStillPanels()) document.documentElement.setAttribute('data-still', '');
  applyMotionLevel();
  reducedQuery().addEventListener('change', () => applyMotionLevel());
}

export function motionIsFull(): boolean {
  return document.documentElement.dataset['motion'] === 'full';
}
