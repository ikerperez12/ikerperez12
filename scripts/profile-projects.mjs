/**
 * Curated public showcase projects on @ikerperez12's profile.
 *
 * This allowlist is deliberately explicit: the daily audit refreshes live
 * metadata (including stars), but it must not re-add projects removed from
 * the portfolio. Both games link to public showcase repositories, never to
 * the private application source.
 */
export const FEATURED_REPOS = Object.freeze([
  "NexoIP-3D-Viewer",
  "IP-OS-LINUX",
  "UI-IP-Toolkit-v4.0",
  "e36",
  "warpod",
  "EASY-LOCALHOST",
  "BLENDER-TOOL",
  "1.2-AuditoriaPQC",
  "1-click-world-showcase",
  "KINIELA-showcase",
  "SIGNAL-NEURALNETWORK",
  "GPT_CMD",
]);

// GitHub can report no detected language for a gallery-only repository.
export const PUBLIC_SHOWCASES = Object.freeze([
  "1-click-world-showcase",
  "KINIELA-showcase",
]);
