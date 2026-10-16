/**
 * <dmns-vitrine>: object plate + wall label. "Step up to the case" opens a native modal dialog
 * with a shared-element morph from the case plate to the dialog plate.
 */
import { transition } from '../dom/transition.js';

const MORPH = 'vitrine-plate';

export class DmnsVitrine extends HTMLElement {
  #opener: HTMLButtonElement | null = null;
  #dialog: HTMLDialogElement | null = null;
  #thumb: HTMLElement | null = null;
  #plate: HTMLElement | null = null;

  connectedCallback(): void {
    this.#opener = this.querySelector<HTMLButtonElement>('[data-open]');
    this.#dialog = this.querySelector<HTMLDialogElement>('dialog');
    this.#thumb = this.querySelector<HTMLElement>('.vitrine__plate');
    this.#plate = this.querySelector<HTMLElement>('.vitrine__dialog-plate');
    if (!this.#opener || !this.#dialog || typeof this.#dialog.showModal !== 'function') return;
    this.#opener.hidden = false;
    this.#opener.addEventListener('click', this.#open);
    this.#dialog.addEventListener('cancel', this.#onCancel);
    this.#dialog.addEventListener('submit', this.#onSubmit);
    this.#dialog.addEventListener('click', this.#onBackdrop);
  }

  disconnectedCallback(): void {
    this.#opener?.removeEventListener('click', this.#open);
    this.#dialog?.removeEventListener('cancel', this.#onCancel);
    this.#dialog?.removeEventListener('submit', this.#onSubmit);
    this.#dialog?.removeEventListener('click', this.#onBackdrop);
  }

  #name(el: HTMLElement | null): void {
    for (const other of [this.#thumb, this.#plate]) other?.style.removeProperty('view-transition-name');
    el?.style.setProperty('view-transition-name', MORPH);
  }

  readonly #open = (): void => {
    const dialog = this.#dialog;
    if (!dialog || dialog.open) return;
    this.#name(this.#thumb);
    void transition(() => {
      this.#name(this.#plate);
      dialog.showModal();
    }, ['vitrine-open']).finally(() => { this.#name(null); });
  };

  #close(): void {
    const dialog = this.#dialog;
    if (!dialog?.open) return;
    this.#name(this.#plate);
    void transition(() => {
      this.#name(this.#thumb);
      dialog.close();
      this.#opener?.focus();
    }, ['vitrine-close']).finally(() => { this.#name(null); });
  }

  readonly #onCancel = (event: Event): void => {
    event.preventDefault();
    this.#close();
  };

  readonly #onSubmit = (event: SubmitEvent): void => {
    event.preventDefault();
    this.#close();
  };

  readonly #onBackdrop = (event: MouseEvent): void => {
    if (event.target === this.#dialog) this.#close();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'dmns-vitrine': DmnsVitrine;
  }
}
