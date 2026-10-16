/** <dmns-page>: Container-query root for a page; owns the page counter and its spreads. */
export class DmnsPage extends HTMLElement {}

customElements.define('dmns-page', DmnsPage);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-page': DmnsPage;
  }
}
