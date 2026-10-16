/** Color math for the contrast audit: hex parsing, OKLCH color-mix, WCAG contrast. Pure. */

export type Rgb = readonly [r: number, g: number, b: number]; // 0–1 sRGB

export function parseHex(hex: string): Rgb {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) throw new Error(`Not a hex color: ${hex}`);
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as unknown as Rgb;
}

export function toHex(rgb: Rgb): string {
  return `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('')}`;
}

const toLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number): number => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

type Lch = readonly [l: number, c: number, h: number];

export function rgbToOklch([r, g, b]: Rgb): Lch {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  const H = C < 1e-4 ? Number.NaN : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return [L, C, H];
}

export function oklchToRgb([L, C, H]: Lch): Rgb {
  const hr = ((Number.isNaN(H) ? 0 : H) * Math.PI) / 180;
  const A = C * Math.cos(hr);
  const B = C * Math.sin(hr);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const lin: Rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((c) => Math.min(1, Math.max(0, fromLinear(Math.min(1, Math.max(0, c)))))) as unknown as Rgb;
}

/** CSS `color-mix(in oklch, a, b p%)`: p is b's share; shorter hue arc; powerless hues adopt the other. */
export function mixOklch(a: Rgb, b: Rgb, bShare: number): Rgb {
  const [l1, c1, h1Raw] = rgbToOklch(a);
  const [l2, c2, h2Raw] = rgbToOklch(b);
  const h1 = Number.isNaN(h1Raw) ? h2Raw : h1Raw;
  const h2 = Number.isNaN(h2Raw) ? h1Raw : h2Raw;
  const t = bShare;
  let h = Number.NaN;
  if (!Number.isNaN(h1) && !Number.isNaN(h2)) {
    let d = h2 - h1;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    h = (h1 + d * t + 360) % 360;
  }
  return oklchToRgb([l1 + (l2 - l1) * t, c1 + (c2 - c1) * t, h]);
}

export function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
