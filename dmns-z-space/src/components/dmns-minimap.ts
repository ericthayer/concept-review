/**
 * <dmns-minimap>: the floorplan HUD. Server-rendered as a <details> room list; this element
 * adds Escape-to-close and closes the panel when focus or a click leaves it.
 */
export class DmnsMinimap extends HTMLElement {
  #panel: HTMLDetailsElement | null = null;

  connectedCallback(): void {
    this.#panel = this.querySelector('details');
    this.addEventListener('keydown', this.#onKey);
    document.addEventListener('pointerdown', this.#onOutside);
    this.addEventListener('focusout', this.#onFocusOut);
  }

  disconnectedCallback(): void {
    this.removeEventListener('keydown', this.#onKey);
    document.removeEventListener('pointerdown', this.#onOutside);
    this.removeEventListener('focusout', this.#onFocusOut);
  }

  #close(returnFocus: boolean): void {
    if (!this.#panel?.open) return;
    this.#panel.open = false;
    if (returnFocus) this.querySelector<HTMLElement>('summary')?.focus();
  }

  readonly #onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.#close(true);
  };

  readonly #onOutside = (event: PointerEvent): void => {
    if (event.target instanceof Node && !this.contains(event.target)) this.#close(false);
  };

  readonly #onFocusOut = (event: FocusEvent): void => {
    if (event.relatedTarget instanceof Node && !this.contains(event.relatedTarget)) this.#close(false);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'dmns-minimap': DmnsMinimap;
  }
}
