"""
Substrate — 3D server rack / distributed node visualization.
Blender 4.x Python script. Run: blender --background --python substrate_racks.py
"""
import bpy
import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'projects', 'substrate')
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

mat_rack = make_mat('Rack', (0.08, 0.08, 0.09), roughness=0.3, metallic=0.7)
mat_server = make_mat('Server', (0.12, 0.12, 0.14), roughness=0.4, metallic=0.6)
mat_led_green = make_mat('LED_Green', (0.1, 0.8, 0.3), roughness=0.2, emission=0.8)
mat_led_amber = make_mat('LED_Amber', (0.9, 0.7, 0.1), roughness=0.2, emission=0.6)
mat_led_blue = make_mat('LED_Blue', (0.15, 0.4, 0.9), roughness=0.2, emission=0.7)
mat_cable = make_mat('Cable', (0.15, 0.15, 0.2), roughness=0.7, metallic=0.3)
mat_ground = make_mat('Ground', (0.03, 0.03, 0.04), roughness=0.9)
mat_accent = make_mat('Accent', (0.18, 0.55, 0.52), roughness=0.3, metallic=0.5, emission=0.2)

# --- Server rack (one unit) ---
def create_rack(x, z=0, height_units=6):
    """Create a server rack with multiple 1U/2U units."""
    # Rack frame
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, z + height_units * 0.22 / 2))
    frame = bpy.context.active_object
    frame.name = 'Rack'
    frame.scale = (0.8, 0.6, height_units * 0.22)
    frame.data.materials.append(mat_rack)
    
    # Server units
    for i in range(height_units):
        uz = z + 0.1 + i * 0.22
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, uz))
        srv = bpy.context.active_object
        srv.name = 'Server'
        srv.scale = (0.75, 0.55, 0.08)
        srv.data.materials.append(mat_server)
        
        # LED indicators
        for j in range(3):
            led_mat = [mat_led_green, mat_led_green, mat_led_amber][j]
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x + 0.25, 0.32, uz))
            led = bpy.context.active_object
            led.name = 'LED'
            led.scale = (0.02, 0.01, 0.01)
            led.data.materials.append(led_mat)
    
    return frame

# Three racks in a row
create_rack(-2.2, height_units=8)
create_rack(0, height_units=10)
create_rack(2.2, height_units=8)

# --- Cable management between racks ---
def create_cable(start_x, end_x, z, y_offset=0.3):
    mid_x = (start_x + end_x) / 2
    dx = abs(end_x - start_x)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.015, depth=dx,
                                         location=(mid_x, y_offset, z))
    cable = bpy.context.active_object
    cable.name = 'Cable'
    cable.rotation_euler = (0, math.pi/2, 0)
    cable.data.materials.append(mat_cable)
    bpy.ops.object.shade_smooth()

# Cables between racks
for z in [0.5, 1.2, 1.8, 2.5]:
    create_cable(-2.2, 0, z, 0.35)
    create_cable(0, 2.2, z, 0.35)

# --- Status LEDs floating above ---
for i, (x, y, z, mat) in enumerate([
    (-2.2, 0.5, 2.2, mat_led_green),
    (0, 0.5, 2.7, mat_led_blue),
    (2.2, 0.5, 2.2, mat_led_amber),
]):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(x, y, z))
    indicator = bpy.context.active_object
    indicator.name = 'StatusLED'
    indicator.data.materials.append(mat)
    bpy.ops.object.shade_smooth()

# --- Ground ---
bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, -0.05))
ground = bpy.context.active_object
ground.name = 'Ground'
ground.data.materials.append(mat_ground)

# --- Lighting ---
bpy.ops.object.light_add(type='AREA', location=(4, -4, 6))
key = bpy.context.active_object
key.data.energy = 350
key.data.size = 3
key.data.color = (1.0, 0.95, 0.9)

bpy.ops.object.light_add(type='AREA', location=(-3, 3, 4))
fill = bpy.context.active_object
fill.data.energy = 120
fill.data.size = 4
fill.data.color = (0.85, 0.9, 1.0)

# Teal accent from behind
bpy.ops.object.light_add(type='SPOT', location=(0, 5, 3))
accent = bpy.context.active_object
accent.data.energy = 200
accent.data.color = (0.18, 0.55, 0.52)
accent.rotation_euler = (math.radians(-50), 0, 0)

# --- Camera ---
bpy.ops.object.camera_add(location=(-3.5, -5, 3.5))
cam = bpy.context.active_object
cam.rotation_euler = (math.radians(55), 0, math.radians(-20))
cam.data.lens = 50
cam.data.dof.use_dof = True
cam.data.dof.aperture_fstop = 3.5
scene.camera = cam

# --- Render ---
filepath = os.path.join(OUTPUT_DIR, 'hero-blender.webp')
scene.render.filepath = filepath
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.quality = 90
bpy.ops.render.render(write_still=True)
print(f"Rendered: {filepath}")
