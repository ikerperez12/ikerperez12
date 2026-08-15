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
import { newCrystal, support, renderCrystal } from "./crystal.mjs";
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
writeFileSync(join(assets, "crystal-dark.svg"), renderCrystal(state, "dark"), "utf8");
writeFileSync(join(assets, "crystal-light.svg"), renderCrystal(state, "light"), "utf8");

// Credit everyone, newest first, in the README itself.
const readmePath = join(root, "README.md");
const text = readFileSync(readmePath, "utf8").replace(/^﻿/, "");
const names = [...state.supporters]
  .reverse()
  .map((u) => `[@${u}](https://github.com/${u})`)
  .join(" · ");
writeFileSync(
  readmePath,
  replaceChunk(
    text,
    "crystal",
    `<sub>**${state.cells.length}** ${state.cells.length === 1 ? "person has" : "people have"} left a cell.` +
      (names ? ` ${names}` : "") +
      `</sub>`
  ),
  "utf8"
);

console.log(message);
