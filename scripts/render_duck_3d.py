import struct
import json
import math
import numpy as np
from PIL import Image
import io

def load_glb(glb_path):
    with open(glb_path, 'rb') as f:
        f.seek(12)
        chunk0_len, _ = struct.unpack('<II', f.read(8))
        gltf = json.loads(f.read(chunk0_len))
        chunk1_len, _ = struct.unpack('<II', f.read(8))
        binary = f.read(chunk1_len)

    def get_buffer(accessor_idx):
        acc = gltf['accessors'][accessor_idx]
        bv = gltf['bufferViews'][acc['bufferView']]
        offset = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
        count = acc['count']
        
        comp_type = acc['componentType']
        type_str = acc['type']

        if comp_type == 5126: # FLOAT
            fmt_char = 'f'
            item_size = 4
        elif comp_type == 5123: # UNSIGNED_SHORT
            fmt_char = 'H'
            item_size = 2
        elif comp_type == 5125: # UNSIGNED_INT
            fmt_char = 'I'
            item_size = 4
        else:
            fmt_char = 'f'
            item_size = 4

        num_components = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[type_str]
        total_items = count * num_components
        data = struct.unpack(f'<{total_items}{fmt_char}', binary[offset:offset + total_items * item_size])
        if num_components == 1:
            return np.array(data)
        return np.array(data).reshape(count, num_components)

    prim = gltf['meshes'][0]['primitives'][0]
    pos = get_buffer(prim['attributes']['POSITION'])
    norms = get_buffer(prim['attributes']['NORMAL'])
    uvs = get_buffer(prim['attributes']['TEXCOORD_0'])
    indices = get_buffer(prim['indices']).astype(int)

    # Texture image
    bv_img = gltf['bufferViews'][gltf['images'][0]['bufferView']]
    img_bytes = binary[bv_img.get('byteOffset', 0):bv_img.get('byteOffset', 0) + bv_img['byteLength']]
    texture_img = Image.open(io.BytesIO(img_bytes)).convert('RGB')

    return pos, norms, uvs, indices, texture_img

