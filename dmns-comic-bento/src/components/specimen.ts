/** <dmns-specimen>: The traveler character (decorative). */
export class DmnsSpecimen extends HTMLElement {}

customElements.define('dmns-specimen', DmnsSpecimen);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-specimen': DmnsSpecimen;
  }
}
