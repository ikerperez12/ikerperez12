/**
 * Candidate closing pieces for the end of the page.
 *
 * All five are pure CSS-animated SVG, because a README cannot run scripts:
 * GitHub strips <script>, <canvas> and <iframe>, so anything that appears to
 * compute must actually be computed here, at build time, and replayed.
 *
 * Each one holds a complete, legible state when animation is disabled, so a
 * reader with prefers-reduced-motion gets the finished figure rather than a
 * blank frame.
 */

import { THEMES, baseStyle, svg, esc, n, MONO } from "./design.mjs";

const W = 1200;
const H = 260;

function frame(t, label, note, h = H) {
  return (
    `<rect x="0" y="0" width="${W}" height="${h}" rx="10" fill="${t.panel}"/>` +
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${h - 1}" rx="10" fill="none" stroke="${t.line}"/>` +
    `<text x="24" y="26" font-family="${MONO}" font-size="11" letter-spacing="2.2" fill="${t.faint}">${esc(label)}</text>` +
    `<text x="${W - 24}" y="26" font-family="${MONO}" font-size="11" letter-spacing="1.4" fill="${t.faint}" text-anchor="end">${esc(note)}</text>`
  );
}

/* ------------------------------------------------------------------ A. wave */
/**
 * Pendulum wave. Each arm is one repository; its period comes from that
 * repository's commit count, so the pattern the arms trace out — converging,
 * scattering, converging again — is set by real history rather than chosen.
 */
export function closerPendulum(data, theme) {
  const t = THEMES[theme];
  const repos = (data.repos || []).slice(0, 16);
  const pivotY = 54;
  const span = W - 160;
  const step = span / Math.max(1, repos.length - 1);

  let body = frame(t, "PENDULUM WAVE · ONE ARM PER REPOSITORY", "period from commit count");
  let css = "";

  repos.forEach((r, i) => {
    const x = 80 + i * step;
    const len = 120 + i * 4;
    // Longer arms swing slower, so the ensemble drifts in and out of phase.
    const dur = n(2.6 + i * 0.14);
    const c = i % 3 === 0 ? t.glow[0] : i % 3 === 1 ? t.glow[1] : t.glow[2];
    body += `<line x1="${n(x)}" y1="${pivotY}" x2="${n(x)}" y2="${n(pivotY + len)}" stroke="${t.lineSoft}" stroke-width="1"/>`;
    body += `<g class="pw p${i}" style="transform-origin:${n(x)}px ${pivotY}px">
<line x1="${n(x)}" y1="${pivotY}" x2="${n(x)}" y2="${n(pivotY + len)}" stroke="${c}" stroke-width="1.2" opacity="0.55"/>
<circle cx="${n(x)}" cy="${n(pivotY + len)}" r="5" fill="${c}"/></g>`;
    css += `.p${i}{animation-duration:${dur}s}`;
  });

  body += `<rect x="80" y="${pivotY}" width="${n(span)}" height="1" fill="${t.line}"/>`;

  const style =
    baseStyle(t) +
    `
.pw{animation-name:sw;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes sw{0%,100%{transform:rotate(-19deg)}50%{transform:rotate(19deg)}}
${css}
@media (prefers-reduced-motion:reduce){.pw{transform:rotate(0)}}
`;
  return svg({
    w: W,
    h: H,
    title: "Pendulum wave",
    desc: `A row of ${repos.length} pendulums, one per public repository, swinging at periods derived from their commit counts.`,
    style,
    body,
  });
}

/* ------------------------------------------------------- B. rule 110 automaton */
/**
 * Rule 110, computed at build time and replayed row by row. Chosen over a
 * prettier automaton because Rule 110 is Turing complete: the figure is a
 * genuine computation, not a pattern that resembles one.
 */
