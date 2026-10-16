/**
 * <dmns-doorway>: a portal link. Writes the camera origin (its own centre) on activation so the
 * `enter` dolly aims into the doorway. Space activates like Enter for keyboard parity.
 */
import { recordOrigin } from '../dom/page-transitions.js';

export class DmnsDoorway extends HTMLElement {
  #link: HTMLAnchorElement | null = null;

  connectedCallback(): void {
    this.#link = this.querySelector<HTMLAnchorElement>('a[href]');
    this.#link?.addEventListener('click', this.#onActivate);
    this.#link?.addEventListener('keydown', this.#onKey);
  }

  disconnectedCallback(): void {
    this.#link?.removeEventListener('click', this.#onActivate);
    this.#link?.removeEventListener('keydown', this.#onKey);
  }

  readonly #onActivate = (): void => {
    const room = this.querySelector('.doorway__room') ?? this.#link;
    if (room) recordOrigin(room);
  };

  readonly #onKey = (event: KeyboardEvent): void => {
    if (event.key !== ' ' || event.repeat) return;
    event.preventDefault();
    this.#link?.click();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'dmns-doorway': DmnsDoorway;
  }
}
