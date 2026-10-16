/**
 * <dmns-floorplan>: Directory floor switcher. Server HTML lists every floor; this element shows
 * one at a time and slides floors vertically with a same-document transition.
 */
import { announce, transition } from '../dom/transition.js';

export class DmnsFloorplan extends HTMLElement {
  #buttons: HTMLButtonElement[] = [];
  #floors: HTMLElement[] = [];
  #status: HTMLElement | null = null;
  #current = -1;

  connectedCallback(): void {
    const switcher = this.querySelector<HTMLElement>('[data-switcher]');
    this.#buttons = [...this.querySelectorAll<HTMLButtonElement>('[data-show-floor]')];
    this.#floors = [...this.querySelectorAll<HTMLElement>('.floorplan__floor')];
    this.#status = this.querySelector('[data-floor-status]');
    if (!switcher || this.#buttons.length === 0) return;

    const raw = new URLSearchParams(location.search).get('floor') ?? (/^#floor-(\d)$/.exec(location.hash)?.[1] ?? null);
    const requested = raw === null ? Number.NaN : Number(raw);
    const initial = this.#floors.some((f) => Number(f.dataset['floor']) === requested) ? requested : Number(this.#floors[0]?.dataset['floor'] ?? 3);
    this.classList.add('is-enhanced');
    switcher.hidden = false;
    this.#show(initial);
    for (const button of this.#buttons) button.addEventListener('click', this.#onClick);
  }

  disconnectedCallback(): void {
    for (const button of this.#buttons) button.removeEventListener('click', this.#onClick);
  }

  #show(floor: number): void {
    this.#current = floor;
    for (const f of this.#floors) f.classList.toggle('is-active', Number(f.dataset['floor']) === floor);
    for (const b of this.#buttons) b.setAttribute('aria-pressed', String(Number(b.dataset['showFloor']) === floor));
  }

  readonly #onClick = (event: Event): void => {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;
    const floor = Number(button.dataset['showFloor']);
    if (floor === this.#current) return;
    const type = floor > this.#current ? 'floor-up' : 'floor-down';
    void transition(() => { this.#show(floor); }, [type]).then(() => {
      const section = this.#floors.find((f) => Number(f.dataset['floor']) === floor);
      const heading = section?.querySelector<HTMLElement>('h2');
      heading?.focus();
      announce(this.#status, `Showing ${heading ? heading.textContent.replace(/\s+/g, " ").trim() : `floor ${floor}`}`);
    });
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'dmns-floorplan': DmnsFloorplan;
  }
}