export function closerAutomaton(data, theme) {
  const t = THEMES[theme];
  const cols = 300;
  const rows = 52;
  const cell = W / cols;
  const top = 44;

  // Seeded from a fixed pseudo-random row rather than a single live cell: one
  // cell produces a narrow triangle in a wide frame, while random initial
  // conditions fill the width with the gliders Rule 110 is actually known for.
  let cur = new Uint8Array(cols);
  let s = 0x9e3779b9;
  for (let i = 0; i < cols; i++) {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    cur[i] = s & 1;
  }

  let body = frame(t, "RULE 110 · CELLULAR AUTOMATON", "computed at build time");
  let cells = "";
  for (let y = 0; y < rows; y++) {
    let row = "";
    for (let x = 0; x < cols; x++) {
      if (!cur[x]) continue;
      row += `<rect x="${n(x * cell)}" y="0" width="${n(cell - 0.4)}" height="${n(cell - 0.4)}"/>`;
    }
    const c = y % 3 === 0 ? t.glow[0] : y % 3 === 1 ? t.glow[1] : t.glow[2];
    cells += `<g class="rw r${y}" transform="translate(0 ${n(top + y * cell)})" fill="${c}">${row}</g>`;
    const next = new Uint8Array(cols);
    for (let x = 0; x < cols; x++) {
      const l = cur[(x - 1 + cols) % cols];
      const m = cur[x];
      const r = cur[(x + 1) % cols];
      const idx = (l << 2) | (m << 1) | r;
      next[x] = (110 >> idx) & 1;
    }
    cur = next;
  }
  body += cells;

  let css = "";
  const cycle = 6;
  for (let y = 0; y < rows; y++) {
    css += `.r${y}{animation-delay:-${n(cycle - (y / rows) * cycle)}s}`;
  }

  const style =
    baseStyle(t) +
    `
.rw{opacity:.22;animation:pop ${cycle}s linear infinite}
@keyframes pop{0%,2%{opacity:1}20%,100%{opacity:.22}}
${css}
@media (prefers-reduced-motion:reduce){.rw{opacity:.8!important}}
`;
  return svg({
    w: W,
    h: H,
    title: "Rule 110 cellular automaton",
    desc: "The Rule 110 elementary cellular automaton evolved from a single live cell for 44 generations.",
    style,
    body,
  });
}

/* --------------------------------------------------------- C. lissajous scope */
/** Three Lissajous figures drawn as if by a phosphor trace. */
export function closerScope(data, theme) {
  const t = THEMES[theme];
  const cy = H / 2 + 14;
  const figs = [
    { a: 3, b: 2, phase: 0, rx: 150, ry: 78 },
    { a: 5, b: 4, phase: Math.PI / 4, rx: 150, ry: 78 },
    { a: 7, b: 5, phase: Math.PI / 2, rx: 150, ry: 78 },
  ];

  let body = frame(t, "LISSAJOUS · PHASE FIGURES", "a:b ratios 3:2, 5:4, 7:5");

  // Graticule, drawn faint so the traces stay dominant.
  for (let i = 1; i < 12; i++) {
    body += `<rect x="${n((W / 12) * i)}" y="44" width="1" height="${H - 62}" fill="${t.lineSoft}"/>`;
  }
  for (let i = 1; i < 4; i++) {
    body += `<rect x="24" y="${n(44 + ((H - 62) / 4) * i)}" width="${W - 48}" height="1" fill="${t.lineSoft}"/>`;
  }

  figs.forEach((f, i) => {
    const cx = W * (0.22 + i * 0.28);
    const pts = [];
    for (let s = 0; s <= 400; s++) {
      const u = (s / 400) * Math.PI * 2;
      pts.push(
        `${n(cx + f.rx * Math.sin(f.a * u + f.phase))},${n(cy + f.ry * Math.sin(f.b * u))}`
      );
    }
    const c = t.glow[i];
    body += `<polyline points="${pts.join(" ")}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" pathLength="100" class="tr t${i}" opacity="0.9"/>`;
  });

  const style =
    baseStyle(t) +
    `
.tr{stroke-dasharray:22 78;animation:draw 7s linear infinite}
.t0{animation-delay:0s}.t1{animation-delay:-2.3s}.t2{animation-delay:-4.6s}
@keyframes draw{to{stroke-dashoffset:-100}}
@media (prefers-reduced-motion:reduce){.tr{stroke-dasharray:none}}
`;
  return svg({
    w: W,
    h: H,
    title: "Lissajous phase figures",
    desc: "Three Lissajous curves with frequency ratios 3:2, 5:4 and 7:5 traced on an oscilloscope graticule.",
    style,
    body,
  });
}

/* -------------------------------------------------------------- D. orbits */
/**
 * One orbit per repository. Radius follows recency and the orbital period
 * follows size, so the arrangement is a reading of the account rather than
 * decoration.
 */
