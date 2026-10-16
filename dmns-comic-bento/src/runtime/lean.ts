/**
 * Lean-in: "Look closer" widens one panel across its spread and steps the rest
 * down to small cells; Escape or the same button steps back. A click, never
 * hover or scroll. Focus moves to the panel heading and back to the button.
 */
import { announce, headingText } from './announce.ts';
import { morph, vtName, type Named } from './transition.ts';

interface Leaning {
  readonly grid: HTMLElement;
  readonly panel: HTMLElement;
  readonly button: HTMLButtonElement;
}

let leaning: Leaning | null = null;
let escapeBound = false;

const LABEL = { closed: 'Look closer', open: 'Step back' } as const;

function setButton(button: HTMLButtonElement, open: boolean): void {
  button.setAttribute('aria-expanded', String(open));
  const label = button.firstChild;
  if (label && label.nodeType === Node.TEXT_NODE) label.nodeValue = open ? LABEL.open : LABEL.closed;
}

function namesFor(grid: HTMLElement): Named[] {
  return [...grid.children]
    .filter((el): el is HTMLElement => el instanceof HTMLElement && !el.hidden)
    .map((el, i) => ({ el, name: vtName('lean', el, i), cls: 'lean' }));
}

function headingOf(panel: HTMLElement): HTMLElement | null {
  const h = panel.querySelector<HTMLElement>('h2, h3');
  if (h && !h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
  return h;
}

function bindEscape(): void {
  if (escapeBound) return;
  escapeBound = true;
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && leaning) {
      event.preventDefault();
      leanOut();
    }
  });
}

export function leanIn(panel: HTMLElement, button: HTMLButtonElement): void {
  const grid = panel.closest<HTMLElement>('.spread__grid');
  if (!grid) return;
  bindEscape();
  const prev = leaning;
  leaning = { grid, panel, button };
  void morph(
    () => {
      if (prev) {
        prev.panel.removeAttribute('data-focused');
        setButton(prev.button, false);
        if (prev.grid !== grid) prev.grid.removeAttribute('data-lean');
      }
      grid.setAttribute('data-lean', '');
      panel.setAttribute('data-focused', '');
      setButton(button, true);
    },
    ['lean-in'],
    namesFor(grid),
  ).then(() => {
    const heading = headingOf(panel);
    heading?.focus();
    announce(`${headingText(heading)}, up close. Press Escape to step back.`);
  });
}

export function leanOut(): void {
  const state = leaning;
  if (!state) return;
  leaning = null;
  void morph(
    () => {
      state.grid.removeAttribute('data-lean');
      state.panel.removeAttribute('data-focused');
      setButton(state.button, false);
    },
    ['lean-out'],
    namesFor(state.grid),
  ).then(() => {
    state.button.focus();
    announce('Back to the full spread.');
  });
}

export function toggleLean(panel: HTMLElement, button: HTMLButtonElement): void {
  if (leaning?.panel === panel) leanOut();
  else leanIn(panel, button);
}
