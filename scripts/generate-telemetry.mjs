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

// 1. BESPOKE AURORA EDGE HERO WITH LUXURY 3D PRISMATIC HYPER-CORE (960 x 340)
function generateHeroSVG(stats, isDark = true) {
  const bg = isDark ? '#05070c' : '#ffffff';
  const surface = isDark ? '#090d16' : '#f8fafc';
  const textPrimary = isDark ? '#f8fafc' : '#090d14';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const textMuted = isDark ? '#64748b' : '#94a3b8';

  const violet = '#c2a4ff';
  const pink = '#fb8dff';
  const emerald = '#4ade80';
  const cyan = '#38bdf8';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 340" width="100%" height="100%">
  <defs>
    <linearGradient id="auroraEdge${isDark ? 'D' : 'L'}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${violet}"/>
      <stop offset="35%" stop-color="${pink}"/>
      <stop offset="70%" stop-color="${emerald}"/>
      <stop offset="100%" stop-color="${cyan}"/>
    </linearGradient>

    <linearGradient id="metallicGrad${isDark ? 'D' : 'L'}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="${cyan}"/>
    </linearGradient>

    <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="50%" stop-color="${violet}"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>

    <radialGradient id="ambientLight" cx="78%" cy="50%" r="55%">
      <stop offset="0%" stop-color="${violet}" stop-opacity="${isDark ? '0.22' : '0.12'}"/>
      <stop offset="45%" stop-color="${cyan}" stop-opacity="${isDark ? '0.12' : '0.06'}"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="crystalGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="${violet}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${pink}" stop-opacity="0"/>
    </radialGradient>

    <filter id="glowHyper" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="4.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <style>
      @keyframes spinGimbal1 {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes spinGimbal2 {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes float3D {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-8px) scale(1.03); }
      }
      @keyframes pulseInnerCore {
        0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 6px ${cyan}); }
        50% { opacity: 1; filter: drop-shadow(0 0 18px ${pink}); }
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
      .gimbal-ring1 {
        transform-origin: 775px 170px;
        animation: spinGimbal1 22s linear infinite;
      }
      .gimbal-ring2 {
        transform-origin: 775px 170px;
        animation: spinGimbal2 16s linear infinite;
      }
      .hyper-core-float {
        transform-origin: 775px 170px;
        animation: float3D 5s ease-in-out infinite;
      }
      .crystal-pulse {
        animation: pulseInnerCore 3.5s ease-in-out infinite;
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

  <rect width="960" height="340" rx="18" fill="url(#auroraEdge${isDark ? 'D' : 'L'})"/>
  <rect x="2" y="2" width="956" height="336" rx="16" fill="${bg}"/>
  <rect x="2" y="2" width="956" height="336" rx="16" fill="url(#ambientLight)"/>

  <path d="M 2 18 Q 2 2 18 2 L 942 2 Q 958 2 958 18 L 958 44 L 2 44 Z" fill="${surface}" stroke="rgba(194, 164, 255, 0.12)" stroke-width="1"/>
  
  <circle cx="28" cy="23" r="4.5" fill="${emerald}"/>
  <text x="44" y="27" class="mono-header" fill="${textPrimary}">IKER PÉREZ GARCÍA // NEXO-IP SYSTEMS &amp; INTERACTIVE RUNTIMES</text>
  <text x="610" y="27" class="mono-tag" fill="${emerald}">[ONLINE • ${stats.totalContribs.toLocaleString()} CONTRIBUTIONS / YEAR]</text>
  <text x="825" y="27" class="mono-tag" fill="${textMuted}">A CORUÑA [ES]</text>

  <g transform="translate(2, 43)">
    <rect width="956" height="2" fill="rgba(255,255,255,0.04)"/>
    <g class="lbar-anim">
      <rect width="350" height="2" fill="url(#progGrad)"/>
    </g>
  </g>

  <g transform="translate(48, 75)">
    <text x="0" y="48" class="hero-main-title" font-size="44" fill="url(#metallicGrad${isDark ? 'D' : 'L'})">IKER PÉREZ GARCÍA</text>
    <text x="0" y="78" class="mono-header" font-size="12" fill="${violet}">SOFTWARE, SISTEMAS Y EXPERIENCIAS INTERACTIVAS</text>
    
    <text x="0" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="14.5" fill="${textSecondary}">
      Ingeniería informática orientada a <tspan fill="${textPrimary}" font-weight="700">software de sistemas</tspan>, <tspan fill="${cyan}" font-weight="700">3D y WebGL interactivo</tspan>,
    </text>
    <text x="0" y="136" font-family="system-ui, -apple-system, sans-serif" font-size="14.5" fill="${textSecondary}">
      <tspan fill="${violet}" font-weight="700">entornos desktop web</tspan> y <tspan fill="${emerald}" font-weight="700">criptografía post-cuántica</tspan> con evidencia pública.
    </text>

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

  <g transform="translate(48, 290)">
    <rect class="eq-bar-1" x="0" y="0" width="5" rx="2.5" fill="${pink}"/>
    <rect class="eq-bar-2" x="8" y="0" width="5" rx="2.5" fill="${violet}"/>
    <rect class="eq-bar-3" x="16" y="0" width="5" rx="2.5" fill="${cyan}"/>
    <rect class="eq-bar-4" x="24" y="0" width="5" rx="2.5" fill="${emerald}"/>
    <text x="38" y="16" class="mono-tag" fill="${violet}">AURASYNTH DSP ENGINE // 44.1 kHz REAL-TIME</text>
  </g>

  <g class="hyper-core-float">
    <circle cx="775" cy="170" r="70" fill="url(#crystalGlow)"/>

    <g class="gimbal-ring1">
      <ellipse cx="775" cy="170" rx="98" ry="42" fill="none" stroke="url(#auroraEdge${isDark ? 'D' : 'L'})" stroke-width="1.8" stroke-opacity="0.8" stroke-dasharray="12 6" transform="rotate(-25 775 170)"/>
      <circle cx="865" cy="140" r="4" fill="${cyan}"/>
      <circle cx="685" cy="200" r="4" fill="${pink}"/>
    </g>

    <g class="gimbal-ring2">
      <ellipse cx="775" cy="170" rx="96" ry="38" fill="none" stroke="${cyan}" stroke-width="1.5" stroke-opacity="0.65" transform="rotate(45 775 170)"/>
      <circle cx="845" cy="220" r="3.5" fill="${violet}"/>
      <circle cx="705" cy="120" r="3.5" fill="${emerald}"/>
    </g>

    <g class="crystal-pulse" filter="url(#glowHyper)" transform="translate(775, 170)">
      <polygon points="0,-45 38,-22 0,0 -38,-22" fill="${surface}" stroke="${violet}" stroke-width="1.8" fill-opacity="0.85"/>
      <polygon points="0,0 38,-22 38,24 0,46" fill="#131122" stroke="${pink}" stroke-width="1.8" fill-opacity="0.9"/>
      <polygon points="-38,-22 0,0 0,46 -38,24" fill="#0d1424" stroke="${cyan}" stroke-width="1.8" fill-opacity="0.9"/>

      <line x1="0" y1="-45" x2="0" y2="46" stroke="${emerald}" stroke-width="1.2" stroke-dasharray="3 3"/>
      <line x1="-38" y1="-22" x2="38" y2="24" stroke="${violet}" stroke-width="1" stroke-opacity="0.6"/>
      <line x1="-38" y1="24" x2="38" y2="-22" stroke="${cyan}" stroke-width="1" stroke-opacity="0.6"/>

      <circle cx="0" cy="0" r="6" fill="#ffffff" filter="url(#glowHyper)"/>
    </g>
  </g>
</svg>`;
}

// 2. LUXURY SECTION HEADER BANNER (960 x 85)
function generateSectionHeaderSVG(isDark = true) {
  const bg = isDark ? '#06080e' : '#ffffff';
  const surface = isDark ? '#0a0e18' : '#f8fafc';
  const textPrimary = isDark ? '#ffffff' : '#090d14';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const violet = '#c2a4ff';
  const pink = '#fb8dff';
  const emerald = '#4ade80';
  const cyan = '#38bdf8';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 85" width="100%" height="100%">
  <defs>
    <linearGradient id="headerAurora${isDark ? 'D' : 'L'}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${violet}"/>
      <stop offset="35%" stop-color="${pink}"/>
      <stop offset="70%" stop-color="${emerald}"/>
      <stop offset="100%" stop-color="${cyan}"/>
    </linearGradient>

    <linearGradient id="headerTitleGrad${isDark ? 'D' : 'L'}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${textPrimary}"/>
      <stop offset="50%" stop-color="${cyan}"/>
      <stop offset="100%" stop-color="${emerald}"/>
    </linearGradient>

    <linearGradient id="headerBeam" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="50%" stop-color="${cyan}"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>

    <style>
      @keyframes beamSlide {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .sec-title {
        font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
        font-weight: 900;
        letter-spacing: -0.01em;
      }
      .sec-mono {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-weight: 700;
        font-size: 11px;
        letter-spacing: 0.08em;
      }
      .sec-pill {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10px;
        font-weight: 600;
      }
      .beam-loop {
        animation: beamSlide 3s infinite linear;
      }
    </style>
  </defs>

  <!-- Aurora Outer Accent Border -->
  <rect width="960" height="85" rx="14" fill="url(#headerAurora${isDark ? 'D' : 'L'})"/>
  <rect x="2" y="2" width="956" height="81" rx="12" fill="${bg}"/>

  <!-- Top Laser Beam Accent -->
  <g transform="translate(2, 2)">
    <rect width="956" height="2" fill="rgba(255,255,255,0.05)"/>
    <g class="beam-loop">
      <rect width="300" height="2" fill="url(#headerBeam)"/>
    </g>
  </g>

  <!-- Section Number Badge & Title -->
  <g transform="translate(30, 48)">
    <rect x="0" y="-20" width="38" height="24" rx="5" fill="${surface}" stroke="${violet}" stroke-width="1.2"/>
    <text x="19" y="-4" text-anchor="middle" class="sec-mono" fill="${violet}">02</text>

    <text x="50" y="-2" class="sec-title" font-size="22" fill="url(#headerTitleGrad${isDark ? 'D' : 'L'})">PROYECTOS PÚBLICOS &amp; GALERÍA BENTO</text>
  </g>

  <!-- Right Telemetry Badge -->
  <g transform="translate(680, 28)">
    <rect width="250" height="30" rx="6" fill="${surface}" stroke="${cyan}" stroke-width="1"/>
    <circle cx="15" cy="15" r="4" fill="${emerald}"/>
    <text x="28" y="19" class="sec-pill" fill="${textPrimary}">12 REPOSITORIOS • OPEN SOURCE</text>
  </g>
</svg>`;
}

