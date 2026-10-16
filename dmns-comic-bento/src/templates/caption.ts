/**
 * Caption renderers. Knockout labels are real text: the full string is read by
 * assistive tech from a visually-hidden span; the per-line / per-word boxes are
 * aria-hidden. Splitting happens here, at build time, never at runtime.
 */
import { TODO } from '../lib/content.ts';
import { html, seeded, type SafeHtml } from './html.ts';

export type HeadingTag = 'h1' | 'h2' | 'h3';

/** Greedy line breaking by character budget. Deterministic. */
export function breakLines(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && next.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export interface KnockoutOptions {
  readonly tag: HeadingTag;
  readonly id: string;
  readonly maxChars?: number;
  readonly className?: string;
}

/** Knockout display label: one ink box per line, seeded misalignment per line. */
export function knockout(text: string, opts: KnockoutOptions): SafeHtml {
  const lines = breakLines(text, opts.maxChars ?? 14);
  let word = 0;
  const boxes = lines.map((line) => {
    const words = line.split(' ').map((w) => {
      word += 1;
      return html`<span class="w" data-w="${Math.min(word, 12)}">${w}</span>`;
    });
    const joined = words.flatMap((w, i) => (i === 0 ? [w] : [html` `, w]));
    return html`<span class="ko-line" data-tilt="${seeded(`${opts.id}:${line}`, 8)}">${joined}</span>`;
  });
  const tag = opts.tag;
  const cls = `knockout${opts.className ? ` ${opts.className}` : ''}`;
  const inner = html`<dmns-caption><span class="vh">${text}</span><span class="ko-lines" aria-hidden="true">${boxes}</span></dmns-caption>`;
  if (tag === 'h1') return html`<h1 id="${opts.id}" class="${cls}" tabindex="-1">${inner}</h1>`;
  if (tag === 'h2') return html`<h2 id="${opts.id}" class="${cls}" tabindex="-1">${inner}</h2>`;
  return html`<h3 id="${opts.id}" class="${cls}" tabindex="-1">${inner}</h3>`;
}

/** Plain heading for information panels (comic frame, no comic type). */
export function plainHeading(text: string, tag: HeadingTag, id: string): SafeHtml {
  if (tag === 'h1') return html`<h1 id="${id}" class="plain-heading" tabindex="-1">${text}</h1>`;
  if (tag === 'h2') return html`<h2 id="${id}" class="plain-heading" tabindex="-1">${text}</h2>`;
  return html`<h3 id="${id}" class="plain-heading" tabindex="-1">${text}</h3>`;
}

/** Caption body copy; null renders the visible TODO placeholder. */
export function captionSub(text: string | null, opts: { quote?: boolean } = {}): SafeHtml {
  if (text === null) return todo();
  if (opts.quote) return html`<p class="caption caption--sub"><q>${text}</q></p>`;
  return html`<p class="caption caption--sub">${text}</p>`;
}

export function todo(what?: string): SafeHtml {
  return html`<p class="todo"><span class="todo__tag">${TODO}</span>${what ? html` <span>${what}</span>` : ''}</p>`;
}

export function kicker(text: string): SafeHtml {
  if (text.includes(TODO)) {
    const [before = ''] = text.split(TODO);
    return html`<p class="kicker">${before}<span class="todo__tag">${TODO}</span></p>`;
  }
  return html`<p class="kicker">${text}</p>`;
}
