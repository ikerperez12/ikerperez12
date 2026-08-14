import os
import math
from PIL import Image, ImageDraw, ImageFont

THUMBS_DIR = r"C:\Users\ijpg1\Documents\antigravity\ikerperez12\assets\thumbs"
os.makedirs(THUMBS_DIR, exist_ok=True)

def render_so_shell():
    # Ultra-realistic C UNIX Terminal
    w, h = 640, 360
    img = Image.new("RGBA", (w, h), "#0a0d14")
    draw = ImageDraw.Draw(img)

    # Window header
    draw.rounded_rectangle([(0, 0), (w, h)], radius=12, fill="#070a10", outline="#1e293b", width=2)
    draw.rounded_rectangle([(0, 0), (w, 38)], radius=12, fill="#0f172a")
    draw.line([(0, 38), (w, 38)], fill="#334155", width=1)
    
    # Window dots
    draw.ellipse([(18, 14), (28, 24)], fill="#ef4444")
    draw.ellipse([(36, 14), (46, 24)], fill="#f59e0b")
    draw.ellipse([(54, 14), (64, 24)], fill="#10b981")
    draw.text((80, 12), "iker@archlinux: ~/so-shell-p2 (c-unix)", fill="#94a3b8")

    # Terminal output
    lines = [
        ("$ make && ./so-shell --interactive", "#f8fafc"),
        ("[CC] gcc -Wall -Wextra -O2 -c shell.c sys_process.c mem_arena.c", "#64748b"),
        ("[LD] linking elf binary: so-shell [POSIX 2024 compliance]", "#38bdf8"),
        ("=== SO-SHELL v2.4 (PID 8192) // PROCESS ENGINE ONLINE ===", "#4ade80"),
        ("so-shell> cat /proc/cpuinfo | grep 'model name' | wc -l > cpu.count &", "#c2a4ff"),
        ("[fork:spawn] child_pid=8193 status=RUNNING pgid=8192", "#94a3b8"),
        ("[pipe:dup2] fd[3] -> fd[1] redirect stdout to pipeline filter", "#fb8dff"),
        ("[signal] SIGCHLD handler reaped PID 8193 with exit code 0", "#4ade80"),
        ("so-shell> mem_arena_stats --verbose", "#f8fafc"),
        ("  arena_pool: 64 MB allocated (0 heap fragmentation / page aligned)", "#38bdf8"),
        ("so-shell> _", "#38bdf8")
    ]

    y = 52
    for text, color in lines:
        draw.text((22, y), text, fill=color)
        y += 24

    img.save(os.path.join(THUMBS_DIR, "so-shell.png"), "PNG", optimize=True)
    print("Generated so-shell.png")

def render_blender_tool():
    # PySide6 Blender 3D Tooling Suite
    w, h = 640, 360
    img = Image.new("RGBA", (w, h), "#0d1117")
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([(0, 0), (w, h)], radius=12, fill="#0b0f19", outline="#1e293b", width=2)
    draw.rounded_rectangle([(0, 0), (w, 38)], radius=12, fill="#161e2e")
    draw.line([(0, 38), (w, 38)], fill="#334155", width=1)
    
    draw.ellipse([(18, 14), (28, 24)], fill="#ef4444")
    draw.ellipse([(36, 14), (46, 24)], fill="#f59e0b")
    draw.ellipse([(54, 14), (64, 24)], fill="#10b981")
    draw.text((80, 12), "PySide6 // Blender Asset Pipeline & Mesh LOD Engine", fill="#c2a4ff")

    # Left sidebar panel
    draw.rectangle([(15, 50), (180, h - 15)], fill="#111827", outline="#1f2937", width=1)
    draw.text((25, 60), "SCENE HIERARCHY", fill="#38bdf8")
    draw.text((25, 85), "▼ Chassis_E36_LOD0", fill="#f8fafc")
    draw.text((35, 105), "• Wheel_FL_Mesh", fill="#94a3b8")
    draw.text((35, 125), "• Wheel_FR_Mesh", fill="#94a3b8")
    draw.text((35, 145), "• Carbon_Hood_PBR", fill="#94a3b8")
    draw.text((25, 175), "▼ Batch Actions", fill="#38bdf8")
    draw.rectangle([(25, 200), (165, 225)], fill="#1e293b", outline="#38bdf8", width=1)
    draw.text((35, 206), "► Auto-Clean UVs", fill="#4ade80")
    draw.rectangle([(25, 235), (165, 260)], fill="#1e293b", outline="#fb8dff", width=1)
    draw.text((35, 241), "► Export GLTF 2.0", fill="#fb8dff")

    # Center 3D viewport wireframe
    draw.rectangle([(195, 50), (w - 15, h - 15)], fill="#070a12", outline="#1f2937", width=1)
    # Isometric 3D wireframe car / geometry
    cx, cy = 410, 190
    pts = [
        (cx - 150, cy + 30), (cx - 70, cy - 50), (cx + 100, cy - 60),
        (cx + 160, cy + 10), (cx + 80, cy + 80), (cx - 110, cy + 80)
    ]
    draw.polygon(pts, outline="#38bdf8", fill=(56, 189, 248, 25))
    draw.line([(cx - 70, cy - 50), (cx - 110, cy + 80)], fill="#c2a4ff", width=1)
    draw.line([(cx + 100, cy - 60), (cx + 80, cy + 80)], fill="#c2a4ff", width=1)
    draw.ellipse([(cx - 110, cy + 60), (cx - 60, cy + 110)], outline="#fb8dff", width=2)
    draw.ellipse([(cx + 60, cy + 60), (cx + 110, cy + 110)], outline="#fb8dff", width=2)
    draw.text((210, 60), "VIEWPORT: SHADED WIREFRAME (60 FPS)", fill="#4ade80")
    draw.text((210, h - 35), "Verts: 24,180 | Tris: 46,290 | PBR Materials: 6", fill="#94a3b8")

    img.save(os.path.join(THUMBS_DIR, "blender-tool.png"), "PNG", optimize=True)
    print("Generated blender-tool.png")

