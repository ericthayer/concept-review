/** <dmns-spread>: A named-layout band of panels. */
export class DmnsSpread extends HTMLElement {}

customElements.define('dmns-spread', DmnsSpread);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-spread': DmnsSpread;
  }
}
