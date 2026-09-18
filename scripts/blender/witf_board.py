"""
WITF Board — Split Alice mechanical keyboard render.
Blender 4.x Python script. Run: blender --background --python witf_board.py
"""
import bpy
import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'projects', 'witf')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- Clear scene ---
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for col in bpy.data.collections:
    bpy.data.collections.remove(col)

# --- Settings ---
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1600
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.world.color = (0.06, 0.06, 0.06)

# --- Materials ---
def make_mat(name, color, roughness=0.4, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    return mat

mat_case = make_mat('Case', (0.08, 0.08, 0.09), roughness=0.35, metallic=0.7)
mat_keycap = make_mat('Keycap', (0.15, 0.15, 0.16), roughness=0.5, metallic=0.0)
mat_accent = make_mat('Accent', (0.18, 0.55, 0.52), roughness=0.3, metallic=0.1)  # teal accent
mat_plate = make_mat('Plate', (0.25, 0.25, 0.26), roughness=0.3, metallic=0.8)
mat_weight = make_mat('Weight', (0.6, 0.55, 0.3), roughness=0.25, metallic=0.9)  # brass weight

# --- Keyboard case ---
def create_case_half(offset_x, flip=False):
    """Create one half of the split Alice case."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(offset_x, 0, 0))
    case = bpy.context.active_object
    case.name = 'CaseHalf'
    case.scale = (3.2, 1.4, 0.35)
    case.data.materials.append(mat_case)
    
    # Slight angle for Alice layout
    case.rotation_euler.z = math.radians(-3) if not flip else math.radians(3)
    bpy.ops.object.shade_smooth()
    return case

left = create_case_half(-1.8)
right = create_case_half(1.8, flip=True)

# --- Plate ---
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.3))
plate = bpy.context.active_object
plate.name = 'Plate'
plate.scale = (3.4, 1.2, 0.05)
plate.data.materials.append(mat_plate)

# --- Keycaps ---
def create_keycap(x, y, z=0.4, size=0.22, accent=False):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z))
    cap = bpy.context.active_object
    cap.name = 'Keycap'
    cap.scale = (size, size, size * 0.5)
    cap.data.materials.append(mat_accent if accent else mat_keycap)
    # Round the top slightly
    bpy.ops.object.shade_smooth()
    return cap

# Left half keys (split Alice layout)
accent_positions = {(0, 0), (2, 1), (5, 2)}  # Esc, Enter-like, Space-bar area
for row in range(4):
    for col in range(6):
        x = -3.2 + col * 0.55
        y = -0.7 + row * 0.5
        # Alice curve: slight Y offset per column
        y += math.sin(col * 0.4) * 0.08
        is_accent = (row, col) in accent_positions
        create_keycap(x, y, accent=is_accent)

# Right half keys
for row in range(4):
    for col in range(6):
        x = 0.4 + col * 0.55
        y = -0.7 + row * 0.5
        y += math.sin(col * 0.4) * 0.08
        is_accent = (row, 2)  # center column accent
        create_keycap(x, y, accent=(col == 2 and row == 1))

# --- Brass weight (underside detail) ---
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.25))
weight = bpy.context.active_object
weight.name = 'Weight'
weight.scale = (1.5, 0.6, 0.04)
weight.data.materials.append(mat_weight)

# --- Lighting ---
# Key light (warm)
bpy.ops.object.light_add(type='AREA', location=(4, -3, 5))
key_light = bpy.context.active_object
key_light.data.energy = 400
key_light.data.size = 3
key_light.data.color = (1.0, 0.95, 0.9)

# Fill light (cool)
bpy.ops.object.light_add(type='AREA', location=(-3, 2, 3))
fill_light = bpy.context.active_object
fill_light.data.energy = 150
fill_light.data.size = 4
fill_light.data.color = (0.85, 0.9, 1.0)

# Rim light (teal accent)
bpy.ops.object.light_add(type='SPOT', location=(0, -5, 2))
rim = bpy.context.active_object
rim.data.energy = 300
rim.data.color = (0.18, 0.55, 0.52)
rim.rotation_euler = (math.radians(60), 0, 0)

# --- Camera ---
bpy.ops.object.camera_add(location=(0, -6.5, 4.5))
cam = bpy.context.active_object
cam.rotation_euler = (math.radians(55), 0, 0)
cam.data.lens = 50
cam.data.dof.use_dof = True
cam.data.dof.aperture_fstop = 2.8
scene.camera = cam

# --- Render ---
filepath = os.path.join(OUTPUT_DIR, 'hero-blender.webp')
scene.render.filepath = filepath
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.quality = 90
bpy.ops.render.render(write_still=True)
print(f"Rendered: {filepath}")
