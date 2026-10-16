/** <dmns-beat-strip>: A 1-4 beat mini-strip; rests on the final beat. */
export class DmnsBeatStrip extends HTMLElement {}

customElements.define('dmns-beat-strip', DmnsBeatStrip);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-beat-strip': DmnsBeatStrip;
  }
}
