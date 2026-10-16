/**
 * <dmns-filter>: exhibition and program filters. Hidden without JS (every
 * panel shows). Upgraded, aria-pressed buttons filter the target spread:
 * leaving panels un-ink (240ms), staying ones slide to their new cells.
 */
import { announce } from '../runtime/announce.ts';
import { morph, vtName } from '../runtime/transition.ts';

export class DmnsFilter extends HTMLElement {
  #grid: HTMLElement | null = null;
  #buttons: HTMLButtonElement[] = [];

  connectedCallback(): void {
    const target = this.dataset['target'];
    this.#grid = target ? (document.getElementById(target)?.querySelector<HTMLElement>('.spread__grid') ?? null) : null;
    this.#buttons = [...this.querySelectorAll<HTMLButtonElement>('button[data-filter-value]')];
    if (!this.#grid || this.#buttons.length === 0) return;
    for (const button of this.#buttons) {
      button.addEventListener('click', () => this.apply(button.dataset['filterValue'] ?? 'all'));
    }
    this.hidden = false;
  }

  apply(value: string): void {
    const grid = this.#grid;
    if (!grid) return;
    const panels = [...grid.children].filter((el): el is HTMLElement => el instanceof HTMLElement);
    const filterable = panels.filter((p) => p.dataset['filter'] !== undefined);
    const shows = (p: HTMLElement): boolean => {
      const tags = p.dataset['filter'];
      return value === 'all' || tags === undefined || tags.split(' ').includes(value);
    };
    const named = panels.map((el, i) => ({ el, name: vtName('filter', el, i), cls: 'filtered' }));
    void morph(
      () => {
        for (const b of this.#buttons) b.setAttribute('aria-pressed', String(b.dataset['filterValue'] === value));
        for (const p of panels) p.hidden = !shows(p);
      },
      ['filter'],
      named,
    );
    const count = filterable.filter(shows).length;
    announce(`Showing ${count} of ${filterable.length}.`);
  }
}

customElements.define('dmns-filter', DmnsFilter);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-filter': DmnsFilter;
  }
}