def render_aurasynth():
    # Web Audio DSP Synthesizer UI
    w, h = 640, 360
    img = Image.new("RGBA", (w, h), "#08060c")
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([(0, 0), (w, h)], radius=12, fill="#0c0a12", outline="#241a38", width=2)
    draw.rounded_rectangle([(0, 0), (w, 38)], radius=12, fill="#171226")
    draw.line([(0, 38), (w, 38)], fill="#362952", width=1)
    
    draw.ellipse([(18, 14), (28, 24)], fill="#ef4444")
    draw.ellipse([(36, 14), (46, 24)], fill="#f59e0b")
    draw.ellipse([(54, 14), (64, 24)], fill="#10b981")
    draw.text((80, 12), "AURASYNTH // Modular Web Audio API DSP Synthesizer", fill="#fb8dff")

    # Oscilloscope display area
    draw.rectangle([(20, 50), (w - 20, 190)], fill="#050308", outline="#fb8dff", width=1)
    # Sine wave modulation
    prev_pt = (20, 120)
    for x in range(20, w - 20, 3):
        y = 120 + int(math.sin((x - 20) * 0.05) * 40 + math.sin((x - 20) * 0.12) * 22)
        draw.line([prev_pt, (x, y)], fill="#fb8dff", width=2)
        prev_pt = (x, y)
    
    draw.text((35, 60), "MASTER OSCILLOSCOPE (44.1 kHz 32-bit float)", fill="#c2a4ff")
    draw.text((w - 210, 60), "FILTER: 24dB LADDER LOWPASS", fill="#4ade80")

    # Control Dials row
    controls = [
        ("OSC 1: SAW", "#38bdf8", 40),
        ("OSC 2: SINE", "#c2a4ff", 160),
        ("CUTOFF: 2.4k", "#fb8dff", 280),
        ("RESONANCE", "#4ade80", 400),
        ("LFO MOD", "#f59e0b", 520)
    ]
    for label, col, cx in controls:
        draw.ellipse([(cx, 220), (cx + 60, 280)], outline=col, width=2, fill="#130e20")
        draw.line([(cx + 30, 250), (cx + 45, 230)], fill=col, width=2)
        draw.text((cx - 5, 295), label, fill="#f8fafc")

    img.save(os.path.join(THUMBS_DIR, "aurasynth.png"), "PNG", optimize=True)
    print("Generated aurasynth.png")

