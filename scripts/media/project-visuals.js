import { el, onImageFallback } from '../components/dom.js';
import { renderOmniRouteTopology } from './omniroute-topology.js';
import { DIAGRAM_DEFINITIONS, renderDiagramVisual } from './project-diagrams.js';

/* ================================================================
   Project Visuals — semantic visual factory per project.

   Every project receives deliberate visual coverage. The visual
   family is chosen by project slug and the render mode:

     'detail'   Full case-study visual with caption and provenance
     'artifact' Home page artifact card (compact)
     'compact'  Archive row (minimal)

   Families:
     physical   Real product images with framing
     topology   SVG system-architecture diagram
     experiment SVG experiment / fork-delta diagram
     recording  Terminal replay surface
     compact    Archive-grade minimal visual

   Actual product images remain actual product images. Conceptual
   procedural objects describe software relationships and are
   captioned accordingly. Generated objects must not imply measured
   telemetry, exact product geometry, or historical simulation output.
   ================================================================ */

// ── SVG helper ──────────────────────────────────────────────────
function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const child of children.flat(Infinity)) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

// ── Physical product visual ─────────────────────────────────────

function renderPhysicalVisual(project) {
  const image = project.gallery?.[0];
  if (!image) {
    return el('div', { class: 'project-visual project-visual--empty', 'data-visual': 'physical' },
      el('p', {}, 'Product imagery is being prepared.'),
    );
  }

  const asset = project.presentation?.assets?.find((a) => a.src === image);
  const alt = asset?.alt ?? project.presentation?.alt ?? `${project.title} product visual`;

  return el('figure', { class: 'project-visual project-visual--physical', 'data-visual': project.slug },
    el('div', { class: 'project-visual__image-frame' },
      onImageFallback(el('img', {
        src: image,
        alt,
        loading: 'eager',
        decoding: 'async',
        fetchpriority: 'high',
        width: asset?.width ?? project.presentation?.media?.width ?? 1600,
        height: asset?.height ?? project.presentation?.media?.height ?? 900,
      })),
    ),
    el('figcaption', {}, `${project.category} / ${project.status}`),
  );
}

// ── Physical gallery (multi-image) ──────────────────────────────

function renderPhysicalGallery(project) {
  if (!project.gallery?.length) return null;

  return el('div', { class: 'project-visual project-visual--gallery', 'data-visual': `${project.slug}-gallery` },
    project.gallery.map((src) => {
      const asset = project.presentation?.assets?.find((a) => a.src === src);
      return el('figure', { class: 'project-visual__gallery-item' },
        onImageFallback(el('img', {
          src,
          alt: asset?.alt ?? project.presentation?.alt ?? `${project.title} visual`,
          loading: 'lazy',
          decoding: 'async',
          width: asset?.width ?? project.presentation?.media?.width ?? 1600,
          height: asset?.height ?? project.presentation?.media?.height ?? 900,
        })),
        asset?.alt ? el('figcaption', {}, asset.alt) : null,
      );
    }),
  );
}

// ── Compact archive visual ──────────────────────────────────────

function renderCompactVisual(project) {
  const image = project.gallery?.[0];
  const hasImage = Boolean(image);

  return el('div', {
    class: `project-visual project-visual--compact${hasImage ? ' project-visual--compact-image' : ''}`,
    'data-visual': 'compact',
  },
    hasImage
      ? onImageFallback(el('img', {
        src: image,
        alt: project.presentation?.alt ?? `${project.title} visual`,
        loading: 'lazy',
        decoding: 'async',
        width: 80,
        height: 80,
      }))
      : el('div', { class: 'project-visual__compact-placeholder' },
        el('span', {}, project.title.charAt(0)),
      ),
  );
}

const PHYSICAL_SLUGS = new Set(['gmk-arch', 'witf', 'dss-cipher']);
const ARCHIVE_SLUGS = new Set(['mcpforge', 'forgecode', 'frostify']);
const MATERIAL_IMAGE_SLUGS = new Set(['sharecli', 'substrate']);

// ── OmniRoute detail visual (delegates to topology renderer) ─────
function renderOmniRouteDetailVisual(lens) {
  const topology = renderOmniRouteTopology(lens);
  return el('figure', { class: 'project-visual project-visual--topology', 'data-visual': 'omniroute' },
    el('div', { class: 'project-visual__plate' },
      el('div', { class: 'project-visual__plate-header' },
        el('span', {}, 'OmniRoute / routing plate'),
        el('span', {}, 'Conceptual model'),
      ),
      topology,
    ),
    el('figcaption', {}, 'OmniRoute routing overview. Failure paths are conditional; dashed in the diagram.'),
  );
}

