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

// 1. BESPOKE NEXO-IP HOLOGRAPHIC HERO (960 x 320)
function generateHeroSVG(stats, isDark = true) {
  const bg = isDark ? '#05080d' : '#ffffff';
  const surface = isDark ? '#0a101a' : '#f8fafc';
  const border = isDark ? '#142033' : '#e2e8f0';
  const textPrimary = isDark ? '#f8fafc' : '#090d14';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const gridStroke = isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(226, 232, 240, 0.8)';
  const cyan = '#00f0ff';
  const emerald = '#10b981';
  const indigo = '#818cf8';
  const amber = '#f59e0b';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 320" width="100%" height="100%">
  <defs>
    <!-- Background Ambient Glow -->
    <radialGradient id="nexoCoreGlow${isDark ? 'D' : 'L'}" cx="80%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="${isDark ? '0.2' : '0.12'}"/>
      <stop offset="45%" stop-color="${indigo}" stop-opacity="${isDark ? '0.12' : '0.08'}"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>

    <!-- Title Gradient -->
    <linearGradient id="heroNameGrad${isDark ? 'D' : 'L'}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${textPrimary}"/>
      <stop offset="45%" stop-color="${cyan}"/>
      <stop offset="100%" stop-color="${emerald}"/>
    </linearGradient>

    <!-- Audio / DSP Wave Gradient -->
    <linearGradient id="dspWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="0.1"/>
      <stop offset="50%" stop-color="${cyan}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${emerald}" stop-opacity="0.15"/>
    </linearGradient>

    <pattern id="nexoGrid${isDark ? 'D' : 'L'}" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="${gridStroke}"/>
    </pattern>

    <style>
      @keyframes spinOrbit1 {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes spinOrbit2 {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes pulseReactorRing {
        0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px ${cyan}); }
        50% { transform: scale(1.08); filter: drop-shadow(0 0 16px ${cyan}); }
      }
      @keyframes dspWaveFlow {
        0% { stroke-dashoffset: 800; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes radarSweepArm {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .hero-main-title {
        font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
        font-weight: 900;
        letter-spacing: -0.03em;
      }
      .mono-header {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
      }
      .mono-tag {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10px;
        font-weight: 600;
      }
      .nexo-core-1 {
        transform-origin: 775px 160px;
        animation: spinOrbit1 20s linear infinite;
      }
      .nexo-core-2 {
        transform-origin: 775px 160px;
        animation: spinOrbit2 15s linear infinite;
      }
      .nexo-reactor {
        transform-origin: 775px 160px;
        animation: pulseReactorRing 4s ease-in-out infinite;
      }
      .dsp-waveform {
        stroke-dasharray: 180 320;
        animation: dspWaveFlow 7s linear infinite;
      }
      .reticle-sweep {
        transform-origin: 885px 44px;
        animation: radarSweepArm 4s linear infinite;
      }
    </style>
  </defs>

  <!-- Base Canvas -->
  <rect width="960" height="320" rx="16" fill="${bg}" stroke="${border}" stroke-width="1.5"/>
  <rect width="960" height="320" rx="16" fill="url(#nexoGrid${isDark ? 'D' : 'L'})"/>
  <rect width="960" height="320" rx="16" fill="url(#nexoCoreGlow${isDark ? 'D' : 'L'})"/>

  <!-- Top System Bar -->
  <path d="M 0 16 Q 0 0 16 0 L 944 0 Q 960 0 960 16 L 960 42 L 0 42 Z" fill="${surface}" stroke="${border}" stroke-width="1"/>
  
  <circle cx="28" cy="21" r="4.5" fill="${emerald}"/>
  <text x="44" y="25" class="mono-header" fill="${textPrimary}">IKER PÉREZ GARCÍA // NEXO-IP SYSTEMS &amp; INTERACTIVE RUNTIMES</text>
  <text x="610" y="25" class="mono-tag" fill="${emerald}">[ONLINE • ${stats.totalContribs.toLocaleString()} CONTRIBUTIONS / YEAR]</text>
  <text x="825" y="25" class="mono-tag" fill="${textMuted}">A CORUÑA [ES]</text>

  <!-- Left Editorial Content (Alinged with nexoip.click) -->
  <g transform="translate(48, 65)">
    <text x="0" y="48" class="hero-main-title" font-size="42" fill="url(#heroNameGrad${isDark ? 'D' : 'L'})">IKER PÉREZ GARCÍA</text>
    <text x="0" y="78" class="mono-header" font-size="12" fill="${cyan}">SOFTWARE, SISTEMAS Y EXPERIENCIAS INTERACTIVAS</text>
    
    <text x="0" y="112" font-family="system-ui, -apple-system, sans-serif" font-size="14.5" fill="${textSecondary}">
      Ingeniería informática orientada a <tspan fill="${textPrimary}" font-weight="700">software de sistemas</tspan>, <tspan fill="${cyan}" font-weight="700">3D y WebGL interactivo</tspan>,
    </text>
    <text x="0" y="134" font-family="system-ui, -apple-system, sans-serif" font-size="14.5" fill="${textSecondary}">
      <tspan fill="${indigo}" font-weight="700">entornos desktop web</tspan> y <tspan fill="${emerald}" font-weight="700">criptografía post-cuántica</tspan> con evidencia pública.
    </text>

    <!-- Technical Badges (Zero Emojis) -->
    <g transform="translate(0, 162)">
      <rect x="0" y="0" width="130" height="26" rx="5" fill="${surface}" stroke="${emerald}" stroke-width="1"/>
      <text x="14" y="17" class="mono-tag" fill="${emerald}">[✓] OFFLINE-FIRST</text>

      <rect x="140" y="0" width="145" height="26" rx="5" fill="${surface}" stroke="${cyan}" stroke-width="1"/>
      <text x="154" y="17" class="mono-tag" fill="${cyan}">[⬡] CYCLONEDX SBOM</text>

      <rect x="295" y="0" width="150" height="26" rx="5" fill="${surface}" stroke="${indigo}" stroke-width="1"/>
      <text x="309" y="17" class="mono-tag" fill="${indigo}">[❖] POST-QUANTUM PQC</text>

      <rect x="455" y="0" width="135" height="26" rx="5" fill="${surface}" stroke="${amber}" stroke-width="1"/>
      <text x="469" y="17" class="mono-tag" fill="${amber}">[◎] WCAG AAA A11Y</text>
    </g>
  </g>

  <!-- Real Audio / DSP Waveform along Bottom Left (Connecting to AURASYNTH & DSP) -->
  <path d="M 48 290 Q 110 265 170 290 T 290 290 T 410 290 T 530 290 T 650 290" fill="none" stroke="url(#dspWaveGrad)" stroke-width="2.5" class="dsp-waveform"/>

  <!-- Right Visual: The Nexo-IP Holographic System Core & Geometric Bus -->
  <g transform="translate(0, 0)">
    <!-- Concentric Multi-Bus Orbits -->
    <g class="nexo-core-1">
      <circle cx="775" cy="160" r="95" fill="none" stroke="${cyan}" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="6 6"/>
      <polygon points="775,65 857,208 693,208" fill="none" stroke="${cyan}" stroke-width="1.2" stroke-opacity="0.45"/>
    </g>

    <g class="nexo-core-2">
      <ellipse cx="775" cy="160" rx="90" ry="40" fill="none" stroke="${indigo}" stroke-width="1.5" stroke-opacity="0.6" transform="rotate(35 775 160)"/>
      <ellipse cx="775" cy="160" rx="90" ry="40" fill="none" stroke="${emerald}" stroke-width="1.5" stroke-opacity="0.6" transform="rotate(-35 775 160)"/>
    </g>

    <!-- Central Nexo Reactor Hub -->
    <g class="nexo-reactor">
      <circle cx="775" cy="160" r="30" fill="${surface}" stroke="${cyan}" stroke-width="2"/>
      <circle cx="775" cy="160" r="14" fill="none" stroke="${emerald}" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle cx="775" cy="160" r="6" fill="${cyan}"/>
      
      <!-- Crosshairs -->
      <line x1="740" y1="160" x2="810" y2="160" stroke="${cyan}" stroke-width="1" stroke-opacity="0.6"/>
      <line x1="775" y1="125" x2="775" y2="195" stroke="${cyan}" stroke-width="1" stroke-opacity="0.6"/>
    </g>
  </g>
</svg>`;
}

async function main() {
  console.log('[Generator] Building Nexo-IP authentic hero assets...');
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