def render_signal_nn():
    # Python DSP & Neural Spectrogram Dashboard
    w, h = 640, 360
    img = Image.new("RGBA", (w, h), "#060a0f")
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([(0, 0), (w, h)], radius=12, fill="#080e17", outline="#17283c", width=2)
    draw.rounded_rectangle([(0, 0), (w, 38)], radius=12, fill="#111d2e")
    draw.line([(0, 38), (w, 38)], fill="#1e3a5f", width=1)
    
    draw.ellipse([(18, 14), (28, 24)], fill="#ef4444")
    draw.ellipse([(36, 14), (46, 24)], fill="#f59e0b")
    draw.ellipse([(54, 14), (64, 24)], fill="#10b981")
    draw.text((80, 12), "SIGNAL-NEURAL // Spectral DSP & Recurrent Neural Models", fill="#4ade80")

    # Left Spectrogram
    draw.rectangle([(20, 50), (320, 250)], fill="#04070c", outline="#38bdf8", width=1)
    draw.text((30, 60), "SPECTRAL FFT WATERFALL (0-20kHz)", fill="#38bdf8")
    for i in range(15):
        y = 90 + i * 10
        for j in range(25):
            x = 35 + j * 11
            val = int((math.sin(i * 0.4 + j * 0.3) + 1) * 127)
            col = (val, int(val * 0.8), 255 - val)
            draw.rectangle([(x, y), (x + 9, y + 8)], fill=col)

    # Right Training Curves
    draw.rectangle([(340, 50), (w - 20, 250)], fill="#04070c", outline="#4ade80", width=1)
    draw.text((350, 60), "RECURRENT MODEL LOSS (MSE)", fill="#4ade80")
    # Loss curve
    prev_pt = (360, 210)
    for x in range(360, w - 40, 10):
        t = (x - 360) / (w - 400)
        y = int(210 - (1 - math.exp(-t * 3)) * 110)
        draw.line([prev_pt, (x, y)], fill="#4ade80", width=2)
        prev_pt = (x, y)
    draw.text((360, 110), "Epoch 100/100 | Val Loss: 0.0024", fill="#f8fafc")

    # Footer metrics
    draw.text((25, 275), "Architecture: Bi-LSTM + Transformer Head | Signal DSP: FFT + Wavelets | PyTorch", fill="#94a3b8")
    draw.text((25, 305), "[STATUS: CONVERGED • INFERENCE: 1.2ms / frame]", fill="#4ade80")

    img.save(os.path.join(THUMBS_DIR, "signal-nn.png"), "PNG", optimize=True)
    print("Generated signal-nn.png")

def render_software_design():
    # Enterprise Architecture UML & SOLID Blueprint
    w, h = 640, 360
    img = Image.new("RGBA", (w, h), "#0a0710")
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([(0, 0), (w, h)], radius=12, fill="#0d0a14", outline="#281d38", width=2)
    draw.rounded_rectangle([(0, 0), (w, 38)], radius=12, fill="#191328")
    draw.line([(0, 38), (w, 38)], fill="#3c2a55", width=1)
    
    draw.ellipse([(18, 14), (28, 24)], fill="#ef4444")
    draw.ellipse([(36, 14), (46, 24)], fill="#f59e0b")
    draw.ellipse([(54, 14), (64, 24)], fill="#10b981")
    draw.text((80, 12), "Software-Design // Enterprise Clean Architecture & SOLID", fill="#c2a4ff")

    # Architecture Blueprint Layers
    layers = [
        ("DOMAIN ENTITIES & RULES (Core Java)", "#38bdf8", 55),
        ("USE CASES & INTERACTORS (Application Service)", "#4ade80", 120),
        ("INTERFACE ADAPTERS (Controllers / Presenters)", "#c2a4ff", 185),
        ("INFRASTRUCTURE & FRAMEWORKS (Persistence / HTTP)", "#fb8dff", 250)
    ]
    for title, col, y in layers:
        draw.rounded_rectangle([(25, y), (w - 25, y + 50)], radius=8, fill="#130f1e", outline=col, width=2)
        draw.text((40, y + 15), title, fill=col)
        draw.rectangle([(w - 180, y + 12), (w - 40, y + 38)], fill="#1f1830", outline=col, width=1)
        draw.text((w - 170, y + 17), "[DEPENDENCY -> IN]", fill="#f8fafc")

    draw.text((25, 320), "Design Patterns: Factory, Strategy, Observer, Decorator | Clean Code Certified", fill="#94a3b8")

    img.save(os.path.join(THUMBS_DIR, "software-design.png"), "PNG", optimize=True)
    print("Generated software-design.png")

render_so_shell()
render_blender_tool()
render_aurasynth()
render_signal_nn()
render_software_design()
