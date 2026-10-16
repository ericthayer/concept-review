/**
 * <dmns-spread>: a band of panels on a named layout. Enforces the spread rules:
 * panel count matches the layout, at most two pop colors (extra panels are
 * muted to halftone), and Specimen appears in at most one panel.
 */
import { figure } from '../../scripts/build-sprites.ts';
import type { PopColor } from '../lib/content.ts';
import { LAYOUTS, slotCount, spanForSlot, type LayoutName } from '../lib/layouts.ts';
import { kicker as kickerHtml, knockout, plainHeading } from './caption.ts';
import type { PageContext } from './context.ts';
import { html, type SafeHtml } from './html.ts';
import { renderPanel, type PanelSpec } from './panel.ts';

export interface SpreadSpec {
  readonly id: string;
  readonly kicker?: string;
  readonly heading: string;
  readonly headingStyle?: 'knockout' | 'plain' | 'hidden';
  readonly layout: LayoutName;
  readonly panels: readonly PanelSpec[];
  /** Extra markup rendered between the heading and the grid (e.g. filters). */
  readonly before?: SafeHtml;
  readonly decor?: SafeHtml;
  readonly hidden?: boolean;
  readonly role?: { readonly tabpanel: string };
}

export const MAX_POPS_PER_SPREAD = 2;

const POPS: readonly PopColor[] = ['green', 'blue', 'orange', 'magenta', 'red'];

/** Pop colors a panel actually shows: its own pop plus every pop-toned art fill. */
export function panelPops(p: PanelSpec, withSpecimen: boolean): Set<PopColor> {
  const out = new Set<PopColor>();
  if (p.pop) out.add(p.pop);
  const ids = [...(p.art ? [p.art] : []), ...(p.beats?.items.map((b) => b.art) ?? []), ...(withSpecimen && p.pose ? [`specimen-${p.pose}`] : [])];
  for (const id of ids) {
    for (const f of figure(id).fills) {
      if ((POPS as readonly string[]).includes(f.tone)) out.add(f.tone as PopColor);
    }
  }
  return out;
}

/** Allow the first two pop colors in reading order; panels that add a third are muted to halftone. */
export function spreadPops(panels: readonly PanelSpec[], specimenPanel: string | null): { allowed: Set<PopColor>; muted: Set<string> } {
  const allowed = new Set<PopColor>();
  const muted = new Set<string>();
  for (const p of panels) {
    const pops = panelPops(p, p.id === specimenPanel);
    const extra = [...pops].filter((c) => !allowed.has(c));
    if (allowed.size + extra.length <= MAX_POPS_PER_SPREAD) extra.forEach((c) => allowed.add(c));
    else muted.add(p.id);
  }
  return { allowed, muted };
}

export function renderSpread(ctx: PageContext, spec: SpreadSpec, index: number): SafeHtml {
  const expected = slotCount(spec.layout);
  if (expected !== null && expected !== spec.panels.length) {
    throw new Error(`Spread ${spec.id}: layout ${spec.layout} needs ${expected} panels, got ${spec.panels.length}`);
  }
  // Specimen appears in exactly one panel per spread: the first that asks for it.
  const specimenPanel = spec.panels.find((p) => Boolean(p.pose) && (p.mood === 'lively' || p.mood === 'closed') && !p.beats)?.id ?? null;
  const { muted } = spreadPops(spec.panels, specimenPanel);
  const panels = spec.panels.map((p, i) => {
    const span = spanForSlot(spec.layout, i, p.span);
    return renderPanel(ctx, { ...p, span }, { showSpecimen: p.id === specimenPanel, mute: muted.has(p.id) });
  });
  const headingId = `${spec.id}-h`;
  const style = spec.headingStyle ?? 'knockout';
  const heading =
    style === 'knockout'
      ? knockout(spec.heading, { tag: 'h2', id: headingId, maxChars: 18, className: 'spread__title' })
      : style === 'plain'
        ? plainHeading(spec.heading, 'h2', headingId)
        : html`<h2 id="${headingId}" class="vh" tabindex="-1">${spec.heading}</h2>`;
  const flow = LAYOUTS[spec.layout].kind === 'flow';
  const ink = index === 0 ? 'enter' : 'scroll';
  const tab = spec.role ? html` role="tabpanel" aria-labelledby="${spec.role.tabpanel}"` : '';
  return html`<dmns-spread id="${spec.id}" data-layout="${spec.layout}" data-ink="${ink}"${spec.hidden ? ' hidden' : ''}${tab}><section class="spread" aria-labelledby="${headingId}"><header class="spread__head">${spec.kicker ? kickerHtml(spec.kicker) : ''}${heading}</header>${spec.before ?? ''}<div class="spread__grid" data-layout="${spec.layout}"${flow ? ' data-flow' : ''}>${panels}</div>${spec.decor ?? ''}</section></dmns-spread>`;
}
