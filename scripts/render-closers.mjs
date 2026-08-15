/**
 * Closing piece: three Lissajous figures on black.
 *
 * No frame, no graticule, no labels — the curves float, and a bright segment
 * travels along each one. Pure CSS animation inside the SVG, because a README
 * cannot run scripts.
 *
 * Rendered dark only. The piece is a light drawing on black, and a light-theme
 * version would be a different image rather than the same one recoloured.
 */

import { svg, n } from "./design.mjs";

const W = 1200;
const H = 340;

const PALETTE = ["#38bdf8", "#818cf8", "#c084fc"];

const FIGURES = [
  { a: 3, b: 2, phase: 0 },
  { a: 5, b: 4, phase: Math.PI / 4 },
  { a: 7, b: 5, phase: Math.PI / 2 },
];

export function closerScope() {
  const cy = H / 2;
  const rx = 158;
  const ry = 112;

  let body = `<rect width="${W}" height="${H}" fill="#000"/>`;

  FIGURES.forEach((f, i) => {
    const cx = W * (0.22 + i * 0.28);
    const pts = [];
    for (let s = 0; s <= 520; s++) {
      const u = (s / 520) * Math.PI * 2;
      pts.push(`${n(cx + rx * Math.sin(f.a * u + f.phase))},${n(cy + ry * Math.sin(f.b * u))}`);
    }
    const d = pts.join(" ");
    const c = PALETTE[i];
    // The whole figure sits underneath at low opacity so the piece still reads
    // as three curves when motion is switched off or before the loop starts.
    body += `<polyline points="${d}" fill="none" stroke="${c}" stroke-width="1.1" opacity="0.17"/>`;
    body += `<polyline points="${d}" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" pathLength="100" class="tr t${i}"/>`;
  });

  const style = `
.tr{stroke-dasharray:24 76;animation:draw 9s linear infinite}
.t0{animation-delay:0s}.t1{animation-delay:-3s}.t2{animation-delay:-6s}
@keyframes draw{to{stroke-dashoffset:-100}}
@media (prefers-reduced-motion:reduce){.tr{stroke-dasharray:none;animation:none;opacity:.9}}
`;

  return svg({
    w: W,
    h: H,
    title: "Lissajous figures",
    desc: "Three Lissajous curves with frequency ratios 3:2, 5:4 and 7:5, drawn in blue, indigo and violet on black, each traced by a travelling highlight.",
    style,
    body,
  });
}

export const CLOSERS = { scope: closerScope };
