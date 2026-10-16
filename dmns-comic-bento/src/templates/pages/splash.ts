/** Splash: the full-viewport hero panel of index and detail pages (#splash). */
import type { Mood, Pose } from '../../lib/content.ts';
import { artSvg, balloon as balloonHtml, sketchStamp, specimen } from '../art.ts';
import { captionSub, kicker as kickerHtml, knockout } from '../caption.ts';
import type { PageContext } from '../context.ts';
import { html, type SafeHtml } from '../html.ts';

export interface SplashSpec {
  readonly title: string;
  readonly kicker: string;
  readonly sub?: string | null;
  readonly subIsQuote?: boolean;
  readonly mood: Mood | 'plain';
  readonly art?: string;
  readonly pose?: Pose | null;
  readonly balloon?: string;
  readonly extra?: SafeHtml;
  readonly issueHead?: boolean;
}

export function renderSplash(ctx: PageContext, spec: SplashSpec): SafeHtml {
  const art = spec.art
    ? html`<figure class="splash__art" aria-hidden="true">${artSvg(ctx, spec.art)}${spec.pose && (spec.mood === 'lively' || spec.mood === 'closed') ? specimen(ctx, spec.pose, 'br') : ''}${spec.balloon && spec.mood === 'lively' ? balloonHtml(spec.balloon) : ''}${sketchStamp()}</figure>`
    : '';
  const banner = spec.mood === 'closed' ? html`<p class="tbc-banner" aria-hidden="true">To be continued…</p>` : '';
  return html`<section id="splash" class="splash${spec.issueHead ? ' splash--issue' : ''}" data-mood="${spec.mood}" aria-labelledby="page-title"><div class="splash__panel">${art}<div class="splash__copy">${kickerHtml(spec.kicker)}${knockout(spec.title, { tag: 'h1', id: 'page-title', maxChars: 16, className: 'splash__title' })}${spec.sub === undefined ? '' : captionSub(spec.sub, { quote: spec.subIsQuote ?? false })}${spec.extra ?? ''}</div>${banner}</div></section>`;
}
