"""Render the keyboard as a turntable on pure black.

A product-shot orbit: the camera circles the assembled keyboard under a fixed
three-point rig, so the light stays put and the object turns through it. Black
is rendered rather than left transparent, because the section it lands in is
full black and a baked background compresses far better than an alpha edge.

    blender --background --factory-startup --python render_turntable.py -- \
        --out DIR --w 900 --h 560 --frames 36 --samples 96
"""
import bpy, sys, os, math, mathutils

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def arg(name, default):
    return argv[argv.index(name) + 1] if name in argv else default


GLB = r"C:\BLENDER\assets\sketchfab\nzxt-minitkl-keyboard\mechanical_keyboard_sanitized_2k.glb"
OUT = arg("--out", r"C:\PROYECTOS\IDEAS\ikerperez12\_src\turn")
RW = int(arg("--w", 900))
RH = int(arg("--h", 560))
NF = int(arg("--frames", 36))
SAMPLES = int(arg("--samples", 96))
DIST = float(arg("--dist", 4.6))
ELEV = float(arg("--elev", 26))
OPEN_AT = float(arg("--open", 0))  # action frame to hold; 0 = fully assembled

os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)

for name in ("Icosphere",):
    ob = bpy.data.objects.get(name)
    if ob:
        bpy.data.objects.remove(ob, do_unlink=True)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = RW
scene.render.resolution_y = RH
scene.render.film_transparent = False
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGB"
scene.render.image_settings.compression = 15

ee = scene.eevee
if hasattr(ee, "taa_render_samples"):
    ee.taa_render_samples = SAMPLES
for flag in ("use_raytracing", "use_shadows"):
    if hasattr(ee, flag):
        setattr(ee, flag, True)

scene.frame_set(int(OPEN_AT))

# ---- bounds -----------------------------------------------------------------
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

# ---- pure black world -------------------------------------------------------
world = bpy.data.worlds.new("W")
world.use_nodes = True
bgnode = world.node_tree.nodes["Background"]
bgnode.inputs[0].default_value = (0, 0, 0, 1)
bgnode.inputs[1].default_value = 0.0
scene.world = world

# ---- camera -----------------------------------------------------------------
cam_data = bpy.data.cameras.new("TurnCam")
cam_data.lens = 95
cam = bpy.data.objects.new("TurnCam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

# ---- fixed lighting rig -----------------------------------------------------
def add_area(name, loc, energy, size, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, type="AREA")
    d.energy = energy
    d.size = size
    d.color = color
    o = bpy.data.objects.new(name, d)
    o.location = center + mathutils.Vector(loc)
    scene.collection.objects.link(o)
    o.rotation_euler = (center - o.location).to_track_quat("-Z", "Y").to_euler()
    return o


# Restrained key light so the dark keycaps stay dark; the shot is carried by
# two coloured rims instead, which is what keeps a black-on-black product
# read legible without washing the subject out.
r = radius
add_area("Key", (-2.4 * r, -2.4 * r, 3.4 * r), 260 * r * r, 3.6 * r, (1.0, 0.97, 0.92))
add_area("Fill", (3.2 * r, -1.4 * r, 1.2 * r), 45 * r * r, 4.4 * r, (0.76, 0.85, 1.0))
add_area("RimA", (1.8 * r, 3.2 * r, 1.6 * r), 620 * r * r, 1.6 * r, (0.45, 0.75, 1.0))
add_area("RimB", (-3.2 * r, 2.4 * r, 1.2 * r), 480 * r * r, 1.6 * r, (0.78, 0.60, 1.0))

# ---- orbit ------------------------------------------------------------------
el = math.radians(ELEV)
dist = radius * DIST
for i in range(NF):
    az = 2 * math.pi * i / NF + math.radians(35)
    cam.location = center + mathutils.Vector(
        (math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el))
    ) * dist
    cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = os.path.join(OUT, f"t{i:03d}.png")
    bpy.ops.render.render(write_still=True)
    print(f"###FRAME {i}")

print("###DONE")
