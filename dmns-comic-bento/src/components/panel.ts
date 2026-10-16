/**
 * <dmns-panel>: one bento cell. Light DOM (it carries view-transition names).
 * Registers its art with the boil scheduler and upgrades its "Look closer"
 * button; transition names are assigned only by the camera and morphs.
 */
import { observeBoil, unobserveBoil } from '../runtime/boil.ts';
import { toggleLean } from '../runtime/lean.ts';

export class DmnsPanel extends HTMLElement {
  #lean: HTMLButtonElement | null = null;
  readonly #onLean = (): void => {
    if (this.#lean) toggleLean(this, this.#lean);
  };

  connectedCallback(): void {
    if (this.hasAttribute('data-has-art')) observeBoil(this);
    this.#lean = this.querySelector<HTMLButtonElement>('.lean-btn');
    if (this.#lean) {
      this.#lean.hidden = false;
      this.#lean.addEventListener('click', this.#onLean);
    }
  }

  disconnectedCallback(): void {
    unobserveBoil(this);
    this.#lean?.removeEventListener('click', this.#onLean);
  }

  get link(): HTMLAnchorElement | null {
    return this.querySelector<HTMLAnchorElement>('.panel__link');
  }

  get heading(): HTMLElement | null {
    return this.querySelector<HTMLElement>('.panel__title, .plain-heading');
  }
}

customElements.define('dmns-panel', DmnsPanel);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-panel': DmnsPanel;
  }
}
