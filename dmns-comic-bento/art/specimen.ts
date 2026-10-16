/**
 * "Specimen": an invented ink-blot field researcher with notebook goggles.
 * Concept device only, not a DMNS mascot. One figure per pose; the sprite
 * builder derives three boil frames from each.
 */
import type { Pose } from '../src/lib/content.ts';
import {
  blob,
  circle,
  closed,
  curve,
  ellipse,
  line,
  rect,
  rotate,
  shape,
  star,
  type Figure,
  type Fill,
  type Point,
  type Stroke,
} from './lib.ts';

const VIEW: Figure['viewBox'] = [-14, -14, 128, 128];

interface Parts {
  fills: Fill[];
  strokes: Stroke[];
}

function base(seed: string, opts: { feet?: 'stand' | 'dangle' | 'climb'; goggles?: boolean } = {}): Parts {
  const body = blob(50, 62, 27, `specimen-${seed}`, 14, 0.12);
  const fills: Fill[] = [{ pts: body, tone: 'ink' }];
  const strokes: Stroke[] = [closed(body)];
  if (opts.goggles !== false) {
    for (const cx of [40, 60]) {
      const lens = circle(cx, 54, 8, 12);
      fills.push({ pts: lens, tone: 'paper' });
      strokes.push(closed(lens));
      fills.push({ pts: circle(cx + 1, 55, 2.4, 8), tone: 'ink' });
    }
    strokes.push({ pts: [[48, 54], [52, 54]], smooth: false, line: 'paper' });
    strokes.push({ pts: [[32, 54], [25, 58]], smooth: false, line: 'paper' });
    strokes.push({ pts: [[68, 54], [75, 58]], smooth: false, line: 'paper' });
  }
  strokes.push({ pts: [[44, 70], [50, 74], [56, 70]], smooth: true, line: 'paper' });
  const feet = opts.feet ?? 'stand';
  if (feet === 'stand') {
    strokes.push(line([42, 86], [40, 96], [33, 96]), line([58, 86], [60, 96], [67, 96]));
  } else if (feet === 'dangle') {
    strokes.push(curve([42, 86], [38, 94], [42, 100]), curve([58, 86], [63, 93], [60, 100]));
  } else {
    strokes.push(line([42, 86], [36, 92], [30, 92]), line([58, 86], [62, 100], [69, 100]));
  }
  return { fills, strokes };
}

function figure(pose: Pose, parts: Parts): Figure {
  return { id: `specimen-${pose}`, viewBox: VIEW, fills: parts.fills, strokes: parts.strokes, register: [2.5, 2] };
}

function add(parts: Parts, ...items: (Stroke | { fill: Fill; stroke: Stroke })[]): Parts {
  for (const it of items) {
    if ('fill' in it) {
      parts.fills.push(it.fill);
      parts.strokes.push(it.stroke);
    } else {
      parts.strokes.push(it);
    }
  }
  return parts;
}

function rotateParts(parts: Parts, deg: number): Parts {
  return {
    fills: parts.fills.map((f) => ({ ...f, pts: rotate(f.pts, deg, 50, 60) })),
    strokes: parts.strokes.map((s) => ({ ...s, pts: rotate(s.pts, deg, 50, 60) })),
  };
}

const leaf = (cx: number, cy: number, rot: number): Point[] => ellipse(cx, cy, 7, 3.5, 10, rot);

export function specimenFigure(pose: Pose): Figure {
  switch (pose) {
    case 'notebook':
      return figure(pose, add(base(pose), line([26, 64], [16, 70]), shape(rect(2, 62, 15, 19), 'paper', false), line([9.5, 64], [9.5, 79])));
    case 'digging':
      return figure(
        pose,
        add(
          base(pose),
          line([74, 64], [86, 54]),
          line([84, 50], [98, 92]),
          shape([[93, 86], [104, 90], [101, 102], [90, 98]], 'paper', false),
          line([26, 66], [18, 74]),
        ),
      );
    case 'floating':
      return figure(
        pose,
        add(base(pose, { feet: 'dangle' }), curve([27, 60], [18, 50], [14, 40]), curve([73, 60], [82, 50], [86, 40]), ...star(6, 16, 4), ...star(94, 22, 3), ...star(88, 98, 3)),
      );
    case 'stethoscope':
      return figure(
        pose,
        add(base(pose), curve([36, 62], [33, 76], [50, 84], [67, 76], [64, 62]), shape(circle(50, 86, 5, 10), 'magenta'), line([26, 66], [18, 74]), line([74, 66], [82, 74])),
      );
    case 'binoculars': {
      const p = base(pose, { goggles: false });
      return figure(
        pose,
        add(p, shape(rect(30, 44, 16, 18), 'green', false), shape(rect(54, 44, 16, 18), 'green', false), line([46, 52], [54, 52]), line([28, 70], [34, 60]), line([72, 70], [66, 60])),
      );
    }
    case 'hardhat':
      return figure(
        pose,
        add(base(pose), shape([[28, 42], [32, 30], [50, 22], [68, 30], [72, 42]], 'red'), line([20, 42], [80, 42]), line([50, 22], [50, 42]), line([26, 66], [18, 74])),
      );
    case 'loupe':
      return figure(pose, add(base(pose), line([74, 64], [82, 58]), shape(circle(90, 48, 9, 12), 'halftone'), line([84, 55], [79, 61]), line([26, 66], [18, 74])));
    case 'blocks':
      return figure(
        pose,
        add(base(pose), shape(rect(-6, 80, 15, 15), 'orange', false), shape(rect(9, 80, 15, 15), 'blue', false), shape(rect(1, 65, 15, 15), 'green', false), line([28, 66], [20, 72])),
      );
    case 'leaves':
      return figure(
        pose,
        add(
          base(pose),
          curve([27, 60], [18, 50], [14, 42]),
          curve([73, 60], [82, 50], [86, 42]),
          shape(leaf(8, 30, 0.6), 'orange'),
          shape(leaf(92, 28, -0.5), 'green'),
          shape(leaf(20, 14, 1.2), 'green'),
          shape(leaf(80, 10, -1.1), 'orange'),
        ),
      );
    case 'climbing':
      return figure(pose, add(base(pose, { feet: 'climb' }), line([72, 62], [84, 50]), line([28, 66], [20, 72])));
    case 'tumbling':
      return figure(pose, rotateParts(add(base(pose, { feet: 'dangle' }), curve([27, 60], [16, 52], [10, 44]), line([74, 64], [86, 70]), ...star(96, 10, 4)), -28));
  }
}
