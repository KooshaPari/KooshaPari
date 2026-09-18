"""
GMK Arch — Keycap showcase render with Arch Linux branding.
Blender 4.x Python script. Run: blender --background --python gmk_arch.py
"""
import bpy
import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'projects', 'gmk-arch')
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
scene.render.film_transparent = True
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.world.color = (0.04, 0.04, 0.05)

# --- Materials ---
def make_mat(name, color, roughness=0.4, metallic=0.0, emission=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    if emission > 0:
        bsdf.inputs['Emission Strength'].default_value = emission
        bsdf.inputs['Emission Color'].default_value = (*color, 1.0)
    return mat

# GMK Arch colorway: dark base with teal accents (Arch Linux teal #1793D1)
mat_base = make_mat('GMK_Base', (0.12, 0.12, 0.13), roughness=0.55)
mat_alpha = make_mat('GMK_Alpha', (0.85, 0.83, 0.78), roughness=0.5)  # cream legends
mat_teal = make_mat('GMK_Teal', (0.09, 0.58, 0.82), roughness=0.35, emission=0.15)  # Arch teal
mat_mod = make_mat('GMK_Mod', (0.18, 0.18, 0.20), roughness=0.5)
mat_dark = make_mat('GMK_Dark', (0.06, 0.06, 0.07), roughness=0.6)

# --- Keycap profile (Cherry profile approximation) ---
def create_keycap(x, y, z=0, size=0.38, height=0.3, mat=None):
    """Create a single keycap with Cherry-profile taper."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + height/2))
    cap = bpy.context.active_object
    cap.name = 'Keycap'
    cap.scale = (size * 0.47, size * 0.47, height * 0.5)
    cap.data.materials.append(mat or mat_base)
    bpy.ops.object.shade_smooth()
    
    # Add slight dish (top concavity) via subdivision + proportional
    return cap

# --- Layout: 65% with Arch teal accent keys ---
TEAL_KEYS = {(0, 0), (13, 0), (13, 1), (7, 3)}  # Esc, Enter, Backspace, special
ALPHA_KEYS = {(i, 0) for i in range(1, 12)}  # Number row alphas

for row in range(5):
    cols = 14 if row < 4 else (8 if row == 4 else 14)
    for col in range(cols):
        x = -2.8 + col * 0.42
        y = -0.8 + row * 0.42
        z = row * 0.02  # Slight height stagger
        
        if (col, row) in TEAL_KEYS:
            mat = mat_teal
        elif (col, row) in ALPHA_KEYS:
            mat = mat_alpha
        elif row == 4:
            mat = mat_mod  # Bottom row modifiers
        else:
            mat = mat_base
        
        size = 0.38
        if row == 4 and col in (4, 5, 6):  # Spacebar
            create_keycap(x + 0.2, y, z, size=1.14, height=0.25, mat=mat_dark)
            continue
        create_keycap(x, y, z, size=size, mat=mat)

# --- Stand/display riser ---
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.15))
riser = bpy.context.active_object
riser.name = 'Riser'
riser.scale = (3.5, 2.0, 0.05)
riser.data.materials.append(mat_dark)

# --- Lighting ---
# Warm key light
bpy.ops.object.light_add(type='AREA', location=(3, -4, 6))
key = bpy.context.active_object
key.data.energy = 350
key.data.size = 2.5
key.data.color = (1.0, 0.95, 0.88)

# Cool fill
bpy.ops.object.light_add(type='AREA', location=(-4, 2, 4))
fill = bpy.context.active_object
fill.data.energy = 120
fill.data.size = 5
fill.data.color = (0.8, 0.9, 1.0)

# Teal accent rim
bpy.ops.object.light_add(type='SPOT', location=(-1, -5, 3))
rim = bpy.context.active_object
rim.data.energy = 200
rim.data.color = (0.09, 0.58, 0.82)
rim.rotation_euler = (math.radians(55), 0, math.radians(10))

# --- Camera ---
bpy.ops.object.camera_add(location=(0, -5.5, 4))
cam = bpy.context.active_object
cam.rotation_euler = (math.radians(50), 0, 0)
cam.data.lens = 55
cam.data.dof.use_dof = True
cam.data.dof.aperture_fstop = 2.2
scene.camera = cam

# --- Render ---
filepath = os.path.join(OUTPUT_DIR, 'hero-blender.webp')
scene.render.filepath = filepath
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.quality = 90
bpy.ops.render.render(write_still=True)
print(f"Rendered: {filepath}")
