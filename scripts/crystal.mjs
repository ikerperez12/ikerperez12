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

import { esc, n, MONO } from "./design.mjs";

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
 * The whole control as one image: button, cells, count.
 *
 * A README cannot style a link — GitHub strips class and style — so a plain
 * anchor can only ever be default-blue underlined text. Drawing the button
 * inside the SVG is the only way it can carry a lit border and sit level with
 * the cells; the image is then wrapped in the issue link, so pressing anywhere
 * on it opens the form.
 *
 * Transparent background and a palette that reads on either canvas, so one file
 * serves both GitHub themes.
 */
export function renderSupport(state) {
  const cell = 13;
  const btnW = 146;
  const btnH = 34;
  const gap = 18;

  const cluster = renderCells(state, cell);
  const H = Math.max(btnH, cluster.h) + 8;
  const cy = H / 2;
  const countText = String(state.cells.length);
  const countW = 22 + countText.length * 8;
  const W = btnW + gap + cluster.w + gap + countW;

  const [g0, g1, g2] = ["#38bdf8", "#818cf8", "#c084fc"];

  const btnY = cy - btnH / 2;
  let body = `<rect x="1" y="${n(btnY)}" width="${btnW - 2}" height="${btnH}" rx="${btnH / 2}" fill="none" stroke="#8b949e" stroke-opacity="0.35"/>`;
  // Three lights chasing the pill, matching the banner's frame.
  body += [g0, g1, g2]
    .map(
      (c, i) =>
        `<rect x="1" y="${n(btnY)}" width="${btnW - 2}" height="${btnH}" rx="${btnH / 2}" fill="none" stroke="${c}" stroke-width="1.8" pathLength="100" stroke-dasharray="20 80" stroke-linecap="round" class="run r${i}"/>`
    )
    .join("");
  body += `<text x="${btnW / 2}" y="${n(cy + 4)}" font-family="${MONO}" font-size="11.5" letter-spacing="2" fill="${g1}" text-anchor="middle">◆ I WAS HERE</text>`;

  const clusterX = btnW + gap;
  body += `<g transform="translate(${n(clusterX)} ${n(cy - cluster.h / 2)})">${cluster.body}</g>`;

  const cxCount = clusterX + cluster.w + gap;
  body += `<rect x="${n(cxCount)}" y="${n(cy - 11)}" width="${countW}" height="22" rx="11" fill="#8b949e" fill-opacity="0.14"/>`;
  body += `<text x="${n(cxCount + countW / 2)}" y="${n(cy + 4)}" font-family="${MONO}" font-size="12" fill="#8b949e" text-anchor="middle">${countText}</text>`;

  const style = `
.run{animation:chase 7s linear infinite}
.r0{animation-delay:0s}.r1{animation-delay:-2.33s}.r2{animation-delay:-4.66s}
@keyframes chase{to{stroke-dashoffset:-100}}
.new{animation:land 2.6s ease-in-out infinite}
@keyframes land{0%,70%,100%{opacity:1}85%{opacity:.4}}
@media (prefers-reduced-motion:reduce){.run,.new{animation:none}}
`;

  const count = state.cells.length;
  const last = count ? state.cells[count - 1].user : null;
  const desc = `Leave a mark. ${count} ${count === 1 ? "person has" : "people have"} pressed so far${last ? `, most recently ${last}` : ""}.`;

  const defs = `<defs>
<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
  <stop offset="0.55" stop-color="#ffffff" stop-opacity="0.04"/>
  <stop offset="1" stop-color="#000000" stop-opacity="0.20"/>
</linearGradient>
</defs>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(W)} ${n(H)}" width="${n(W)}" height="${n(H)}" role="img" aria-labelledby="d">
<desc id="d">${esc(desc)}</desc>
<style>${style}</style>
${defs}${body}
</svg>`;
}

/** Tooltip text for the img element: the only hover GitHub will actually fire. */
export function supportTooltip(state) {
  if (!state.cells.length) return "Nobody yet — be the first";
  const names = [...state.supporters].reverse().slice(0, 12).map((u) => "@" + u);
  const more = state.supporters.length - names.length;
  return `${state.cells.length} here: ${names.join(", ")}${more > 0 ? ` and ${more} more` : ""}`;
}

/**
 * The cell cluster, cropped tight.
 *
 * Each cell is wrapped in a link to that person's profile and carries their
 * name as a title. Neither fires while the SVG is displayed through an <img>,
 * which is how GitHub renders it — but opening the file makes both live, so the
 * crystal doubles as a clickable index of who is in it.
 */
function renderCells(state, cell) {
  const xs = state.cells.length ? state.cells.map((c) => c.x) : [state.seed[0]];
  const ys = state.cells.length ? state.cells.map((c) => c.y) : [state.seed[1]];
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);

  const w = (x1 - x0 + 1) * cell;
  const h = (y1 - y0 + 1) * cell;

  let body = "";
  state.cells.forEach((c, i) => {
    const newest = i === state.cells.length - 1;
    const inset = 1.2;
    const size = cell - inset * 2;
    const x = n((c.x - x0) * cell + inset);
    const y = n((c.y - y0) * cell + inset);
    const col = colourFor(c.user);
    // A lit top edge and a darker floor give each cell a little relief, so the
    // cluster reads as tiles rather than as flat swatches.
    body +=
      `<a href="https://github.com/${esc(c.user)}" target="_blank">` +
      `<title>@${esc(c.user)}</title>` +
      `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="2.6" fill="${col}"${newest ? ' class="new"' : ""}/>` +
      `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="2.6" fill="url(#sheen)"/>` +
      `<rect x="${n(x + 0.5)}" y="${n(y + 0.5)}" width="${n(size - 1)}" height="${n(size - 1)}" rx="2.2" fill="none" stroke="#ffffff" stroke-opacity="0.28"/>` +
      `</a>`;
  });

  return { w: state.cells.length ? w : 0, h: state.cells.length ? h : cell, body };
}

/** Cells alone, kept for anyone wanting the raw picture. */
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
