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

import { esc, MONO, SANS, n } from "./design.mjs";

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

export function renderCrystal(state, theme) {
  const dark = theme === "dark";
  const bg = dark ? "#0d1117" : "#ffffff";
  const line = dark ? "#1c222b" : "#e4e8ed";
  const ink = dark ? "#e6edf3" : "#1f2328";
  const faint = dark ? "#6e7681" : "#818b98";

  // The frame follows the crystal rather than the lattice. A fixed canvas sized
  // for a full board leaves a tiny cluster marooned in empty space for the first
  // few hundred supporters, which is exactly when it needs to look deliberate.
  const cell = 22;
  const pad = 26;
  const head = 42;
  const margin = 2;

  const xs = [state.seed[0], ...state.cells.map((c) => c.x)];
  const ys = [state.seed[1], ...state.cells.map((c) => c.y)];
  let x0 = Math.min(...xs) - margin;
  let x1 = Math.max(...xs) + margin;
  let y0 = Math.min(...ys) - margin;
  let y1 = Math.max(...ys) + margin;

  // Keep a minimum footprint so a nearly empty crystal is not a postage stamp.
  const minW = 22;
  const minH = 9;
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
  const W = gw * cell + pad * 2;
  const H = gh * cell + pad * 2 + head + 26;
  const top = head + pad;

  const px = (x) => pad + (x - x0) * cell;
  const py = (y) => top + (y - y0) * cell;

  let body = `<rect width="${W}" height="${H}" rx="10" fill="${bg}"/>`;
  body += `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${line}"/>`;

  // The seed, drawn plainly so the origin of the shape is visible.
  body += `<rect x="${px(state.seed[0]) + 5}" y="${py(state.seed[1]) + 5}" width="${cell - 10}" height="${cell - 10}" rx="3" fill="${faint}"/>`;

  state.cells.forEach((c, i) => {
    const newest = i === state.cells.length - 1;
    const inset = newest ? 2 : 3;
    body += `<rect x="${px(c.x) + inset}" y="${py(c.y) + inset}" width="${cell - inset * 2}" height="${cell - inset * 2}" rx="4" fill="${colourFor(c.user)}"${newest ? ' class="new"' : ""}/>`;
  });

  const count = state.cells.length;
  body += `<text x="${pad}" y="30" font-family="${MONO}" font-size="12" letter-spacing="2.2" fill="${faint}">CRYSTAL · ONE CELL PER PERSON</text>`;
  body += `<text x="${W - pad}" y="30" font-family="${MONO}" font-size="12" letter-spacing="2.2" fill="${ink}" text-anchor="end">${count} ${count === 1 ? "SUPPORTER" : "SUPPORTERS"}</text>`;

  const last = state.cells.length ? state.cells[state.cells.length - 1].user : null;
  body += `<text x="${pad}" y="${H - 12}" font-family="${MONO}" font-size="11" fill="${faint}">${esc(
    last ? `newest: @${last}` : "nobody yet — the first cell is still free"
  )}</text>`;

  const style = `
text{text-rendering:geometricPrecision}
.new{animation:land 2.4s ease-out infinite}
@keyframes land{0%,70%{opacity:1}85%{opacity:.45}100%{opacity:1}}
@media (prefers-reduced-motion:reduce){.new{animation:none}}
`;

  const desc = `A crystal grown one cell per supporter, currently ${count} cell${count === 1 ? "" : "s"}${last ? `, most recently from ${last}` : ""}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d" font-family="${SANS}">
<title id="t">Supporter crystal</title><desc id="d">${esc(desc)}</desc>
<style>${style}</style>
${body}
</svg>`;
}
