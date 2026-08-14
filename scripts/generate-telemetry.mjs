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

// 1. BESPOKE AURORA EDGE & NEXO HOLOGRAPHIC HERO (960 x 340)
function generateHeroSVG(stats, isDark = true) {
  const bg = isDark ? '#060507' : '#ffffff';
  const surface = isDark ? '#0c0a10' : '#f8fafc';
  const textPrimary = isDark ? '#f8fafc' : '#090d14';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const textMuted = isDark ? '#64748b' : '#94a3b8';

  // Aurora & metallic color palette from user specifications:
  // #c2a4ff (Purple), #fb8dff (Pink), #4ade80 (Emerald), #38bdf8 (Cyan), #f8fafc (Silver)
  const violet = '#c2a4ff';
  const pink = '#fb8dff';
  const emerald = '#4ade80';
  const cyan = '#38bdf8';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 340" width="100%" height="100%">
  <defs>
    <!-- 1. Aurora Conic-like Linear Multi-stop Gradient -->
    <linearGradient id="auroraEdge${isDark ? 'D' : 'L'}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${violet}"/>
      <stop offset="35%" stop-color="${pink}"/>
      <stop offset="70%" stop-color="${emerald}"/>
      <stop offset="100%" stop-color="${cyan}"/>
    </linearGradient>

    <!-- 2. Metallic Silver / Cyan Gradient for Typography -->
    <linearGradient id="metallicGrad${isDark ? 'D' : 'L'}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="${cyan}"/>
    </linearGradient>

    <!-- 3. Indeterminate Progress Bar Gradient -->
    <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="50%" stop-color="${violet}"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>

    <!-- 4. Ambient Radial Glow -->
    <radialGradient id="auroraCoreGlow" cx="80%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${violet}" stop-opacity="${isDark ? '0.22' : '0.12'}"/>
      <stop offset="50%" stop-color="${pink}" stop-opacity="${isDark ? '0.12' : '0.06'}"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>

    <!-- Background Pattern -->
    <pattern id="heroGrid${isDark ? 'D' : 'L'}" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="${isDark ? 'rgba(194, 164, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'}"/>
    </pattern>

    <!-- Glow Filter -->
    <filter id="glowAurora" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <style>
      @keyframes spinOrbit1 {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes spinOrbit2 {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes pulseReactor {
        0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px ${violet}); }
        50% { transform: scale(1.12); filter: drop-shadow(0 0 16px ${pink}); }
      }
      @keyframes lbar {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes wv2_1 { 0%, 100% { height: 6px; } 50% { height: 22px; } }
      @keyframes wv2_2 { 0%, 100% { height: 8px; } 50% { height: 26px; } }
      @keyframes wv2_3 { 0%, 100% { height: 12px; } 50% { height: 20px; } }
      @keyframes wv2_4 { 0%, 100% { height: 6px; } 50% { height: 24px; } }

      .hero-main-title {
        font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
        font-weight: 900;
        letter-spacing: -0.02em;
      }
      .mono-header {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.08em;
      }
      .mono-tag {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10px;
        font-weight: 600;
      }
      .orbit-1 {
        transform-origin: 775px 170px;
        animation: spinOrbit1 20s linear infinite;
      }
      .orbit-2 {
        transform-origin: 775px 170px;
        animation: spinOrbit2 14s linear infinite;
      }
      .reactor-hub {
        transform-origin: 775px 170px;
        animation: pulseReactor 4s ease-in-out infinite;
      }
      .lbar-anim {
        animation: lbar 2s infinite linear;
      }
      .eq-bar-1 { animation: wv2_1 1s ease-in-out infinite; }
      .eq-bar-2 { animation: wv2_2 1s ease-in-out infinite 0.15s; }
      .eq-bar-3 { animation: wv2_3 1s ease-in-out infinite 0.3s; }
      .eq-bar-4 { animation: wv2_4 1s ease-in-out infinite 0.45s; }
    </style>
  </defs>

  <!-- Outer Aurora Gradient Border Frame (conic-style padding: 2px) -->
  <rect width="960" height="340" rx="18" fill="url(#auroraEdge${isDark ? 'D' : 'L'})"/>
  
  <!-- Inner Obsidian Luxury Background Canvas -->
  <rect x="2" y="2" width="956" height="336" rx="16" fill="${bg}"/>
  <rect x="2" y="2" width="956" height="336" rx="16" fill="url(#heroGrid${isDark ? 'D' : 'L'})"/>
  <rect x="2" y="2" width="956" height="336" rx="16" fill="url(#auroraCoreGlow)"/>

  <!-- Top System Bar -->
  <path d="M 2 18 Q 2 2 18 2 L 942 2 Q 958 2 958 18 L 958 44 L 2 44 Z" fill="${surface}" stroke="rgba(194, 164, 255, 0.15)" stroke-width="1"/>
  
  <circle cx="28" cy="23" r="4.5" fill="${emerald}"/>
  <text x="44" y="27" class="mono-header" fill="${textPrimary}">IKER PÉREZ GARCÍA // NEXO-IP SYSTEMS &amp; INTERACTIVE RUNTIMES</text>
  <text x="610" y="27" class="mono-tag" fill="${emerald}">[ONLINE • ${stats.totalContribs.toLocaleString()} CONTRIBUTIONS / YEAR]</text>
  <text x="825" y="27" class="mono-tag" fill="${textMuted}">A CORUÑA [ES]</text>

  <!-- Indeterminate Scanline Progress Beam under Top Bar -->
  <g transform="translate(2, 43)">
    <rect width="956" height="2" fill="rgba(255,255,255,0.05)"/>
    <g class="lbar-anim">
      <rect width="350" height="2" fill="url(#progGrad)"/>
    </g>
  </g>

  <!-- Left Editorial Content (Aligned with nexoip.click) -->
  <g transform="translate(48, 75)">
    <text x="0" y="48" class="hero-main-title" font-size="44" fill="url(#metallicGrad${isDark ? 'D' : 'L'})">IKER PÉREZ GARCÍA</text>
    <text x="0" y="78" class="mono-header" font-size="12" fill="${violet}">SOFTWARE, SISTEMAS Y EXPERIENCIAS INTERACTIVAS</text>
    
    <text x="0" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="14.5" fill="${textSecondary}">
      Ingeniería informática orientada a <tspan fill="${textPrimary}" font-weight="700">software de sistemas</tspan>, <tspan fill="${cyan}" font-weight="700">3D y WebGL interactivo</tspan>,
    </text>
    <text x="0" y="136" font-family="system-ui, -apple-system, sans-serif" font-size="14.5" fill="${textSecondary}">
      <tspan fill="${violet}" font-weight="700">entornos desktop web</tspan> y <tspan fill="${emerald}" font-weight="700">criptografía post-cuántica</tspan> con evidencia pública.
    </text>

    <!-- Technical Badges (Aurora styled, Zero Emojis) -->
    <g transform="translate(0, 168)">
      <rect x="0" y="0" width="130" height="28" rx="6" fill="${surface}" stroke="${emerald}" stroke-width="1.2"/>
      <text x="14" y="18" class="mono-tag" fill="${emerald}">[✓] OFFLINE-FIRST</text>

      <rect x="140" y="0" width="145" height="28" rx="6" fill="${surface}" stroke="${cyan}" stroke-width="1.2"/>
      <text x="154" y="18" class="mono-tag" fill="${cyan}">[⬡] CYCLONEDX SBOM</text>

      <rect x="295" y="0" width="150" height="28" rx="6" fill="${surface}" stroke="${violet}" stroke-width="1.2"/>
      <text x="309" y="18" class="mono-tag" fill="${violet}">[❖] POST-QUANTUM PQC</text>

      <rect x="455" y="0" width="135" height="28" rx="6" fill="${surface}" stroke="${pink}" stroke-width="1.2"/>
      <text x="469" y="18" class="mono-tag" fill="${pink}">[◎] WCAG AAA A11Y</text>
    </g>
  </g>

  <!-- Audio Equalizer Bars (Connecting to AURASYNTH & DSP) -->
  <g transform="translate(48, 290)">
    <rect class="eq-bar-1" x="0" y="0" width="5" rx="2.5" fill="${pink}"/>
    <rect class="eq-bar-2" x="8" y="0" width="5" rx="2.5" fill="${violet}"/>
    <rect class="eq-bar-3" x="16" y="0" width="5" rx="2.5" fill="${cyan}"/>
    <rect class="eq-bar-4" x="24" y="0" width="5" rx="2.5" fill="${emerald}"/>
    <text x="38" y="16" class="mono-tag" fill="${violet}">AURASYNTH DSP ENGINE // 44.1 kHz REAL-TIME</text>
  </g>

  <!-- Right Visual: The Bespoke Nexo-IP Quantum Core & Multi-Ring Gyroscope -->
  <g transform="translate(0, 0)">
    <!-- Outer Aurora Prismatic Orbit Ring -->
    <g class="orbit-1">
      <circle cx="775" cy="170" r="100" fill="none" stroke="url(#auroraEdge${isDark ? 'D' : 'L'})" stroke-width="1.8" stroke-opacity="0.8" stroke-dasharray="8 6"/>
      <polygon points="775,70 862,220 688,220" fill="none" stroke="${violet}" stroke-width="1.2" stroke-opacity="0.5"/>
    </g>

    <!-- Counter-Rotating Equatorial Orbit Rings -->
    <g class="orbit-2">
      <ellipse cx="775" cy="170" rx="96" ry="42" fill="none" stroke="${pink}" stroke-width="1.5" stroke-opacity="0.6" transform="rotate(35 775 170)"/>
      <ellipse cx="775" cy="170" rx="96" ry="42" fill="none" stroke="${cyan}" stroke-width="1.5" stroke-opacity="0.6" transform="rotate(-35 775 170)"/>
    </g>

    <!-- Central Quantum Reactor Core (Pulsing Glow) -->
    <g class="reactor-hub" filter="url(#glowAurora)">
      <circle cx="775" cy="170" r="32" fill="${surface}" stroke="${violet}" stroke-width="2"/>
      <circle cx="775" cy="170" r="16" fill="none" stroke="${emerald}" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle cx="775" cy="170" r="7" fill="${cyan}"/>
      
      <!-- Holographic Reticle Crosshairs -->
      <line x1="735" y1="170" x2="815" y2="170" stroke="${violet}" stroke-width="1" stroke-opacity="0.7"/>
      <line x1="775" y1="130" x2="775" y2="210" stroke="${violet}" stroke-width="1" stroke-opacity="0.7"/>
    </g>
  </g>
</svg>`;
}

async function main() {
  console.log('[Generator] Building Aurora Edge Nexo-IP Hero assets...');
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
