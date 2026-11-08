"""
Hybrid-materials — three conceptual software objects on a studio plate.

Objects:
  1. sharecli capsules on a queue rail
  2. substrate layered policy ports
  3. phenotype-omlx compute / memory slabs

Palette: graphite, porcelain, muted teal.
Camera: orthographic, 1200 x 800.
Render: Cycles CPU, 32 samples + denoising.

Reproducible with seed=0.  All geometry is procedural; no third-party assets.
"""
import argparse
import hashlib
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

parser = argparse.ArgumentParser()
parser.add_argument('--output-dir', required=True,
                    help='Output directory for renders and manifest.')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])

OUT = Path(args.output_dir).resolve()
OUT.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 1200, 800

# ---------------------------------------------------------------------------
# Reset
# ---------------------------------------------------------------------------

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------

def _mat(name, rgb, *, roughness=0.45, metallic=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*rgb, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 0.55
    return m

graphite_dark   = _mat('Graphite Dark',   (0.12, 0.13, 0.15), roughness=0.70, metallic=0.15)
graphite_mid    = _mat('Graphite Mid',    (0.22, 0.24, 0.27), roughness=0.55, metallic=0.10)
porcelain       = _mat('Porcelain',       (0.88, 0.86, 0.82), roughness=0.28, metallic=0.0)
teal_muted      = _mat('Muted Teal',      (0.34, 0.58, 0.56), roughness=0.42, metallic=0.20)
teal_light      = _mat('Teal Light',      (0.48, 0.70, 0.68), roughness=0.38, metallic=0.15)
rail_metal      = _mat('Rail Metal',      (0.30, 0.32, 0.35), roughness=0.35, metallic=0.55)
plate_studio    = _mat('Studio Plate',    (0.74, 0.71, 0.64), roughness=0.82, metallic=0.0)

# ---------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------

def _box(name, loc, scale, mat, *, bevel=0.03, segments=3):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        mod = o.modifiers.new('Bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = segments
        mod.affect = 'EDGES'
    o.data.materials.append(mat)
    return o

def _cyl(name, loc, radius, depth, mat, *, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(mat)
    return o

def _rounded_pill(name, loc, length, width, height, mat, *, bevel=0.03, segments=3):
    """Elongated capsule (box + two half-cylinders via bevel)."""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = (length, width, height)
    bpy.ops.object.transform_apply(scale=True)
    # Heavy bevel rounds edges into a pill silhouette
    if bevel > 0:
        mod = o.modifiers.new('Bevel', 'BEVEL')
        mod.width = min(bevel, min(width, height) * 0.45)
        mod.segments = segments
        mod.affect = 'EDGES'
    o.data.materials.append(mat)
    return o

# ---------------------------------------------------------------------------
# 1. Sharecli capsules on queue rail
# ---------------------------------------------------------------------------
# Rail: thin dark bar running left-to-right, slightly raised.
# Capsules: small porcelain pill shapes sitting on the rail, with teal accents
# marking "active" capsules.

RAIL_Y = 0.0
RAIL_Z = 0.22
RAIL_LEN = 5.0
RAIL_WID = 0.14
RAIL_HT  = 0.06

_box('ShareCLI_Rail', (0, RAIL_Y, RAIL_Z),
     (RAIL_LEN, RAIL_WID, RAIL_HT), rail_metal, bevel=0.015)

# Rail guide rails (two thin lines on either side of the capsules)
for side in (-1, 1):
    _box(f'GuideRail_{side}',
         (0, RAIL_Y + side * 0.18, RAIL_Z + 0.035),
         (RAIL_LEN, 0.025, 0.025), graphite_mid, bevel=0.005)

# Six capsules across the rail — alternating porcelain and teal
CAP_SPACING = 0.72
CAP_LEN = 0.42
CAP_WID = 0.22
CAP_HT  = 0.14
capsule_positions = [-1.80, -1.08, -0.36, 0.36, 1.08, 1.80]

for i, cx in enumerate(capsule_positions):
    mat = teal_muted if i == 3 else porcelain  # 4th capsule is "active"
    pill_name = f'Capsule_{i:02d}'
    _rounded_pill(pill_name, (cx, RAIL_Y, RAIL_Z + RAIL_HT / 2 + CAP_HT / 2 + 0.01),
                  CAP_LEN, CAP_WID, CAP_HT, mat, bevel=0.06, segments=4)
    # Small status dot on the active capsule
    if i == 3:
        _cyl(f'StatusDot_{i}',
             (cx + CAP_LEN * 0.35, RAIL_Y, RAIL_Z + RAIL_HT / 2 + CAP_HT + 0.03),
             radius=0.035, depth=0.02, mat=teal_light)

# Queue direction arrow (small chevron on the rail surface)
_box('QueueArrow_Body', (-2.1, RAIL_Y, RAIL_Z + RAIL_HT / 2 + 0.008),
     (0.22, 0.06, 0.008), teal_muted, bevel=0.003)
for arm_side in (-1, 1):
    _cyl(f'QueueArrow_Arm_{arm_side}',
         (-2.1 - 0.06, RAIL_Y + arm_side * 0.06, RAIL_Z + RAIL_HT / 2 + 0.008),
         radius=0.02, depth=0.14, mat=teal_muted,
         rotation=(0, math.pi / 2, arm_side * 0.45))


# ---------------------------------------------------------------------------
# 2. Substrate layered policy ports
# ---------------------------------------------------------------------------
# Stack of three rectangular slabs with small "port" cylinders visible on
# the front face.  Layered to suggest a policy stack.

SUB_X = 0.0
SUB_Y = -2.2
SUB_Z_BASE = 0.08
LAYER_WID = 2.4
LAYER_LEN = 1.2
LAYER_HT  = 0.12
LAYER_GAP = 0.04
NUM_LAYERS = 3

for li in range(NUM_LAYERS):
    z = SUB_Z_BASE + li * (LAYER_HT + LAYER_GAP)
    mat = [graphite_dark, graphite_mid, porcelain][li]
    _box(f'PolicyLayer_{li}',
         (SUB_X, SUB_Y, z + LAYER_HT / 2),
         (LAYER_LEN, LAYER_WID, LAYER_HT), mat, bevel=0.025)

    # Port cylinders on the front face — two per layer
    port_mat = teal_muted if li < 2 else teal_light
    for pi in range(2):
        px = SUB_X - 0.30 + pi * 0.60
        _cyl(f'Port_L{li}_P{pi}',
             (px, SUB_Y - LAYER_WID / 2 - 0.03, z + LAYER_HT / 2),
             radius=0.055, depth=0.08, mat=port_mat,
             rotation=(math.pi / 2, 0, 0))

# Label plate under the stack
_box('PolicyLabel', (SUB_X, SUB_Y, SUB_Z_BASE - 0.04),
     (LAYER_LEN * 0.6, 0.08, 0.015), teal_light, bevel=0.004)


# ---------------------------------------------------------------------------
# 3. Phenotype-OMLX compute / memory slabs
# ---------------------------------------------------------------------------
# Two wide, low slabs side by side — "compute" (graphite) and "memory"
# (porcelain) — with small teal indicator rectangles and connecting traces.

PHX_X = 0.0
PHX_Y = 2.4
PHX_Z = 0.08
SLAB_WID = 2.6
SLAB_LEN = 1.0
SLAB_HT  = 0.18
SLAB_GAP = 0.25

# Compute slab (graphite, left)
_box('ComputeSlab', (PHX_X - SLAB_GAP / 2 - SLAB_WID / 2, PHX_Y, PHX_Z + SLAB_HT / 2),
     (SLAB_LEN, SLAB_WID, SLAB_HT), graphite_dark, bevel=0.035)

# Memory slab (porcelain, right)
_box('MemorySlab', (PHX_X + SLAB_GAP / 2 + SLAB_WID / 2, PHX_Y, PHX_Z + SLAB_HT / 2),
     (SLAB_LEN, SLAB_WID, SLAB_HT), porcelain, bevel=0.035)

# Teal indicator bars on compute slab surface (4 small bars)
for bi in range(4):
    bx = PHX_X - SLAB_GAP / 2 - SLAB_WID / 2 - 0.30 + bi * 0.22
    _box(f'ComputeIndicator_{bi}',
         (bx, PHX_Y, PHX_Z + SLAB_HT + 0.012),
         (0.14, 0.08, 0.012), teal_muted, bevel=0.003)

# Memory capacity indicators on memory slab (3 wider bars)
for bi in range(3):
    bx = PHX_X + SLAB_GAP / 2 + SLAB_WID / 2 - 0.22 + bi * 0.24
    _box(f'MemoryIndicator_{bi}',
         (bx, PHX_Y, PHX_Z + SLAB_HT + 0.012),
         (0.18, 0.10, 0.012), teal_light, bevel=0.003)

# Bus trace connecting the two slabs
_bus_w = SLAB_GAP + SLAB_LEN + 0.15
_box('BusTrace', (PHX_X, PHX_Y, PHX_Z + SLAB_HT + 0.006),
    (_bus_w, 0.35, 0.06), rail_metal, bevel=0.010)

# Readable text labels on each slab — genuine Blender text objects
for label_text, lx, contrast_mat in [
        ('COMPUTE', PHX_X - SLAB_GAP / 2 - SLAB_WID / 2, teal_light),
        ('MEMORY',  PHX_X + SLAB_GAP / 2 + SLAB_WID / 2, teal_muted)]:
    bpy.ops.object.text_add(
        location=(lx, PHX_Y, PHX_Z + SLAB_HT + 0.008))
    _txt = bpy.context.object
    _txt.name = f'Text_{label_text}'
    _txt.data.body = label_text
    _txt.data.size = 0.16
    _txt.data.extrude = 0.014
    _txt.data.resolution_u = 4
    _txt.data.align_x = 'CENTER'
    _txt.data.align_y = 'CENTER'
    _txt.data.materials.append(contrast_mat)
    bpy.ops.object.convert(target='MESH')


# ---------------------------------------------------------------------------
# Lighting
# ---------------------------------------------------------------------------
for lname, loc, energy, size in [
    ('Key',   ( 1.5,  -6.0, 10.0), 1800, 8.0),
    ('Fill',  (-5.5,   3.5,  7.0),  950, 7.0),
    ('Rim',   ( 4.5,   5.0,  5.5),  480, 5.5),
]:
    bpy.ops.object.light_add(type='AREA', location=loc)
    lamp = bpy.context.object
    lamp.name = f'Light_{lname}'
    lamp.data.energy = energy
    lamp.data.shape = 'DISK'
    lamp.data.size = size
    lamp.rotation_euler = (
        Vector((0, 0, 0)) - lamp.location
    ).to_track_quat('-Z', 'Y').to_euler()


# ---------------------------------------------------------------------------
# Render setup
# ---------------------------------------------------------------------------
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.world.color = (0.30, 0.30, 0.30)
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'


# ---------------------------------------------------------------------------
# Camera (orthographic)
# ---------------------------------------------------------------------------
cam_loc = (0.0, -9.5, 14.0)
bpy.ops.object.camera_add(location=cam_loc)
cam = bpy.context.object
cam.name = 'Camera_Ortho'
# Point camera slightly forward of centre to frame all three groups
target = Vector((0.0, 0.3, 0.4))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.type = 'ORTHO'
cam.data.ortho_scale = 11.5
scene.camera = cam
scene.render.resolution_x = WIDTH
scene.render.resolution_y = HEIGHT

png_path = OUT / 'hybrid-materials.png'
scene.render.filepath = str(png_path)
bpy.ops.render.render(write_still=True)
print(f'PNG rendered -> {png_path}')


# ---------------------------------------------------------------------------
# Provenance manifest
# ---------------------------------------------------------------------------

png_bytes = png_path.read_bytes()
md5 = hashlib.md5(png_bytes).hexdigest()
sha256 = hashlib.sha256(png_bytes).hexdigest()

manifest = {
    'asset': 'hybrid-materials',
    'description': (
        'Three conceptual software objects — sharecli capsules on queue rail, '
        'substrate layered policy ports, phenotype-omlx compute/memory slabs — '
        'rendered as a single studio plate.'
    ),
    'palette': ['graphite', 'porcelain', 'muted teal'],
    'camera': {
        'type': 'ORTHO',
        'position': list(cam_loc),
        'ortho_scale': cam.data.ortho_scale,
        'target': [target.x, target.y, target.z],
    },
    'resolution': {'width': WIDTH, 'height': HEIGHT},
    'renderer': 'Cycles CPU, 32 samples, denoising, AgX view transform',
    'seed': 0,
    'boundary': (
        'Original procedural geometry.  No third-party assets.  '
        'Hand-authored explanatory artwork, not recorded tool output.'
    ),
    'generator': 'build_scene.py',
    'rendered_png': {
        'filename': png_path.name,
        'size_bytes': len(png_bytes),
        'md5': md5,
        'sha256': sha256,
    },
}

manifest_path = OUT / 'provenance.json'
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Manifest written -> {manifest_path}')
try:
    scene.view_settings.view_transform = 'AgX'
except TypeError:
    scene.view_settings.view_transform = 'Standard'
