import os
import urllib.request
import json
from PIL import Image, ImageOps, ImageDraw

OUTPUT_DIR = r"C:\Users\ijpg1\Documents\antigravity\ikerperez12\assets\thumbs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TARGET_SIZE = (800, 450)

# Local sources & remote URLs
SOURCES = {
    "nexoip": {
        "local": r"C:\Users\ijpg1\Documents\antigravity\quick-hypatia\.github\assets\nexoip-3d-viewer.png",
        "url": "https://raw.githubusercontent.com/ikerperez12/NexoIP-3D-Viewer/main/.github/assets/nexoip-3d-viewer.png"
    },
    "ip-os": {
        "url": "https://raw.githubusercontent.com/ikerperez12/IP-OS-LINUX/main/.github/assets/ip-linux-hero.png"
    },
    "e36": {
        "url": "https://e36.vercel.app/assets/screenshots/desktop-scene-02.png"
    },
    "warpod": {
        "local": r"C:\Users\ijpg1\projects\WARP\FONDOS\Proyecto_Purpura\.github\assets\warpod-hero.png",
        "url": "https://raw.githubusercontent.com/ikerperez12/warpod/main/.github/assets/warpod-hero.png"
    },
    "easy-localhost": {
        "url": "https://github.com/ikerperez12/EASY-LOCALHOST/releases/download/v3.0.0/preview-v3.png"
    }
}

def fetch_image(name, config):
    local_path = config.get("local")
    if local_path and os.path.exists(local_path):
        print(f"Loading local {name} from {local_path}")
        return Image.open(local_path).convert("RGBA")
    
    url = config.get("url")
    if url:
        print(f"Downloading {name} from {url}")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                from io import BytesIO
                return Image.open(BytesIO(response.read())).convert("RGBA")
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
    return None

def create_pqc_card():
    # Procedural crisp graphic for QuantumGuard Post-Quantum Cryptography Lab
    img = Image.new("RGBA", TARGET_SIZE, (10, 15, 24, 255))
    draw = ImageDraw.Draw(img)
    
    # Grid lines
    for x in range(0, 800, 40):
        draw.line([(x, 0), (x, 450)], fill=(20, 30, 45, 255), width=1)
    for y in range(0, 450, 40):
        draw.line([(0, y), (800, y)], fill=(20, 30, 45, 255), width=1)
    
    # HUD Border & Framing
    draw.rounded_rectangle([(30, 30), (770, 420)], radius=12, outline=(16, 185, 129, 200), width=2)
    
    # Tech labels & HUD lines
    draw.text((50, 50), "QUANTUMGUARD CONSOLE // POST-QUANTUM CRYPTOGRAPHY LAB", fill=(52, 211, 153, 255))
    draw.text((50, 80), "PROTOCOL: OQS (Open Quantum Safe) Hybrid / Kyber-1024 / Dilithium-5", fill=(148, 163, 184, 255))
    
    # Draw simulated oscilloscope waveform (emerald green)
    import math
    points = []
    for x in range(50, 750, 3):
        norm_x = (x - 50) / 700.0
        y = 260 + math.sin(norm_x * 25) * 45 * math.sin(norm_x * 3) + math.cos(norm_x * 50) * 15
        points.append((x, y))
    
    for i in range(len(points) - 1):
        draw.line([points[i], points[i+1]], fill=(16, 185, 129, 255), width=3)
    
    draw.text((50, 380), "LIVE TELEMETRY: 60 FPS SIDE-CHANNEL ATTACK EMULATION // MTU ANALYSIS", fill=(16, 185, 129, 220))
    return img

def create_ui_toolkit_card():
    # Procedural crisp graphic for UI IP Toolkit
    img = Image.new("RGBA", TARGET_SIZE, (15, 15, 22, 255))
    draw = ImageDraw.Draw(img)
    
    for x in range(0, 800, 30):
        draw.line([(x, 0), (x, 450)], fill=(25, 25, 38, 255), width=1)
    for y in range(0, 450, 30):
        draw.line([(0, y), (800, y)], fill=(25, 25, 38, 255), width=1)
        
    draw.rounded_rectangle([(30, 30), (770, 420)], radius=12, outline=(129, 140, 248, 200), width=2)
    draw.text((50, 50), "UI IP TOOLKIT v4.0 // MODULAR DESIGN & COMPONENT SYSTEM", fill=(165, 180, 252, 255))
    draw.text((50, 80), "ZERO-DEPENDENCY PRECISION CSS // HIGH-PERFORMANCE UI PRIMITIVES", fill=(148, 163, 184, 255))
    
    # Draw mock UI component boxes
    draw.rounded_rectangle([(60, 130), (270, 350)], radius=8, outline=(99, 102, 241, 180), fill=(20, 20, 35, 255), width=1)
    draw.text((80, 150), "Button Matrix", fill=(255, 255, 255, 255))
    draw.rounded_rectangle([(80, 180), (250, 215)], radius=4, fill=(99, 102, 241, 255))
    draw.text((105, 190), "Primary Action", fill=(255, 255, 255, 255))
    draw.rounded_rectangle([(80, 230), (250, 265)], radius=4, outline=(99, 102, 241, 255), fill=(0, 0, 0, 0))
    draw.text((105, 240), "Outline Ghost", fill=(165, 180, 252, 255))
    
    draw.rounded_rectangle([(300, 130), (740, 350)], radius=8, outline=(99, 102, 241, 180), fill=(20, 20, 35, 255), width=1)
    draw.text((320, 150), "Dynamic Data Grid // Glassmorphism Theme Layer", fill=(255, 255, 255, 255))
    draw.rounded_rectangle([(320, 190), (720, 320)], radius=6, fill=(10, 12, 22, 255), outline=(60, 65, 90, 255))
    draw.text((340, 210), "$ token init --palette deep-indigo --a11y-contrast strict", fill=(129, 140, 248, 255))
    draw.text((340, 240), "[✓] CSS variables registered: 142 tokens", fill=(52, 211, 153, 255))
    draw.text((340, 270), "[✓] WCAG AAA Color Ratio Verified (21:1 on void)", fill=(52, 211, 153, 255))
    
    return img

def process_and_save(img, name):
    # Fit into 800x450 preserving aspect ratio with dark background padding
    img = ImageOps.contain(img, TARGET_SIZE, Image.Resampling.LANCZOS)
    bg = Image.new("RGBA", TARGET_SIZE, (10, 13, 18, 255))
    
    # Paste centered
    offset_x = (TARGET_SIZE[0] - img.width) // 2
    offset_y = (TARGET_SIZE[1] - img.height) // 2
    bg.paste(img, (offset_x, offset_y), img)
    
    # Save optimized WebP and PNG
    out_png = os.path.join(OUTPUT_DIR, f"{name}.png")
    out_webp = os.path.join(OUTPUT_DIR, f"{name}.webp")
    
    bg.save(out_png, "PNG", optimize=True)
    bg.save(out_webp, "WEBP", quality=85, method=6)
    print(f"Saved {name}: {os.path.getsize(out_png)//1024} KB (PNG), {os.path.getsize(out_webp)//1024} KB (WebP)")

def main():
    for name, config in SOURCES.items():
        img = fetch_image(name, config)
        if img:
            process_and_save(img, name)
        else:
            print(f"Could not load image for {name}")
            
    # Generate procedural cards for PQC and UI Toolkit
    pqc_img = create_pqc_card()
    process_and_save(pqc_img, "pqc")
    
    ui_img = create_ui_toolkit_card()
    process_and_save(ui_img, "ui-toolkit")

if __name__ == "__main__":
    main()
