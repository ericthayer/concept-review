/** <dmns-masthead>: nav chrome plus the theme and Still Panels toggles. */
import { parseTheme, THEME_KEY, type ThemeChoice } from '../lib/motion.ts';
import { setStillPanels } from '../runtime/motion-state.ts';

function effectiveTheme(): ThemeChoice {
  const set = parseTheme(document.documentElement.dataset['theme'] ?? null);
  if (set) return set;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export class DmnsMasthead extends HTMLElement {
  #theme: HTMLButtonElement | null = null;
  #still: HTMLButtonElement | null = null;

  connectedCallback(): void {
    this.#theme = this.querySelector<HTMLButtonElement>('[data-action="theme"]');
    this.#still = this.querySelector<HTMLButtonElement>('[data-action="still"]');
    this.#theme?.addEventListener('click', this.#toggleTheme);
    this.#still?.addEventListener('click', this.#toggleStill);
    this.#sync();
    if (this.#theme) this.#theme.hidden = false;
    if (this.#still) this.#still.hidden = false;
  }

  disconnectedCallback(): void {
    this.#theme?.removeEventListener('click', this.#toggleTheme);
    this.#still?.removeEventListener('click', this.#toggleStill);
  }

  #sync(): void {
    this.#theme?.setAttribute('aria-pressed', String(effectiveTheme() === 'dark'));
    this.#still?.setAttribute('aria-pressed', String(document.documentElement.hasAttribute('data-still')));
  }

  #toggleTheme = (): void => {
    const next: ThemeChoice = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset['theme'] = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage unavailable */
    }
    this.#sync();
  };

  #toggleStill = (): void => {
    setStillPanels(!document.documentElement.hasAttribute('data-still'));
    this.#sync();
  };
}

customElements.define('dmns-masthead', DmnsMasthead);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-masthead': DmnsMasthead;
  }
}
