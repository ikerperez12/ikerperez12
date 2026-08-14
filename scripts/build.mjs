/**
 * Renders every generated asset from data.json into .github/assets/.
 *
 * Kept deliberately dumb: collect.mjs owns all network access and writes
 * data.json, this file owns rendering only. That split means the whole page can
 * be re-rendered offline while iterating on the design.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderHero } from "./render-hero.mjs";
import { renderSection } from "./render-section.mjs";
import { renderCoreSTL } from "./render-core.mjs";
import { writeReadme } from "./render-readme.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".github", "assets");
mkdirSync(out, { recursive: true });

// Strip a UTF-8 BOM: shell redirection on Windows adds one and JSON.parse
// rejects it, which makes local iteration fail for a non-obvious reason.
const data = JSON.parse(readFileSync(join(root, "data.json"), "utf8").replace(/^﻿/, ""));

const targets = [
  ["hero-dark.svg", renderHero(data, { theme: "dark", variant: "wide" })],
  ["hero-light.svg", renderHero(data, { theme: "light", variant: "wide" })],
  ["hero-dark-sm.svg", renderHero(data, { theme: "dark", variant: "narrow" })],
  ["hero-light-sm.svg", renderHero(data, { theme: "light", variant: "narrow" })],
  ["section-dark.svg", renderSection(data, { theme: "dark", variant: "wide" })],
  ["section-light.svg", renderSection(data, { theme: "light", variant: "wide" })],
  ["section-dark-sm.svg", renderSection(data, { theme: "dark", variant: "narrow" })],
  ["section-light-sm.svg", renderSection(data, { theme: "light", variant: "narrow" })],
];

let total = 0;
for (const [name, svg] of targets) {
  writeFileSync(join(out, name), svg, "utf8");
  const bytes = Buffer.byteLength(svg, "utf8");
  total += bytes;
  console.log(`${name.padEnd(24)} ${(bytes / 1024).toFixed(1)} KB`);
}

// The same geometry the hero renders, as a file NexoIP 3D Viewer can open.
const stl = renderCoreSTL(data);
writeFileSync(join(out, "core.stl"), stl, "utf8");
console.log(`${"core.stl".padEnd(24)} ${(Buffer.byteLength(stl) / 1024).toFixed(1)} KB`);

console.log(`generated total ${((total + Buffer.byteLength(stl)) / 1024).toFixed(1)} KB`);

writeReadme(root, data);
console.log("README.md generated regions updated");
