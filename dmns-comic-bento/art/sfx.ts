/**
 * Hand-lettered SFX words as SVG strokes (never a font). A tiny stroke
 * alphabet covers the words the book uses; letters tilt and bounce per seed.
 */
import { hashSeed, jitter, rng, rotate, toPath, translate, type Point } from './lib.ts';

type Glyph = readonly { readonly pts: readonly Point[]; readonly smooth?: boolean; readonly closed?: boolean }[];

const GLYPHS: Readonly<Record<string, Glyph>> = {
  K: [{ pts: [[0, 0], [0, 14]] }, { pts: [[10, 0], [0, 8]] }, { pts: [[3, 6], [10, 14]] }],
  R: [{ pts: [[0, 14], [0, 0], [6, 0], [10, 3.5], [6, 7], [0, 7]], smooth: true }, { pts: [[4, 7], [10, 14]] }],
  U: [{ pts: [[0, 0], [0, 10], [5, 14], [10, 10], [10, 0]], smooth: true }],
  N: [{ pts: [[0, 14], [0, 0], [10, 14], [10, 0]] }],
  C: [{ pts: [[10, 2], [6, 0], [1, 3], [0, 7], [1, 11], [6, 14], [10, 12]], smooth: true }],
  H: [{ pts: [[0, 0], [0, 14]] }, { pts: [[10, 0], [10, 14]] }, { pts: [[0, 7], [10, 7]] }],
  F: [{ pts: [[10, 0], [0, 0], [0, 14]] }, { pts: [[0, 7], [7, 7]] }],
  W: [{ pts: [[0, 0], [2.5, 14], [5, 5], [7.5, 14], [10, 0]] }],
  O: [{ pts: [[5, 0], [9, 2], [10, 7], [9, 12], [5, 14], [1, 12], [0, 7], [1, 2]], smooth: true, closed: true }],
  S: [{ pts: [[10, 2], [6, 0], [1, 2], [2, 6], [8, 8], [10, 11], [6, 14], [0, 12]], smooth: true }],
  '!': [{ pts: [[5, 0], [5, 9]] }, { pts: [[5, 13], [5, 14]] }],
};

export const SFX_WORDS = ['KRUNCH', 'FWOOSH'] as const;
export type SfxWord = (typeof SFX_WORDS)[number];

export function sfxSvg(word: SfxWord): string {
  const rand = rng(hashSeed(word));
  const paths: string[] = [];
  const advance = 14;
  [...word].forEach((ch, i) => {
    const glyph = GLYPHS[ch];
    if (!glyph) throw new Error(`SFX glyph missing: ${ch}`);
    const tilt = (rand() - 0.5) * 16;
    const lift = (rand() - 0.5) * 4;
    for (const stroke of glyph) {
      const placed = translate(rotate(jitter(stroke.pts, rand, 0.5), tilt, 5, 7), 4 + i * advance, 4 + lift);
      paths.push(toPath(placed, stroke.closed ?? false, stroke.smooth ?? false));
    }
  });
  const w = 8 + word.length * advance;
  const d = paths.join('');
  return `<svg class="sfx" viewBox="0 0 ${w} 24" aria-hidden="true" focusable="false"><path class="sfx__back" d="${d}"/><path class="sfx__front" d="${d}"/></svg>`;
}
