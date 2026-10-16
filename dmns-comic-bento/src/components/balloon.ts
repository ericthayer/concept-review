/** <dmns-balloon>: Decorative speech balloon (aria-hidden). Jokes and invitations only, never facts. */
export class DmnsBalloon extends HTMLElement {}

customElements.define('dmns-balloon', DmnsBalloon);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-balloon': DmnsBalloon;
  }
}
