/**
 * Placeholder panel scenes (viewBox 320×200). Simple, recognisable, flat fills.
 * Every scene is a "Sketch" placeholder for an illustrator to replace 1:1
 * (see docs/illustration-brief.md). Documentary scenes use sepia only.
 */
import {
  arc,
  blob,
  circle,
  closed,
  curve,
  ellipse,
  line,
  rect,
  shape,
  star,
  wave,
  type Figure,
  type Fill,
  type Point,
  type Stroke,
} from './lib.ts';

type Item = Stroke | { fill: Fill; stroke: Stroke } | Fill;

function scene(id: string, items: Item[], register: Point = [3, 2]): Figure {
  const fills: Fill[] = [];
  const strokes: Stroke[] = [];
  for (const it of items) {
    if ('fill' in it) {
      fills.push(it.fill);
      strokes.push(it.stroke);
    } else if ('tone' in it) {
      fills.push(it);
    } else {
      strokes.push(it);
    }
  }
  return { id, viewBox: [0, 0, 320, 200], fills, strokes, register };
}

const ground = (y = 178): Stroke => line([8, y], [312, y]);
const pencil = (s: Stroke): Stroke => ({ ...s, line: 'pencil' });

function stegosaurus(): Item[] {
  const body: Point[] = [[74, 132], [96, 104], [140, 86], [188, 90], [226, 112], [252, 124], [300, 120], [254, 136], [214, 142], [150, 146], [100, 144]];
  const plates: Item[] = [];
  const plateBase: [number, number, number][] = [
    [104, 102, 12], [122, 92, 16], [142, 86, 20], [164, 86, 22], [186, 90, 20], [206, 98, 17], [226, 110, 13], [244, 120, 9],
  ];
  plateBase.forEach(([x, y, h], i) => {
    const lean = i % 2 === 0 ? -3 : 3;
    plates.push(shape([[x - 7, y + 2], [x + lean, y - h], [x + 7, y + 2]], 'orange', false));
  });
  return [
    ...plates,
    shape(body, 'green'),
    shape([[80, 130], [62, 136], [44, 142], [40, 150], [56, 152], [78, 146]], 'green'),
    { fill: { pts: circle(48, 145, 2, 6), tone: 'ink' }, stroke: closed(circle(48, 145, 2, 6)) },
    line([110, 142], [108, 176], [118, 176]),
    line([134, 145], [136, 176], [146, 176]),
    line([196, 142], [198, 176], [208, 176]),
    line([222, 138], [228, 176], [238, 176]),
    line([278, 124], [290, 106]),
    line([286, 122], [302, 108]),
    line([284, 128], [302, 138]),
    line([276, 130], [290, 146]),
    ground(),
  ];
}

