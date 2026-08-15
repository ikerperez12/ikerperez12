/**
 * Hero banner.
 *
 * Three things move, and each one is tied to something real:
 *
 *   - the frame, where three lights chase the perimeter on a narrow cool ramp;
 *   - the field behind the type, a slow drift of soft light so the panel is not
 *     a flat rectangle;
 *   - the pendulum wave, one arm per public repository, with arm lengths that
 *     differ just enough for the row to drift in and out of phase.
 */

import { THEMES, baseStyle, svg, esc, n } from "./design.mjs";

/** Roll the contribution calendar up into the last twelve months. */
function cadence(data) {
  const cal = (data.github && data.github.calendar) || [];
  const buckets = new Map();
  for (const [date, count] of cal) {
    const key = String(date).slice(0, 7);
    buckets.set(key, (buckets.get(key) || 0) + count);
  }
  const months = [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  const max = Math.max(1, ...months.map((m) => m[1]));
  return { months, max };
}

export function renderHero(data, { theme = "dark", variant = "wide" } = {}) {
  const t = THEMES[theme];
  const dark = theme === "dark";
  const wide = variant === "wide";
  const W = wide ? 1200 : 760;
  const pad = wide ? 40 : 28;

  const fs = wide
    ? { bar: 13, mark: 76, copy: 21, chip: 12, foot: 13, cap: 11 }
    : { bar: 15, mark: 64, copy: 23, chip: 14, foot: 15, cap: 13 };

  const { months } = cadence(data);
  const totalCommits = months.reduce((s, m) => s + m[1], 0);

  const barH = wide ? 44 : 50;
  const tx = pad + 16;

  const copy = wide
    ? [
        ["Every layer ships the same contract — security, accessibility,", t.dim],
        ["and something you can actually run.", t.accent],
      ]
    : [
        ["Every layer ships the same contract —", t.dim],
        ["security, accessibility, and", t.dim],
        ["something you can actually run.", t.accent],
      ];

  const markY = barH + (wide ? 104 : 96);
  const copy0 = markY + (wide ? 42 : 40);
  const lead = wide ? 28 : 30;
  const textBottom = copy0 + copy.length * lead;

  // Pendulum panel: right column on desktop, its own band underneath on mobile.
  const cadW = wide ? 420 : W - pad * 2 - 32;
  const cadX = wide ? W - pad - 16 - cadW : tx;
  const cadTop = wide ? barH + 62 : textBottom + 34;
  const cadH = wide ? 132 : 108;

  // The pendulum column is often deeper than the text column, so the panel has
  // to be sized by whichever side ends lower.
  const cadBottom = cadTop + cadH + 8;
  const H = (wide ? Math.max(textBottom + 12, cadBottom) : cadBottom) + (wide ? 14 : 18);

  // ---- background -----------------------------------------------------------
  let body = `<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="${t.panel}"/>`;
  body += `<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="url(#field)"/>`;
  // Two soft lights drifting behind the type. Large, low-opacity and slow, so
  // they read as depth rather than as an effect.
  body += `<g class="motion-only" clip-path="url(#panel)">
<ellipse cx="${W * 0.24}" cy="${H * 0.30}" rx="${W * 0.34}" ry="${H * 0.62}" fill="url(#l1)" class="d1"/>
<ellipse cx="${W * 0.72}" cy="${H * 0.72}" rx="${W * 0.30}" ry="${H * 0.55}" fill="url(#l2)" class="d2"/>
</g>`;

  // ---- status bar -----------------------------------------------------------
  body += `<rect x="1" y="${barH}" width="${W - 2}" height="1" fill="${t.line}"/>`;
  body += `<circle cx="${pad + 6}" cy="${barH / 2}" r="4" fill="${t.pass}" class="pulse"/>`;
  body += `<text x="${pad + 22}" y="${barH / 2 + 4}" class="mono" font-size="${fs.bar}" letter-spacing="1.6" fill="${t.dim}">IKER PEREZ // COMPUTER ENGINEER</text>`;
  body += `<text x="${W - pad}" y="${barH / 2 + 4}" class="mono" font-size="${fs.bar}" letter-spacing="1.6" fill="${t.faint}" text-anchor="end">A CORUÑA [ES]</text>`;

  // ---- identity -------------------------------------------------------------
  body += `<text x="${tx}" y="${markY}" font-size="${fs.mark}" font-weight="700" letter-spacing="-1.6" fill="${t.ink}">IKER PEREZ</text>`;
  copy.forEach((c, i) => {
    body += `<text x="${tx}" y="${copy0 + i * lead}" font-size="${fs.copy}" fill="${c[1]}">${esc(c[0])}</text>`;
  });


  // ---- pendulum wave --------------------------------------------------------
  // One arm per public repository. Arm length grows along the row, so the
  // periods differ slightly and the ensemble drifts in and out of phase instead
  // of swinging as a block.
  const arms = (data.repos || []).filter((r) => r.repo !== data.user).slice(0, 14);
  // Inset the row: a swinging bob travels sideways by len*sin(angle), and
  // without a margin the outermost arms leave the panel at the ends of a swing.
  const swingRoom = wide ? 42 : 34;
  const armSpan = cadW - swingRoom * 2;
  const armX0 = cadX + swingRoom;
  const step = arms.length > 1 ? armSpan / (arms.length - 1) : 0;
  body += `<rect x="${n(cadX)}" y="${cadTop}" width="${n(cadW)}" height="1" fill="${t.line}"/>`;

  let armCss = "";
  arms.forEach((r, i) => {
    const x = armX0 + i * step;
    const len = cadH * 0.4 + (i * (cadH * 0.5)) / Math.max(1, arms.length - 1);
    const c = t.glow[i % 3];
    body += `<line x1="${n(x)}" y1="${cadTop}" x2="${n(x)}" y2="${n(cadTop + len)}" stroke="${t.lineSoft}" stroke-width="1"/>`;
    body += `<g class="pw a${i}" style="transform-origin:${n(x)}px ${cadTop}px">
<line x1="${n(x)}" y1="${cadTop}" x2="${n(x)}" y2="${n(cadTop + len)}" stroke="${c}" stroke-width="1.1" opacity="0.5"/>
<circle cx="${n(x)}" cy="${n(cadTop + len)}" r="${wide ? 3.6 : 4.4}" fill="${c}"/></g>`;
    armCss += `.a${i}{animation-duration:${n(2.9 + i * 0.155)}s}`;
  });

  // ---- footing --------------------------------------------------------------

  // ---- animated frame -------------------------------------------------------
  // pathLength normalises the perimeter to 100, so the dash pattern and the
  // per-light offsets are readable percentages instead of computed geometry.
  body += `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="11" fill="none" stroke="${t.line}" stroke-width="1"/>`;
  const runners = t.glow
    .map(
      (c, i) =>
        `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="11" fill="none" stroke="${c}" stroke-width="2" pathLength="100" stroke-dasharray="16 84" stroke-linecap="round" class="run r${i}" opacity="${dark ? 0.95 : 0.8}"/>`
    )
    .join("");
  body += `<g class="motion-only">${runners}</g>`;
  // Without motion the frame would lose its colour entirely, so a static
  // gradient edge stands in for the chase.
  body += `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="11" fill="none" stroke="url(#edge)" stroke-width="2" class="static-only"/>`;

  // ---- defs -----------------------------------------------------------------
  const [g0, g1, g2] = t.glow;
  const defs = `<defs>
<clipPath id="panel"><rect x="0" y="0" width="${W}" height="${H}" rx="12"/></clipPath>
<linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${t.panel}"/><stop offset="1" stop-color="${t.deep}"/>
</linearGradient>
<radialGradient id="l1"><stop offset="0" stop-color="${g0}" stop-opacity="${dark ? 0.16 : 0.10}"/><stop offset="1" stop-color="${g0}" stop-opacity="0"/></radialGradient>
<radialGradient id="l2"><stop offset="0" stop-color="${g2}" stop-opacity="${dark ? 0.14 : 0.09}"/><stop offset="1" stop-color="${g2}" stop-opacity="0"/></radialGradient>
<linearGradient id="bar" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="${g0}"/><stop offset="1" stop-color="${g2}"/>
</linearGradient>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${g0}"/><stop offset="0.5" stop-color="${g1}"/><stop offset="1" stop-color="${g2}"/>
</linearGradient>
</defs>`;

  const style =
    baseStyle(t) +
    `
.run{animation:chase 9s linear infinite}
.r0{animation-delay:0s}
.r1{animation-delay:-3s}
.r2{animation-delay:-6s}
@keyframes chase{to{stroke-dashoffset:-100}}
.d1{animation:dr1 19s ease-in-out infinite}
.d2{animation:dr2 23s ease-in-out infinite}
@keyframes dr1{0%,100%{transform:translate(0,0)}50%{transform:translate(6%,-4%)}}
@keyframes dr2{0%,100%{transform:translate(0,0)}50%{transform:translate(-5%,5%)}}
.pw{animation-name:sw;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes sw{0%,100%{transform:rotate(-17deg)}50%{transform:rotate(17deg)}}
${armCss}
.pulse{animation:pu 2.8s ease-in-out infinite}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.3}}
@media (prefers-reduced-motion:reduce){.pw{transform:rotate(0)}}
`;

  const desc = `Iker Perez, computer engineer in A Coruña. Every layer ships the same contract: security, accessibility, and something you can actually run. Beside the text, a pendulum wave with one arm per public repository, ${totalCommits} commits this year.`;

  return svg({ w: W, h: H, title: "Iker Perez — computer engineer", desc, style, body: defs + body });
}
