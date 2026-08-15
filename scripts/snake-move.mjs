/**
 * Applies one snake move submitted through an issue, then redraws the board.
 *
 * Run by .github/workflows/snake.yml. Everything reaching this script comes
 * from a stranger, so nothing is trusted: the direction is matched against a
 * fixed list and the player name against GitHub's own username grammar, and
 * neither is ever handed to a shell.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { newGame, step, renderBoard, DIRS } from "./snake.mjs";
import { replaceChunk } from "./render-readme.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const statePath = join(root, ".github", "state", "snake.json");
const assets = join(root, ".github", "assets");

const rawTitle = process.env.ISSUE_TITLE || "";
const rawUser = process.env.ISSUE_USER || "";

// `snake|<direction>` and nothing else. Anything that does not match exactly is
// discarded rather than interpreted.
const m = /^snake\|([a-z]{2,5})$/.exec(rawTitle.trim().toLowerCase());
const dir = m && Object.hasOwn(DIRS, m[1]) ? m[1] : null;
const player = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(rawUser)
  ? rawUser
  : "someone";

let state;
try {
  state = JSON.parse(readFileSync(statePath, "utf8"));
} catch {
  state = newGame();
}

if (dir) {
  state = step(state, dir, player);
} else {
  state.message = "Move not recognised. Use one of the four links.";
}

mkdirSync(dirname(statePath), { recursive: true });
writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
mkdirSync(assets, { recursive: true });
writeFileSync(join(assets, "snake-dark.svg"), renderBoard(state, "dark"), "utf8");
writeFileSync(join(assets, "snake-light.svg"), renderBoard(state, "light"), "utf8");

// Keep the scoreboard in the README in step with the board image.
const readmePath = join(root, "README.md");
let text = readFileSync(readmePath, "utf8").replace(/^﻿/, "");
const players = state.players.length
  ? state.players.map((p) => `[@${p}](https://github.com/${p})`).join(" · ")
  : "nobody yet";
text = replaceChunk(
  text,
  "snake",
  `**Move ${state.moves}** · score **${state.score}** · best **${state.high}**\n\n` +
    `${state.message}\n\n` +
    `<sub>Recent players: ${players}</sub>`
);
writeFileSync(readmePath, text, "utf8");

// Consumed by the workflow to write its reply comment.
console.log(state.message);
