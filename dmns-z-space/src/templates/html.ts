/**
 * Build-time HTML tagged template. Every interpolated value is escaped unless it is
 * already SafeHtml (the output of another `html` call or an explicit `trusted()`).
 */
import { TODO_MARK, isTodo } from '../lib/content-types.js';

export class SafeHtml {
  constructor(readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

export type Interpolation = SafeHtml | string | number | boolean | null | undefined | readonly Interpolation[];

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

function render(value: Interpolation): string {
  if (value === null || value === undefined || value === false || value === true) return '';
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escapeHtml(String(value));
}

export function html(strings: TemplateStringsArray, ...values: readonly Interpolation[]): SafeHtml {
  let out = strings[0] ?? '';
  values.forEach((value, i) => {
    out += render(value) + (strings[i + 1] ?? '');
  });
  return new SafeHtml(out);
}

/** For markup produced by this codebase (never content strings). */
export function trusted(markup: string): SafeHtml {
  return new SafeHtml(markup);
}

/**
 * Render a content string. `TODO: confirm with DMNS` values become a visibly marked
 * placeholder so reviewers can never mistake missing copy for real copy.
 */
export function copy(value: string): SafeHtml {
  if (!isTodo(value)) return html`${value}`;
  const detail = value.slice(TODO_MARK.length).replace(/^[\s:(–-]+|\)$/g, '').trim();
  return html`<mark class="todo" data-todo>${TODO_MARK}${detail ? html`<span class="todo__detail"> · ${detail}</span>` : ''}</mark>`;
}

export function attrs(map: Readonly<Record<string, string | number | boolean | null | undefined>>): SafeHtml {
  const parts: string[] = [];
  for (const [name, value] of Object.entries(map)) {
    if (value === false || value === null || value === undefined) continue;
    parts.push(value === true ? name : `${name}="${escapeHtml(String(value))}"`);
  }
  return new SafeHtml(parts.length ? ` ${parts.join(' ')}` : '');
}
