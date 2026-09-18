"""
ShareCLI — 3D node graph of agent processes and runtime topology.
Blender 4.x Python script. Run: blender --background --python sharecli_nodes.py
"""
import bpy
import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'projects', 'sharecli')
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
scene.world.color = (0.03, 0.03, 0.04)

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

mat_node = make_mat('Node', (0.15, 0.15, 0.17), roughness=0.3, metallic=0.6)
mat_active = make_mat('Active', (0.78, 0.42, 0.23), roughness=0.3, metallic=0.2, emission=0.3)  # warm orange
mat_edge = make_mat('Edge', (0.3, 0.3, 0.35), roughness=0.5, metallic=0.8)
mat_ground = make_mat('Ground', (0.05, 0.05, 0.06), roughness=0.8)
mat_accent = make_mat('Accent', (0.18, 0.55, 0.52), roughness=0.3, emission=0.2)  # teal

# --- Node positions (agent process topology) ---
# Central hub + radiating agent nodes
nodes = [
    # (x, y, z, is_active, label)
    (0, 0, 0, True, 'runtime'),       # Central runtime
    (-2, 1.5, 0.3, False, 'agent-1'),
    (-1, 2.2, 0.5, False, 'agent-2'),
    (0.5, 2.5, 0.2, True, 'agent-3'),
    (2, 1.8, 0.4, False, 'agent-4'),
    (2.5, 0.5, 0.1, False, 'agent-5'),
    (1.8, -1.2, 0.3, False, 'agent-6'),
    (-0.5, -2, 0.6, True, 'agent-7'),
    (-2, -1, 0.2, False, 'agent-8'),
    # Queue nodes
    (-3, 0, 0.8, False, 'queue-1'),
    (3, 0, 0.7, False, 'queue-2'),
    (0, 3, 0.4, False, 'coalesce'),
]

# Create nodes
node_objects = []
for x, y, z, active, label in nodes:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(x, y, z))
    n = bpy.context.active_object
    n.name = label
    n.data.materials.append(mat_active if active else mat_node)
    bpy.ops.object.shade_smooth()
    node_objects.append(n)

# --- Connection edges (cylinders between nodes) ---
def create_edge(obj_a, obj_b, mat, radius=0.02):
    loc_a = obj_a.location
    loc_b = obj_b.location
    mid = ((loc_a.x + loc_b.x) / 2, (loc_a.y + loc_b.y) / 2, (loc_a.z + loc_b.z) / 2)
    
    dx = loc_b.x - loc_a.x
    dy = loc_b.y - loc_a.y
    dz = loc_b.z - loc_a.z
    length = math.sqrt(dx*dx + dy*dy + dz*dz)
    
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=length, location=mid)
    edge = bpy.context.active_object
    edge.name = 'Edge'
    edge.data.materials.append(mat)
    
    # Orient cylinder to point from A to B
    import mathutils
    direction = mathutils.Vector((dx, dy, dz)).normalized()
    rot = direction.to_track_quat('Z', 'Y')
    edge.rotation_euler = rot.to_euler()
    
    bpy.ops.object.shade_smooth()
    return edge

# Connect center to all agents
for i in range(1, 10):
    create_edge(node_objects[0], node_objects[i], mat_edge, radius=0.015)

# Connect queue nodes
create_edge(node_objects[0], node_objects[9], mat_accent, radius=0.02)
create_edge(node_objects[0], node_objects[10], mat_accent, radius=0.02)
create_edge(node_objects[0], node_objects[11], mat_accent, radius=0.02)

# Some agent-to-agent edges
create_edge(node_objects[1], node_objects[2], mat_edge, radius=0.01)
create_edge(node_objects[3], node_objects[4], mat_edge, radius=0.01)
create_edge(node_objects[6], node_objects[7], mat_edge, radius=0.01)

# --- Ground plane ---
bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, -0.8))
ground = bpy.context.active_object
ground.name = 'Ground'
ground.data.materials.append(mat_ground)

# --- Lighting ---
bpy.ops.object.light_add(type='AREA', location=(4, -3, 6))
key = bpy.context.active_object
key.data.energy = 300
key.data.size = 3
key.data.color = (1.0, 0.95, 0.9)

bpy.ops.object.light_add(type='AREA', location=(-3, 3, 4))
fill = bpy.context.active_object
fill.data.energy = 100
fill.data.size = 5
fill.data.color = (0.85, 0.9, 1.0)

# Teal accent from below
bpy.ops.object.light_add(type='POINT', location=(0, 0, -2))
accent_light = bpy.context.active_object
accent_light.data.energy = 80
accent_light.data.color = (0.18, 0.55, 0.52)

# --- Camera ---
bpy.ops.object.camera_add(location=(0, -7, 5))
cam = bpy.context.active_object
cam.rotation_euler = (math.radians(52), 0, 0)
cam.data.lens = 45
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
