/**
 * Writes the generated regions of README.md.
 *
 * Only the interiors of the marker comments are owned by this script. Prose,
 * headings and layout are hand-written and never touched, so the page keeps
 * reading like something a person wrote even though its facts refresh daily.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderCoreSTL, coreLegend } from "./render-core.mjs";

/** Replace the interior of a marker pair, leaving the markers in place. */
export function replaceChunk(text, marker, content) {
  const start = `<!-- ${marker}:start -->`;
  const end = `<!-- ${marker}:end -->`;
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!re.test(text)) {
    throw new Error(`marker ${marker} not found in README`);
  }
  return text.replace(re, `${start}\n${content}\n${end}`);
}

// Headers stay short because the matrix is eleven columns wide; the full names
// live in the legend below it, where they have room to be read.
const CONTROL_LABELS = {
  ci: "CI",
  codeql: "CQL",
  security: "SEC",
  license: "LIC",
  contributing: "CTB",
  architecture: "ARC",
  a11y_ci: "A11Y",
  dep_audit: "DEP",
  signed_release: "SHA",
  sbom: "SBOM",
};

const CONTROL_MEANING = {
  ci: "a CI workflow exists",
  codeql: "CodeQL analysis runs",
  security: "SECURITY.md is published",
  license: "the repository is licensed",
  contributing: "CONTRIBUTING.md is published",
  architecture: "an architecture document exists",
  a11y_ci: "accessibility tests run in CI",
  dep_audit: "dependencies are audited in CI",
  signed_release: "releases publish SHA-256 sums",
  sbom: "releases publish a software bill of materials",
};

const DISPLAY = {
  "NexoIP-3D-Viewer": "NexoIP 3D Viewer",
  "IP-OS-LINUX": "IP Linux",
  "UI-IP-Toolkit-v4.0": "UI IP Toolkit",
  e36: "E36 Scroll Cine",
  warpod: "Warpod Studio",
  "BLENDER-TOOL": "IP Blender Tool",
  "EASY-LOCALHOST": "Easy Localhost",
  "1.2-AuditoriaPQC": "QuantumGuard PQC lab",
};

/** The audit table: one row per project, one column per control. */
function auditTable(data) {
  const keys = Object.keys(CONTROL_LABELS);
  const head = `| Project | ${keys.map((k) => CONTROL_LABELS[k]).join(" | ")} | Verified |`;
  const sep = `| --- | ${keys.map(() => ":-:").join(" | ")} | :-: |`;
  const rows = data.products.map((p) => {
    const cells = keys.map((k) => (p.controls[k] ? "●" : "·"));
    const n = keys.filter((k) => p.controls[k]).length;
    return `| [${DISPLAY[p.repo] || p.repo}](https://github.com/${data.user}/${p.repo}) | ${cells.join(" | ")} | ${n}/${keys.length} |`;
  });
  return [head, sep, ...rows].join("\n");
}

/** Live deployment probe results, reported without embellishment. */
function probeList(data) {
  if (!data.probes.length) return "_No deployments probed._";
  return data.probes
    .map((p) => {
      const state = p.ok ? `answered ${p.status}` : "did not answer";
      return `- \`${state}\` — [${p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}](${p.url})`;
    })
    .join("\n");
}

function coreBlock(data) {
  return "```stl\n" + renderCoreSTL(data) + "\n```";
}

function coreLegendTable(data) {
  const rows = coreLegend(data).map(
    (l) =>
      `| ${l.tier} | ${l.layer} | [${DISPLAY[l.repo] || l.repo}](https://github.com/${data.user}/${l.repo}) | ${l.verified} |`
  );
  return ["| Tier | Layer | Repository | Controls verified |", "| :-: | --- | --- | :-: |", ...rows].join("\n");
}

/** Projects that have a real screenshot; everything else gets generated cover art. */
const SHOTS = {
  "NexoIP-3D-Viewer": "p-nexoip.webp",
  "IP-OS-LINUX": "p-iplinux.webp",
  "UI-IP-Toolkit-v4.0": "p-toolkit.webp",
  e36: "p-e36.webp",
  warpod: "p-warpod.webp",
  "EASY-LOCALHOST": "p-easylocalhost.webp",
};

/** One short, checkable line per project. Anything not listed falls back to the
 *  repository's own description, so a new repository still lands in the gallery. */
