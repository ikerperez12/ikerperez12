"""Decimate the keyboard down to something a README can carry, and export STL.

GitHub renders a fenced `stl` block with its own 3D viewer, which is the only
real 3D on the platform — but the block is text in the README, so the triangle
budget is tight. Internals are dropped first (switches, PCB and stabilisers are
invisible with the case closed), then what remains is decimated.

    blender --background --factory-startup --python export_stl.py -- \
        --out FILE.stl --tris 4000
"""
import bpy, sys, os, math, mathutils

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def arg(name, default):
    return argv[argv.index(name) + 1] if name in argv else default


GLB = r"C:\BLENDER\assets\sketchfab\nzxt-minitkl-keyboard\mechanical_keyboard_sanitized_2k.glb"
OUT = arg("--out", r"C:\PROYECTOS\IDEAS\ikerperez12\_src\keyboard.stl")
TARGET = int(arg("--tris", 4000))

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
bpy.context.scene.frame_set(0)

# Materials that are only visible once the case is opened.
HIDDEN = {"Switch", "Switch_Bottom", "Switch_Mid", "Stabilizer_1", "Stabilizer_2",
          "LEDs", "material", "Rubber", "Inner_Volume_Control"}

keep = []
for ob in list(bpy.data.objects):
    if ob.type != "MESH":
        continue
    mats = {m.name for m in ob.data.materials if m}
    if ob.name == "Icosphere" or (mats and mats <= HIDDEN):
        bpy.data.objects.remove(ob, do_unlink=True)
    else:
        keep.append(ob)

# Bake the armature so the exported mesh matches the assembled pose.
for ob in keep:
    bpy.context.view_layer.objects.active = ob
    for m in list(ob.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            ob.modifiers.remove(m)

bpy.ops.object.select_all(action="DESELECT")
for ob in keep:
    ob.select_set(True)
bpy.context.view_layer.objects.active = keep[0]
bpy.ops.object.join()
obj = bpy.context.view_layer.objects.active

bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

before = len(obj.data.polygons)
if before > TARGET:
    d = obj.modifiers.new("Decimate", "DECIMATE")
    d.ratio = max(0.01, TARGET / before)
    bpy.ops.object.modifier_apply(modifier=d.name)
after = len(obj.data.polygons)

# Centre on the origin and scale to a comfortable size for the viewer.
bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
obj.location = (0, 0, 0)
dims = max(obj.dimensions)
if dims:
    obj.scale = tuple(60.0 / dims for _ in range(3))
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
try:
    bpy.ops.wm.stl_export(filepath=OUT, ascii_format=True, export_selected_objects=False)
except AttributeError:
    bpy.ops.export_mesh.stl(filepath=OUT, ascii=True)

print(f"###TRIS {before} -> {after}")
print(f"###BYTES {os.path.getsize(OUT)}")
print("###DONE")
