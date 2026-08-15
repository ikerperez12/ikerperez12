/**
 * Shrinks an ASCII STL so it can live inside the README.
 *
 * The block GitHub renders is text in the Markdown file, so every wasted
 * character is weight on the page. Blender writes full float precision, which
 * is far more than a model 60 units across can show: rounding to two decimals
 * is invisible in the viewer and roughly halves the file.
 *
 *   node scripts/compact-stl.mjs in.stl out.stl [name]
 */

import { readFileSync, writeFileSync } from "node:fs";

const [, , src, dst, name = "keyboard"] = process.argv;
if (!src || !dst) {
  console.error("usage: compact-stl.mjs in.stl out.stl [name]");
  process.exit(1);
}

// One decimal on a model 60 units across is a tenth of a millimetre at display
// size — invisible in the viewer, and it saves roughly a fifth of the file.
const num = (s) => {
  const v = Math.round(parseFloat(s) * 10) / 10;
  return Object.is(v, -0) ? "0" : String(v);
};

const out = [`solid ${name}`];
let facets = 0;

for (const raw of readFileSync(src, "utf8").split("\n")) {
  const line = raw.trim();
  if (line.startsWith("facet normal")) {
    const p = line.split(/\s+/);
    out.push(`facet normal ${num(p[2])} ${num(p[3])} ${num(p[4])}`);
    facets++;
  } else if (line.startsWith("vertex")) {
    const p = line.split(/\s+/);
    out.push(`vertex ${num(p[1])} ${num(p[2])} ${num(p[3])}`);
  } else if (line === "outer loop" || line === "endloop" || line === "endfacet") {
    out.push(line);
  }
}
out.push(`endsolid ${name}`);

const text = out.join("\n");
writeFileSync(dst, text, "utf8");
console.log(`facets=${facets} bytes=${Buffer.byteLength(text)} (${(Buffer.byteLength(text) / 1024).toFixed(0)} KB)`);
