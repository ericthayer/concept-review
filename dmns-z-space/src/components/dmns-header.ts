/**
 * <dmns-header>: primary nav, Stillness toggle, theme toggle, ticket CTA.
 * The nav and CTA are server-rendered; this element only reveals and wires the toggles.
 */
import { readStillness, writeStillness } from '../lib/motion.js';
import { safeStorage } from '../dom/storage.js';

export const THEME_KEY = 'dmns:theme';

export type HeaderEvent =
  | { readonly type: 'stillness'; readonly on: boolean }
  | { readonly type: 'theme'; readonly theme: 'light' | 'dark' };

export class DmnsHeader extends HTMLElement {
  #stillness: HTMLButtonElement | null = null;
  #theme: HTMLButtonElement | null = null;

  connectedCallback(): void {
    const toggles = this.querySelector<HTMLElement>('[data-toggles]');
    this.#stillness = this.querySelector<HTMLButtonElement>('[data-stillness-toggle]');
    this.#theme = this.querySelector<HTMLButtonElement>('[data-theme-toggle]');
    if (!toggles || !this.#stillness || !this.#theme) return;
    toggles.hidden = false;
    this.#sync();
    this.#stillness.addEventListener('click', this.#onStillness);
    this.#theme.addEventListener('click', this.#onTheme);
  }

  disconnectedCallback(): void {
    this.#stillness?.removeEventListener('click', this.#onStillness);
    this.#theme?.removeEventListener('click', this.#onTheme);
  }

  #currentTheme(): 'light' | 'dark' {
    const explicit = document.documentElement.dataset['theme'];
    if (explicit === 'light' || explicit === 'dark') return explicit;
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  #sync(): void {
    this.#stillness?.setAttribute('aria-pressed', String(readStillness(safeStorage())));
    this.#theme?.setAttribute('aria-pressed', String(this.#currentTheme() === 'light'));
  }

  #emit(detail: HeaderEvent): void {
    this.dispatchEvent(new CustomEvent<HeaderEvent>('dmns:header', { detail, bubbles: true }));
  }

  readonly #onStillness = (): void => {
    const on = !readStillness(safeStorage());
    writeStillness(safeStorage(), on);
    if (on) document.documentElement.dataset['stillness'] = 'on';
    else delete document.documentElement.dataset['stillness'];
    this.#sync();
    this.#emit({ type: 'stillness', on });
  };

  readonly #onTheme = (): void => {
    const theme = this.#currentTheme() === 'light' ? 'dark' : 'light';
    document.documentElement.dataset['theme'] = theme;
    try {
      safeStorage()?.setItem(THEME_KEY, theme);
    } catch {
      // Storage unavailable: the theme still applies to this page.
    }
    this.#sync();
    this.#emit({ type: 'theme', theme });
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'dmns-header': DmnsHeader;
  }
}
