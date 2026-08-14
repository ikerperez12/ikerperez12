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

const CONTROL_LABELS = {
  ci: "CI",
  codeql: "CodeQL",
  security: "SECURITY.md",
  license: "License",
  contributing: "CONTRIBUTING.md",
  architecture: "Architecture doc",
  a11y_ci: "axe-core in CI",
  dep_audit: "Dependency audit",
  signed_release: "SHA-256 sums",
  sbom: "SBOM",
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

export function writeReadme(root, data) {
  const path = join(root, "README.md");
  let text = readFileSync(path, "utf8").replace(/^﻿/, "");
  text = replaceChunk(text, "audit", auditTable(data));
  text = replaceChunk(text, "probes", probeList(data));
  text = replaceChunk(text, "core", coreBlock(data));
  text = replaceChunk(text, "corelegend", coreLegendTable(data));
  text = replaceChunk(
    text,
    "stamp",
    `Last audit: **${data.generated.slice(0, 16).replace("T", " ")} UTC**. ` +
      `Everything above is read from the GitHub API by [\`scripts/collect.mjs\`](scripts/collect.mjs) — nothing is typed in by hand.`
  );
  writeFileSync(path, text, "utf8");
  return path;
}
