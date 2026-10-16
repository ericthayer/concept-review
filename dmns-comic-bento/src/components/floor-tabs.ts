/**
 * <dmns-floor-tabs>: Halls floor switcher. Without JS it is a list of anchor
 * links to stacked floor spreads. Upgraded, it is an ARIA tablist (arrow keys,
 * Home, End, roving tabindex) and floors slide vertically like an elevator.
 */
import { announce } from '../runtime/announce.ts';
import { morph } from '../runtime/transition.ts';

export class DmnsFloorTabs extends HTMLElement {
  #tabs: HTMLAnchorElement[] = [];
  #panels: HTMLElement[] = [];
  #current = -1;

  connectedCallback(): void {
    const list = this.querySelector('ul');
    const tabs = [...this.querySelectorAll<HTMLAnchorElement>('a[data-floor]')];
    const panels = tabs.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))));
    if (!list || tabs.length === 0 || panels.some((p) => p === null)) return;
    this.#tabs = tabs;
    this.#panels = panels.filter((p): p is HTMLElement => p !== null);

    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Floors');
    tabs.forEach((tab, i) => {
      const panel = this.#panels[i];
      tab.parentElement?.setAttribute('role', 'presentation');
      tab.setAttribute('role', 'tab');
      if (panel) {
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
      }
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        this.select(i, true);
      });
      tab.addEventListener('keydown', (event) => this.#onKey(event, i));
    });
    this.select(this.#initialIndex(), false);
  }

  /** Hash first, then the floor of the hall the reader just came from, else the first floor. */
  #initialIndex(): number {
    const byHash = this.#panels.findIndex((p) => `#${p.id}` === location.hash);
    if (byHash !== -1) return byHash;
    let from = '';
    try {
      const ref = new URL(document.referrer);
      if (ref.origin === location.origin) from = ref.pathname;
    } catch {
      /* no referrer */
    }
    if (from) {
      const byRef = this.#panels.findIndex((p) => [...p.querySelectorAll<HTMLAnchorElement>('a.panel__link')].some((a) => a.pathname === from));
      if (byRef !== -1) return byRef;
    }
    return 0;
  }

  #onKey(event: KeyboardEvent, i: number): void {
    const last = this.#tabs.length - 1;
    const next: Record<string, number> = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last };
    const target = next[event.key];
    if (target === undefined) return;
    event.preventDefault();
    this.select(target, true);
    this.#tabs[target]?.focus();
  }

  select(index: number, animate: boolean): void {
    if (index === this.#current || !this.#panels[index]) return;
    const from = this.#current;
    const update = (): void => {
      this.#tabs.forEach((tab, k) => {
        tab.setAttribute('aria-selected', String(k === index));
        tab.tabIndex = k === index ? 0 : -1;
      });
      this.#panels.forEach((panel, k) => {
        panel.hidden = k !== index;
      });
      this.#current = index;
    };
    if (!animate) {
      update();
      return;
    }
    const stage = this.#panels[index]?.parentElement;
    const panel = this.#panels[index];
    void morph(update, ['floor', index > from ? 'floor-up' : 'floor-down'], stage ? [{ el: stage, name: 'floor-stage' }] : []);
    history.replaceState(history.state, '', `#${panel?.id ?? ''}`);
    announce(`Showing ${this.#tabs[index]?.textContent?.trim() ?? 'floor'}.`);
  }
}

customElements.define('dmns-floor-tabs', DmnsFloorTabs);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-floor-tabs': DmnsFloorTabs;
  }
}
