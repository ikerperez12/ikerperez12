/**
 * Hero asset: a section through the machine.
 *
 * Read it top-down. The left column is a drawn core sample; each band is one
 * layer of computing Iker actually works in, and beside it sits one real
 * project plus the single strongest fact the GitHub API can confirm about it.
 * The graphic argues range through evidence instead of through a grid of
 * technology logos.
 *
 * The sweep descending the core is not decoration: it is the same top-to-bottom
 * pass the daily audit workflow makes over these repositories.
 */

import { THEMES, baseStyle, svg, esc, n } from "./design.mjs";

/**
 * Which layer a project belongs to is an editorial judgement, so the mapping is
 * hand-authored. Every fact rendered beside it comes from data.json, so the
 * graphic cannot drift away from what the repositories actually contain.
 */
const STRATA = [
  { domain: "INTERFACE", repo: "UI-IP-Toolkit-v4.0", name: "UI IP Toolkit" },
  { domain: "WEB EXPERIENCE", repo: "e36", name: "E36 Scroll Cine" },
  { domain: "REAL-TIME 3D", repo: "warpod", name: "Warpod Studio" },
  { domain: "WEB PLATFORM", repo: "IP-OS-LINUX", name: "IP Linux" },
  { domain: "DESKTOP 3D", repo: "NexoIP-3D-Viewer", name: "NexoIP 3D Viewer" },
  { domain: "PIPELINE", repo: "BLENDER-TOOL", name: "IP Blender Tool" },
  { domain: "DEV TOOLING", repo: "EASY-LOCALHOST", name: "Easy Localhost" },
  { domain: "SECURITY", repo: "1.2-AuditoriaPQC", name: "QuantumGuard PQC lab" },
  { domain: "SYSTEMS", repo: "SO-2324", name: "Operating systems in C" },
];

/** Evidence for layers whose proof lives outside the audited product set. */
const FALLBACK = { "SO-2324": "FIC · Universidade da Coruña" };

/** The strongest verifiable fact for a project, at most three tokens. */
function factFor(entry, data) {
  const p = data.products.find((x) => x.repo === entry.repo);
  if (!p) return FALLBACK[entry.repo] || "";
  const c = p.controls || {};
  const bits = [];
  if (p.release && p.release.tag) bits.push(p.release.tag);
  if (c.sbom) bits.push("SBOM");
  else if (c.signed_release) bits.push("SHA-256");
  const probe = data.probes.find((q) => q && p.homepage && q.url === p.homepage);
  if (probe && probe.ok) bits.push("live");
  if (c.a11y_ci) bits.push("axe CI");
  else if (c.codeql) bits.push("CodeQL");
  else if (c.ci) bits.push("CI");
  if (p.license) bits.push(p.license);
  return bits.slice(0, 3).join(" · ") || FALLBACK[entry.repo] || "";
}

const COPY = {
  wide: [
    { text: "Computer engineer. From C and operating systems up to real-time 3D.", tone: "ink" },
    { text: "Every layer ships with the same contract — security, accessibility, a real artifact.", tone: "accent" },
  ],
  narrow: [
    { text: "Computer engineer. From C and", tone: "ink" },
    { text: "operating systems up to real-time 3D.", tone: "ink" },
    { text: "Every layer ships with the same contract —", tone: "accent" },
    { text: "security, accessibility, a real artifact.", tone: "accent" },
  ],
};

