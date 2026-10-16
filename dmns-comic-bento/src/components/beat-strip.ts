/**
 * <dmns-beat-strip>: plays its beats once when it first enters view, then rests
 * on the final beat. Replays on panel hover/focus or the Replay button. Never
 * loops. With reduced motion or Still Panels it only plays on Replay.
 */
import { MOTION_EVENT, motionIsFull } from '../runtime/motion-state.ts';

const BEAT_MS = 1100;

export class DmnsBeatStrip extends HTMLElement {
  #beats: HTMLElement[] = [];
  #replay: HTMLButtonElement | null = null;
  #timer = 0;
  #played = false;
  #observer: IntersectionObserver | null = null;

  connectedCallback(): void {
    this.#beats = [...this.querySelectorAll<HTMLElement>('.beat')];
    this.#replay = this.querySelector<HTMLButtonElement>('.beat-replay');
    if (this.#beats.length < 2) return;
    if (this.#replay) {
      this.#replay.hidden = false;
      this.#replay.addEventListener('click', this.#onReplay);
    }
    const panel = this.closest('dmns-panel');
    panel?.addEventListener('pointerenter', this.#onHint);
    panel?.addEventListener('focusin', this.#onHint);
    document.addEventListener(MOTION_EVENT, this.#onMotion);
    if (typeof IntersectionObserver !== 'undefined') {
      this.#observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting) && !this.#played) {
          this.#played = true;
          if (motionIsFull()) this.play();
        }
      }, { threshold: 0.5 });
      this.#observer.observe(this);
    }
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#replay?.removeEventListener('click', this.#onReplay);
    document.removeEventListener(MOTION_EVENT, this.#onMotion);
    this.stop();
  }

  /** Step through every beat once and rest on the last. */
  play(): void {
    this.stop();
    let index = 0;
    const show = (): void => {
      this.#beats.forEach((b, i) => b.toggleAttribute('data-active', i === index));
      this.dataset['current'] = String(index + 1);
      index += 1;
      if (index < this.#beats.length) this.#timer = window.setTimeout(show, BEAT_MS);
      else this.#timer = window.setTimeout(() => this.stop(), BEAT_MS);
    };
    show();
  }

  stop(): void {
    window.clearTimeout(this.#timer);
    delete this.dataset['current'];
    for (const b of this.#beats) b.removeAttribute('data-active');
  }

  #onReplay = (): void => this.play();
  #onHint = (): void => {
    if (motionIsFull() && !this.dataset['current']) this.play();
  };
  #onMotion = (): void => {
    if (!motionIsFull()) this.stop();
  };
}

customElements.define('dmns-beat-strip', DmnsBeatStrip);

declare global {
  interface HTMLElementTagNameMap {
    'dmns-beat-strip': DmnsBeatStrip;
  }
}
