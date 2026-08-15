/**
 * Renders every generated asset from data.json into .github/assets/.
 *
 * Kept deliberately dumb: collect.mjs owns all network access and writes
 * data.json, this file owns rendering only. That split means the whole page can
 * be re-rendered offline while iterating on the design.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { newCrystal, renderCrystal } from "./crystal.mjs";
import { renderHero } from "./render-hero.mjs";
import { renderCover } from "./render-cover.mjs";
import { CLOSERS } from "./render-closers.mjs";
import { writeReadme } from "./render-readme.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".github", "assets");
mkdirSync(out, { recursive: true });

// Strip a UTF-8 BOM: shell redirection on Windows adds one and JSON.parse
// rejects it, which makes local iteration fail for a non-obvious reason.
const data = JSON.parse(readFileSync(join(root, "data.json"), "utf8").replace(/^﻿/, ""));

let total = 0;
function emit(name, content) {
  writeFileSync(join(out, name), content, "utf8");
  total += Buffer.byteLength(content, "utf8");
}

// ---- hero -------------------------------------------------------------------
emit("hero-dark.svg", renderHero(data, { theme: "dark", variant: "wide" }));
emit("hero-light.svg", renderHero(data, { theme: "light", variant: "wide" }));
emit("hero-dark-sm.svg", renderHero(data, { theme: "dark", variant: "narrow" }));
emit("hero-light-sm.svg", renderHero(data, { theme: "light", variant: "narrow" }));

// ---- gallery cover art ------------------------------------------------------
// Covers are regenerated from scratch each run, so a renamed or removed
// repository cannot leave a stale card behind in the assets directory.
for (const f of readdirSync(out)) {
  if (f.startsWith("cover-") && f.endsWith(".svg")) unlinkSync(join(out, f));
}
const SHOTS = new Set([
  "NexoIP-3D-Viewer",
  "IP-OS-LINUX",
  "UI-IP-Toolkit-v4.0",
  "e36",
  "warpod",
  "EASY-LOCALHOST",
]);
let covers = 0;
for (const r of data.repos || []) {
  if (SHOTS.has(r.repo) || r.repo === data.user) continue;
  emit(`cover-${r.repo}.svg`, renderCover(r));
  covers++;
}

// ---- closing piece ----------------------------------------------------------
// Dark only: it is a light drawing on black in both themes.
for (const f of readdirSync(out)) {
  if (f.startsWith("closer-") && f !== "closer-scope.svg") unlinkSync(join(out, f));
}
emit("closer-scope.svg", CLOSERS.scope());

// ---- supporter crystal ------------------------------------------------------
// Rendered from the committed ledger, so a fresh clone reproduces exactly the
// crystal the supporters actually grew.
const statePath = join(root, ".github", "state", "crystal.json");
let crystal;
try {
  crystal = JSON.parse(readFileSync(statePath, "utf8"));
} catch {
  crystal = newCrystal();
  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(crystal, null, 2), "utf8");
}
emit("crystal.svg", renderCrystal(crystal));

console.log(`assets: hero x4, covers x${covers}, closer x1, crystal x1`);
console.log(`generated total ${(total / 1024).toFixed(1)} KB`);

writeReadme(root, data);
console.log("README.md generated regions updated");

