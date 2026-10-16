/** <dmns-sfx>: Decorative hand-lettered SFX word (aria-hidden), max one per spread. */
export class DmnsSfx extends HTMLElement {}

customElements.define('dmns-sfx', DmnsSfx);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-sfx': DmnsSfx;
  }
}