// ── phenotype-omlx experiment specimen (detail mode) ───────────
function renderOmlxExperimentSpecimen(project) {
  const nodeW = 200;
  const nodeH = 52;
  const svgContent = [
    svg('title', { id: 'omlx-experiment-title' }, 'phenotype-omlx fork-delta experiment'),
    svg('desc', { id: 'omlx-experiment-desc' },
      'Conceptual experiment boundary: upstream MLX runtime feeds fork additions for routing, Rust performance cores, and evaluation.'),
    svg('defs', {},
      svg('marker', {
        id: 'omlx-arrow', viewBox: '0 0 10 10', refX: 10, refY: 5,
        markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse',
      }, svg('path', { d: 'M0 0 L10 5 L0 10 Z', fill: 'var(--family-accent, var(--arch-500))' }))),
    // Edges
    svg('path', { d: 'M134 72 V112', fill: 'none', class: 'project-visual__edge', 'marker-end': 'url(#omlx-arrow)' }),
    svg('path', { d: 'M134 168 V208', fill: 'none', class: 'project-visual__edge', 'marker-end': 'url(#omlx-arrow)' }),
    svg('path', { d: 'M134 264 V304', fill: 'none', class: 'project-visual__edge', 'marker-end': 'url(#omlx-arrow)' }),
    svg('path', { d: 'M244 140 H360', fill: 'none', class: 'project-visual__edge',
      'stroke-dasharray': '6 5', 'marker-end': 'url(#omlx-arrow)' }),
    svg('path', { d: 'M460 112 V208', fill: 'none', class: 'project-visual__edge',
      'stroke-dasharray': '6 5', 'marker-end': 'url(#omlx-arrow)' }),
    // Nodes
    svg('g', { class: 'project-visual__node', transform: 'translate(24 16)' },
      svg('rect', { width: nodeW, height: nodeH, rx: 3 }),
      svg('text', { x: 14, y: 32 }, 'Upstream omlx runtime')),
    svg('g', { class: 'project-visual__node', transform: 'translate(24 112)' },
      svg('rect', { width: nodeW, height: nodeH, rx: 3 }),
      svg('text', { x: 14, y: 32 }, 'Multi-backend routing')),
    svg('g', { class: 'project-visual__node', transform: 'translate(24 208)' },
      svg('rect', { width: nodeW, height: nodeH, rx: 3 }),
      svg('text', { x: 14, y: 32 }, 'Rust performance cores')),
    svg('g', { class: 'project-visual__node', transform: 'translate(24 304)' },
      svg('rect', { width: nodeW, height: nodeH, rx: 3 }),
      svg('text', { x: 14, y: 32 }, 'Evaluation paths')),
    svg('g', { class: 'project-visual__node', transform: 'translate(360 112)' },
      svg('rect', { width: nodeW, height: nodeH, rx: 3 }),
      svg('text', { x: 14, y: 32 }, 'Fork delta scope')),
  ].filter(Boolean);

  const svgEl = svg('svg', {
    class: 'project-visual__svg',
    viewBox: '0 0 600 380',
    role: 'img',
    'aria-labelledby': 'omlx-experiment-title omlx-experiment-desc',
  }, ...svgContent);

  const steps = [
    'The upstream omlx runtime provides MLX-focused inference primitives.',
    'The fork adds multi-backend routing to compare inference paths across backends.',
    'Rust performance cores isolate compute-sensitive paths for measurement.',
    'Evaluation paths run comparison workloads against the routing layer.',
    'The fork delta scope is limited to routing, performance, and evaluation additions; upstream attribution is retained.',
  ];

  const figure = el('figure', { class: 'project-visual project-visual--diagram', 'data-visual': 'phenotype-omlx' },
    el('div', { class: 'project-visual__plate' },
      el('div', { class: 'project-visual__plate-header' },
        el('span', {}, 'phenotype-omlx fork-delta experiment'),
        el('span', {}, 'Conceptual model'),
      ),
      svgEl,
    ),
    el('figcaption', {}, 'Fork-delta experiment boundary. Upstream attribution to jundot/omlx is retained.'),
    el('details', { class: 'project-visual__reader' },
      el('summary', {}, 'Read experiment boundary'),
      el('ol', {}, ...steps.map((step) => el('li', {}, step))),
    ),
  );
  figure._steps = steps;
  return figure;
}

// ── Material image slot (physical material view for systems projects) ──
function renderMaterialSlot(project) {
  const slug = project.slug;
  const desktop = `/public/projects/hybrid-materials/${slug}-desktop.webp`;
  const mobile = `/public/projects/hybrid-materials/${slug}-mobile.webp`;
  const label = {
    sharecli: 'Process runtime material boundary',
    substrate: 'Provider routing material boundary',
    'phenotype-omlx': 'MLX inference material boundary',
  }[slug];
  if (!label) return null;

  return el('figure', { class: 'project-visual project-visual--material', 'data-visual': `${slug}-material` },
    el('div', { class: 'project-visual__image-frame' },
      el('picture', {},
        el('source', { media: '(max-width: 600px)', srcset: mobile, type: 'image/webp' }),
        onImageFallback(el('img', {
            src: desktop,
            alt: project.presentation?.alt ?? `${project.title} material boundary`,
            loading: 'lazy',
            decoding: 'async',
            width: 1200,
            height: 800,
        })),
      ),
    ),
    el('figcaption', {}, label),
  );
}

