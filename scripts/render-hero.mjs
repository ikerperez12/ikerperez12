/**
 * Hero banner: identity, plus the claims the audit was able to confirm today.
 *
 * The banner carries no raster payload. The animated keyboard sits beneath it
 * as its own file, so the one heavy asset on the page is downloaded once and
 * shared by both themes instead of being base64-duplicated into two SVGs.
 *
 * The chips are derived from audit results rather than written by hand, so the
 * banner cannot keep advertising a control after it stops existing.
 */

import { THEMES, baseStyle, svg, esc } from "./design.mjs";
import { controlsFor, TIERS } from "./render-core.mjs";

function chipsFor(data) {
  const anyControl = (key) =>
    data.products.some((p) => p.controls && p.controls[key]);
  const out = [];
  if (data.products.some((p) => p.controls && p.controls.sbom)) out.push("CYCLONEDX SBOM");
  if (anyControl("signed_release")) out.push("SHA-256 SUMS");
  if (anyControl("a11y_ci")) out.push("AXE-CORE IN CI");
  if (anyControl("codeql")) out.push("CODEQL");
  if (anyControl("security")) out.push("SECURITY.MD");
  return out.slice(0, 5);
}

export function renderHero(data, { theme = "dark", variant = "wide" } = {}) {
  const t = THEMES[theme];
  const wide = variant === "wide";
  const W = wide ? 1200 : 760;
  const pad = wide ? 40 : 28;

  const fs = wide
    ? { bar: 13, mark: 76, copy: 21, chip: 12, foot: 13 }
    : { bar: 15, mark: 64, copy: 23, chip: 14, foot: 15 };

  const verified = TIERS.reduce((s, x) => s + controlsFor(x.repo, data), 0);
  const live = data.probes.filter((p) => p && p.ok).length;
  const chips = chipsFor(data);

  const barH = wide ? 44 : 50;
  const tx = pad + 16;

  const copy = wide
    ? [
        ["From C and operating systems up to real-time 3D.", t.dim],
        ["Every layer ships the same contract — security, accessibility,", t.dim],
        ["and something you can actually run.", t.accent],
      ]
    : [
        ["From C and operating systems", t.dim],
        ["up to real-time 3D. Every layer ships", t.dim],
        ["the same contract — security,", t.dim],
        ["accessibility, and something", t.dim],
        ["you can actually run.", t.accent],
      ];

  const markY = barH + (wide ? 104 : 96);
  const copy0 = markY + (wide ? 42 : 40);
  const lead = wide ? 28 : 30;
  const chipY = copy0 + copy.length * lead + (wide ? 20 : 26);
  const chipH = wide ? 28 : 34;
  const chipRows = wide ? 1 : Math.ceil(chips.length / 2);
  const footY = chipY + chipRows * chipH + (wide ? 20 : 26) * chipRows - (chipRows - 1) * 4 + (wide ? 22 : 26);
  const H = footY + (wide ? 24 : 50);

  let body = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${t.panel}" stroke="${t.line}"/>`;
  body += `<rect x="1" y="${barH}" width="${W - 2}" height="1" fill="${t.line}"/>`;
  body += `<circle cx="${pad + 6}" cy="${barH / 2}" r="4" fill="${t.pass}" class="pulse"/>`;
  body += `<text x="${pad + 22}" y="${barH / 2 + 4}" class="mono" font-size="${fs.bar}" letter-spacing="1.6" fill="${t.dim}">IKER PEREZ // COMPUTER ENGINEER</text>`;
  body += `<text x="${W - pad}" y="${barH / 2 + 4}" class="mono" font-size="${fs.bar}" letter-spacing="1.6" fill="${t.faint}" text-anchor="end">A CORUÑA [ES] · AUDITED ${data.generated.slice(0, 10)}</text>`;

  // A hairline that sweeps the banner once per cycle, echoing the audit pass.
  body += `<g class="motion-only"><rect x="1" y="${barH + 1}" width="${wide ? 200 : 140}" height="${H - barH - 2}" fill="url(#sw)" class="sweep"/></g>`;

  body += `<text x="${tx}" y="${markY}" font-size="${fs.mark}" font-weight="700" letter-spacing="-1.6" fill="${t.ink}">IKER PEREZ</text>`;
  copy.forEach((c, i) => {
    body += `<text x="${tx}" y="${copy0 + i * lead}" font-size="${fs.copy}" fill="${c[1]}">${esc(c[0])}</text>`;
  });

  let cx = tx;
  let cy = chipY;
  chips.forEach((c, i) => {
    const w = c.length * (wide ? 7.6 : 9.2) + (wide ? 26 : 28);
    if (!wide && i % 2 === 0 && i > 0) {
      cx = tx;
      cy += chipH + 12;
    }
    body += `<rect x="${cx}" y="${cy}" width="${w}" height="${chipH}" rx="4" fill="none" stroke="${t.line}"/>`;
    body += `<text x="${cx + w / 2}" y="${cy + chipH / 2 + 4}" class="mono" font-size="${fs.chip}" letter-spacing="1.2" fill="${t.dim}" text-anchor="middle">${esc(c)}</text>`;
    cx += w + 10;
  });

  // The narrow banner cannot hold this on one line without clipping.
  const footLines = wide
    ? [`${data.github.publicRepos} public repositories · ${verified} engineering controls verified today · ${live} deployments answering`]
    : [
        `${data.github.publicRepos} public repositories · ${live} deployments answering`,
        `${verified} engineering controls verified today`,
      ];
  footLines.forEach((l, i) => {
    body += `<text x="${tx}" y="${footY + i * (wide ? 0 : 22)}" class="mono" font-size="${fs.foot}" fill="${t.faint}">${esc(l)}</text>`;
  });

  const defs = `<defs><linearGradient id="sw" x1="0" x2="1" y1="0" y2="0">
<stop offset="0" stop-color="${t.accent}" stop-opacity="0"/>
<stop offset="0.5" stop-color="${t.accent}" stop-opacity="0.13"/>
<stop offset="1" stop-color="${t.accent}" stop-opacity="0"/>
</linearGradient></defs>`;

  const style =
    baseStyle(t) +
    `
.sweep{animation:sw 11s linear infinite}
@keyframes sw{0%{transform:translateX(-${wide ? 200 : 140}px)}100%{transform:translateX(${W}px)}}
.pulse{animation:pu 2.8s ease-in-out infinite}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.3}}
`;

  const desc = `Iker Perez, computer engineer in A Coruña. Works from C and operating systems up to real-time 3D. Today's audit: ${verified} engineering controls verified across ${data.github.publicRepos} public repositories, ${live} live deployments answering. Confirmed practices: ${chips.join(", ")}.`;

  return svg({ w: W, h: H, title: "Iker Perez — computer engineer", desc, style, body: defs + body });
}
