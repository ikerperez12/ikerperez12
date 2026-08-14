import struct
import json
import math
import numpy as np
from PIL import Image

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
    import io
    texture_img = Image.open(io.BytesIO(img_bytes)).convert('RGB')

    return pos, norms, uvs, indices, texture_img

def render_duck_image():
    glb_path = r"C:\Users\ijpg1\projects\nexoip-final-integration\public\assets\models\duck.glb"
    pos, norms, uvs, indices, texture_img = load_glb(glb_path)

    # Center and normalize positions
    center = np.mean(pos, axis=0)
    pos_centered = pos - center
    max_span = np.max(np.abs(pos_centered))
    pos_norm = pos_centered / max_span

    # Resolution (2x for supersampling)
    w_out, h_out = 320, 320
    scale_factor = 2
    W, H = w_out * scale_factor, h_out * scale_factor

    # Rotation: Yaw = -55 deg, Pitch = 15 deg
    yaw = math.radians(-55)
    pitch = math.radians(18)
    roll = math.radians(0)

    # Rotation matrices
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

    # Perspective projection
    fov = 2.4
    dist = 2.6
    z = rot_pos[:, 2] + dist
    proj_x = (rot_pos[:, 0] / z) * fov * (W / 2) + (W / 2)
    proj_y = (-rot_pos[:, 1] / z) * fov * (H / 2) + (H / 2) + 15

    # Rasterize triangles to frame buffer
    color_buf = np.zeros((H, W, 4), dtype=np.uint8)
    depth_buf = np.full((H, W), np.inf, dtype=np.float32)

    tex_w, tex_h = texture_img.size
    tex_np = np.array(texture_img)

    # Lights
    light1 = np.array([0.5, 0.8, 0.7])
    light1 /= np.linalg.norm(light1)
    light2 = np.array([-0.7, -0.2, 0.4])
    light2 /= np.linalg.norm(light2)

    triangles = indices.reshape(-1, 3)

    # Sort triangles by centroid depth (Painter's algorithm fallback + Z-buffer)
    tri_depths = np.mean(z[triangles], axis=1)
    sorted_tri_indices = np.argsort(-tri_depths)

    for tri_idx in sorted_tri_indices:
        idx = triangles[tri_idx]
        p0 = np.array([proj_x[idx[0]], proj_y[idx[0]], z[idx[0]]])
        p1 = np.array([proj_x[idx[1]], proj_y[idx[1]], z[idx[1]]])
        p2 = np.array([proj_x[idx[2]], proj_y[idx[2]], z[idx[2]]])

        # Bounding box
        min_x = max(0, int(math.floor(min(p0[0], p1[0], p2[0]))))
        max_x = min(W - 1, int(math.ceil(max(p0[0], p1[0], p2[0]))))
        min_y = max(0, int(math.floor(min(p0[1], p1[1], p2[1]))))
        max_y = min(H - 1, int(math.ceil(max(p0[1], p1[1], p2[1]))))

        if min_x > max_x or min_y > max_y:
            continue

        # Area
        area = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p1[1] - p0[1]) * (p2[0] - p0[0])
        if abs(area) < 1e-5:
            continue

        # Normal lighting
        avg_n = np.mean(rot_norms[idx], axis=0)
        norm_len = np.linalg.norm(avg_n)
        if norm_len > 0:
            avg_n /= norm_len
        diffuse1 = max(0, float(np.dot(avg_n, light1)))
        diffuse2 = max(0, float(np.dot(avg_n, light2))) * 0.4
        ambient = 0.45
        intensity = min(1.3, ambient + diffuse1 * 0.8 + diffuse2)

        # Average UV
        avg_uv = np.mean(uvs[idx], axis=0)
        u_coord = int(np.clip(avg_uv[0] * (tex_w - 1), 0, tex_w - 1))
        v_coord = int(np.clip((1.0 - avg_uv[1]) * (tex_h - 1), 0, tex_h - 1))
        base_col = tex_np[v_coord, u_coord]

        r = int(np.clip(base_col[0] * intensity, 0, 255))
        g = int(np.clip(base_col[1] * intensity, 0, 255))
        b = int(np.clip(base_col[2] * intensity, 0, 255))

        avg_z = float(np.mean(p0[2] + p1[2] + p2[2]) / 3.0)

        # Draw filled triangle
        xs = np.arange(min_x, max_x + 1)
        ys = np.arange(min_y, max_y + 1)
        grid_x, grid_y = np.meshgrid(xs, ys)

        w0 = (p1[0] - grid_x) * (p2[1] - grid_y) - (p1[1] - grid_y) * (p2[0] - grid_x)
        w1 = (p2[0] - grid_x) * (p0[1] - grid_y) - (p2[1] - grid_y) * (p0[0] - grid_x)
        w2 = (p0[0] - grid_x) * (p1[1] - grid_y) - (p0[1] - grid_y) * (p1[0] - grid_x)

        if area > 0:
            inside = (w0 >= 0) & (w1 >= 0) & (w2 >= 0)
        else:
            inside = (w0 <= 0) & (w1 <= 0) & (w2 <= 0)

        for y_idx in range(min_y, max_y + 1):
            for x_idx in range(min_x, max_x + 1):
                if inside[y_idx - min_y, x_idx - min_x]:
                    if avg_z < depth_buf[y_idx, x_idx]:
                        depth_buf[y_idx, x_idx] = avg_z
                        color_buf[y_idx, x_idx] = [r, g, b, 255]

    # Supersampled image
    img = Image.fromarray(color_buf, 'RGBA')
    # Downsample with Lanczos for anti-aliasing
    final_img = img.resize((w_out, h_out), Image.Resampling.LANCZOS)
    
    out_path = r"C:\Users\ijpg1\Documents\antigravity\ikerperez12\assets\duck_3d.png"
    final_img.save(out_path, "PNG", optimize=True)
    print("Successfully rendered 3D duck from duck.glb to:", out_path)

if __name__ == '__main__':
    render_duck_image()
