/** <dmns-floor-tabs>: Halls floor switcher; anchor links until upgraded. */
export class DmnsFloorTabs extends HTMLElement {}

customElements.define('dmns-floor-tabs', DmnsFloorTabs);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-floor-tabs': DmnsFloorTabs;
  }
}
