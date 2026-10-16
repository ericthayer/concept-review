/** <dmns-caption>: Splits knockout text into word spans at build time; nothing to do at runtime. */
export class DmnsCaption extends HTMLElement {}

customElements.define('dmns-caption', DmnsCaption);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-caption': DmnsCaption;
  }
}
