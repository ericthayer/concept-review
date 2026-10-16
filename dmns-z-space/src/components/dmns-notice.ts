/**
 * <dmns-notice>: date-bound notices in one polite live region. Expired notices are removed
 * at build time; this element also drops any that expire between builds and remembers
 * dismissal for the session.
 */
import { safeStorage } from '../dom/storage.js';

const DISMISSED_KEY = 'dmns:notices-dismissed';

function localToday(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export class DmnsNotice extends HTMLElement {
  #button: HTMLButtonElement | null = null;

  connectedCallback(): void {
    const today = localToday();
    const dismissed = this.#dismissed();
    const items = [...this.querySelectorAll<HTMLElement>('[data-notice-id]')];
    for (const item of items) {
      const end = item.dataset['end'] ?? '';
      if ((end && end < today) || dismissed.includes(item.dataset['noticeId'] ?? '')) item.remove();
    }
    if (!this.querySelector('[data-notice-id]')) {
      this.hidden = true;
      return;
    }
    this.#button = this.querySelector<HTMLButtonElement>('[data-dismiss]');
    if (this.#button) {
      this.#button.hidden = false;
      this.#button.addEventListener('click', this.#onDismiss);
    }
  }

  disconnectedCallback(): void {
    this.#button?.removeEventListener('click', this.#onDismiss);
  }

  #dismissed(): string[] {
    try {
      const raw = safeStorage()?.getItem(DISMISSED_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
    } catch {
      return [];
    }
  }

  readonly #onDismiss = (): void => {
    const ids = [...this.querySelectorAll<HTMLElement>('[data-notice-id]')].map((el) => el.dataset['noticeId'] ?? '');
    try {
      safeStorage()?.setItem(DISMISSED_KEY, JSON.stringify([...new Set([...this.#dismissed(), ...ids])]));
    } catch {
      // Not persisted; dismissal still applies to this page.
    }
    this.hidden = true;
    document.getElementById('main')?.focus({ preventScroll: true });
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'dmns-notice': DmnsNotice;
  }
}
