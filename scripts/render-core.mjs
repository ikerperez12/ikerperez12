/**
 * The core sample: a solid built from audited repository data.
 *
 * The geometry is not decorative. It is the section through the machine turned
 * upright — one tier per layer, systems at the bottom and the interface at the
 * top — where each tier's width is how many engineering controls the daily
 * audit could actually verify in that repository. A repository that proves
 * nothing produces a sliver, so the silhouette is one only these repositories
 * can make.
 *
 * Two outputs share this geometry: an ASCII STL that GitHub renders natively
 * (and that NexoIP 3D Viewer can open), and the shaded object in the hero.
 *
 * Triangle count is kept low deliberately: the STL is embedded in the README as
 * text, so every facet is bytes a reader scrolls past in the raw file.
 */

/** Bottom-to-top, mirroring the section which reads top-to-bottom. */
export const TIERS = [
  { repo: "SO-2324", layer: "systems" },
  { repo: "1.2-AuditoriaPQC", layer: "security" },
  { repo: "EASY-LOCALHOST", layer: "dev tooling" },
  { repo: "BLENDER-TOOL", layer: "pipeline" },
  { repo: "NexoIP-3D-Viewer", layer: "desktop 3D" },
  { repo: "IP-OS-LINUX", layer: "web platform" },
  { repo: "warpod", layer: "real-time 3D" },
  { repo: "e36", layer: "web experience" },
  { repo: "UI-IP-Toolkit-v4.0", layer: "interface" },
];

const TIER_H = 6;
const BASE_W = 6;
const STEP_W = 2.4;

export function controlsFor(repo, data) {
  const p = data.products.find((x) => x.repo === repo);
  if (!p || !p.controls) return 0;
  return Object.values(p.controls).filter(Boolean).length;
}

/**
 * Tiers stacked widest-first, so the solid rests on the work that proves the
 * most and tapers to the work that proves the least. The ordering is itself a
 * reading of the data rather than a fixed layout.
 */
export function stackOrder(data) {
  return [...TIERS].sort(
    (a, b) => controlsFor(b.repo, data) - controlsFor(a.repo, data)
  );
}

/** Triangles as { n:[x,y,z], v:[[x,y,z],[x,y,z],[x,y,z]] }, centred on origin. */
export function coreTriangles(data) {
  const tris = [];
  const push = (n, a, b, c) => tris.push({ n, v: [a, b, c] });

  const order = stackOrder(data);
  const totalH = TIER_H * order.length;
  const zOff = -totalH / 2;

  order.forEach((t, i) => {
    const w = BASE_W + STEP_W * controlsFor(t.repo, data);
    const z0 = zOff + i * TIER_H;
    const z1 = z0 + TIER_H;
    const p = [
      [-w, -w, z0], [w, -w, z0], [w, w, z0], [-w, w, z0],
      [-w, -w, z1], [w, -w, z1], [w, w, z1], [-w, w, z1],
    ];
    const quad = (n, i0, i1, i2, i3) => {
      push(n, p[i0], p[i1], p[i2]);
      push(n, p[i0], p[i2], p[i3]);
    };
    quad([0, 0, -1], 0, 3, 2, 1);
    quad([0, 0, 1], 4, 5, 6, 7);
    quad([0, -1, 0], 0, 1, 5, 4);
    quad([1, 0, 0], 1, 2, 6, 5);
    quad([0, 1, 0], 2, 3, 7, 6);
    quad([-1, 0, 0], 3, 0, 4, 7);
  });

  return tris;
}

const f = (v) => {
  const r = Math.round(v * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
};

/** ASCII STL. GitHub renders this natively from a fenced `stl` block. */
export function renderCoreSTL(data) {
  const out = ["solid iker-perez-core"];
  for (const t of coreTriangles(data)) {
    out.push(`facet normal ${f(t.n[0])} ${f(t.n[1])} ${f(t.n[2])}`);
    out.push("outer loop");
    for (const v of t.v) out.push(`vertex ${f(v[0])} ${f(v[1])} ${f(v[2])}`);
    out.push("endloop");
    out.push("endfacet");
  }
  out.push("endsolid iker-perez-core");
  return out.join("\n");
}

/** Legend so the geometry is never a mystery to the reader. */
export function coreLegend(data) {
  return stackOrder(data).map((t, i) => ({
    tier: i + 1,
    layer: t.layer,
    repo: t.repo,
    verified: controlsFor(t.repo, data),
  }));
}
