/**
 * A snake anyone can play from the profile page.
 *
 * A README cannot run scripts, so the game loop lives in GitHub itself: each
 * direction is a link that opens a prefilled issue, a workflow reads the title,
 * advances the board by one cell, redraws it, and closes the issue. The
 * repository is the database and the commit history is the replay.
 *
 * The board wraps at the edges. With strangers taking turns, walls would end
 * most games within a few moves, and only self-collision is a decision someone
 * actually made.
 */

import { THEMES, esc, MONO, SANS, n } from "./design.mjs";

export const COLS = 21;
export const ROWS = 13;

export const DIRS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export function newGame(previousHigh = 0) {
  const cx = Math.floor(COLS / 2);
  const cy = Math.floor(ROWS / 2);
  return {
    snake: [
      [cx, cy],
      [cx - 1, cy],
      [cx - 2, cy],
    ],
    dir: "right",
    food: [cx + 5, cy],
    score: 0,
    high: previousHigh,
    moves: 0,
    players: [],
    last: null,
    over: false,
    message: "New game.",
  };
}

function freeCell(state, rand) {
  const taken = new Set(state.snake.map(([x, y]) => `${x},${y}`));
  const open = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!taken.has(`${x},${y}`)) open.push([x, y]);
    }
  }
  return open[Math.floor(rand() * open.length)] || [0, 0];
}

/**
 * Advance one cell. Returns the next state; the caller decides what to say
 * about it. Reversing straight back into the neck is ignored rather than
 * treated as a loss, because it is almost always a misclick.
 */
export function step(state, dir, player, rand = Math.random) {
  const s = JSON.parse(JSON.stringify(state));

  // `start` is its own command so a stalled or finished board can be cleared
  // without waiting for someone to crash it deliberately.
  if (dir === "start") {
    const fresh = newGame(Math.max(state.high || 0, state.score || 0));
    fresh.players = s.players;
    fresh.last = player;
    fresh.message = `@${player} started a new game. Press a direction to move.`;
    return fresh;
  }

  if (!DIRS[dir]) return { ...s, message: "Unknown move, ignored." };

  const opposite = { up: "down", down: "up", left: "right", right: "left" };
  if (s.snake.length > 1 && opposite[dir] === s.dir) {
    s.message = `@${player} tried to reverse into the neck. Ignored.`;
    return s;
  }

  const [dx, dy] = DIRS[dir];
  const [hx, hy] = s.snake[0];
  const head = [(hx + dx + COLS) % COLS, (hy + dy + ROWS) % ROWS];

  s.dir = dir;
  s.moves += 1;
  s.last = player;
  if (player && !s.players.includes(player)) s.players.unshift(player);
  s.players = s.players.slice(0, 12);

  const hitsSelf = s.snake.some(([x, y], i) => i < s.snake.length - 1 && x === head[0] && y === head[1]);
  if (hitsSelf) {
    const high = Math.max(s.high, s.score);
    const fresh = newGame(high);
    fresh.players = s.players;
    fresh.last = player;
    fresh.message = `@${player} ran into the tail at ${s.score} points. Board reset.`;
    return fresh;
  }

  s.snake.unshift(head);
  if (head[0] === s.food[0] && head[1] === s.food[1]) {
    s.score += 1;
    s.high = Math.max(s.high, s.score);
    s.food = freeCell(s, rand);
    s.message = `@${player} ate. Score ${s.score}.`;
  } else {
    s.snake.pop();
    s.message = `@${player} moved ${dir}.`;
  }
  return s;
}

/** The board, drawn for one GitHub theme. */
export function renderBoard(state, theme) {
  const t = THEMES[theme];
  const cell = 38;
  const pad = 22;
  const headH = 54;
  const W = COLS * cell + pad * 2;
  const H = ROWS * cell + pad * 2 + headH + 34;
  const top = headH + pad;

  let g = "";
  for (let x = 0; x <= COLS; x++) {
    g += `<rect x="${pad + x * cell}" y="${top}" width="1" height="${ROWS * cell}" fill="${t.lineSoft}"/>`;
  }
  for (let y = 0; y <= ROWS; y++) {
    g += `<rect x="${pad}" y="${top + y * cell}" width="${COLS * cell}" height="1" fill="${t.lineSoft}"/>`;
  }

  const cellAt = (x, y) => [pad + x * cell, top + y * cell];

  // Food pulses so it is findable at a glance on a busy grid.
  const [fx, fy] = cellAt(state.food[0], state.food[1]);
  let food = `<circle cx="${fx + cell / 2}" cy="${fy + cell / 2}" r="${cell * 0.26}" fill="${t.accent}" class="food"/>`;

  let body = "";
  state.snake.forEach(([x, y], i) => {
    const [px, py] = cellAt(x, y);
    const head = i === 0;
    const shade = t.glow[i % 3];
    const inset = head ? 3 : 5;
    body += `<rect x="${px + inset}" y="${py + inset}" width="${cell - inset * 2}" height="${cell - inset * 2}" rx="${head ? 7 : 5}" fill="${head ? t.ink : shade}" opacity="${head ? 1 : 0.85}"/>`;
    if (head) {
      body += `<rect x="${px + inset}" y="${py + inset}" width="${cell - inset * 2}" height="${cell - inset * 2}" rx="7" fill="none" stroke="${t.glow[0]}" stroke-width="2"/>`;
    }
  });

  const title = `SNAKE · MOVE ${state.moves}`;
  const right = `SCORE ${state.score}   BEST ${state.high}`;

  const style = `
text{text-rendering:geometricPrecision}
.food{animation:fp 1.9s ease-in-out infinite}
@keyframes fp{0%,100%{opacity:1}50%{opacity:.42}}
@media (prefers-reduced-motion:reduce){.food{animation:none}}
`;

  const desc = `Snake board, ${COLS} by ${ROWS}. Move ${state.moves}, score ${state.score}, best ${state.high}. ${state.message}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d" font-family="${SANS}">
<title id="t">Community snake</title><desc id="d">${esc(desc)}</desc>
<style>${style}</style>
<rect width="${W}" height="${H}" rx="10" fill="${t.panel}"/>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${t.line}"/>
<text x="${pad}" y="34" font-family="${MONO}" font-size="13" letter-spacing="2.2" fill="${t.faint}">${esc(title)}</text>
<text x="${W - pad}" y="34" font-family="${MONO}" font-size="13" letter-spacing="2.2" fill="${t.dim}" text-anchor="end">${esc(right)}</text>
${g}${body}${food}
<text x="${pad}" y="${H - 16}" font-family="${MONO}" font-size="12" fill="${t.faint}">${esc(state.message.slice(0, 90))}</text>
</svg>`;
}