// 3. LUXURY FOOTER MONOLITH (960 x 85)
function generateFooterSVG(isDark = true) {
  const bg = isDark ? '#06080e' : '#ffffff';
  const surface = isDark ? '#0a0e18' : '#f8fafc';
  const textPrimary = isDark ? '#ffffff' : '#090d14';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const violet = '#c2a4ff';
  const pink = '#fb8dff';
  const emerald = '#4ade80';
  const cyan = '#38bdf8';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 85" width="100%" height="100%">
  <defs>
    <linearGradient id="footerAurora${isDark ? 'D' : 'L'}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${violet}"/>
      <stop offset="35%" stop-color="${pink}"/>
      <stop offset="70%" stop-color="${emerald}"/>
      <stop offset="100%" stop-color="${cyan}"/>
    </linearGradient>
    <style>
      .foot-title {
        font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
        font-weight: 800;
        font-size: 14px;
        letter-spacing: 0.02em;
      }
      .foot-mono {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.06em;
      }
    </style>
  </defs>

  <rect width="960" height="85" rx="14" fill="url(#footerAurora${isDark ? 'D' : 'L'})"/>
  <rect x="2" y="2" width="956" height="81" rx="12" fill="${bg}"/>

  <g transform="translate(35, 48)">
    <text x="0" y="-4" class="foot-title" fill="${textPrimary}">IKER PÉREZ GARCÍA</text>
    <text x="170" y="-4" class="foot-mono" fill="${violet}">• A CORUÑA, GALICIA, SPAIN</text>
    <text x="440" y="-4" class="foot-mono" fill="${cyan}">• NEXOIP.CLICK</text>
    <text x="590" y="-4" class="foot-mono" fill="${emerald}">• LIVING COMPUTATIONAL PROFILE</text>
  </g>
</svg>`;
}

async function main() {
  console.log('[Generator] Building luxury SVGs and section headers...');
  const stats = await fetchStats();

  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  fs.writeFileSync(path.join(ASSETS_DIR, 'hero-dark.svg'), generateHeroSVG(stats, true));
  fs.writeFileSync(path.join(ASSETS_DIR, 'hero-light.svg'), generateHeroSVG(stats, false));

  fs.writeFileSync(path.join(ASSETS_DIR, 'section-header-projects-dark.svg'), generateSectionHeaderSVG(true));
  fs.writeFileSync(path.join(ASSETS_DIR, 'section-header-projects-light.svg'), generateSectionHeaderSVG(false));

  fs.writeFileSync(path.join(ASSETS_DIR, 'footer-dark.svg'), generateFooterSVG(true));
  fs.writeFileSync(path.join(ASSETS_DIR, 'footer-light.svg'), generateFooterSVG(false));

  console.log('[Generator] Rendered all luxury hero and section header assets.');
}

main().catch(err => {
  console.error('[Generator] Error:', err);
  process.exit(1);
});
