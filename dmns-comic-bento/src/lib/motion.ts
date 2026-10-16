/**
 * Motion preference resolution. One MotionLevel drives every animated system:
 *  - 'full'    choreography runs (boil, beats, ink-in, camera moves)
 *  - 'reduced' OS reduce-motion or Still Panels: no boil/beats autoplay/ink-in,
 *              camera moves become a 150ms crossfade
 *  - 'none'    the engine supports neither View Transitions nor scroll timelines:
 *              instant navigation, static final states, a CSS-only entrance
 */

export type MotionLevel = 'full' | 'reduced' | 'none';

export interface MotionSupport {
  /** document.startViewTransition exists (same-document VT) */
  readonly sameDocument: boolean;
  /** cross-document VT (pagereveal / view-transition-class support as proxy) */
  readonly crossDocument: boolean;
  /** CSS.supports('animation-timeline: view()') */
  readonly scrollTimeline: boolean;
}

export interface MotionInputs {
  readonly prefersReducedMotion: boolean;
  readonly stillPanels: boolean;
  readonly support: MotionSupport;
}

export function resolveMotionLevel(input: MotionInputs): MotionLevel {
  if (input.prefersReducedMotion || input.stillPanels) return 'reduced';
  const { sameDocument, crossDocument, scrollTimeline } = input.support;
  if (!sameDocument && !crossDocument && !scrollTimeline) return 'none';
  return 'full';
}

/** Duration (ms) a camera move should use for a motion level. */
export function cameraDuration(level: MotionLevel, fullMs: number): number {
  if (level === 'full') return fullMs;
  if (level === 'reduced') return 150;
  return 0;
}

export const STILL_PANELS_KEY = 'dmns:still-panels';
export const THEME_KEY = 'dmns:theme';

export type ThemeChoice = 'light' | 'dark';

export function parseStillPanels(raw: string | null): boolean {
  return raw === '1';
}

export function parseTheme(raw: string | null): ThemeChoice | null {
  return raw === 'light' || raw === 'dark' ? raw : null;
}
