/** Small shared partials: links, media plates, wall labels. */
import type { Link, Media, WingId } from '../lib/content-types.js';
import { attrs, copy, html, type Interpolation, type SafeHtml } from './html.js';
import { externalIcon } from './icons.js';

/** Outbound link to the live site, with a visible and spoken external affordance. */
export function outbound(link: Link, className = 'link-external'): SafeHtml {
  return html`<a class="${className}" href="${link.href}" rel="external">${link.label}${externalIcon}<span class="visually-hidden"> (dmns.org)</span></a>`;
}

export interface PlateOptions {
  readonly wing: WingId;
  readonly priority?: boolean;
  readonly className?: string;
  /** Shared-element key; the transition layer reads it (never a static view-transition-name). */
  readonly morph?: string;
  readonly decorative?: boolean;
}

export function plate(media: Media, options: PlateOptions): SafeHtml {
  const className = ['plate', media.placeholder ? 'plate--placeholder' : '', options.className ?? ''].filter(Boolean).join(' ');
  const morph = options.morph ? attrs({ 'data-morph': options.morph }) : '';
  if (media.placeholder || !media.src) {
    const role = options.decorative ? attrs({ 'aria-hidden': 'true' }) : attrs({ role: 'img', 'aria-label': media.alt });
    return html`<figure class="${className}" data-wing="${options.wing}"${morph}>
      <div class="plate__surface"${role}>
        <span class="plate__label" aria-hidden="true">${media.label}</span>
        <span class="plate__tag" aria-hidden="true">Placeholder</span>
      </div>
    </figure>`;
  }
  const base = media.src.replace(/\.[a-z0-9]+$/i, '');
  return html`<figure class="${className}" data-wing="${options.wing}"${morph}>
    <picture>
      <source type="image/avif" srcset="${base}.avif">
      <source type="image/webp" srcset="${base}.webp">
      <img src="${media.src}" alt="${options.decorative ? '' : media.alt}" width="${media.width}" height="${media.height}"${attrs({
        loading: options.priority ? null : 'lazy',
        fetchpriority: options.priority ? 'high' : null,
        decoding: 'async',
        'aria-hidden': options.decorative ? 'true' : null,
      })}>
    </picture>
    ${options.decorative ? '' : html`<figcaption class="plate__credit">${copy(media.credit)}</figcaption>`}
  </figure>`;
}

export interface WallLabelProps {
  readonly id?: string;
  readonly name: string;
  readonly meta: readonly string[];
  readonly text?: string;
  readonly headingLevel: 2 | 3;
  readonly wing: WingId;
  readonly className?: string;
  readonly extra?: Interpolation;
}

/** A real museum case label: object name, metadata line, short paragraph. */
export function wallLabel(props: WallLabelProps): SafeHtml {
  const heading =
    props.headingLevel === 2
      ? html`<h2 class="wall-label__name"${attrs({ id: props.id })}>${copy(props.name)}</h2>`
      : html`<h3 class="wall-label__name"${attrs({ id: props.id })}>${copy(props.name)}</h3>`;
  return html`<div class="wall-label ${props.className ?? ''}" data-wing="${props.wing}">
    ${heading}
    ${props.meta.length ? html`<p class="wall-label__meta">${props.meta.map((m, i) => html`${i ? html`<span class="wall-label__sep" aria-hidden="true"> · </span>` : ''}${copy(m)}`)}</p>` : ''}
    ${props.text ? html`<p class="wall-label__text">${copy(props.text)}</p>` : ''}
    ${props.extra}
  </div>`;
}

export function eyebrow(text: string): SafeHtml {
  return html`<p class="eyebrow">${copy(text)}</p>`;
}
