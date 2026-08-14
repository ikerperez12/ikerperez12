"""Render the keyboard's `Open` action to transparent PNG frames.

Called from Blender in background mode:
    blender --background --factory-startup --python render_kb.py -- \
        --out DIR --size 720 --frames 14 --start 0 --end 160 [--samples 48]

The model is a CC BY 4.0 derivative (see ATTRIBUTION.md beside the .glb); the
credit travels with the generated asset into the profile repository.
"""
import bpy, sys, os, math, mathutils

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def arg(name, default):
    return argv[argv.index(name) + 1] if name in argv else default


GLB = r"C:\BLENDER\assets\sketchfab\nzxt-minitkl-keyboard\mechanical_keyboard_sanitized_2k.glb"
OUT = arg("--out", r"C:\PROYECTOS\IDEAS\ikerperez12\_src\kb")
SIZE = int(arg("--size", 720))
RW = int(arg("--w", SIZE))
RH = int(arg("--h", SIZE))
DIST = float(arg("--dist", 4.7))
NFRAMES = int(arg("--frames", 14))
F0 = float(arg("--start", 0))
F1 = float(arg("--end", 160))
SAMPLES = int(arg("--samples", 48))
ENGINE = arg("--engine", "BLENDER_EEVEE")

os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)

# A material-less helper sphere ships with the file; it is not product geometry.
for name in ("Icosphere",):
    ob = bpy.data.objects.get(name)
    if ob:
        bpy.data.objects.remove(ob, do_unlink=True)

scene = bpy.context.scene
scene.render.engine = ENGINE
scene.render.resolution_x = RW
scene.render.resolution_y = RH
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.compression = 15

if ENGINE == "CYCLES":
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
else:
    ee = scene.eevee
    if hasattr(ee, "taa_render_samples"):
        ee.taa_render_samples = max(16, SAMPLES)
    for flag in ("use_raytracing", "use_shadows"):
        if hasattr(ee, flag):
            setattr(ee, flag, True)

# ---- bounds of real geometry, used to frame the shot -----------------------
mn = mathutils.Vector((1e9, 1e9, 1e9))
mx = mathutils.Vector((-1e9, -1e9, -1e9))
for ob in bpy.data.objects:
    if ob.type != "MESH":
        continue
    for c in ob.bound_box:
        w = ob.matrix_world @ mathutils.Vector(c)
        for i in range(3):
            mn[i] = min(mn[i], w[i])
            mx[i] = max(mx[i], w[i])
center = (mn + mx) / 2
radius = max((mx - mn).x, (mx - mn).y, (mx - mn).z) / 2

# ---- camera ----------------------------------------------------------------
cam_data = bpy.data.cameras.new("HeroCam")
cam_data.lens = 85
cam = bpy.data.objects.new("HeroCam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

# Three-quarter view from slightly above: reads as a product shot and keeps the
# opening mechanism legible rather than foreshortened.
az = math.radians(52)
el = math.radians(30)
dist = radius * DIST
cam.location = center + mathutils.Vector(
    (math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el))
) * dist
direction = center - cam.location
cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_area(name, loc, energy, size, rot=(0, 0, 0), color=(1, 1, 1)):
    d = bpy.data.lights.new(name, type="AREA")
    d.energy = energy
    d.size = size
    d.color = color
    o = bpy.data.objects.new(name, d)
    o.location = center + mathutils.Vector(loc)
    o.rotation_euler = rot
    scene.collection.objects.link(o)
    # Aim the light at the subject.
    dv = center - o.location
    o.rotation_euler = dv.to_track_quat("-Z", "Y").to_euler()
    return o


r = radius
# Key light front-left, cool fill opposite, and a hot rim behind so the silhouette
# survives on GitHub's near-black canvas as well as on white.
add_area("Key", (-2.4 * r, -2.0 * r, 3.0 * r), 900 * r * r, 3.2 * r, color=(1.0, 0.97, 0.92))
add_area("Fill", (3.0 * r, -1.4 * r, 1.0 * r), 260 * r * r, 4.0 * r, color=(0.82, 0.88, 1.0))
add_area("Rim", (1.2 * r, 3.2 * r, 2.2 * r), 1500 * r * r, 2.2 * r, color=(1.0, 0.86, 0.62))
add_area("Under", (0, -0.6 * r, -2.6 * r), 120 * r * r, 4.0 * r, color=(0.7, 0.8, 1.0))

world = bpy.data.worlds.new("W")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.055, 0.07, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.35
scene.world = world

# ---- render the sampled action --------------------------------------------
step = (F1 - F0) / max(1, NFRAMES - 1)
for i in range(NFRAMES):
    f = F0 + step * i
    scene.frame_set(int(round(f)))
    scene.render.filepath = os.path.join(OUT, f"f{i:03d}.png")
    bpy.ops.render.render(write_still=True)
    print(f"###FRAME {i} at {f:.1f}")

print("###DONE")
