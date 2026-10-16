/**
 * Build-time HTML helpers. Every interpolation is escaped unless it is already
 * a SafeHtml produced by this module.
 */

const BRAND = Symbol('safe-html');

export interface SafeHtml {
  readonly [BRAND]: true;
  readonly value: string;
}

export function raw(value: string): SafeHtml {
  return { [BRAND]: true, value };
}

export function isSafe(v: unknown): v is SafeHtml {
  return typeof v === 'object' && v !== null && BRAND in v;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type Interp = SafeHtml | string | number | boolean | null | undefined | readonly Interp[];

function render(v: Interp): string {
  if (v === null || v === undefined || v === false || v === true) return '';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return escapeHtml(v);
  if (isSafe(v)) return v.value;
  return (v as readonly Interp[]).map(render).join('');
}

/** Tagged template: html`<p>${text}</p>` */
export function html(strings: TemplateStringsArray, ...values: Interp[]): SafeHtml {
  let out = strings[0] ?? '';
  values.forEach((v, i) => {
    out += render(v) + (strings[i + 1] ?? '');
  });
  return raw(out);
}

export function join(items: readonly SafeHtml[], sep = ''): SafeHtml {
  return raw(items.map((i) => i.value).join(sep));
}

/** Stable, readable id from text. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Deterministic 0..n-1 bucket from a string, for seeded misalignment. */
export function seeded(text: string, n: number): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % n;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
