/** Art references: panels <use> symbols from the page sprite. Build-time only. */
import { sfxSvg, type SfxWord } from '../../art/sfx.ts';
import { BOIL_FRAMES, figure } from '../../scripts/build-sprites.ts';
import type { Pose } from '../lib/content.ts';
import type { PageContext } from './context.ts';
import { html, raw, type SafeHtml } from './html.ts';

function uses(id: string): SafeHtml {
  const frames = Array.from({ length: BOIL_FRAMES }, (_, k) => html`<use class="beat-frame" href="#${id}-l${k}" width="100%" height="100%"/>`);
  return html`<use class="art__fill" href="#${id}-f" width="100%" height="100%"/><g class="art__line">${frames}</g>`;
}

/** Inline SVG for one figure. Decorative: the figure is aria-hidden. */
export function artSvg(ctx: PageContext, id: string, className = 'art'): SafeHtml {
  const f = figure(id);
  ctx.art.add(id);
  return html`<svg class="${className}" viewBox="${f.viewBox.join(' ')}" data-placeholder="true" aria-hidden="true" focusable="false">${uses(id)}</svg>`;
}

export type SpecimenSpot = 'br' | 'bl' | 'tr' | 'center';

export function specimen(ctx: PageContext, pose: Pose, spot: SpecimenSpot = 'br'): SafeHtml {
  return html`<dmns-specimen data-pose="${pose}" data-spot="${spot}">${artSvg(ctx, `specimen-${pose}`, 'art art--specimen')}</dmns-specimen>`;
}

export function sketchStamp(): SafeHtml {
  return html`<span class="sketch-stamp">Sketch</span>`;
}

export function balloon(text: string): SafeHtml {
  return html`<dmns-balloon aria-hidden="true"><span>${text}</span></dmns-balloon>`;
}

export function sfx(word: SfxWord): SafeHtml {
  return html`<dmns-sfx data-word="${word}">${raw(sfxSvg(word))}</dmns-sfx>`;
}
