/**
 * Adds one supporter to the crystal and redraws it.
 *
 * Run by .github/workflows/support.yml. The username arrives from a stranger,
 * so it is matched against GitHub's own account grammar before it is used, and
 * it never reaches a shell.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { newCrystal, support, renderSupport, supportTooltip, hash } from "./crystal.mjs";
import { replaceChunk } from "./render-readme.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const statePath = join(root, ".github", "state", "crystal.json");
const assets = join(root, ".github", "assets");

const rawTitle = (process.env.ISSUE_TITLE || "").trim().toLowerCase();
const rawUser = process.env.ISSUE_USER || "";

const valid = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(rawUser);
const user = valid ? rawUser : null;

let state;
try {
  state = JSON.parse(readFileSync(statePath, "utf8"));
} catch {
  state = newCrystal();
}

let message;
if (rawTitle !== "support") {
  message = "Not a support request; nothing changed.";
} else if (!user) {
  message = "Could not read that account name, so no cell was added.";
} else {
  const res = support(state, user);
  state = res.state;
  message = res.added
    ? `Added a cell for @${user}. The crystal is now ${state.cells.length} cell${state.cells.length === 1 ? "" : "s"}.`
    : `@${user} already has a cell — one per person, so the crystal stays honest.`;
}

mkdirSync(dirname(statePath), { recursive: true });
writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
mkdirSync(assets, { recursive: true });
const svg = renderSupport(state);
writeFileSync(join(assets, "support.svg"), svg, "utf8");
// Key the cache-buster to the image itself, not to the count: a redesign that
// leaves the count unchanged must still defeat GitHub's asset cache.
const version = hash(svg).toString(36);


// The img title is the only hover GitHub will fire, so it carries the names.
const readmePath = join(root, "README.md");
const readme = readFileSync(readmePath, "utf8").replace(/^﻿/, "");
const link =
  "https://github.com/ikerperez12/ikerperez12/issues/new?title=support&body=" +
  "Just+press+Create.+Nothing+here+needs+changing.";
writeFileSync(
  readmePath,
  replaceChunk(
    readme,
    "crystal",
    `<p align="center">
  <a href="${link}"><img src=".github/assets/support.svg?v=${version}" title="${supportTooltip(state).replace(/"/g, "&quot;")}" alt="I was here. ${state.cells.length} ${state.cells.length === 1 ? "person has" : "people have"} left a cell."></a>
</p>`
  ),
  "utf8"
);

console.log(message);
