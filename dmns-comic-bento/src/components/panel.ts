/** <dmns-panel>: One bento cell with a stretched link. */
export class DmnsPanel extends HTMLElement {}

customElements.define('dmns-panel', DmnsPanel);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-panel': DmnsPanel;
  }
}
