/**
 * <dmns-event-corridor>: native scroll-snapping list. Arrow buttons (aria-controls the track)
 * step one item and disable at either end.
 */
export class DmnsEventCorridor extends HTMLElement {
  #track: HTMLElement | null = null;
  #buttons: HTMLButtonElement[] = [];
  #frame = 0;

  connectedCallback(): void {
    this.#track = this.querySelector<HTMLElement>('.corridor__track');
    const controls = this.querySelector<HTMLElement>('[data-controls]');
    this.#buttons = [...this.querySelectorAll<HTMLButtonElement>('[data-dir]')];
    if (!this.#track || !controls) return;
    controls.hidden = false;
    for (const b of this.#buttons) b.addEventListener('click', this.#onStep);
    this.#track.addEventListener('scroll', this.#onScroll, { passive: true });
    this.#sync();
  }

  disconnectedCallback(): void {
    for (const b of this.#buttons) b.removeEventListener('click', this.#onStep);
    this.#track?.removeEventListener('scroll', this.#onScroll);
    cancelAnimationFrame(this.#frame);
  }

  #sync(): void {
    const t = this.#track;
    if (!t) return;
    const max = t.scrollWidth - t.clientWidth - 1;
    for (const b of this.#buttons) {
      const dir = Number(b.dataset['dir']);
      b.disabled = dir < 0 ? t.scrollLeft <= 0 : t.scrollLeft >= max;
    }
  }

  readonly #onScroll = (): void => {
    cancelAnimationFrame(this.#frame);
    this.#frame = requestAnimationFrame(() => { this.#sync(); });
  };

  readonly #onStep = (event: Event): void => {
    const t = this.#track;
    const item = t?.querySelector<HTMLElement>('.corridor__item');
    if (!t || !item) return;
    const dir = Number((event.currentTarget as HTMLElement).dataset['dir']);
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset['stillness'] !== 'on';
    t.scrollBy({ left: dir * (item.offsetWidth + parseFloat(getComputedStyle(t).columnGap || '0')), behavior: smooth ? 'smooth' : 'auto' });
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'dmns-event-corridor': DmnsEventCorridor;
  }
}
