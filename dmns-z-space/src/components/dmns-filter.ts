/**
 * <dmns-filter>: exhibition filter. Items that stay morph to their new positions; items that
 * leave fade back into darkness. Focus stays on the pressed toggle; the result is announced.
 */
import { announce, transition } from '../dom/transition.js';

type Phase = 'all' | 'now' | 'coming';

export class DmnsFilter extends HTMLElement {
  #buttons: HTMLButtonElement[] = [];
  #items: HTMLElement[] = [];
  #status: HTMLElement | null = null;

  connectedCallback(): void {
    const group = this.querySelector<HTMLElement>('[data-filter]');
    this.#buttons = [...this.querySelectorAll<HTMLButtonElement>('[data-filter-value]')];
    this.#items = [...this.querySelectorAll<HTMLElement>('[data-filter-item]')];
    this.#status = this.querySelector('[data-filter-status]');
    if (!group || this.#items.length === 0) return;
    group.hidden = false;
    for (const b of this.#buttons) b.addEventListener('click', this.#onClick);
  }

  disconnectedCallback(): void {
    for (const b of this.#buttons) b.removeEventListener('click', this.#onClick);
  }

  #apply(phase: Phase): number {
    let shown = 0;
    for (const item of this.#items) {
      const visible = phase === 'all' || item.dataset['phase'] === phase;
      item.hidden = !visible;
      if (visible) shown++;
    }
    for (const b of this.#buttons) b.setAttribute('aria-pressed', String(b.dataset['filterValue'] === phase));
    return shown;
  }

  #nameItems(on: boolean): void {
    this.#items.forEach((item, i) => {
      if (on) {
        item.style.setProperty('view-transition-name', `filter-item-${i}`);
        item.style.setProperty('view-transition-class', 'filter-item');
      } else {
        item.style.removeProperty('view-transition-name');
        item.style.removeProperty('view-transition-class');
      }
    });
  }

  readonly #onClick = (event: Event): void => {
    const value = (event.currentTarget as HTMLElement).dataset['filterValue'];
    const phase: Phase = value === 'now' || value === 'coming' ? value : 'all';
    let shown = 0;
    this.#nameItems(true);
    void transition(() => {
      shown = this.#apply(phase);
    }, ['filter']).finally(() => {
      this.#nameItems(false);
      announce(this.#status, `${shown} ${shown === 1 ? 'exhibition' : 'exhibitions'} shown`);
    });
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'dmns-filter': DmnsFilter;
  }
}
