import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const STATE_FILE = path.join(ROOT_DIR, 'state_3d.json');

// 3D MODELS DEFINITIONS (Vertices & Edges)
const MODELS = {
  // 1. NEXO TESSERACT (Hypercube)
  tesseract: {
    name: "NEXO TESSERACT 4D",
    vertices: [
      // Inner cube
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      // Outer cube
      [-2, -2, -2], [2, -2, -2], [2, 2, -2], [-2, 2, -2],
      [-2, -2, 2], [2, -2, 2], [2, 2, 2], [-2, 2, 2]
    ],
    edges: [
      // Inner cube edges
      [0,1], [1,2], [2,3], [3,0], [4,5], [5,6], [6,7], [7,4], [0,4], [1,5], [2,6], [3,7],
      // Outer cube edges
      [8,9], [9,10], [10,11], [11,8], [12,13], [13,14], [14,15], [15,12], [8,12], [9,13], [10,14], [11,15],
      // Connecting struts
      [0,8], [1,9], [2,10], [3,11], [4,12], [5,13], [6,14], [7,15]
    ],
    scale: 32
  },

  // 2. BMW E36 CHASSIS WIREFRAME
  e36: {
    name: "BMW E36 318is COUPE",
    vertices: [
      // Base / Wheelbase
      [-3.2, 0.8, -1.3], [3.2, 0.8, -1.3], [3.2, 0.8, 1.3], [-3.2, 0.8, 1.3],
      // Beltline / Hood
      [-3.4, 0.0, -1.25], [-1.2, -0.2, -1.25], [1.8, -0.1, -1.25], [3.3, 0.1, -1.25],
      [-3.4, 0.0, 1.25], [-1.2, -0.2, 1.25], [1.8, -0.1, 1.25], [3.3, 0.1, 1.25],
      // Roof / Cabin
      [-1.0, -1.2, -0.95], [0.9, -1.2, -0.95],
      [-1.0, -1.2, 0.95], [0.9, -1.2, 0.95],
      // Wheels
      [-2.1, 0.8, -1.35], [2.1, 0.8, -1.35],
      [-2.1, 0.8, 1.35], [2.1, 0.8, 1.35]
    ],
    edges: [
      // Chassis lower loop
      [0,1], [1,2], [2,3], [3,0],
      // Beltline
      [4,5], [5,6], [6,7], [8,9], [9,10], [10,11],
      [4,8], [5,9], [6,10], [7,11],
      // Pillars to base
      [0,4], [1,7], [2,11], [3,8],
      // Windshield & Roof
      [5,12], [9,14], [6,13], [10,15],
      [12,13], [14,15], [12,14], [13,15],
      // Wheels / Accents
      [16,0], [16,4], [17,1], [17,7], [18,3], [18,8], [19,2], [19,11]
    ],
    scale: 35
  },

  // 3. QUANTUM ICOSAHEDRON (Polyhedral Diamond)
  quantum: {
    name: "QUANTUMGUARD ICOSAHEDRON",
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
    scale: 48
  }
};

const THEMES = {
  cyan: {
    name: "CYAN_PHOSPHOR",
    stroke: "#00f0ff",
    glow: "rgba(0, 240, 255, 0.4)",
    vertex: "#ffffff",
    bg: "#06090e",
    border: "#1a2333"
  },
  emerald: {
    name: "MATRIX_EMERALD",
    stroke: "#10b981",
    glow: "rgba(16, 185, 129, 0.4)",
    vertex: "#34d399",
    bg: "#040d0a",
    border: "#13382c"
  },
  amber: {
    name: "AMBER_RETRO",
    stroke: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.4)",
    vertex: "#fde68a",
    bg: "#0d0904",
    border: "#382713"
  },
  violet: {
    name: "HYPER_VIOLET",
    stroke: "#818cf8",
    glow: "rgba(129, 140, 248, 0.4)",
    vertex: "#c7d2fe",
    bg: "#080711",
    border: "#231f42"
  }
};

// Vector Rotation & 3D Projection Math
function rotatePoint(point, yawDeg, pitchDeg) {
  const radX = (pitchDeg * Math.PI) / 180;
  const radY = (yawDeg * Math.PI) / 180;

  let [x, y, z] = point;

  // Rotate around Y axis (Yaw)
  const x1 = x * Math.cos(radY) + z * Math.sin(radY);
  const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

  // Rotate around X axis (Pitch)
  const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
  const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

  return [x1, y2, z2];
}

function projectPoint(point3d, width, height, scale, fov = 300) {
  const [x, y, z] = point3d;
  // Perspective projection
  const distance = 8;
  const sz = z + distance;
  const factor = fov / (sz > 0.1 ? sz : 0.1);

  const projX = width / 2 + x * factor * (scale / 40);
  const projY = height / 2 + y * factor * (scale / 40);

  return [projX, projY, z];
}