// ── Compact archive specimen (larger than row compact, with boundary) ──
function renderArchiveSpecimen(project) {
  const image = project.gallery?.[0];
  const boundary = {
    mcpforge: 'Attributed to isaacphi/mcp-language-server; upstream attribution retained.',
    forgecode: 'Attributed to tailcallhq/forgecode; upstream attribution retained.',
    frostify: 'Fork of gwennlbh/Frostify; upstream attribution retained. GitHub release-asset downloads are not a user count.',
  }[project.slug] ?? 'Historical entry with provenance preserved.';

  const categories = {
    mcpforge: 'Developer tools',
    forgecode: 'Developer tools',
    frostify: 'Design',
  }[project.slug] ?? project.category;

  const mediaFig = image
    ? el('figure', { class: 'project-visual__gallery-item' },
        onImageFallback(el('img', {
          src: image,
          alt: project.presentation?.alt ?? `${project.title} archive visual`,
          loading: 'lazy',
          decoding: 'async',
          width: 640,
          height: 360,
        })),
        el('figcaption', {}, `${categories} / ${project.status}`),
      )
    : el('div', { class: 'project-visual__compact-placeholder' },
        el('span', {}, project.title.charAt(0)),
      );

  return el('div', { class: 'project-visual project-visual--archive', 'data-visual': `${project.slug}-archive` },
    mediaFig,
    el('p', { class: 'project-visual__boundary' }, boundary),
  );
}

// ── Public factory ──────────────────────────────────────────────

/**
 * Render a project visual appropriate to the slug and mode.
 *
 * @param {object} project  - Project record from data/projects.js
 * @param {object} opts
 * @param {string} opts.lens  - 'engineering' | 'product'
 * @param {string} opts.mode  - 'detail' | 'artifact' | 'compact'
 * @returns {HTMLElement|null}
 */
export function renderProjectVisual(project, { lens = 'engineering', mode = 'detail' } = {}) {
  if (!project) return null;

  const slug = project.slug;

  // Compact mode: archive row
  if (mode === 'compact') {
    return renderCompactVisual(project);
  }

  // Physical products: real images.
  // In detail mode, return null because project-detail.js already renders
  // heroPlate + case-gallery for physical products. Only provide visuals
  // for artifact mode (home page cards).
  if (PHYSICAL_SLUGS.has(slug)) {
    if (mode === 'artifact') {
      return renderPhysicalVisual(project);
    }
    return null;
  }

  // Material image slot: systems projects get a material boundary image
  // below their workbench/plate. Only render in detail mode.
  if (MATERIAL_IMAGE_SLUGS.has(slug)) {
    if (mode === 'detail') {
      return renderMaterialSlot(project);
    }
    return null;
  }

  // NetWeave: delegating to existing workbench (no double-render)
  if (slug === 'netweave') {
    return null;
  }

  // OmniRoute detail: render the topology diagram via the dedicated renderer
  if (slug === 'omniroute') {
    if (mode === 'detail') {
      return renderOmniRouteDetailVisual(lens);
    }
    return null;
  }

  // phenotype-omlx detail: render a fork-delta experiment specimen
  if (slug === 'phenotype-omlx') {
    if (mode === 'detail') {
      return renderOmlxExperimentSpecimen(project);
    }
    return null;
  }

  // Archive projects: render a compact specimen with historical boundary
  if (ARCHIVE_SLUGS.has(slug)) {
    if (mode === 'detail') {
      return renderArchiveSpecimen(project);
    }
    return null;
  }

  // Projects with new SVG diagrams
  if (DIAGRAM_DEFINITIONS[slug]) {
    return renderDiagramVisual(DIAGRAM_DEFINITIONS[slug]);
  }

  // Fallback: compact visual for artifact mode only.
  if (mode === 'detail') return null;
  return renderCompactVisual(project);
}

/**
 * Return the visual family name for a project slug.
 * Used by CSS for family-specific styling.
 */
export function projectVisualFamily(slug) {
  if (PHYSICAL_SLUGS.has(slug)) return 'physical';
  if (slug === 'netweave') return 'netweave';
  if (slug === 'sharecli') return 'sharecli';
  if (slug === 'omniroute') return 'omniroute';
  if (slug === 'substrate') return 'substrate';
  if (slug === 'phenotype-omlx') return 'omlx';
  if (DIAGRAM_DEFINITIONS[slug]) return 'diagram';
  return 'compact';
}

/**
 * Return alt text / summary for a project visual.
 * Used by artifact.js and project-detail.js for accessibility.
 */
export function projectVisualAlt(project) {
  if (!project) return '';
  const asset = project.presentation?.assets?.[0];
  if (asset?.alt) return asset.alt;
  if (project.presentation?.alt) return project.presentation.alt;
  return project.summary ?? `${project.title} project visual`;
}
