/**
 * <dmns-panel>: one bento cell. Light DOM (it carries view-transition names).
 * Registers its art with the boil scheduler; transition names are assigned
 * only by the camera, never statically.
 */
import { observeBoil, unobserveBoil } from '../runtime/boil.ts';

export class DmnsPanel extends HTMLElement {
  connectedCallback(): void {
    if (this.hasAttribute('data-has-art')) observeBoil(this);
  }

  disconnectedCallback(): void {
    unobserveBoil(this);
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
