/**
 * A crystal that grows by one cell for every person who presses support.
 *
 * The turn-based game this replaces asked visitors to keep coming back, which
 * is the wrong shape for a two-click mechanic. A single permanent mark is the
 * right one: press once, leave a cell, and the picture is different forever.
 *
 * Growth is diffusion-limited aggregation on a square lattice — each new cell
 * attaches somewhere already touching the mass — so the silhouette is organic
 * and depends on the order people arrived in. Nobody can plan it, and no two
 * crystals could ever match.
 *
 * Position and colour both come from a hash of the username, so a given person
 * always lands in the same place: the result is reproducible from the ledger
 * alone, and anyone can find their own cell.
 */

import { esc, n } from "./design.mjs";

export const COLS = 47;
export const ROWS = 23;

/** FNV-1a. Small, dependency-free, and stable across runs. */
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function newCrystal() {
  const cx = Math.floor(COLS / 2);
  const cy = Math.floor(ROWS / 2);
  return { seed: [cx, cy], cells: [], supporters: [] };
}

const key = (x, y) => `${x},${y}`;

/** Every empty cell orthogonally touching the existing mass. */
function sites(state) {
  const taken = new Set([key(...state.seed), ...state.cells.map((c) => key(c.x, c.y))]);
  const out = new Set();
  const consider = (x, y) => {
    if (x < 1 || y < 1 || x >= COLS - 1 || y >= ROWS - 1) return;
    if (!taken.has(key(x, y))) out.add(key(x, y));
  };
  for (const k of taken) {
    const [x, y] = k.split(",").map(Number);
    consider(x + 1, y);
    consider(x - 1, y);
    consider(x, y + 1);
    consider(x, y - 1);
  }
  // Sorted so the choice below is a pure function of the ledger, not of Set
  // iteration order, which would drift between Node versions.
  return [...out].sort();
}

/**
 * Adds one supporter. Returns { state, added } — `added` is false when the
 * person already has a cell, which keeps this a headcount rather than a
 * clickable score.
 */
export function support(state, user) {
  const s = JSON.parse(JSON.stringify(state));
  if (s.supporters.includes(user)) return { state: s, added: false };

  const options = sites(s);
  const h = hash(user + ":" + s.cells.length);
  const pick = options[h % options.length];
  const [x, y] = pick.split(",").map(Number);

  s.cells.push({ x, y, user });
  s.supporters.push(user);
  return { state: s, added: true };
}

/** Hue is constrained to one cool band so the crystal reads as a palette. */
function colourFor(user) {
  const h = hash(user);
  const hue = 188 + (h % 104); // cyan through violet
  const sat = 62 + ((h >> 8) % 22);
  const lig = 56 + ((h >> 16) % 16);
  return `hsl(${hue} ${sat}% ${lig}%)`;
}

/**
 * Cells and nothing else.
 *
 * No frame, no heading, no padding, and no background — which also means one
 * file serves both GitHub themes instead of two. The image is cropped to the
 * cells themselves, so it starts almost invisible and grows only as people
 * arrive; the count and the button live in the README as plain text.
 */
export function renderCrystal(state) {
  const cell = 13;
  const pad = 0;
  const head = 0;
  const margin = 0;

  const xs = [state.seed[0], ...state.cells.map((c) => c.x)];
  const ys = [state.seed[1], ...state.cells.map((c) => c.y)];
  let x0 = Math.min(...xs) - margin;
  let x1 = Math.max(...xs) + margin;
  let y0 = Math.min(...ys) - margin;
  let y1 = Math.max(...ys) + margin;

  // A modest floor so the very first cells still read as a mark rather than a
  // rendering glitch. Everything past that is growth.
  const minW = 6;
  const minH = 3;
  while (x1 - x0 + 1 < minW) {
    x0 -= 1;
    x1 += 1;
  }
  while (y1 - y0 + 1 < minH) {
    y0 -= 1;
    y1 += 1;
  }

  const gw = x1 - x0 + 1;
  const gh = y1 - y0 + 1;
  const W = gw * cell;
  const H = gh * cell;

  const px = (x) => (x - x0) * cell;
  const py = (y) => (y - y0) * cell;

  let body = "";
  state.cells.forEach((c, i) => {
    const newest = i === state.cells.length - 1;
    const inset = 1.5;
    body += `<rect x="${n(px(c.x) + inset)}" y="${n(py(c.y) + inset)}" width="${cell - inset * 2}" height="${cell - inset * 2}" rx="3" fill="${colourFor(c.user)}"${newest ? ' class="new"' : ""}><title>@${esc(c.user)}</title></rect>`;
  });

  const count = state.cells.length;
  const last = count ? state.cells[count - 1].user : null;

  const style = `
.new{animation:land 2.6s ease-in-out infinite}
@keyframes land{0%,70%,100%{opacity:1}85%{opacity:.4}}
@media (prefers-reduced-motion:reduce){.new{animation:none}}
`;

  const desc = `${count} ${count === 1 ? "person has" : "people have"} left a mark${last ? `, most recently ${last}` : ""}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="d">
<desc id="d">${esc(desc)}</desc>
<style>${style}</style>
${body}
</svg>`;
}
