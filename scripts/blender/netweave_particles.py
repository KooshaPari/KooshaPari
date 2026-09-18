"""
NetWeave — 3D traffic simulation with particle flow visualization.
Blender 4.x Python script. Run: blender --background --python netweave_particles.py
"""
import bpy
import math
import os
import random

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'projects', 'netweave')
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
scene.world.color = (0.02, 0.03, 0.04)

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

mat_road = make_mat('Road', (0.1, 0.1, 0.12), roughness=0.7, metallic=0.3)
mat_car_fast = make_mat('CarFast', (0.2, 0.7, 0.6), roughness=0.3, emission=0.4)  # green = flowing
mat_car_slow = make_mat('CarSlow', (0.85, 0.65, 0.15), roughness=0.3, emission=0.3)  # yellow = slowing
mat_car_grid = make_mat('CarGrid', (0.8, 0.2, 0.15), roughness=0.3, emission=0.5)  # red = gridlock
mat_building = make_mat('Building', (0.08, 0.08, 0.1), roughness=0.6, metallic=0.4)
mat_ground = make_mat('Ground', (0.03, 0.03, 0.04), roughness=0.9)

# --- Road grid (directed graph) ---
roads = [
    # (x1, y1, x2, y2) — road segments
    (-5, -2, 5, -2),   # Main horizontal
    (-5, 0, 5, 0),     # Center horizontal
    (-5, 2, 5, 2),     # Top horizontal
    (-3, -4, -3, 4),   # Left vertical
    (0, -4, 0, 4),     # Center vertical
    (3, -4, 3, 4),     # Right vertical
    (-5, -4, 5, -4),   # Bottom horizontal
    (-5, 4, 5, 4),     # Top horizontal
]

for x1, y1, x2, y2 in roads:
    mx = (x1 + x2) / 2
    my = (y1 + y2) / 2
    dx = x2 - x1
    dy = y2 - y1
    length = math.sqrt(dx*dx + dy*dy)
    
    bpy.ops.mesh.primitive_cube_add(size=1, location=(mx, my, -0.05))
    road = bpy.context.active_object
    road.name = 'Road'
    if abs(dx) > abs(dy):
        road.scale = (length / 2, 0.25, 0.03)
    else:
        road.scale = (0.25, length / 2, 0.03)
    road.data.materials.append(mat_road)

# --- Intersection nodes (raised slightly) ---
intersections = [(-3, -2), (0, -2), (3, -2),
                 (-3, 0), (0, 0), (3, 0),
                 (-3, 2), (0, 2), (3, 2)]

for ix, iy in intersections:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=0.06, location=(ix, iy, 0.01))
    node = bpy.context.active_object
    node.name = 'Intersection'
    node.data.materials.append(mat_road)
    bpy.ops.object.shade_smooth()

# --- Vehicle particles (spheres along roads) ---
random.seed(42)
car_mats = [mat_car_fast, mat_car_slow, mat_car_grid]

for _ in range(60):
    road_idx = random.randint(0, len(roads) - 1)
    x1, y1, x2, y2 = roads[road_idx]
    t = random.random()
    x = x1 + (x2 - x1) * t
    y = y1 + (y2 - y1) * t
    # Offset slightly from road center
    offset = random.uniform(-0.15, 0.15)
    if abs(x2 - x1) > abs(y2 - y1):
        y += offset
    else:
        x += offset
    
    # Color based on position (congestion near center)
    dist_center = math.sqrt(x*x + y*y)
    if dist_center < 2:
        mat = mat_car_grid  # Gridlock near center
    elif dist_center < 3.5:
        mat = mat_car_slow  # Slowing
    else:
        mat = mat_car_fast  # Flowing
    
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(x, y, 0.12))
    car = bpy.context.active_object
    car.name = 'Car'
    car.data.materials.append(mat)
    bpy.ops.object.shade_smooth()

# --- Buildings (simple blocks around the grid) ---
building_positions = [
    (-4.5, -3.5), (-4.5, 3.5), (4.5, -3.5), (4.5, 3.5),
    (-4.5, 1), (4.5, 1), (-1, -3.5), (-1, 3.5),
    (1.5, -3.5), (1.5, 3.5),
]

for bx, by in building_positions:
    h = random.uniform(0.8, 2.5)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(bx, by, h / 2))
    bldg = bpy.context.active_object
    bldg.name = 'Building'
    bldg.scale = (0.6, 0.6, h)
    bldg.data.materials.append(mat_building)

# --- Ground ---
bpy.ops.mesh.primitive_plane_add(size=16, location=(0, 0, -0.15))
ground = bpy.context.active_object
ground.name = 'Ground'
ground.data.materials.append(mat_ground)

# --- Lighting ---
bpy.ops.object.light_add(type='AREA', location=(5, -5, 8))
key = bpy.context.active_object
key.data.energy = 400
key.data.size = 4
key.data.color = (1.0, 0.95, 0.9)

bpy.ops.object.light_add(type='AREA', location=(-5, 5, 5))
fill = bpy.context.active_object
fill.data.energy = 150
fill.data.size = 5
fill.data.color = (0.85, 0.9, 1.0)

# Top-down accent
bpy.ops.object.light_add(type='SPOT', location=(0, 0, 10))
spot = bpy.context.active_object
spot.data.energy = 200
spot.data.color = (0.2, 0.6, 0.55)
spot.rotation_euler = (0, 0, 0)

# --- Camera (top-down angled view) ---
bpy.ops.object.camera_add(location=(0, -10, 9))
cam = bpy.context.active_object
cam.rotation_euler = (math.radians(45), 0, 0)
cam.data.lens = 35
cam.data.dof.use_dof = True
cam.data.dof.aperture_fstop = 5.0
scene.camera = cam

# --- Render ---
filepath = os.path.join(OUTPUT_DIR, 'hero-blender.webp')
scene.render.filepath = filepath
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.quality = 90
bpy.ops.render.render(write_still=True)
print(f"Rendered: {filepath}")
