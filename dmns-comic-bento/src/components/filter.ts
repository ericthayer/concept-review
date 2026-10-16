/** <dmns-filter>: Exhibition and program filters; hidden until upgraded. */
export class DmnsFilter extends HTMLElement {}

customElements.define('dmns-filter', DmnsFilter);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-filter': DmnsFilter;
  }
}
