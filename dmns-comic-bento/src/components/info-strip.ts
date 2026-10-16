/** <dmns-info-strip>: upgrades the static hours line with the live open state. */
import { describeOpenState, openState, type Hours } from '../lib/dates.ts';

export class DmnsInfoStrip extends HTMLElement {
  #timer = 0;

  connectedCallback(): void {
    this.#update();
    this.#timer = window.setInterval(() => this.#update(), 60_000);
  }

  disconnectedCallback(): void {
    window.clearInterval(this.#timer);
  }

  #hours(): Hours | null {
    const d = this.dataset;
    if (!d['open'] || !d['close'] || !d['tz']) return null;
    return {
      open: d['open'],
      close: d['close'],
      fridayLateClose: d['late'] ?? null,
      closedDates: (d['closed'] ?? '').split(',').filter(Boolean),
      timeZone: d['tz'],
    };
  }

  #update(): void {
    const hours = this.#hours();
    if (!hours) return;
    const text = describeOpenState(openState(hours, new Date()));
    const live = this.querySelector<HTMLElement>('[data-open-state]');
    if (live && live.textContent !== text) live.textContent = text;
    for (const mirror of document.querySelectorAll<HTMLElement>('[data-open-state-mirror]')) {
      if (mirror.textContent !== text) mirror.textContent = text;
    }
  }
}

customElements.define('dmns-info-strip', DmnsInfoStrip);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-info-strip': DmnsInfoStrip;
  }
}