export const SCENES: readonly Figure[] = [
  scene('scene-space', [
    shape(circle(150, 96, 46, 18), 'blue'),
    { fill: { pts: ellipse(150, 96, 92, 18, 22, -0.26), tone: 'halftone' }, stroke: closed(ellipse(150, 96, 92, 18, 22, -0.26)) },
    curve([112, 70], [130, 62], [154, 60]),
    ...star(36, 30, 6), ...star(276, 36, 5), ...star(262, 164, 4), ...star(56, 156, 5), ...star(110, 22, 3), ...star(220, 18, 3),
  ]),
  scene('scene-blocks', [
    shape(rect(60, 118, 56, 56), 'orange', false),
    shape(rect(116, 118, 56, 56), 'blue', false),
    shape(rect(88, 62, 56, 56), 'green', false),
    line([76, 134], [100, 134], [88, 158], [76, 134]),
    shape(circle(206, 156, 20, 14), 'orange'),
    ground(),
  ]),
  scene('scene-health', [
    shape([[90, 150], [40, 100], [36, 72], [54, 54], [78, 58], [90, 74], [102, 58], [126, 54], [144, 72], [140, 100]], 'magenta'),
    curve(...wave(176, 290, 60, 18, 1.5)),
    curve(...wave(176, 290, 60, 18, 1.5, Math.PI)),
    ...[0, 1, 2, 3, 4, 5].map((i) => line([190 + i * 18, 48], [190 + i * 18, 72])),
    ground(),
  ]),
  scene('scene-wildlife', [
    shape([[10, 178], [10, 130], [70, 70], [118, 120], [170, 52], [240, 132], [310, 86], [310, 178]], 'green', false),
    shape([[40, 178], [52, 140], [64, 178]], 'ink', false),
    shape([[250, 178], [264, 132], [278, 178]], 'ink', false),
    curve([120, 40], [128, 34], [136, 40]),
    curve([140, 30], [148, 24], [156, 30]),
    closed(rect(4, 4, 312, 192), false),
  ]),
  scene('scene-vitrine', [
    { pts: rect(96, 140, 128, 34), tone: 'sepia' },
    closed(rect(96, 26, 128, 148), false),
    line([96, 140], [224, 140]),
    line([84, 174], [236, 174]),
    { ...line([110, 40], [132, 40]), line: 'fine' },
  ], [0, 0]),
  scene('scene-gem', [
    shape([[110, 76], [160, 40], [210, 76], [160, 164]], 'blue', false),
    line([110, 76], [210, 76]),
    line([136, 76], [160, 40], [184, 76]),
    line([136, 76], [160, 164], [184, 76]),
    ...star(232, 44, 6), ...star(86, 120, 4),
    ground(),
  ]),
  scene('scene-stegosaurus', [...stegosaurus(), shape([[230, 178], [250, 160], [276, 158], [296, 178]], 'halftone')]),
  scene('scene-construction', [
    pencil(closed([[70, 170], [96, 70], [122, 170]], false)),
    pencil(closed([[110, 170], [146, 44], [182, 170]], false)),
    pencil(closed([[170, 170], [190, 100], [210, 170]], false)),
    { pts: [[110, 170], [146, 44], [160, 110], [140, 170]], tone: 'pencil-fill' },
    pencil(line([230, 30], [230, 178])),
    pencil(line([290, 30], [290, 178])),
    pencil(line([230, 70], [290, 70])),
    pencil(line([230, 120], [290, 120])),
    pencil(line([230, 70], [290, 120])),
    pencil(line([20, 178], [300, 178])),
  ], [0, 0]),
  scene('scene-park', [
    line([80, 178], [80, 120]),
    shape(blob(80, 92, 40, 'tree-a', 12, 0.16), 'green'),
    line([236, 178], [236, 132]),
    shape(blob(236, 108, 30, 'tree-b', 12, 0.18), 'green'),
    shape([[130, 178], [150, 152], [178, 146], [204, 156], [216, 178]], 'orange'),
    ground(),
  ]),
  scene('scene-dragon', [
    shape([[70, 140], [100, 110], [150, 104], [200, 116], [240, 138], [280, 150], [300, 140], [292, 160], [240, 160], [190, 150], [130, 150], [92, 150]], 'green'),
    shape([[130, 108], [150, 40], [176, 70], [196, 30], [200, 112]], 'magenta', false),
    shape([[70, 140], [52, 116], [36, 112], [24, 124], [40, 140], [60, 148]], 'green'),
    { fill: { pts: circle(36, 120, 2, 6), tone: 'ink' }, stroke: closed(circle(36, 120, 2, 6)) },
    line([292, 142], [304, 132], [306, 148]),
    line([110, 150], [104, 176]),
    line([210, 156], [216, 176]),
    ground(),
  ]),
  scene('scene-unicorn', [
    shape([[120, 180], [126, 120], [140, 86], [170, 66], [206, 70], [214, 84], [196, 96], [186, 120], [190, 180]], 'paper'),
    shape([[168, 68], [186, 14], [180, 70]], 'paper', false),
    line([172, 52], [184, 48]), line([175, 40], [185, 37]),
    shape([[140, 86], [118, 98], [112, 130], [124, 160], [128, 120], [136, 100]], 'magenta'),
    { fill: { pts: circle(194, 80, 2.5, 6), tone: 'ink' }, stroke: closed(circle(194, 80, 2.5, 6)) },
  ]),
  scene('scene-mermaid', [
    shape([[150, 150], [156, 110], [166, 80], [150, 56], [176, 66], [200, 52], [186, 80], [176, 112], [174, 150]], 'green'),
    { fill: { pts: [[0, 150], ...wave(0, 320, 150, 6, 4), [320, 200], [0, 200]], tone: 'halftone' }, stroke: curve(...wave(0, 320, 150, 6, 4)) },
    curve(...wave(20, 300, 172, 4, 5, 1)),
    ...star(90, 120, 3), ...star(240, 110, 4),
  ]),
  scene('scene-landscape', [
    { pts: [[8, 178], [8, 130], [80, 110], [160, 124], [240, 100], [312, 118], [312, 178]], tone: 'sepia' },
    curve([8, 130], [80, 110], [160, 124], [240, 100], [312, 118]),
    closed(circle(250, 54, 18, 14)),
    line([8, 150], [312, 150]),
    ground(),
  ], [0, 0]),
  scene('scene-lanterns', [
    curve([10, 40], [90, 80], [160, 92], [230, 80], [310, 40]),
    ...[[60, 72], [120, 92], [190, 92], [258, 72]].map(([x, y]) => shape(rect((x ?? 0) - 9, (y ?? 0) + 4, 18, 24), 'blue', false)),
    ...star(60, 150, 8), ...star(150, 140, 6), ...star(250, 156, 8), ...star(100, 176, 5),
  ]),
  scene('scene-crate', [
    shape(rect(100, 80, 120, 96), 'orange', false),
    line([100, 112], [220, 112]),
    line([100, 144], [220, 144]),
    line([100, 80], [220, 176]),
    ground(),
  ]),
  scene('scene-dome', [
    shape([[60, 176], ...arc(160, 176, 100, 180, 360, 16), [260, 176]], 'blue'),
    ...star(130, 120, 6), ...star(180, 100, 4), ...star(210, 140, 5), ...star(108, 150, 3),
    ground(),
  ]),
  scene('scene-screen', [
    shape(rect(40, 24, 240, 110), 'blue', false),
    curve(...arc(160, 230, 90, 220, 320, 12)),
    curve(...arc(160, 250, 100, 225, 315, 12)),
    curve(...arc(160, 270, 110, 228, 312, 12)),
  ]),
  scene('scene-laser', [
    ...[-60, -35, -12, 12, 35, 60].map((deg) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return line([160, 178], [160 + Math.cos(a) * 170, 178 + Math.sin(a) * 170]);
    }),
    shape(rect(140, 168, 40, 14), 'magenta', false),
    ground(),
  ]),
  scene('scene-notebook', [
    shape([[30, 60], [160, 50], [160, 180], [30, 176]], 'paper', false),
    shape([[160, 50], [290, 60], [290, 176], [160, 180]], 'paper', false),
    ...[80, 100, 120, 140].map((y) => ({ ...line([46, y], [146, y - 4]), line: 'fine' as const })),
    ...[86, 106, 126, 146].map((y) => ({ ...line([176, y - 4], [276, y]), line: 'fine' as const })),
    shape(rect(96, 186, 128, 6), 'halftone', false),
  ]),
  scene('scene-drawers', [
    closed(rect(90, 30, 140, 146), false),
    ...[64, 98, 132].map((y) => line([90, y], [230, y])),
    ...[47, 81, 115, 149].map((y) => line([150, y], [170, y])),
    { pts: rect(90, 132, 140, 44), tone: 'sepia' },
  ], [0, 0]),
  scene('scene-trilobite', [
    shape(ellipse(160, 104, 46, 66, 20), 'orange'),
    ...[60, 76, 92, 108, 124, 140, 156].map((y) => curve([122, y], [160, y + 6], [198, y])),
    line([160, 40], [160, 168]),
    ground(),
  ]),
  scene('scene-beetle', [
    shape(ellipse(160, 110, 40, 54, 18), 'green'),
    shape(circle(160, 52, 16, 12), 'green'),
    line([160, 60], [160, 162]),
    line([124, 92], [92, 76]), line([122, 112], [86, 112]), line([126, 134], [94, 154]),
    line([196, 92], [228, 76]), line([198, 112], [234, 112]), line([194, 134], [226, 154]),
    line([152, 38], [140, 18]), line([168, 38], [180, 18]),
  ]),
  scene('scene-books', [
    shape(rect(80, 140, 160, 22), 'blue', false),
    shape(rect(92, 118, 140, 22), 'orange', false),
    shape(rect(86, 96, 150, 22), 'green', false),
    shape(rect(100, 74, 120, 22), 'paper', false),
    ground(162),
  ]),
  scene('scene-monitor', [
    shape(rect(70, 30, 180, 110), 'blue', false),
    ...[66, 102].map((y) => line([70, y], [250, y])),
    ...[130, 190].map((x) => line([x, 30], [x, 140])),
    line([160, 140], [160, 166]),
    line([120, 170], [200, 170]),
  ]),
  scene('scene-clock', [
    shape(circle(160, 100, 64, 20), 'paper'),
    line([160, 100], [160, 54]),
    line([160, 100], [196, 112]),
    ...[0, 90, 180, 270].map((deg) => {
      const a = (deg * Math.PI) / 180;
      return line([160 + Math.cos(a) * 54, 100 + Math.sin(a) * 54], [160 + Math.cos(a) * 62, 100 + Math.sin(a) * 62]);
    }),
  ]),
  scene('scene-pin', [
    shape([[160, 176], [126, 110], [124, 80], [140, 56], [160, 50], [180, 56], [196, 80], [194, 110]], 'blue'),
    shape(circle(160, 88, 14, 12), 'paper'),
    curve([40, 150], [100, 132], [150, 150], [220, 130], [290, 150]),
    curve([30, 176], [120, 164], [210, 178], [300, 166]),
  ]),
  scene('scene-door', [
    shape(rect(118, 40, 84, 138), 'blue', false),
    line([186, 110], [194, 110]),
    line([40, 178], [118, 150]),
    line([118, 150], [118, 178]),
    ground(),
  ]),
  scene('scene-plaza', [
    shape(rect(30, 110, 260, 10), 'halftone', false),
    line([60, 120], [60, 150]), line([110, 120], [110, 150]), line([210, 120], [210, 150]), line([260, 120], [260, 150]),
    line([160, 178], [160, 118]),
    shape(blob(160, 82, 38, 'plaza-tree', 12, 0.15), 'green'),
    ground(),
  ]),
  scene('scene-calendar', [
    shape(rect(80, 40, 160, 136), 'paper', false),
    shape(rect(80, 40, 160, 30), 'orange', false),
    ...[102, 134].map((y) => line([80, y], [240, y])),
    ...[120, 160, 200].map((x) => line([x, 70], [x, 176])),
    line([110, 30], [110, 50]), line([210, 30], [210, 50]),
  ]),
  scene('scene-bus', [
    shape(rect(50, 70, 220, 90), 'orange', false),
    ...[74, 120, 166, 212].map((x) => shape(rect(x, 84, 36, 30), 'paper', false)),
    shape(circle(100, 164, 16, 12), 'ink'),
    shape(circle(226, 164, 16, 12), 'ink'),
    ground(),
  ]),
  scene('scene-microscope', [
    shape([[150, 40], [176, 40], [190, 120], [164, 120]], 'blue', false),
    line([170, 120], [170, 150]),
    shape(rect(120, 150, 110, 14), 'halftone', false),
    shape(rect(130, 164, 96, 14), 'ink', false),
    curve([200, 110], [226, 130], [214, 160]),
  ]),
];