const BLURB = {
  "NexoIP-3D-Viewer": "Offline-first desktop 3D viewer. Sandboxed renderer, private protocol, SBOM and checksums.",
  "IP-OS-LINUX": "A desktop that runs in a tab: window manager, workspaces, IndexedDB filesystem.",
  "UI-IP-Toolkit-v4.0": "Copy-ready interface parts. axe-core gates serious regressions in CI.",
  e36: "Seven locked-scroll scenes, no framework. PWA with rendered accessibility tests.",
  warpod: "Cinematic WebGL: React Three Fiber scene, GSAP choreography, smooth scroll.",
  "EASY-LOCALHOST": "Always-on-top panel for local dev servers. Ten releases, each with a SHA-256.",
  "BLENDER-TOOL": "Render queue for Blender. Scans .blend files for missing textures before queueing.",
  "1.2-AuditoriaPQC": "Post-quantum crypto lab driving real Open Quantum Safe containers.",
  GPT_CMD: "Command-line ChatGPT automation with history, export and clipboard image send.",
  "SIGNAL-NEURALNETWORK": "Signal-processing neural network experiment.",
  WARP: "Personal web portfolio.",
  "Software-Design": "Software design coursework: patterns and modular object-oriented design.",
  "Basketball-API": "Django REST API with a frontend, containerised.",
  "SO-SHELL-p2": "UNIX shell in C: process lifecycle, file descriptors, redirection.",
  "SO-2324": "Operating systems coursework in C at the Universidade da Coruña.",
};

/**
 * The gallery as a Markdown table.
 *
 * GitHub wraps Markdown tables — and only Markdown tables — in a horizontally
 * scrollable container. A single wide row is therefore a native scrolling
 * gallery, with no CSS, which is otherwise impossible here because class and
 * style attributes are stripped.
 */
/** Curated lead order; everything after it falls back to stars, then recency. */
const LEAD = [
  "NexoIP-3D-Viewer",
  "IP-OS-LINUX",
  "UI-IP-Toolkit-v4.0",
  "e36",
  "warpod",
  "EASY-LOCALHOST",
  "BLENDER-TOOL",
  "1.2-AuditoriaPQC",
];

function gallery(data) {
  // Only advertise a deployment the probe actually reached this morning, so a
  // dead homepage in repository metadata never becomes a broken link here.
  const liveUrls = new Set(
    (data.probes || []).filter((p) => p && p.ok).map((p) => p.url.replace(/\/$/, ""))
  );

  const repos = (data.repos || [])
    .filter((r) => r.repo !== data.user)
    .filter((r) => Object.keys(r.languages || {}).length > 0)
    .sort((a, b) => {
      const ia = LEAD.indexOf(a.repo);
      const ib = LEAD.indexOf(b.repo);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      if (b.stars !== a.stars) return b.stars - a.stars;
      return String(b.pushed).localeCompare(String(a.pushed));
    });

  const COLS = 4;
  const cells = repos.map((r) => {
    const url = `https://github.com/${data.user}/${r.repo}`;
    const img = SHOTS[r.repo]
      ? `.github/assets/${SHOTS[r.repo]}`
      : `.github/assets/cover-${r.repo}.svg`;
    const title = DISPLAY[r.repo] || r.repo;

    const tags = [];
    if (r.stars) tags.push(`${r.stars}★`);
    const lang = Object.keys(r.languages || {})[0];
    if (lang) tags.push(lang);
    if (r.release && r.release.tag) tags.push(r.release.tag);
    if (r.license) tags.push(r.license);

    const blurb = BLURB[r.repo] || r.description || "";
    const reachable = r.homepage && liveUrls.has(r.homepage.replace(/\/$/, ""));
    const live = reachable ? ` · <a href="${r.homepage}">live</a>` : "";

    return (
      `<td width="25%" valign="top">` +
      `<a href="${url}"><img src="${img}" width="100%" alt="${title}"></a><br>` +
      `<b><a href="${url}">${title}</a></b><br>` +
      `<sub>${blurb}</sub><br>` +
      `<sub><code>${tags.join("</code> <code>")}</code>${live}</sub>` +
      `</td>`
    );
  });

  // A four-column grid rather than one wide scrolling row. GitHub's table
  // layout compresses a fifteen-column row until the thumbnails collapse to
  // thumbnail-of-a-thumbnail size, and images cannot resist it because the
  // stylesheet gives every image max-width:100%. A fixed percentage grid is the
  // only layout here that renders at a predictable size.
  const rows = [];
  for (let i = 0; i < cells.length; i += COLS) {
    rows.push(`<tr>\n${cells.slice(i, i + COLS).join("\n")}\n</tr>`);
  }
  return `<table width="100%">\n${rows.join("\n")}\n</table>`;
}

export function writeReadme(root, data) {
  const path = join(root, "README.md");
  let text = readFileSync(path, "utf8").replace(/^﻿/, "");
  text = replaceChunk(text, "gallery", gallery(data));
  text = replaceChunk(text, "probes", probeList(data));
  // The snake scoreboard is owned by snake-move.mjs; leave whatever is there.
  text = replaceChunk(
    text,
    "stamp",
    `Last audit: **${data.generated.slice(0, 16).replace("T", " ")} UTC**. ` +
      `Everything above is read from the GitHub API by [\`scripts/collect.mjs\`](scripts/collect.mjs) — nothing is typed in by hand.`
  );
  writeFileSync(path, text, "utf8");
  return path;
}