function render3DViewportSVG(state) {
  const width = 960;
  const height = 380;
  const modelKey = state.model in MODELS ? state.model : 'e36';
  const themeKey = state.theme in THEMES ? state.theme : 'cyan';
  const model = MODELS[modelKey];
  const theme = THEMES[themeKey];

  // Rotate and project all vertices
  const projected = model.vertices.map(v => {
    const rot = rotatePoint(v, state.yaw, state.pitch);
    return projectPoint(rot, width, height + 10, model.scale);
  });

  // Sort edges by average Z depth for correct rendering hierarchy
  const edgesWithDepth = model.edges.map(e => {
    const p1 = projected[e[0]];
    const p2 = projected[e[1]];
    const avgZ = (p1[2] + p2[2]) / 2;
    return { e, p1, p2, avgZ };
  });

  edgesWithDepth.sort((a, b) => a.avgZ - b.avgZ);

  let edgesSvg = '';
  edgesWithDepth.forEach(edge => {
    const alpha = Math.min(1, Math.max(0.2, (edge.avgZ + 4) / 8));
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
      .vp-title {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.08em;
      }
      .vp-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px;
        font-weight: 600;
      }
      .vp-hud {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        letter-spacing: 0.05em;
      }
    </style>
  </defs>

  <!-- Viewport Base Canvas -->
  <rect width="${width}" height="${height}" rx="12" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1.5"/>
  
  <!-- Viewport Grid & Crosshair Accents -->
  <line x1="${width/2}" y1="40" x2="${width/2}" y2="${height - 20}" stroke="${theme.border}" stroke-width="0.8" stroke-dasharray="4 4"/>
  <line x1="30" y1="${height/2 + 10}" x2="${width - 30}" y2="${height/2 + 10}" stroke="${theme.border}" stroke-width="0.8" stroke-dasharray="4 4"/>
  <circle cx="${width/2}" cy="${height/2 + 10}" r="120" fill="none" stroke="${theme.border}" stroke-width="0.5" stroke-dasharray="2 6"/>

  <!-- Top System Header Bar -->
  <path d="M 0 12 Q 0 0 12 0 L ${width-12} 0 Q ${width} 0 ${width} 12 L ${width} 38 L 0 38 Z" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/>
  
  <circle cx="25" cy="19" r="4.5" fill="${theme.stroke}"/>
  <text x="38" y="23" class="vp-title" fill="#f8fafc">NEXO-IP // LIVING 3D VIEWPORT ENGINE</text>
  <text x="440" y="23" class="vp-label" fill="${theme.stroke}">MODEL: ${model.name}</text>
  <text x="750" y="23" class="vp-hud" fill="#94a3b8">RENDER: GPU WIREFRAME (60 FPS)</text>

  <!-- Real-Time Camera Telemetry Overlay -->
  <g transform="translate(30, 60)" class="vp-hud" fill="#94a3b8">
    <rect width="180" height="75" rx="6" fill="${theme.bg}" stroke="${theme.border}" stroke-width="0.8" fill-opacity="0.85"/>
    <text x="12" y="20" fill="${theme.stroke}" font-weight="700">CAMERA MATRIX</text>
    <text x="12" y="38">YAW: <tspan fill="#f8fafc" font-weight="700">${state.yaw}°</tspan></text>
    <text x="12" y="54">PITCH: <tspan fill="#f8fafc" font-weight="700">${state.pitch}°</tspan></text>
    <text x="12" y="68">VERTICES: <tspan fill="#f8fafc">${model.vertices.length}</tspan> | EDGES: <tspan fill="#f8fafc">${model.edges.length}</tspan></text>
  </g>

  <!-- Operator State Stamp -->
  <g transform="translate(${width - 230}, 60)" class="vp-hud" fill="#94a3b8">
    <rect width="200" height="75" rx="6" fill="${theme.bg}" stroke="${theme.border}" stroke-width="0.8" fill-opacity="0.85"/>
    <text x="12" y="20" fill="${theme.stroke}" font-weight="700">COMMUNITY OPERATOR</text>
    <text x="12" y="38">OPERATOR: <tspan fill="#f8fafc" font-weight="700">@${state.lastOperator || 'ikerperez12'}</tspan></text>
    <text x="12" y="54">ACTION: <tspan fill="#f8fafc">${state.lastAction || 'rotate'}</tspan></text>
    <text x="12" y="68">TOTAL CYCLES: <tspan fill="${theme.stroke}">${state.totalInteractions || 1}</tspan></text>
  </g>

  <!-- 3D Rendered Wireframe Geometry -->
  <g filter="url(#glow3d)">
    ${edgesSvg}
    ${verticesSvg}
  </g>

  <!-- Viewport Corner Brackets -->
  <path d="M 20 50 L 20 40 L 30 40" fill="none" stroke="${theme.stroke}" stroke-width="2"/>
  <path d="M ${width-20} 50 L ${width-20} 40 L ${width-30} 40" fill="none" stroke="${theme.stroke}" stroke-width="2"/>
  <path d="M 20 ${height-30} L 20 ${height-20} L 30 ${height-20}" fill="none" stroke="${theme.stroke}" stroke-width="2"/>
  <path d="M ${width-20} ${height-30} L ${width-20} ${height-20} L ${width-30} ${height-20}" fill="none" stroke="${theme.stroke}" stroke-width="2"/>

  <!-- Footer Navigation Info -->
  <text x="30" y="${height - 12}" class="vp-hud" fill="#64748b">3D PROJECTION: ORTHO-PERSPECTIVE // DRIVEN BY GITHUB ACTIONS CI/CD</text>
  <text x="${width - 250}" y="${height - 12}" class="vp-hud" fill="${theme.stroke}">INTERACT VIA ISSUES BELOW ↓</text>
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
  const svg = render3DViewportSVG(state);
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
      // e.g. nexo3d|rotate_left OR nexo3d|model|tesseract OR nexo3d|theme|emerald
      if (parts[1] === 'rotate_left') state.yaw = (state.yaw - 45 + 360) % 360;
      if (parts[1] === 'rotate_right') state.yaw = (state.yaw + 45) % 360;
      if (parts[1] === 'pitch_up') state.pitch = Math.min(80, state.pitch + 20);
      if (parts[1] === 'pitch_down') state.pitch = Math.max(-80, state.pitch - 20);
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