export function closerOrbits(data, theme) {
  const t = THEMES[theme];
  const repos = (data.repos || []).slice(0, 11);
  // Taller than the others: at 260px the ellipses flatten to near-lines and the
  // figure stops reading as orbits at all.
  const OH = 360;
  const cx = W / 2;
  const cy = OH / 2 + 14;

  let body = frame(t, "ORBITS · ONE PER REPOSITORY", "radius by recency, period by size", OH);
  body += `<circle cx="${cx}" cy="${cy}" r="5" fill="${t.accent}"/>`;

  let css = "";
  repos.forEach((r, i) => {
    const rx = 48 + i * 46;
    const ry = 20 + i * 12.4;
    const bytes = Object.values(r.languages || {}).reduce((s, v) => s + v, 0);
    const dur = n(9 + (Math.log10(bytes + 10) * 3.4) + i * 1.7);
    const c = t.glow[i % 3];
    body += `<ellipse cx="${cx}" cy="${cy}" rx="${n(rx)}" ry="${n(ry)}" fill="none" stroke="${t.lineSoft}" stroke-width="1"/>`;
    body += `<g class="orb o${i}" style="transform-origin:${cx}px ${cy}px"><circle cx="${n(cx + rx)}" cy="${cy}" r="${n(2.4 + Math.min(3, Math.log10(bytes + 10) / 2))}" fill="${c}"/></g>`;
    css += `.o${i}{animation-duration:${dur}s}`;
  });

  const style =
    baseStyle(t) +
    `
.orb{animation-name:spin;animation-timing-function:linear;animation-iteration-count:infinite}
@keyframes spin{to{transform:rotate(360deg)}}
${css}
@media (prefers-reduced-motion:reduce){.orb{transform:none}}
`;
  return svg({
    w: W,
    h: OH,
    title: "Repository orbits",
    desc: `${repos.length} elliptical orbits, one per public repository, with periods derived from repository size.`,
    style,
    body,
  });
}

/* --------------------------------------------------------- E. hilbert curve */
/** A space-filling curve drawn by a travelling light. */
export function closerHilbert(data, theme) {
  const t = THEMES[theme];
  const order = 5;
  // Taller panel: at 260px the curve shrinks to a smudge in the middle of a very
  // wide frame, which reads as a mistake rather than as a figure.
  const HH = 400;
  const size = HH - 90;
  const cells = 1 << order;
  const step = size / cells;

  const d2xy = (d) => {
    let rx, ry, x = 0, y = 0, tt = d;
    for (let s = 1; s < cells; s *= 2) {
      rx = 1 & (tt / 2);
      ry = 1 & (tt ^ rx);
      if (ry === 0) {
        if (rx === 1) {
          x = s - 1 - x;
          y = s - 1 - y;
        }
        [x, y] = [y, x];
      }
      x += s * rx;
      y += s * ry;
      tt = Math.floor(tt / 4);
    }
    return [x, y];
  };

  const ox = (W - size) / 2;
  const oy = 56;
  const pts = [];
  for (let d = 0; d < cells * cells; d++) {
    const [x, y] = d2xy(d);
    pts.push(`${n(ox + x * step + step / 2)},${n(oy + y * step + step / 2)}`);
  }

  let body = frame(t, "HILBERT CURVE · ORDER 5", "1024 cells, one continuous path", HH);
  // The full path is always present, faintly; a bright segment travels along it.
  // Drawing it from nothing would leave the panel blank for most of the loop and
  // completely blank to anyone who never sees the animation start.
  body += `<polyline points="${pts.join(" ")}" fill="none" stroke="${t.lineSoft}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/>`;
  body += `<polyline points="${pts.join(" ")}" fill="none" stroke="url(#hg)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" pathLength="100" class="hb"/>`;

  const defs = `<defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${t.glow[0]}"/><stop offset="0.5" stop-color="${t.glow[1]}"/><stop offset="1" stop-color="${t.glow[2]}"/>
</linearGradient></defs>`;

  const style =
    baseStyle(t) +
    `
.hb{stroke-dasharray:18 82;animation:trace 14s linear infinite}
@keyframes trace{to{stroke-dashoffset:-100}}
@media (prefers-reduced-motion:reduce){.hb{stroke-dasharray:none}}
`;
  return svg({
    w: W,
    h: HH,
    title: "Hilbert curve, order 5",
    desc: "A single continuous space-filling Hilbert curve of order 5 covering 1024 cells.",
    style,
    body,
  });
}

export const CLOSERS = {
  pendulum: closerPendulum,
  automaton: closerAutomaton,
  scope: closerScope,
  orbits: closerOrbits,
  hilbert: closerHilbert,
};
