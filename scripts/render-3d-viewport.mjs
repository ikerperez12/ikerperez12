import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const STATE_FILE = path.join(ROOT_DIR, 'state_3d.json');

// 3D MODEL DEFINITIONS (Vertices & Edges)
const MODELS = {
  e36: {
    name: "BMW E36 318is COUPE",
    category: "AUTOMOTIVE WEBGL 3D",
    vertices: [
      [-3.2, 0.8, -1.3], [3.2, 0.8, -1.3], [3.2, 0.8, 1.3], [-3.2, 0.8, 1.3],
      [-3.4, 0.0, -1.25], [-1.2, -0.2, -1.25], [1.8, -0.1, -1.25], [3.3, 0.1, -1.25],
      [-3.4, 0.0, 1.25], [-1.2, -0.2, 1.25], [1.8, -0.1, 1.25], [3.3, 0.1, 1.25],
      [-1.0, -1.2, -0.95], [0.9, -1.2, -0.95],
      [-1.0, -1.2, 0.95], [0.9, -1.2, 0.95],
      [-2.1, 0.8, -1.35], [2.1, 0.8, -1.35],
      [-2.1, 0.8, 1.35], [2.1, 0.8, 1.35]
    ],
    edges: [
      [0,1], [1,2], [2,3], [3,0],
      [4,5], [5,6], [6,7], [8,9], [9,10], [10,11],
      [4,8], [5,9], [6,10], [7,11],
      [0,4], [1,7], [2,11], [3,8],
      [5,12], [9,14], [6,13], [10,15],
      [12,13], [14,15], [12,14], [13,15],
      [16,0], [16,4], [17,1], [17,7], [18,3], [18,8], [19,2], [19,11]
    ],
    scale: 36
  },
  tesseract: {
    name: "NEXO TESSERACT 4D",
    category: "GEOMETRIC RUNTIME 3D",
    vertices: [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      [-2, -2, -2], [2, -2, -2], [2, 2, -2], [-2, 2, -2],
      [-2, -2, 2], [2, -2, 2], [2, 2, 2], [-2, 2, 2]
    ],
    edges: [
      [0,1], [1,2], [2,3], [3,0], [4,5], [5,6], [6,7], [7,4], [0,4], [1,5], [2,6], [3,7],
      [8,9], [9,10], [10,11], [11,8], [12,13], [13,14], [14,15], [15,12], [8,12], [9,13], [10,14], [11,15],
      [0,8], [1,9], [2,10], [3,11], [4,12], [5,13], [6,14], [7,15]
    ],
    scale: 34
  },
  quantum: {
    name: "QUANTUMGUARD ICOSAHEDRON",
    category: "CRYPTOGRAPHIC PQC 3D",
    vertices: (() => {
      const phi = (1 + Math.sqrt(5)) / 2;
      return [
        [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
        [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
        [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
      ];
    })(),
    edges: [
      [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
      [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
      [3, 9], [3, 4], [3, 2], [3, 6], [3, 8],
      [9, 4], [4, 2], [2, 6], [6, 8], [8, 9],
      [4, 5], [5, 9], [9, 1], [1, 8], [8, 7],
      [7, 6], [6, 10], [10, 2], [2, 11], [11, 4]
    ],
    scale: 50
  }
};

const THEMES = {
  cyan: {
    name: "CYAN PHOSPHOR",
    stroke: "#00f0ff",
    vertex: "#ffffff",
    bg: "#070a0f",
    surface: "#0c111a",
    border: "#172131"
  },
  emerald: {
    name: "MATRIX EMERALD",
    stroke: "#10b981",
    vertex: "#6ee7b7",
    bg: "#040d0a",
    surface: "#081813",
    border: "#13382c"
  },
  amber: {
    name: "AMBER RETRO",
    stroke: "#f59e0b",
    vertex: "#fde68a",
    bg: "#0d0904",
    surface: "#181107",
    border: "#382713"
  },
  violet: {
    name: "HYPER VIOLET",
    stroke: "#818cf8",
    vertex: "#c7d2fe",
    bg: "#080711",
    surface: "#100d22",
    border: "#241e44"
  }
};

function rotatePoint(point, yawDeg, pitchDeg) {
  const radX = (pitchDeg * Math.PI) / 180;
  const radY = (yawDeg * Math.PI) / 180;
  let [x, y, z] = point;

  const x1 = x * Math.cos(radY) + z * Math.sin(radY);
  const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

  const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
  const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

  return [x1, y2, z2];
}

function projectPoint(point3d, width, height, scale, fov = 320) {
  const [x, y, z] = point3d;
  const distance = 8.5;
  const sz = z + distance;
  const factor = fov / (sz > 0.1 ? sz : 0.1);

  const projX = width / 2 + x * factor * (scale / 40);
  const projY = height / 2 + y * factor * (scale / 40);

  return [projX, projY, z];
}

export function renderInteractiveViewportSVG(state) {
  const width = 960;
  const height = 400;
  const modelKey = state.model in MODELS ? state.model : 'e36';
  const themeKey = state.theme in THEMES ? state.theme : 'cyan';
  const model = MODELS[modelKey];
  const theme = THEMES[themeKey];

  const projected = model.vertices.map(v => {
    const rot = rotatePoint(v, state.yaw, state.pitch);
    return projectPoint(rot, width, height + 15, model.scale);
  });

  const edgesWithDepth = model.edges.map(e => {
    const p1 = projected[e[0]];
    const p2 = projected[e[1]];
    const avgZ = (p1[2] + p2[2]) / 2;
    return { p1, p2, avgZ };
  });

  edgesWithDepth.sort((a, b) => a.avgZ - b.avgZ);

  let edgesSvg = '';
  edgesWithDepth.forEach(edge => {
    const alpha = Math.min(1, Math.max(0.25, (edge.avgZ + 4) / 8));
    edgesSvg += `<line x1="${edge.p1[0].toFixed(1)}" y1="${edge.p1[1].toFixed(1)}" x2="${edge.p2[0].toFixed(1)}" y2="${edge.p2[1].toFixed(1)}" stroke="${theme.stroke}" stroke-width="1.8" stroke-opacity="${alpha.toFixed(2)}" stroke-linecap="round"/>`;
  });

  let verticesSvg = '';
  projected.forEach(p => {
    verticesSvg += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${theme.vertex}" stroke="${theme.stroke}" stroke-width="1"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <filter id="glow3d" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <style>
      .hero-name {
        font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
        font-weight: 900;
        letter-spacing: -0.02em;
      }
      .mono-header {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        font-size: 11.5px;
        letter-spacing: 0.08em;
      }
      .mono-hud {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.04em;
      }
    </style>
  </defs>

  <!-- Frame Background -->
  <rect width="${width}" height="${height}" rx="14" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1.5"/>

  <!-- Top Identity Header Bar -->
  <path d="M 0 14 Q 0 0 14 0 L ${width-14} 0 Q ${width} 0 ${width} 14 L ${width} 52 L 0 52 Z" fill="${theme.surface}" stroke="${theme.border}" stroke-width="1"/>
  
  <circle cx="28" cy="26" r="5" fill="${theme.stroke}"/>
  <text x="44" y="30" class="hero-name" font-size="20" fill="#f8fafc">IKER PEREZ</text>
  <text x="175" y="30" class="mono-header" fill="${theme.stroke}">// FULL-TECH COMPUTER ENGINEER</text>
  <text x="640" y="30" class="mono-hud" fill="#94a3b8">A CORUÑA [ES] • 2,623 CONTRIBUTIONS</text>
  <text x="865" y="30" class="mono-hud" fill="${theme.stroke}">[3D ENGINE ●]</text>

  <!-- Grid & Reticle Accents -->
  <line x1="${width/2}" y1="52" x2="${width/2}" y2="${height - 25}" stroke="${theme.border}" stroke-width="0.8" stroke-dasharray="4 4"/>
  <line x1="30" y1="${height/2 + 25}" x2="${width - 30}" y2="${height/2 + 25}" stroke="${theme.border}" stroke-width="0.8" stroke-dasharray="4 4"/>
  <circle cx="${width/2}" cy="${height/2 + 25}" r="130" fill="none" stroke="${theme.border}" stroke-width="0.6" stroke-dasharray="2 6"/>

  <!-- Left Camera HUD Panel -->
  <g transform="translate(35, 75)" class="mono-hud" fill="#94a3b8">
    <rect width="190" height="84" rx="6" fill="${theme.surface}" stroke="${theme.border}" stroke-width="0.8" fill-opacity="0.9"/>
    <text x="12" y="22" fill="${theme.stroke}" font-weight="700">CAMERA PROJECTION</text>
    <text x="12" y="42">YAW: <tspan fill="#f8fafc" font-weight="700">${state.yaw}°</tspan> | PITCH: <tspan fill="#f8fafc" font-weight="700">${state.pitch}°</tspan></text>
    <text x="12" y="58">MODEL: <tspan fill="${theme.stroke}">${model.name}</tspan></text>
    <text x="12" y="74">VERTS: <tspan fill="#f8fafc">${model.vertices.length}</tspan> | EDGES: <tspan fill="#f8fafc">${model.edges.length}</tspan></text>
  </g>

  <!-- Right Community Operator Stamp -->
  <g transform="translate(${width - 245}, 75)" class="mono-hud" fill="#94a3b8">
    <rect width="210" height="84" rx="6" fill="${theme.surface}" stroke="${theme.border}" stroke-width="0.8" fill-opacity="0.9"/>
    <text x="12" y="22" fill="${theme.stroke}" font-weight="700">COMMUNITY CONTROLLER</text>
    <text x="12" y="42">OPERATOR: <tspan fill="#f8fafc" font-weight="700">@${state.lastOperator || 'ikerperez12'}</tspan></text>
    <text x="12" y="58">ACTION: <tspan fill="#f8fafc">${state.lastAction || 'BOOT'}</tspan></text>
    <text x="12" y="74">INTERACTION CYCLES: <tspan fill="${theme.stroke}">${state.totalInteractions || 1}</tspan></text>
  </g>

  <!-- 3D Rendered Wireframe Geometry -->
  <g filter="url(#glow3d)">
    ${edgesSvg}
    ${verticesSvg}
  </g>

  <!-- Viewport Corner Reticles -->
  <path d="M 25 70 L 25 60 L 35 60" fill="none" stroke="${theme.stroke}" stroke-width="2"/>
  <path d="M ${width-25} 70 L ${width-25} 60 L ${width-35} 60" fill="none" stroke="${theme.stroke}" stroke-width="2"/>
  <path d="M 25 ${height-35} L 25 ${height-25} L 35 ${height-25}" fill="none" stroke="${theme.stroke}" stroke-width="2"/>
  <path d="M ${width-25} ${height-35} L ${width-25} ${height-25} L ${width-35} ${height-25}" fill="none" stroke="${theme.stroke}" stroke-width="2"/>

  <!-- Footer Navigation Info -->
  <text x="35" y="${height - 14}" class="mono-hud" fill="#64748b">INTERACTIVE 3D PROJECTION ENGINE // OPERATED BY GITHUB ACTIONS</text>
  <text x="${width - 240}" y="${height - 14}" class="mono-hud" fill="${theme.stroke}">CLICK CONTROLS BELOW TO ROTATE ↓</text>
</svg>`;
}

export function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return {
    model: 'e36',
    yaw: 45,
    pitch: 20,
    theme: 'cyan',
    lastOperator: 'ikerperez12',
    lastAction: 'INITIAL_BOOT',
    totalInteractions: 1,
    timestamp: new Date().toISOString()
  };
}

export function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function generateAll(state) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const svg = renderInteractiveViewportSVG(state);
  fs.writeFileSync(path.join(ASSETS_DIR, 'interactive-viewport.svg'), svg);
  console.log('[Engine] Generated assets/interactive-viewport.svg');
}

// CLI handler
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let state = loadState();

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--command' && args[i+1]) {
      const cmdStr = args[i+1];
      const parts = cmdStr.split('|');
      if (parts[1] === 'rotate_left') state.yaw = (state.yaw - 45 + 360) % 360;
      if (parts[1] === 'rotate_right') state.yaw = (state.yaw + 45) % 360;
      if (parts[1] === 'pitch_up') state.pitch = Math.min(75, state.pitch + 20);
      if (parts[1] === 'pitch_down') state.pitch = Math.max(-75, state.pitch - 20);
      if (parts[1] === 'model' && parts[2] && MODELS[parts[2]]) state.model = parts[2];
      if (parts[1] === 'theme' && parts[2] && THEMES[parts[2]]) state.theme = parts[2];
      if (parts[1] === 'reset') { state.yaw = 45; state.pitch = 20; state.model = 'e36'; state.theme = 'cyan'; }
      
      state.lastAction = parts.slice(1).join('_').toUpperCase();
    }
    if (args[i] === '--user' && args[i+1]) {
      state.lastOperator = args[i+1];
      state.totalInteractions = (state.totalInteractions || 0) + 1;
      state.timestamp = new Date().toISOString();
    }
  }

  saveState(state);
  generateAll(state);
}
