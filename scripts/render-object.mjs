/**
 * Software renderer for the core sample.
 *
 * Deliberately dependency-free so the Actions runner can regenerate the hero
 * object without an npm install: a z-buffered flat-shaded rasteriser plus a
 * hand-rolled PNG encoder over Node's built-in zlib.
 *
 * Flat shading is the right call twice over. The solid is axis-aligned, so
 * there are only six distinct normals and the output quantises to a handful of
 * colours that PNG compresses very well — which matters because the result is
 * base64-embedded into an SVG that has to stay small.
 */

import { deflateSync } from "node:zlib";
import { coreTriangles } from "./render-core.mjs";

// ---------------------------------------------------------------- PNG output

const CRC = (() => {
  const t = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Encode RGBA bytes as a PNG buffer. */
function encodePNG(rgba, w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // truecolour + alpha
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ----------------------------------------------------------------- rendering

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

function rotate(v, yaw, pitch) {
  const [x, y, z] = v;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x1 = x * cy - y * sy;
  const y1 = x * sy + y * cy;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return [x1, y1 * cp - z * sp, y1 * sp + z * cp];
}

/**
 * Renders the solid to an RGBA PNG.
 *
 * `palette` supplies the lit and unlit ends of the ramp so the object can be
 * given different material treatment per GitHub theme rather than being
 * inverted, which would look wrong on a shaded object.
 */
export function renderObjectPNG(data, opts = {}) {
  return renderTrianglesPNG(coreTriangles(data), opts);
}

/** Rasterise an arbitrary triangle soup; used to preview decimated meshes. */
export function renderTrianglesPNG(tris, { size = 560, ss = 2, yaw = 0.62, pitch = -1.02, palette } = {}) {
  const W = size * ss;
  const H = size * ss;

  // Project once, then fit the silhouette to the frame.
  const proj = tris.map((t) => ({
    n: rotate(t.n, yaw, pitch),
    v: t.v.map((p) => rotate(p, yaw, pitch)),
  }));

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const t of proj) {
    for (const p of t.v) {
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    }
  }
  const pad = 0.06;
  const scale = Math.min(W * (1 - pad * 2) / (maxX - minX), H * (1 - pad * 2) / (maxY - minY));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const toPx = (p) => [W / 2 + (p[0] - cx) * scale, H / 2 - (p[1] - cy) * scale, p[2]];

  const key = norm([-0.5, 0.62, 0.62]);
  const rim = norm([0.65, -0.35, 0.3]);

  const buf = Buffer.alloc(W * H * 4, 0);
  const zbuf = new Float32Array(W * H).fill(-Infinity);

  for (const t of proj) {
    const a = toPx(t.v[0]), b = toPx(t.v[1]), c = toPx(t.v[2]);

    // Backface cull in screen space.
    const area = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
    if (area >= 0) continue;

    const lam = Math.max(0, dot(t.n, key));
    const rimL = Math.pow(Math.max(0, dot(t.n, rim)), 3);
    const k = Math.min(1, palette.ambient + lam * palette.diffuse + rimL * palette.rim);
    const col = [
      Math.round(palette.base[0] + (palette.lit[0] - palette.base[0]) * k),
      Math.round(palette.base[1] + (palette.lit[1] - palette.base[1]) * k),
      Math.round(palette.base[2] + (palette.lit[2] - palette.base[2]) * k),
    ];

    const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
    const x1 = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
    const y0 = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
    const y1 = Math.min(H - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
    const inv = 1 / area;

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = ((b[0] - a[0]) * (py - a[1]) - (px - a[0]) * (b[1] - a[1])) * inv;
        const w1 = ((c[0] - b[0]) * (py - b[1]) - (px - b[0]) * (c[1] - b[1])) * inv;
        const w2 = ((a[0] - c[0]) * (py - c[1]) - (px - c[0]) * (a[1] - c[1])) * inv;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const z = a[2] * w1 + b[2] * w2 + c[2] * w0;
        const i = y * W + x;
        if (z <= zbuf[i]) continue;
        zbuf[i] = z;
        const o = i * 4;
        buf[o] = col[0];
        buf[o + 1] = col[1];
        buf[o + 2] = col[2];
        buf[o + 3] = 255;
      }
    }
  }

  // Box-downsample for antialiasing, including the alpha edge.
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, bl = 0, al = 0;
      for (let dy = 0; dy < ss; dy++) {
        for (let dx = 0; dx < ss; dx++) {
          const o = ((y * ss + dy) * W + (x * ss + dx)) * 4;
          const A = buf[o + 3] / 255;
          r += buf[o] * A;
          g += buf[o + 1] * A;
          bl += buf[o + 2] * A;
          al += A;
        }
      }
      const o = (y * size + x) * 4;
      if (al > 0) {
        out[o] = Math.round(r / al);
        out[o + 1] = Math.round(g / al);
        out[o + 2] = Math.round(bl / al);
        out[o + 3] = Math.round((al / (ss * ss)) * 255);
      }
    }
  }

  return encodePNG(out, size, size);
}

export const MATERIALS = {
  // Warm metal reading as machined brass against the near-black canvas.
  dark: { base: [38, 30, 18], lit: [242, 205, 140], ambient: 0.16, diffuse: 0.78, rim: 0.5 },
  // Denser and cooler so the object still has weight on white.
  light: { base: [92, 74, 40], lit: [214, 170, 96], ambient: 0.1, diffuse: 0.72, rim: 0.35 },
};
