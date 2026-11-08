# Project Visual and Asset Audit (Corrected)

Date: 2026-09-12

## Corrections to previous audit

The previous audit was largely accurate for asset inventory. Key corrections:

| Previous claim | Correction |
|---|---|
| "hybrid-shell.css and project-visuals.css MISSING" in audit #1 | Both exist (536 and 257 lines). The media module render paths through these CSS files are functional. |

## Project visual coverage matrix

| Project slug | Presentation type | FEATURED_PRESENTATIONS? | Visual assets | SVG diagram? | Case study data? | Coverage |
|---|---|---|---|---|---|---|
| `netweave` | experiment-note | Yes | 6x v3 WebP + v1/v2 | Yes (netweave-field.js) | 8 sections + diagram | MOST COMPLETE — v3 blind draft |
| `sharecli` | systems-sheet | Yes | card.webp + 2 .cast | Yes (sharecli-workbench.js) | 9 sections | PARTIAL — no runtime screenshot |
| `omniroute` | systems-sheet | Yes | card.webp (3.6KB) | Yes (omniroute-topology.js) | 10 sections | PARTIAL — external ownership |
| `gmk-arch` | physical-plate | Yes | hero.png (354x90) | No (image) | 8 sections | PARTIAL — single wordmark |
| `witf` | physical-plate | Yes | hero-01.jpg, hero-02.jpg (1600x900) | No (image) | 8 sections | PARTIAL — 2 product images |
| `substrate` | systems-sheet | Yes | card.webp | Yes (project-visuals.js) | 8 sections | PARTIAL — no screenshot |
| `phenotype-omlx` | experiment-note | Yes | card.webp | Yes (project-visuals.js) | 8 sections | PARTIAL — no benchmark visual |
| `byteport` | (none) | No | **NO ASSET DIR** | Yes (SVG) | **NO caseStudy** | MINIMAL |
| `tracera` | (none) | No | **NO ASSET DIR** | Yes (SVG) | **NO caseStudy** | MINIMAL |
| `dss-cipher` | (none) | No | hero.gif | No | **NO caseStudy** | PARTIAL — legacy GIF |
| `frostify` | (none) | No | No assets | No | **NO caseStudy** | MINIMAL |
| `cliproxyapi-plusplus` | (none) | No | No assets | No | No | EMPTY |
| `agentapi-plusplus` | (none) | No | No assets | No | No | EMPTY |
| `mcpforge` | (none) | No | No assets | No | No | EMPTY |
| `forgecode` | (none) | No | No assets | No | No | EMPTY |

## Media module inventory (verified)

| Module | Lines | Purpose |
|---|---|---|
| `project-visuals.js` | 400 | Per-project SVG diagram factory |
| `sharecli-workbench.js` | 236 | ShareCLI visual workbench |
| `netweave-workbench.js` | 148 | NetWeave workbench state machine |
| `omniroute-topology.js` | 89 | OmniRoute routing diagram |
| `netweave-field.js` | 85 | NetWeave traffic field |
| `sharecli-recording.js` | 62 | ShareCLI cast replay |
| `systems-plate.js` | 58 | Shared systems diagram tokens |
| `diagrams.js` | 51 | Base diagram primitives |
| `model-slot.js` | 13 | Model slot placeholder |
| `layered-image.js` | 12 | Layered image wrapper |

## Dist vs source discrepancies

- `dist/styles/` is missing `project-index.css` (exists in source `styles/`).
- `dist/public/projects/` includes v2 WebP derivatives for NetWeave that source does not list as modified.
- `dist/` contains `work/agentapi-plusplus.html`, `cliproxyapi-plusplus.html`, `forgecode.html`, `mcpforge.html` which are NOT in `git diff --name-only` (already committed or unchanged).

## Asset provenance status

- `asset-sources/netweave-local-rules-v1/`: Contains `build_scene_v3.py` and `manifest-v3.json`. No actual Blender `.blend` source is in the worktree (it is private/custody). **Blender source is absent — cannot re-render from this worktree.**
- WITF and GMK Arch images have SHA-256 hashes and retained-source records in `data/projects.js`.
- No editable PSD/AI/Figma source exists in the repository.
