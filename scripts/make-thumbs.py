"""Build the gallery thumbnails from each project's own published screenshots.

Sources are the images already committed in the projects' repositories (or
served by their live deployments), so the gallery shows the real products rather
than mock-ups. Output is WebP at twice the display width, which is the smallest
format that still looks right on a high-density screen.
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "_src")
OUT = os.path.join(HERE, "..", ".github", "assets")

WIDTH = 560          # 2x the ~280px a three-column cell gets on GitHub
ASPECT = 16 / 10
QUALITY = 74

# name -> (source file, vertical crop anchor)
JOBS = {
    "p-nexoip": ("nexoip.png", "center"),
    "p-iplinux": ("iplinux.png", "top"),
    "p-toolkit": ("toolkit.png", "top"),
    "p-e36": ("e36.png", "center"),
    "p-warpod": ("warpod.png", "center"),
    "p-easylocalhost": ("easylocalhost.png", "top"),
}


def crop_to_aspect(im, anchor):
    w, h = im.size
    target_h = int(w / ASPECT)
    if target_h <= h:
        top = 0 if anchor == "top" else (h - target_h) // 2
        return im.crop((0, top, w, top + target_h))
    target_w = int(h * ASPECT)
    left = (w - target_w) // 2
    return im.crop((left, 0, left + target_w, h))


os.makedirs(OUT, exist_ok=True)
total = 0
for name, (src, anchor) in JOBS.items():
    path = os.path.join(SRC, src)
    if not os.path.exists(path):
        print("MISSING", src)
        continue
    im = Image.open(path).convert("RGB")
    im = crop_to_aspect(im, anchor)
    im = im.resize((WIDTH, int(WIDTH / ASPECT)), Image.LANCZOS)
    dst = os.path.join(OUT, name + ".webp")
    im.save(dst, "WEBP", quality=QUALITY, method=6)
    size = os.path.getsize(dst)
    total += size
    print(f"{name}.webp  {im.size[0]}x{im.size[1]}  {size/1024:.1f} KB")

print(f"TOTAL {total/1024:.1f} KB")
