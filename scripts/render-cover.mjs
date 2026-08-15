/**
 * Generated cover art for repositories that have no screenshot of their own.
 *
 * The gallery lists every public repository, but only a handful ship product
 * shots. Rather than leaving gaps or inventing mock-ups, each remaining
 * repository gets a card drawn from its own facts: the real language breakdown
 * as a proportional bar in GitHub's own language colours, and a field pattern
 * seeded from the repository name so no two cards look alike.
 *
 * Covers are dark in both themes on purpose — they sit beside real screenshots,
 * which are dark too, and a theme-flipping card in that row would read as a
 * different kind of object.
 */

import { esc, MONO, SANS, n } from "./design.mjs";

const W = 560;
const H = 350;

/** Deterministic hash so a repository always gets the same field. */
function seed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(s) {
  let x = s || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 4294967296;
  };
}

/**
 * Break a name onto at most three lines. Only spaces are break points: names
 * like `1.2-AuditoriaPQC` and `SO-SHELL-p2` carry meaning in their punctuation
 * and reading them back as "1 2 AuditoriaPQC" is worse than a long line.
 */
function wrap(name, perLine) {
  const parts = name.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const p of parts) {
    if (!cur) cur = p;
    else if ((cur + " " + p).length <= perLine) cur += " " + p;
    else {
      lines.push(cur);
      cur = p;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

/** Shrink the title until the longest line fits the card. */
function titleSize(lines) {
  const longest = Math.max(...lines.map((l) => l.length));
  if (longest <= 13) return 34;
  if (longest <= 17) return 28;
  if (longest <= 21) return 23;
  return 19;
}

export function renderCover(repo) {
  const langs = Object.entries(repo.languages || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total = langs.reduce((s, l) => s + l[1], 0) || 1;
  const rnd = rng(seed(repo.repo));

  const accent = (repo.langColors && langs.length && repo.langColors[langs[0][0]]) || "#8b949e";

  // Field: a sparse scatter of hairlines, dense near the top-right so the
  // title side of the card stays quiet.
  let field = "";
  for (let i = 0; i < 34; i++) {
    const x = 120 + rnd() * (W - 120);
    const y = 20 + rnd() * (H - 120);
    const len = 12 + rnd() * 64;
    const op = 0.05 + rnd() * 0.16;
    field += `<rect x="${n(x)}" y="${n(y)}" width="${n(len)}" height="1" fill="${accent}" opacity="${n(op)}"/>`;
  }
  for (let i = 0; i < 12; i++) {
    const x = 140 + rnd() * (W - 160);
    const y = 24 + rnd() * (H - 140);
    field += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(1 + rnd() * 2)}" fill="${accent}" opacity="${n(0.12 + rnd() * 0.2)}"/>`;
  }

  const title = wrap(repo.display || repo.repo, 15);
  const tsize = titleSize(title);
  const lead = Math.round(tsize * 1.24);
  const titleY = 96;

  let bar = "";
  let bx = 40;
  const barW = W - 80;
  langs.forEach(([name, bytes]) => {
    const w = (bytes / total) * barW;
    const c = (repo.langColors && repo.langColors[name]) || "#6e7681";
    bar += `<rect x="${n(bx)}" y="${H - 78}" width="${n(Math.max(2, w - 2))}" height="6" rx="3" fill="${c}"/>`;
    bx += w;
  });

  const meta = [];
  if (repo.stars) meta.push(`${repo.stars}★`);
  if (repo.license) meta.push(repo.license);
  if (repo.release && repo.release.tag) meta.push(repo.release.tag);

  const body = `
<rect width="${W}" height="${H}" fill="#0a0d12"/>
<rect width="${W}" height="${H}" fill="url(#g)"/>
${field}
<rect x="40" y="${titleY - tsize}" width="3" height="${title.length * lead}" fill="${accent}"/>
${title
    .map(
      (l, i) =>
        `<text x="58" y="${titleY + i * lead}" font-family="${SANS}" font-size="${tsize}" font-weight="700" fill="#e6edf3">${esc(l)}</text>`
    )
    .join("")}
<text x="58" y="${titleY + (title.length - 1) * lead + 30}" font-family="${MONO}" font-size="14" letter-spacing="1.4" fill="#7d8590">${esc(
    langs.length ? langs[0][0].toUpperCase() : "REPOSITORY"
  )}</text>
${bar}
<text x="40" y="${H - 44}" font-family="${MONO}" font-size="13" fill="#6e7681">${esc(meta.join("  ·  "))}</text>
<text x="${W - 40}" y="${H - 44}" font-family="${MONO}" font-size="13" fill="#6e7681" text-anchor="end">${esc(repo.repo)}</text>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#1c222b"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(
    repo.display || repo.repo
  )}">
<defs><radialGradient id="g" cx="0.75" cy="0.2" r="0.9">
<stop offset="0" stop-color="${accent}" stop-opacity="0.13"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
</radialGradient></defs>
${body}
</svg>`;
}
