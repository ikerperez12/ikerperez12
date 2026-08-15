/**
 * Design tokens and SVG primitives for the generated profile assets.
 *
 * Every asset is emitted twice, once per GitHub theme, and paired in the
 * README with <picture>. That keeps each file free of prefers-color-scheme
 * rules and lets the two themes use genuinely different ink, not inverted
 * colours.
 *
 * Type is set in system stacks on purpose: an SVG loaded through <img> is an
 * isolated document that cannot fetch a webfont, so anything else would fall
 * back unpredictably on the reader's machine.
 */

export const MONO =
  "ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
export const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif";

/**
 * Palettes sit close to GitHub Primer so the assets read as part of the page
 * rather than pasted onto it. The gold accent is carried over from NexoIP 3D
 * Viewer, which is where it already appears in Iker's own release badges.
 */
export const THEMES = {
  dark: {
    name: "dark",
    panel: "#0d1117",
    panelAlt: "#11161d",
    ink: "#e6edf3",
    dim: "#8b949e",
    faint: "#6e7681",
    line: "#272e38",
    lineSoft: "#1c222b",
    accent: "#d9a441",
    data: "#58a6ff",
    pass: "#3fb950",
    warn: "#d29922",
    idle: "#39414d",
    // A deliberately narrow cool ramp for the animated frame. Three neighbouring
    // hues read as one palette; spreading them across the wheel would read as a
    // rainbow, which is the look this is trying to avoid.
    glow: ["#38bdf8", "#818cf8", "#c084fc"],
    deep: "#080b11",
  },
  light: {
    name: "light",
    panel: "#ffffff",
    panelAlt: "#f6f8fa",
    ink: "#1f2328",
    dim: "#59636e",
    faint: "#818b98",
    line: "#d1d9e0",
    lineSoft: "#e4e8ed",
    accent: "#8a5d0f",
    data: "#0969da",
    pass: "#1a7f37",
    warn: "#9a6700",
    idle: "#c4ccd4",
    glow: ["#0284c7", "#4f46e5", "#9333ea"],
    deep: "#f2f5f9",
  },
};

/** Escape text for safe inclusion in SVG markup. */
export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Wrap a document. `title`/`desc` give assistive technology a real description
 * of the asset, which matters because these images carry information.
 */
export function svg({ w, h, title, desc, style, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d" font-family="${SANS}">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<style>${style}</style>
${body}
</svg>`;
}

/**
 * Base stylesheet. Animation is CSS keyframes rather than SMIL because that is
 * what survives inside an <img>-loaded SVG on GitHub today, and it is the one
 * technique that can be disabled wholesale for reduced-motion readers.
 */
export function baseStyle(t) {
  return `
.p{fill:${t.panel}}
.ink{fill:${t.ink}}
.dim{fill:${t.dim}}
.faint{fill:${t.faint}}
.acc{fill:${t.accent}}
.dat{fill:${t.data}}
.ok{fill:${t.pass}}
.mono{font-family:${MONO}}
text{text-rendering:geometricPrecision}
.ln{stroke:${t.line};fill:none}
.lns{stroke:${t.lineSoft};fill:none}
@media (prefers-reduced-motion:reduce){
  *{animation:none!important}
  .motion-only{opacity:0}
  .static-only{opacity:1!important}
}
.static-only{opacity:0}
`;
}

/** Horizontal rule used to separate bands of content. */
export function rule(x, y, w, t, soft = false) {
  return `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${
    soft ? t.lineSoft : t.line
  }"/>`;
}

/** Letter-spaced label used for eyebrows and column headers. */
export function label(x, y, s, fill, size = 11, spacing = 1.6, anchor = "start") {
  return `<text x="${x}" y="${y}" class="mono" font-size="${size}" letter-spacing="${spacing}" fill="${fill}" text-anchor="${anchor}">${esc(
    s
  )}</text>`;
}

/** Round a number to at most 2 decimals to keep emitted SVG small. */
export function n(v) {
  return Math.round(v * 100) / 100;
}
