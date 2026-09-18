"""
OmniRoute — 3D routing topology visualization.
Blender 4.x Python script. Run: blender --background --python omniroute_graph.py
"""
import bpy
import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'projects', 'omniroute')
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

mat_request = make_mat('Request', (0.3, 0.5, 0.8), roughness=0.3, metallic=0.1, emission=0.2)  # blue
mat_provider = make_mat('Provider', (0.18, 0.55, 0.52), roughness=0.3, metallic=0.3, emission=0.15)  # teal
mat_fallback = make_mat('Fallback', (0.78, 0.42, 0.23), roughness=0.35, metallic=0.1, emission=0.1)  # orange
mat_router = make_mat('Router', (0.5, 0.45, 0.6), roughness=0.25, metallic=0.5, emission=0.25)  # purple
mat_edge_main = make_mat('EdgeMain', (0.25, 0.25, 0.3), roughness=0.5, metallic=0.8)
mat_edge_fail = make_mat('EdgeFail', (0.5, 0.3, 0.2), roughness=0.5, metallic=0.6)
mat_ground = make_mat('Ground', (0.04, 0.04, 0.05), roughness=0.9)

# --- Routing nodes ---
# Request -> Router -> Providers -> Response
#                                   -> Failure -> Fallback -> Router
nodes_data = [
    # (x, y, z, material, scale, label)
    (-4, 0, 0.5, mat_request, 0.35, 'request'),
    (-1.5, 0, 0.8, mat_router, 0.4, 'router'),
    (1.5, 1.5, 0.3, mat_provider, 0.3, 'provider-a'),
    (1.5, 0, 0.3, mat_provider, 0.3, 'provider-b'),
    (1.5, -1.5, 0.3, mat_provider, 0.3, 'provider-c'),
    (4, 0, 0.5, mat_request, 0.35, 'response'),
    (3, -2.5, 0.6, mat_fallback, 0.28, 'failure'),
    (-1.5, -3, 0.4, mat_fallback, 0.25, 'fallback'),
]

node_objects = []
for x, y, z, mat, scale, label in nodes_data:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=scale, location=(x, y, z))
    n = bpy.context.active_object
    n.name = label
    n.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    node_objects.append(n)

# --- Edges ---
import mathutils

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
    direction = mathutils.Vector((dx, dy, dz)).normalized()
    rot = direction.to_track_quat('Z', 'Y')
    edge.rotation_euler = rot.to_euler()
    bpy.ops.object.shade_smooth()
    return edge

# Main flow: request -> router
create_edge(node_objects[0], node_objects[1], mat_edge_main, 0.025)
# Router -> providers
create_edge(node_objects[1], node_objects[2], mat_edge_main, 0.02)
create_edge(node_objects[1], node_objects[3], mat_edge_main, 0.02)
create_edge(node_objects[1], node_objects[4], mat_edge_main, 0.02)
# Provider -> response
create_edge(node_objects[2], node_objects[5], mat_edge_main, 0.02)
create_edge(node_objects[3], node_objects[5], mat_edge_main, 0.02)
create_edge(node_objects[4], node_objects[5], mat_edge_main, 0.02)
# Failure path (dashed feel via thinner + different color)
create_edge(node_objects[3], node_objects[6], mat_edge_fail, 0.015)
# Fallback -> router
create_edge(node_objects[6], node_objects[7], mat_edge_fail, 0.015)
create_edge(node_objects[7], node_objects[1], mat_edge_fail, 0.015)

# --- Ground ---
bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, -0.6))
ground = bpy.context.active_object
ground.name = 'Ground'
ground.data.materials.append(mat_ground)

# --- Lighting ---
bpy.ops.object.light_add(type='AREA', location=(5, -4, 7))
key = bpy.context.active_object
key.data.energy = 350
key.data.size = 3
key.data.color = (1.0, 0.95, 0.9)

bpy.ops.object.light_add(type='AREA', location=(-4, 3, 4))
fill = bpy.context.active_object
fill.data.energy = 120
fill.data.size = 5
fill.data.color = (0.85, 0.9, 1.0)

bpy.ops.object.light_add(type='POINT', location=(0, 0, 3))
top = bpy.context.active_object
top.data.energy = 60
top.data.color = (0.5, 0.45, 0.6)

# --- Camera ---
bpy.ops.object.camera_add(location=(0, -8, 6))
cam = bpy.context.active_object
cam.rotation_euler = (math.radians(50), 0, 0)
cam.data.lens = 40
cam.data.dof.use_dof = True
cam.data.dof.aperture_fstop = 4.0
scene.camera = cam

# --- Render ---
filepath = os.path.join(OUTPUT_DIR, 'hero-blender.webp')
scene.render.filepath = filepath
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.quality = 90
bpy.ops.render.render(write_still=True)
print(f"Rendered: {filepath}")
