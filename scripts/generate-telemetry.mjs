import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

async function fetchStats() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  let totalContribs = 2623;

  if (token) {
    try {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ProfileTelemetryEngine'
        },
        body: JSON.stringify({
          query: `query { viewer { contributionsCollection { contributionCalendar { totalContributions } } } }`
        })
      });
      if (res.ok) {
        const json = await res.json();
        totalContribs = json.data?.viewer?.contributionsCollection?.contributionCalendar?.totalContributions || totalContribs;
      }
    } catch (e) {}
  }
  return { totalContribs };
}

// 1. ULTRA-LUXURY EDITORIAL HERO BANNER (960 x 300)
function generateHeroSVG(stats, isDark = true) {
  const bg = isDark ? '#05070b' : '#ffffff';
  const surface = isDark ? '#0a0f18' : '#f8fafc';
  const border = isDark ? '#162235' : '#e2e8f0';
  const textPrimary = isDark ? '#f8fafc' : '#090d14';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const gridStroke = isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(226, 232, 240, 0.8)';
  const cyan = '#00f0ff';
  const emerald = '#10b981';
  const indigo = '#818cf8';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 300" width="100%" height="100%">
  <defs>
    <linearGradient id="glowMesh${isDark ? 'D' : 'L'}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="${isDark ? '0.18' : '0.12'}"/>
      <stop offset="50%" stop-color="${indigo}" stop-opacity="${isDark ? '0.12' : '0.08'}"/>
      <stop offset="100%" stop-color="${emerald}" stop-opacity="${isDark ? '0.15' : '0.1'}"/>
    </linearGradient>

    <linearGradient id="textGrad${isDark ? 'D' : 'L'}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${textPrimary}"/>
      <stop offset="50%" stop-color="${cyan}"/>
      <stop offset="100%" stop-color="${emerald}"/>
    </linearGradient>

    <pattern id="dotGrid${isDark ? 'D' : 'L'}" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="${gridStroke}"/>
    </pattern>

    <style>
      @keyframes floatMesh {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(30px, -20px) scale(1.08); }
      }
      @keyframes pulseBeam {
        0%, 100% { stroke-dashoffset: 0; opacity: 0.4; }
        50% { stroke-dashoffset: -200; opacity: 0.9; }
      }
      @keyframes rotateOrbit {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .hero-title {
        font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
        font-weight: 900;
        letter-spacing: -0.03em;
      }
      .mono-text {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
      }
      .mono-sub {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 12px;
        letter-spacing: 0.1em;
      }
      .ambient-glow {
        animation: floatMesh 12s ease-in-out infinite;
        transform-origin: center;
      }
      .flowing-signal {
        stroke-dasharray: 60 140;
        animation: pulseBeam 5s linear infinite;
      }
      .orbital-ring {
        transform-origin: 780px 150px;
        animation: rotateOrbit 24s linear infinite;
      }
    </style>
  </defs>

  <!-- Frame Background -->
  <rect width="960" height="300" rx="16" fill="${bg}" stroke="${border}" stroke-width="1.5"/>
  <rect width="960" height="300" rx="16" fill="url(#dotGrid${isDark ? 'D' : 'L'})"/>

  <!-- Ambient Fluid Mesh Backdrop -->
  <ellipse class="ambient-glow" cx="800" cy="150" rx="260" ry="140" fill="url(#glowMesh${isDark ? 'D' : 'L'})"/>

  <!-- Top System Telemetry Bar -->
  <path d="M 0 16 Q 0 0 16 0 L 944 0 Q 960 0 960 16 L 960 42 L 0 42 Z" fill="${surface}" stroke="${border}" stroke-width="1"/>
  
  <circle cx="28" cy="21" r="4.5" fill="${emerald}"/>
  <text x="44" y="25" class="mono-text" fill="${textPrimary}">IKER PEREZ // SYSTEMS &amp; CREATIVE COMPUTING</text>
  <text x="560" y="25" class="mono-text" fill="${emerald}">[ONLINE • ${stats.totalContribs.toLocaleString()} CONTRIBUTIONS / YEAR]</text>
  <text x="820" y="25" class="mono-text" fill="${textMuted}">A CORUÑA [ES]</text>

  <!-- Left Hero Content -->
  <g transform="translate(48, 65)">
    <text x="0" y="52" class="hero-title" font-size="44" fill="url(#textGrad${isDark ? 'D' : 'L'})">IKER PEREZ</text>
    <text x="0" y="82" class="mono-sub" fill="${cyan}">SOFTWARE ENGINEER &amp; SYSTEMS TECHNOLOGIST</text>
    
    <text x="0" y="118" font-family="system-ui, -apple-system, sans-serif" font-size="14.5" fill="${textSecondary}">
      Building <tspan fill="${textPrimary}" font-weight="700">Offline-First 3D Systems</tspan>, <tspan fill="${cyan}" font-weight="700">Interactive WebGL Experiences</tspan>,
    </text>
    <text x="0" y="140" font-family="system-ui, -apple-system, sans-serif" font-size="14.5" fill="${textSecondary}">
      <tspan fill="${indigo}" font-weight="700">Desktop Web Environments</tspan>, and <tspan fill="${emerald}" font-weight="700">Post-Quantum Cryptography</tspan>.
    </text>

    <!-- Clean Vector Pills -->
    <g transform="translate(0, 168)">
      <rect x="0" y="0" width="130" height="26" rx="5" fill="${surface}" stroke="${emerald}" stroke-width="1"/>
      <text x="14" y="17" class="mono-text" font-size="10" fill="${emerald}">[✓] OFFLINE-FIRST</text>

      <rect x="140" y="0" width="145" height="26" rx="5" fill="${surface}" stroke="${cyan}" stroke-width="1"/>
      <text x="154" y="17" class="mono-text" font-size="10" fill="${cyan}">[⬡] CYCLONEDX SBOM</text>

      <rect x="295" y="0" width="140" height="26" rx="5" fill="${surface}" stroke="${indigo}" stroke-width="1"/>
      <text x="309" y="17" class="mono-text" font-size="10" fill="${indigo}">[❖] SHA-256 SIGNED</text>

      <rect x="445" y="0" width="135" height="26" rx="5" fill="${surface}" stroke="${textSecondary}" stroke-width="1"/>
      <text x="459" y="17" class="mono-text" font-size="10" fill="${textPrimary}">[◎] WCAG AAA A11Y</text>
    </g>
  </g>

  <!-- Right Visual Kinetic Geometry -->
  <g class="orbital-ring">
    <circle cx="780" cy="150" r="85" fill="none" stroke="${cyan}" stroke-width="1.2" stroke-opacity="0.3" stroke-dasharray="6 4"/>
    <ellipse cx="780" cy="150" rx="85" ry="36" fill="none" stroke="${indigo}" stroke-width="1.5" stroke-opacity="0.6" transform="rotate(30 780 150)"/>
    <ellipse cx="780" cy="150" rx="85" ry="36" fill="none" stroke="${emerald}" stroke-width="1.5" stroke-opacity="0.6" transform="rotate(-30 780 150)"/>
    
    <!-- Central Polyhedron -->
    <polygon points="780,95 825,150 780,205 735,150" fill="none" stroke="${cyan}" stroke-width="1.8"/>
    <circle cx="780" cy="150" r="6" fill="${cyan}"/>
  </g>

  <!-- Flowing Signal Pulse along Bottom -->
  <path d="M 48 275 L 700 275" fill="none" stroke="${cyan}" stroke-width="1.5" class="flowing-signal"/>
</svg>`;
}

async function main() {
  console.log('[Generator] Building luxury hero assets...');
  const stats = await fetchStats();

  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  fs.writeFileSync(path.join(ASSETS_DIR, 'hero-dark.svg'), generateHeroSVG(stats, true));
  fs.writeFileSync(path.join(ASSETS_DIR, 'hero-light.svg'), generateHeroSVG(stats, false));

  console.log('[Generator] Rendered assets/hero-dark.svg & assets/hero-light.svg');
}

main().catch(err => {
  console.error('[Generator] Error:', err);
  process.exit(1);
});
