import { DmnsHeader } from './dmns-header.js';
import { DmnsNotice } from './dmns-notice.js';

const ELEMENTS: readonly (readonly [string, CustomElementConstructor])[] = [
  ['dmns-header', DmnsHeader],
  ['dmns-notice', DmnsNotice],
];

export function defineElements(): void {
  for (const [name, ctor] of ELEMENTS) if (!customElements.get(name)) customElements.define(name, ctor);
}
