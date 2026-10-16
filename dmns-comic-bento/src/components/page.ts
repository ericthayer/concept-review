/** <dmns-page>: container-query root. Hands non-panel art (splash, stair) to the boil scheduler. */
import { observeBoil } from '../runtime/boil.ts';

export class DmnsPage extends HTMLElement {
  connectedCallback(): void {
    for (const el of this.querySelectorAll('.splash__panel, .stair-climber')) observeBoil(el);
  }

  get splash(): HTMLElement | null {
    return this.querySelector<HTMLElement>('#splash .splash__panel');
  }
}

customElements.define('dmns-page', DmnsPage);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-page': DmnsPage;
  }
}