def render_duck_angle(yaw_deg=125, pitch_deg=12, out_name="duck_3d.png"):
    glb_path = r"C:\Users\ijpg1\projects\nexoip-final-integration\public\assets\models\duck.glb"
    pos, norms, uvs, indices, texture_img = load_glb(glb_path)

    # Bounding box center
    min_bound = np.min(pos, axis=0)
    max_bound = np.max(pos, axis=0)
    center = (min_bound + max_bound) / 2.0
    
    pos_centered = pos - center
    max_span = np.max(max_bound - min_bound)
    pos_norm = pos_centered / max_span

    # Resolution (High Res supersampling)
    w_out, h_out = 400, 400
    scale = 2
    W, H = w_out * scale, h_out * scale

    # Rotation: Looking from front 3/4 left towards user
    yaw = math.radians(yaw_deg)
    pitch = math.radians(pitch_deg)

    Ry = np.array([
        [math.cos(yaw), 0, math.sin(yaw)],
        [0, 1, 0],
        [-math.sin(yaw), 0, math.cos(yaw)]
    ])
    Rx = np.array([
        [1, 0, 0],
        [0, math.cos(pitch), -math.sin(pitch)],
        [0, math.sin(pitch), math.cos(pitch)]
    ])

    R = Rx @ Ry

    rot_pos = pos_norm @ R.T
    rot_norms = norms @ R.T

    # Camera perspective
    fov = 2.1
    dist = 2.4
    z = rot_pos[:, 2] + dist
    proj_x = (rot_pos[:, 0] / z) * fov * (W / 2) + (W / 2)
    proj_y = (-rot_pos[:, 1] / z) * fov * (H / 2) + (H / 2) - 10

    color_buf = np.zeros((H, W, 4), dtype=np.uint8)
    depth_buf = np.full((H, W), np.inf, dtype=np.float32)

    tex_w, tex_h = texture_img.size
    tex_np = np.array(texture_img, dtype=np.float32)

    # Clean studio lights
    light_main = np.array([0.4, 0.8, 0.8])
    light_main /= np.linalg.norm(light_main)

    light_fill = np.array([-0.6, 0.3, 0.5])
    light_fill /= np.linalg.norm(light_fill)

    triangles = indices.reshape(-1, 3)

    for tri in triangles:
        i0, i1, i2 = tri
        x0, y0, z0 = proj_x[i0], proj_y[i0], z[i0]
        x1, y1, z1 = proj_x[i1], proj_y[i1], z[i1]
        x2, y2, z2 = proj_x[i2], proj_y[i2], z[i2]

        min_x = max(0, int(math.floor(min(x0, x1, x2))))
        max_x = min(W - 1, int(math.ceil(max(x0, x1, x2))))
        min_y = max(0, int(math.floor(min(y0, y1, y2))))
        max_y = min(H - 1, int(math.ceil(max(y0, y1, y2))))

        if min_x > max_x or min_y > max_y:
            continue

        denom = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(denom) < 1e-6:
            continue

        uv0, uv1, uv2 = uvs[i0], uvs[i1], uvs[i2]
        n0, n1, n2 = rot_norms[i0], rot_norms[i1], rot_norms[i2]

        # Rasterize pixels in bbox with full Barycentric interpolation
        for y_pix in range(min_y, max_y + 1):
            for x_pix in range(min_x, max_x + 1):
                w0 = ((y1 - y2) * (x_pix - x2) + (x2 - x1) * (y_pix - y2)) / denom
                w1 = ((y2 - y0) * (x_pix - x2) + (x0 - x2) * (y_pix - y2)) / denom
                w2 = 1.0 - w0 - w1

                if w0 >= -1e-4 and w1 >= -1e-4 and w2 >= -1e-4:
                    pix_z = w0 * z0 + w1 * z1 + w2 * z2
                    if pix_z < depth_buf[y_pix, x_pix]:
                        depth_buf[y_pix, x_pix] = pix_z

                        # Interpolated UV
                        u = w0 * uv0[0] + w1 * uv1[0] + w2 * uv2[0]
                        v = 1.0 - (w0 * uv0[1] + w1 * uv1[1] + w2 * uv2[1])

                        u_idx = int(np.clip(u * (tex_w - 1), 0, tex_w - 1))
                        v_idx = int(np.clip(v * (tex_h - 1), 0, tex_h - 1))
                        tex_color = tex_np[v_idx, u_idx]

                        # Interpolated normal
                        norm = w0 * n0 + w1 * n1 + w2 * n2
                        n_len = np.linalg.norm(norm)
                        if n_len > 0:
                            norm /= n_len

                        # Studio Shading
                        diffuse_main = max(0.0, float(np.dot(norm, light_main)))
                        diffuse_fill = max(0.0, float(np.dot(norm, light_fill))) * 0.35
                        ambient = 0.55
                        lighting = min(1.4, ambient + diffuse_main * 0.75 + diffuse_fill)

                        r = int(np.clip(tex_color[0] * lighting, 0, 255))
                        g = int(np.clip(tex_color[1] * lighting, 0, 255))
                        b = int(np.clip(tex_color[2] * lighting, 0, 255))

                        color_buf[y_pix, x_pix] = [r, g, b, 255]

    # Convert to image and downsample with Lanczos for smooth anti-aliased edges
    img = Image.fromarray(color_buf, 'RGBA')
    final_img = img.resize((w_out, h_out), Image.Resampling.LANCZOS)
    
    out_path = rf"C:\Users\ijpg1\Documents\antigravity\ikerperez12\assets\{out_name}"
    final_img.save(out_path, "PNG", optimize=True)
    print("Rendered front 3D duck to:", out_path)

if __name__ == '__main__':
    render_duck_angle(yaw_deg=125, pitch_deg=10, out_name="duck_3d.png")
