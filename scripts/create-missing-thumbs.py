import os
from PIL import Image, ImageDraw, ImageFont

THUMBS_DIR = r"C:\Users\ijpg1\Documents\antigravity\ikerperez12\assets\thumbs"
os.makedirs(THUMBS_DIR, exist_ok=True)

def create_preview_card(filename, title, subtitle, tag, color_accent, bg_color="#070a0f"):
    width, height = 640, 360
    img = Image.new("RGBA", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Subtle grid background
    grid_spacing = 24
    for x in range(0, width, grid_spacing):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 10), width=1)
    for y in range(0, height, grid_spacing):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 10), width=1)

    # Outer border with accent glow
    draw.rounded_rectangle([(10, 10), (width - 10, height - 10)], radius=12, outline=color_accent, width=2)
    
    # Top window bar
    draw.rounded_rectangle([(12, 12), (width - 12, 48)], radius=10, fill=(15, 22, 33, 255))
    draw.line([(12, 48), (width - 12, 48)], fill=color_accent, width=1)
    
    # Window buttons
    draw.ellipse([(28, 24), (38, 34)], fill=(239, 68, 68, 255))
    draw.ellipse([(46, 24), (56, 34)], fill=(245, 158, 11, 255))
    draw.ellipse([(64, 24), (74, 34)], fill=(16, 185, 129, 255))
    
    # Header tag
    draw.rectangle([(width - 190, 20), (width - 25, 40)], fill=(0, 0, 0, 120), outline=color_accent, width=1)

    # Mock content based on project type
    if "SHELL" in title:
        # Terminal lines
        draw.text((40, 75), "$ ./so-shell --sandbox", fill=(255, 255, 255, 255))
        draw.text((40, 105), "[kernel] fork() PID 4120 -> spawn isolated child", fill=(100, 240, 150, 255))
        draw.text((40, 135), "[io] dup2() stdout -> pipe[1] (FD 3 redirect)", fill=(148, 163, 184, 255))
        draw.text((40, 165), "[exec] execve(/bin/posix_runtime, args, env)", fill=(0, 240, 255, 255))
        draw.text((40, 195), "[mem] arena_alloc(0x4000) -> OK [0 errors]", fill=(245, 158, 11, 255))
        draw.text((40, 230), "$ status: POSIX C SYSTEM READY", fill=(16, 185, 129, 255))
    elif "BLENDER" in title:
        # 3D viewport wireframe mesh
        pts = [(320, 100), (460, 170), (320, 250), (180, 170)]
        draw.polygon(pts, outline=color_accent, fill=(0, 240, 255, 20))
        draw.line([(320, 100), (320, 250)], fill=color_accent, width=2)
        draw.line([(180, 170), (460, 170)], fill=color_accent, width=2)
        draw.text((40, 280), "PySide6 // Blender Asset Validation & Export Engine", fill=(255, 255, 255, 255))
    elif "SYNTH" in title:
        # Audio Waveform
        import math
        prev_pt = (40, 180)
        for x in range(40, width - 40, 4):
            y = 180 + int(math.sin((x - 40) * 0.08) * 45 + math.cos((x - 40) * 0.16) * 25)
            draw.line([prev_pt, (x, y)], fill=color_accent, width=3)
            prev_pt = (x, y)
        draw.text((40, 280), "AURASYNTH // Web Audio API DSP Real-Time Oscillator", fill=(255, 255, 255, 255))
    elif "SIGNAL" in title:
        # Neural Spectrogram
        draw.rectangle([(40, 80), (width - 40, 240)], outline=color_accent, width=1)
        for i in range(12):
            x = 60 + i * 44
            h = 40 + (i * 17) % 110
            draw.rectangle([(x, 230 - h), (x + 28, 230)], fill=color_accent)
        draw.text((40, 280), "DSP Spectral Analysis & Recurrent Neural Models", fill=(255, 255, 255, 255))
    elif "DESIGN" in title:
        # Architecture UML Nodes
        draw.rectangle([(60, 90), (220, 150)], outline=color_accent, width=2, fill=(15, 23, 42, 255))
        draw.rectangle([(400, 90), (560, 150)], outline=color_accent, width=2, fill=(15, 23, 42, 255))
        draw.rectangle([(230, 190), (390, 250)], outline=(16, 185, 129), width=2, fill=(15, 23, 42, 255))
        draw.line([(220, 120), (400, 120)], fill=color_accent, width=2)
        draw.line([(310, 120), (310, 190)], fill=(16, 185, 129), width=2)
        draw.text((40, 280), "Enterprise Software Architecture // SOLID Design Patterns", fill=(255, 255, 255, 255))
    else:
        draw.text((40, 150), title, fill=(255, 255, 255, 255))
        draw.text((40, 190), subtitle, fill=(148, 163, 184, 255))

    out_path = os.path.join(THUMBS_DIR, filename)
    img.save(out_path, "PNG", optimize=True)
    print(f"Generated {out_path}")

create_preview_card("so-shell.png", "SO-SHELL-p2", "POSIX C UNIX Shell", "C / POSIX", (56, 189, 248))
create_preview_card("blender-tool.png", "BLENDER-TOOL", "PySide6 3D Tooling", "Python / 3D", (194, 164, 255))
create_preview_card("aurasynth.png", "AURASYNTH", "Web Audio DSP Synthesizer", "Web Audio", (251, 141, 255))
create_preview_card("signal-nn.png", "SIGNAL-NEURALNETWORK", "DSP Spectral & RNN", "Python / AI", (74, 222, 128))
create_preview_card("software-design.png", "Software-Design", "Enterprise Architecture", "Java / SOLID", (245, 158, 11))
