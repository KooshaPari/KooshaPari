# Blender Recovery Report — 2026-09-13

## Blender Binary Provenance

**System installation:** `/Applications/Blender.app` (Blender 4.4.3, arm64, built 2025-04-29)
- Symlink: `/opt/homebrew/bin/blender` → `/Applications/Blender.app/Contents/MacOS/Blender`
- **Root cause of prior failure:** The symlink path confuses Blender's macOS path resolution. When invoked via `/opt/homebrew/bin/blender`, the binary cannot find its bundled Python, scripts, or datafiles (reports "Bundled Python not found" and "couldn't find 'scripts/modules'").
- **Fix:** Use the resolved binary path `/Applications/Blender.app/Contents/MacOS/Blender` directly. All resources (Python 3.11.11, scripts/modules, datafiles) are present at `/Applications/Blender.app/Contents/Resources/4.4/`.
- **No downloads or installs required.** No isolated Blender was needed.

## Environment Fixes

1. **AgX view transform unavailable** in headless/background mode (missing OpenColorIO config). Patched both `build_scene.py` and `build_project.py` with try/except fallback to `Standard` view transform.
2. **Pillow not available** for PNG→WebP conversion. Used `cwebp` (installed at `/opt/homebrew/bin/cwebp`) instead.

## Script Patches Applied

| File | Change | Reason |
|------|--------|--------|
| `build_scene.py` | `scene.view_settings.view_transform = 'AgX'` → try/except fallback to `'Standard'` | AgX unavailable in headless |
| `build_project.py` | Same patch | Same reason |

## Render Results

All renders completed successfully via `Blender 4.4.3 --background --python <script>`.

### Composite (build_scene.py)
| File | Size | MD5 | SHA256 |
|------|------|-----|--------|
| hybrid-materials.png | 695,359 B | (see provenance) | (see provenance) |
| hybrid-materials.webp | 9,422 B | b2a0378d... | e4e98349... |

### Per-Project (build_project.py)
| Project | Desktop | Mobile |
|---------|---------|--------|
| sharecli | 8,660 B | 5,504 B |
| substrate | 6,304 B | 3,742 B |
| phenotype-omlx | 10,330 B | 6,346 B |

All 7 WebP files visually verified — geometry fixes from prior lane confirmed visible.

## Files Updated

### Asset Sources (render provenance)
- `asset-sources/hybrid-materials/hybrid-materials.png` — re-rendered composite
- `asset-sources/hybrid-materials/hybrid-materials.webp` — re-rendered composite
- `asset-sources/hybrid-materials/provenance.json` — updated hashes
- `asset-sources/hybrid-materials/render-sharecli/` — new desktop+mobile WebPs
- `asset-sources/hybrid-materials/render-substrate/` — new desktop+mobile WebPs
- `asset-sources/hybrid-materials/render-phenotype-omlx/` — new desktop+mobile WebPs
- Per-render `provenance.json` files updated with actual hashes

### Public Exports (final WebPs)
- `public/projects/hybrid-materials/hybrid-materials.webp` — composite
- `public/projects/hybrid-materials/sharecli-desktop.webp`
- `public/projects/hybrid-materials/sharecli-mobile.webp`
- `public/projects/hybrid-materials/substrate-desktop.webp`
- `public/projects/hybrid-materials/substrate-mobile.webp`
- `public/projects/hybrid-materials/phenotype-omlx-desktop.webp`
- `public/projects/hybrid-materials/phenotype-omlx-mobile.webp`
- `public/projects/hybrid-materials/provenance.json` — updated with real hashes

### Archive Preserved
- `docs/sessions/20260912-hybrid-materials-fix/archive/` — all prior exports intact (untouched)

## Render Differences vs Prior

| Metric | Prior (pre-fix) | Current (post-fix) | Delta |
|--------|-----------------|---------------------|-------|
| sharecli-desktop | 10,742 B | 8,660 B | -19% (re-render, different seeds/denoiser) |
| sharecli-mobile | 6,740 B | 5,504 B | -18% |
| substrate-desktop | 6,232 B | 6,304 B | +1% |
| substrate-mobile | 3,884 B | 3,742 B | -4% |
| phenotype-omlx-desktop | 8,148 B | 10,330 B | +27% (thicker bus trace + labels) |
| phenotype-omlx-mobile | 5,246 B | 6,346 B | +21% |
| composite.webp | 4,362 B | 9,422 B | +116% (Standard vs AgX color transform) |

Size changes reflect geometry fixes (bus trace thickened, stagger increased, labels added) and Standard view transform replacing AgX.

## Remaining Gates

1. ✅ All renders completed and visually verified
2. ✅ Provenance updated with actual byte hashes
3. ✅ Archive preserved (no deletes)
4. ✅ No app JS/CSS/data/dist files modified
5. ✅ No git/deploy/account changes
6. ⚠️ View transform is `Standard` not `AgX` — AgX requires full GUI mode or custom OCIO config. Acceptable for procedural artwork.
