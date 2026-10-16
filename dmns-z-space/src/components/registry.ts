import { DmnsDoorway } from './dmns-doorway.js';
import { DmnsEventCorridor } from './dmns-event-corridor.js';
import { DmnsFilter } from './dmns-filter.js';
import { DmnsFloorplan } from './dmns-floorplan.js';
import { DmnsHeader } from './dmns-header.js';
import { DmnsMinimap } from './dmns-minimap.js';
import { DmnsNotice } from './dmns-notice.js';
import { DmnsSealedHall } from './dmns-sealed-hall.js';
import { DmnsVitrine } from './dmns-vitrine.js';

const ELEMENTS: readonly (readonly [string, CustomElementConstructor])[] = [
  ['dmns-header', DmnsHeader],
  ['dmns-minimap', DmnsMinimap],
  ['dmns-doorway', DmnsDoorway],
  ['dmns-floorplan', DmnsFloorplan],
  ['dmns-vitrine', DmnsVitrine],
  ['dmns-notice', DmnsNotice],
  ['dmns-event-corridor', DmnsEventCorridor],
  ['dmns-sealed-hall', DmnsSealedHall],
  ['dmns-filter', DmnsFilter],
];

export function defineElements(): void {
  for (const [name, ctor] of ELEMENTS) if (!customElements.get(name)) customElements.define(name, ctor);
}
