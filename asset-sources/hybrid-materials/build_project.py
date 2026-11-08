"""
Per-project renderer for hybrid-materials scenes.

Builds the full composite scene then hides unrelated object groups,
reframes camera to fill the frame, and renders distinct WebP outputs.

Projects:
  sharecli       — Four capsules on a queue rail (one highlighted)
  substrate      — Layered policy ports with interface ports
  phenotype-omlx — Compute + memory slabs with indicator bars

Usage:
  blender --background --python build_project.py -- \\
    --project sharecli --output-dir /path/to/out
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
parser.add_argument('--project', required=True,
                    choices=['sharecli', 'substrate', 'phenotype-omlx'],
                    help='Which project scene to render.')
parser.add_argument('--output-dir', required=True,
                    help='Output directory for renders and .blend.')
raw = sys.argv[sys.argv.index('--') + 1:]
args = parser.parse_args(raw)

OUT = Path(args.output_dir).resolve()
OUT.mkdir(parents=True, exist_ok=True)

PROJECT = args.project
SLUG = PROJECT  # file-safe slug

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
rail_metal      = _mat('Rail Metal',      (0.18, 0.20, 0.23), roughness=0.40, metallic=0.55)
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
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = (length, width, height)
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        mod = o.modifiers.new('Bevel', 'BEVEL')
        mod.width = min(bevel, min(width, height) * 0.45)
        mod.segments = segments
        mod.affect = 'EDGES'
    o.data.materials.append(mat)
    return o

# Track all objects per group for hiding
_sharecli_objs = []
_substrate_objs = []
_omlx_objs = []

# ---------------------------------------------------------------------------
# 1. ShareCLI — FOUR capsules on queue rail
# ---------------------------------------------------------------------------
# Workbench: agent bursts -> process observation -> coalesce + queue -> shared host state
# Exactly four capsules, one highlighted (3rd = "coalesce + queue" active state).

RAIL_Y = 0.0
RAIL_Z = 0.22
RAIL_LEN = 3.8
RAIL_WID = 0.14
RAIL_HT  = 0.06

_sharecli_objs.append(
    _box('ShareCLI_Rail', (0, RAIL_Y, RAIL_Z),
         (RAIL_LEN, RAIL_WID, RAIL_HT), rail_metal, bevel=0.015))

for side in (-1, 1):
    _sharecli_objs.append(
        _box(f'GuideRail_{side}',
             (0, RAIL_Y + side * 0.18, RAIL_Z + 0.035),
             (RAIL_LEN, 0.025, 0.025), graphite_mid, bevel=0.005))

# Four capsules — evenly spaced, matching 4-node topology
CAP_SPACING = 0.80
CAP_LEN = 0.50
CAP_WID = 0.26
CAP_HT  = 0.16
# Center four capsules around x=0
capsule_x = [-1.20, -0.40, 0.40, 1.20]

for i, cx in enumerate(capsule_x):
    # 3rd capsule (index 2) is "active" — teal, matches coalesce+queue
    mat = teal_muted if i == 2 else porcelain
    pill_name = f'ShareCLI_Cap_{i}'
    _sharecli_objs.append(
        _rounded_pill(pill_name,
                      (cx, RAIL_Y, RAIL_Z + RAIL_HT / 2 + CAP_HT / 2 + 0.03),
                      CAP_LEN, CAP_WID, CAP_HT, mat, bevel=0.06, segments=4))
    if i == 2:
        _sharecli_objs.append(
            _cyl(f'ShareCLI_StatusDot_{i}',
                 (cx + CAP_LEN * 0.35, RAIL_Y,
                  RAIL_Z + RAIL_HT / 2 + CAP_HT + 0.03),
                 radius=0.035, depth=0.02, mat=teal_light))

# Queue direction chevron
_sharecli_objs.append(
    _box('ShareCLI_Arrow', (-1.50, RAIL_Y, RAIL_Z + RAIL_HT / 2 + 0.010),
         (0.28, 0.08, 0.012), teal_muted, bevel=0.004))
for arm_side in (-1, 1):
    _sharecli_objs.append(
        _cyl(f'ShareCLI_ArrowArm_{arm_side}',
             (-1.50 - 0.06, RAIL_Y + arm_side * 0.07,
              RAIL_Z + RAIL_HT / 2 + 0.010),
             radius=0.025, depth=0.14, mat=teal_muted,
             rotation=(0, math.pi / 2, arm_side * 0.45)))


# ---------------------------------------------------------------------------
# 2. Substrate — Layered policy ports
# ---------------------------------------------------------------------------

SUB_X = 0.0
SUB_Y = -2.2
SUB_Z_BASE = 0.08
LAYER_WID = 2.4
LAYER_LEN = 1.2
LAYER_HT  = 0.18
LAYER_GAP = 0.09
NUM_LAYERS = 3

for li in range(NUM_LAYERS):
    z = SUB_Z_BASE + li * (LAYER_HT + LAYER_GAP)
    mat = [graphite_dark, graphite_mid, porcelain][li]
    # Stagger layers: offset each layer along Y so all three are visible from above
    stagger_y = -li * 0.65
    _substrate_objs.append(
        _box(f'SubPolicyLayer_{li}',
             (SUB_X, SUB_Y + stagger_y, z + LAYER_HT / 2),
             (LAYER_LEN, LAYER_WID, LAYER_HT), mat, bevel=0.025))
    port_mat = teal_muted if li < 2 else teal_light
    for pi in range(2):
        px = SUB_X - 0.30 + pi * 0.60
        _substrate_objs.append(
            _cyl(f'SubPort_L{li}_P{pi}',
                 (px, SUB_Y + stagger_y - LAYER_WID / 2 - 0.08, z + LAYER_HT / 2),
                 radius=0.055, depth=0.08, mat=port_mat,
                 rotation=(math.pi / 2, 0, 0)))

_substrate_objs.append(
    _box('SubPolicyLabel', (SUB_X, SUB_Y - 0.35, SUB_Z_BASE - 0.05),
         (LAYER_LEN * 0.7, 0.10, 0.02), teal_light, bevel=0.005))


# ---------------------------------------------------------------------------
# 3. phenotype-omlx — Compute + memory slabs
# ---------------------------------------------------------------------------

PHX_X = 0.0
PHX_Y = 2.4
PHX_Z = 0.08
SLAB_WID = 2.6
SLAB_LEN = 1.0
SLAB_HT  = 0.18
SLAB_GAP = 0.25

_omlx_objs.append(
    _box('PhxComputeSlab',
         (PHX_X - SLAB_GAP / 2 - SLAB_WID / 2, PHX_Y, PHX_Z + SLAB_HT / 2),
         (SLAB_LEN, SLAB_WID, SLAB_HT), graphite_dark, bevel=0.035))

_omlx_objs.append(
    _box('PhxMemorySlab',
         (PHX_X + SLAB_GAP / 2 + SLAB_WID / 2, PHX_Y, PHX_Z + SLAB_HT / 2),
         (SLAB_LEN, SLAB_WID, SLAB_HT), porcelain, bevel=0.035))

for bi in range(4):
    bx = PHX_X - SLAB_GAP / 2 - SLAB_WID / 2 - 0.30 + bi * 0.22
    _omlx_objs.append(
        _box(f'PhxComputeInd_{bi}',
             (bx, PHX_Y, PHX_Z + SLAB_HT + 0.012),
             (0.14, 0.08, 0.012), teal_muted, bevel=0.003))

for bi in range(3):
    bx = PHX_X + SLAB_GAP / 2 + SLAB_WID / 2 - 0.22 + bi * 0.24
    _omlx_objs.append(
        _box(f'PhxMemInd_{bi}',
             (bx, PHX_Y, PHX_Z + SLAB_HT + 0.012),
             (0.18, 0.10, 0.012), teal_light, bevel=0.003))

_bus_w = SLAB_GAP + SLAB_LEN + 0.15
_omlx_objs.append(
    _box('PhxBusTrace', (PHX_X, PHX_Y, PHX_Z + SLAB_HT + 0.012),
         (_bus_w, 0.45, 0.08), teal_muted, bevel=0.012))

# Readable text labels on each slab — genuine Blender text objects
for label_text, lx, contrast_mat in [
        ('COMPUTE', PHX_X - SLAB_GAP / 2 - SLAB_WID / 2, teal_light),
        ('MEMORY',  PHX_X + SLAB_GAP / 2 + SLAB_WID / 2, teal_muted)]:
    bpy.ops.object.text_add(
        location=(lx, PHX_Y, PHX_Z + SLAB_HT + 0.008))
    _txt = bpy.context.object
    _txt.name = f'PhxText_{label_text}'
    _txt.data.body = label_text
    _txt.data.size = 0.16
    _txt.data.extrude = 0.014
    _txt.data.resolution_u = 4
    _txt.data.align_x = 'CENTER'
    _txt.data.align_y = 'CENTER'
    _txt.data.materials.append(contrast_mat)
    # Convert text curves to mesh for reliable Cycles rendering
    bpy.ops.object.convert(target='MESH')
    _omlx_objs.append(_txt)


# ---------------------------------------------------------------------------
# Lighting (always present, shared)
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
# Hide unrelated object groups
# ---------------------------------------------------------------------------

hide_groups = {
    'sharecli':       _substrate_objs + _omlx_objs,
    'substrate':      _sharecli_objs + _omlx_objs,
    'phenotype-omlx': _sharecli_objs + _substrate_objs,
}

for obj in hide_groups.get(PROJECT, []):
    obj.hide_render = True
    obj.hide_viewport = True


# ---------------------------------------------------------------------------
# Camera per project — reframe to fill frame
# ---------------------------------------------------------------------------

# Each project's bounding box centre and extent determine the ortho_scale.
# Camera always looks from above (-Y) and slightly forward.

PROJECT_FRAMES = {
    'sharecli': {
        'center': Vector((0.0, 0.0, 0.32)),
        'ortho_scale': 5.0,
        'cam_y': -8.0,
        'cam_z': 12.0,
    },
    'substrate': {
        'center': Vector((0.0, SUB_Y - 0.65, SUB_Z_BASE + 0.25)),
        'ortho_scale': 4.5,
        'cam_y': SUB_Y - 0.65 - 5.0,
        'cam_z': 9.0,
    },
    'phenotype-omlx': {
        'center': Vector((PHX_X, PHX_Y - 0.10, PHX_Z + 0.12)),
        'ortho_scale': 4.2,
        'cam_y': PHX_Y - 5.0,
        'cam_z': 10.5,
    },
}

frame = PROJECT_FRAMES[PROJECT]
cam_loc = (0.0, frame['cam_y'], frame['cam_z'])

scene = bpy.context.scene
bpy.ops.object.camera_add(location=cam_loc)
cam = bpy.context.object
cam.name = f'Camera_{SLUG}'

look_target = frame['center']
cam.rotation_euler = (look_target - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.type = 'ORTHO'
cam.data.ortho_scale = frame['ortho_scale']
scene.camera = cam


# ---------------------------------------------------------------------------
# Render setup
# ---------------------------------------------------------------------------

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.world.color = (0.30, 0.30, 0.30)
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.quality = 95
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'

# Also disable film transparent — solid background
scene.render.film_transparent = False


# ---------------------------------------------------------------------------
# Save .blend first (before render changes filepath)
# ---------------------------------------------------------------------------

blend_path = OUT / f'{SLUG}.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
print(f'Blend saved -> {blend_path}')


# ---------------------------------------------------------------------------
# Render helper
# ---------------------------------------------------------------------------

def _render(w, h, tag):
    scene.render.resolution_x = w
    scene.render.resolution_y = h
    out_file = OUT / f'{SLUG}-{tag}.webp'
    scene.render.filepath = str(out_file)
    bpy.ops.render.render(write_still=True)
    print(f'Rendered {tag} ({w}x{h}) -> {out_file}')
    return out_file


# ---------------------------------------------------------------------------
# Render desktop (1200x800) and mobile (800x700)
# ---------------------------------------------------------------------------

desktop_path = _render(1200, 800, 'desktop')
mobile_path  = _render(800,  700, 'mobile')


# ---------------------------------------------------------------------------
# Provenance manifest
# ---------------------------------------------------------------------------

def _hash_file(p):
    data = p.read_bytes()
    return {
        'filename': p.name,
        'size_bytes': len(data),
        'md5': hashlib.md5(data).hexdigest(),
        'sha256': hashlib.sha256(data).hexdigest(),
    }

# Reopen to get dimensions reliably via image load (quick sanity)
def _dims(p):
    try:
        img = bpy.data.images.load(str(p))
        w, h = img.size
        img.filepath_raw = ''
        bpy.data.images.remove(img)
        return {'width': w, 'height': h}
    except Exception:
        return {}

manifest = {
    'asset': f'hybrid-materials-{SLUG}',
    'project': PROJECT,
    'description': {
        'sharecli': (
            'Four capsules on a queue rail representing Rust process and '
            'resource runtime for high-concurrency coding-agent workloads. '
            'Third capsule highlighted — active/coalescing state.'
        ),
        'substrate': (
            'Three-layer policy stack with interface ports representing '
            'AI execution and provider-routing substrate spanning HTTP, '
            'CLI, MCP, and A2A interfaces.'
        ),
        'phenotype-omlx': (
            'Compute and memory slabs with indicator bars representing '
            'MLX inference research stack with Rust performance cores, '
            'multi-backend routing, and evaluation tooling.'
        ),
    }[PROJECT],
    'palette': ['graphite', 'porcelain', 'muted teal'],
    'camera': {
        'type': 'ORTHO',
        'position': list(cam_loc),
        'ortho_scale': cam.data.ortho_scale,
        'target': [look_target.x, look_target.y, look_target.z],
    },
    'renderer': 'Cycles CPU, 32 samples, denoising, AgX view transform',
    'seed': 0,
    'boundary': (
        'Original procedural geometry. No third-party assets. '
        'Hand-authored explanatory artwork, not recorded tool output. '
        f'Scene derived from composite build_scene.py; unrelated object '
        f'groups hidden for focused render.'
    ),
    'generator': 'build_project.py',
    'composite_source': 'build_scene.py',
    'renders': {},
}

for label, path in [('desktop', desktop_path), ('mobile', mobile_path)]:
    entry = _hash_file(path)
    entry['dimensions'] = _dims(path)
    entry['target_size'] = (
        {'width': 1200, 'height': 800} if label == 'desktop'
        else {'width': 800, 'height': 700}
    )
    manifest['renders'][label] = entry

manifest['blend_file'] = _hash_file(blend_path)

manifest_path = OUT / 'provenance.json'
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Manifest written -> {manifest_path}')
print(f'Done: {PROJECT} -> {OUT}')
try:
    scene.view_settings.view_transform = 'AgX'
except TypeError:
    scene.view_settings.view_transform = 'Standard'