export function renderSection(data, { theme = "dark", variant = "wide" } = {}) {
  const t = THEMES[theme];
  const wide = variant === "wide";

  const W = wide ? 1200 : 760;
  const padX = wide ? 56 : 40;
  const innerW = W - padX * 2;

  const fs = wide
    ? { eyebrow: 14, mark: 78, copy: 20, cap: 12, domain: 13, name: 17, fact: 13 }
    : { eyebrow: 19, mark: 76, copy: 25, cap: 17, domain: 18, name: 24, fact: 17 };

  // ---- header --------------------------------------------------------------
  const since = new Date(data.github.createdAt).getFullYear();
  const lines = COPY[wide ? "wide" : "narrow"];

  const yEyebrow = wide ? 54 : 62;
  const yMark = wide ? 138 : 158;
  const yCopy0 = wide ? 184 : 214;
  const copyLead = wide ? 30 : 36;
  const yCap = yCopy0 + copyLead * lines.length + (wide ? 30 : 40);
  const yRule = yCap + (wide ? 14 : 18);
  const top = yRule + (wide ? 26 : 32);

  let head = `<text x="${padX}" y="${yEyebrow}" class="mono" font-size="${fs.eyebrow}" letter-spacing="2.6" fill="${t.faint}">A CORUÑA · GALICIA · GITHUB SINCE ${since}</text>`;
  head += `<text x="${padX}" y="${yMark}" font-size="${fs.mark}" font-weight="700" letter-spacing="-1.6" fill="${t.ink}">IKER PEREZ</text>`;
  lines.forEach((l, i) => {
    head += `<text x="${padX}" y="${yCopy0 + i * copyLead}" font-size="${fs.copy}" fill="${
      l.tone === "accent" ? t.accent : t.dim
    }">${esc(l.text)}</text>`;
  });

  head += `<text x="${padX}" y="${yCap}" class="mono" font-size="${fs.cap}" letter-spacing="2.4" fill="${t.faint}">SECTION THROUGH THE MACHINE</text>`;
  head += `<text x="${W - padX}" y="${yCap}" class="mono" font-size="${fs.cap}" letter-spacing="2.4" fill="${t.faint}" text-anchor="end">AUDITED ${data.generated.slice(0, 10)}</text>`;
  head += `<rect x="${padX}" y="${yRule}" width="${innerW}" height="1" fill="${t.line}"/>`;

  // ---- section -------------------------------------------------------------
  const rowH = wide ? 40 : 78;
  const coreX = padX;
  const coreW = wide ? 52 : 40;
  const colDomain = coreX + coreW + (wide ? 30 : 22);
  const colName = wide ? colDomain + 168 : colDomain;
  const colFact = W - padX;

  const depth = rowH * STRATA.length;
  let core = "";
  let rows = "";

  STRATA.forEach((s, i) => {
    const y = top + i * rowH;
    const mid = y + rowH / 2;

    // Core band: a neutral tone ramp so the column reads as depth rather than
    // as a stack of unrelated swatches.
    core += `<rect x="${coreX}" y="${y}" width="${coreW}" height="${rowH}" fill="${t.panelAlt}"/>`;
    core += `<rect x="${coreX}" y="${y}" width="${coreW}" height="${rowH}" fill="${t.ink}" opacity="${n(0.014 * i + 0.01)}"/>`;
    if (i > 0) {
      core += `<rect x="${coreX}" y="${y}" width="${coreW}" height="1" fill="${t.line}"/>`;
      rows += `<rect x="${colDomain}" y="${y}" width="${W - padX - colDomain}" height="1" fill="${t.lineSoft}"/>`;
    }

    // Depth graduation, drawn on the core edge like a rule on a drawing.
    core += `<rect x="${coreX + coreW - (wide ? 9 : 8)}" y="${mid - 0.5}" width="${wide ? 9 : 8}" height="1" fill="${t.faint}" opacity="0.55"/>`;

    // Layer index, doubling as the reading order of the section.
    core += `<text x="${coreX + (wide ? 11 : 9)}" y="${mid + (wide ? 4 : 5)}" class="mono" font-size="${wide ? 12 : 15}" fill="${t.faint}">${String(i + 1).padStart(2, "0")}</text>`;

    const fact = factFor(s, data);
    if (wide) {
      rows += `<text x="${colDomain}" y="${mid + 4}" class="mono" font-size="${fs.domain}" letter-spacing="1.5" fill="${t.faint}">${esc(s.domain)}</text>`;
      rows += `<text x="${colName}" y="${mid + 5}" font-size="${fs.name}" fill="${t.ink}">${esc(s.name)}</text>`;
      rows += `<text x="${colFact}" y="${mid + 4}" class="mono" font-size="${fs.fact}" fill="${t.dim}" text-anchor="end">${esc(fact)}</text>`;
    } else {
      rows += `<text x="${colDomain}" y="${mid - 16}" class="mono" font-size="${fs.domain}" letter-spacing="1.5" fill="${t.faint}">${esc(s.domain)}</text>`;
      rows += `<text x="${colDomain}" y="${mid + 12}" font-size="${fs.name}" fill="${t.ink}">${esc(s.name)}</text>`;
      rows += `<text x="${colDomain}" y="${mid + 34}" class="mono" font-size="${fs.fact}" fill="${t.dim}">${esc(fact)}</text>`;
    }
  });

  // Core outline last so it sits above the band fills.
  core += `<rect x="${coreX}" y="${top}" width="${coreW}" height="${depth}" fill="none" stroke="${t.line}" stroke-width="1"/>`;

  const bottom = top + depth;
  rows += `<rect x="${colDomain}" y="${bottom}" width="${W - padX - colDomain}" height="1" fill="${t.line}"/>`;

  // ---- sweep ---------------------------------------------------------------
  // One hairline descending the core. A single transform keeps it cheap enough
  // to run alongside the other animated assets on the page.
  const dur = 8;
  const sweep = `<g class="motion-only"><rect x="${coreX}" y="${top}" width="${coreW}" height="2" fill="${t.accent}" class="sweep"/></g>`;

  let ticks = "";
  STRATA.forEach((_, i) => {
    const at = (i / STRATA.length) * dur;
    ticks += `.k${i}{animation:lit ${dur}s linear infinite;animation-delay:-${n(dur - at)}s}`;
    rows += `<rect x="${colDomain - (wide ? 16 : 12)}" y="${top + i * rowH + rowH / 2 - 4}" width="2" height="8" fill="${t.idle}" class="k${i}"/>`;
  });

  const style =
    baseStyle(t) +
    `
.sweep{animation:drop ${dur}s linear infinite}
@keyframes drop{0%{transform:translateY(0);opacity:0}5%{opacity:.95}95%{opacity:.95}100%{transform:translateY(${depth}px);opacity:0}}
@keyframes lit{0%,3%{fill:${t.accent}}16%,100%{fill:${t.idle}}}
${ticks}
`;

  const H = bottom + (wide ? 30 : 38);
  const desc =
    "Section through the machine. Nine layers of Iker Perez's work, read top to bottom: " +
    STRATA.map((s, i) => `${i + 1} ${s.domain}, ${s.name}`).join("; ") +
    ".";

  return svg({
    w: W,
    h: H,
    title: "Iker Perez — section through the machine",
    desc,
    style,
    body: head + core + rows + sweep,
  });
}
