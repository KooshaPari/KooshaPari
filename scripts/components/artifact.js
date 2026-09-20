import { el } from './dom.js';
import { renderOmniRouteTopology } from '../media/omniroute-topology.js';
import {
  createEvidenceLabel,
  createMetricAnnotation,
  evidenceLabel,
  metricAnnotation,
} from './evidence.js';
import {
  topologyLabels,
  experimentRows,
  ARTIFACT_FAMILY_MAP,
  createArtifactHeader,
  createAnnotationBlock,
  createTopologyNodes,
} from './artifact-helpers.js';
import { projectSpine, statusGlyph } from './visual-ascii.js';

// ASCII project spine: render only when the record carries metrics AND is a
// physical-product artifact. Skips witf because it ships its own viewer.
function physicalSpine(record) {
  if (record.category !== 'physical-product') return null;
  if (!Array.isArray(record.metrics) || record.metrics.length === 0) return null;
  if (record.slug === 'witf') return null;
  return el(
    'pre',
    {
      class: 'ascii-spine',
      'aria-hidden': 'true',
      'data-slug': record.slug,
      'data-status-glyph': statusGlyph(record.status),
    },
    projectSpine(
      record.slug,
      record.category,
      record.metrics.slice(0, 3).map((m) => m[0]),
    ),
  );
}

export function physicalPlate(record, lens) {
  const media = record.presentation?.media ?? {};
  const selectedAsset = record.presentation?.assets?.[0];
  const image = selectedAsset?.src ?? record.gallery?.[0];

  return el(
    'article',
    { class: `artifact artifact--physical artifact--${record.slug}`, 'data-artifact': record.slug, 'data-reveal': 'up', 'data-reveal-delay': '0' },
    physicalSpine(record),
    createArtifactHeader(record, 'Material artifact', el),
    image
      ? el(
          'figure',
          { class: 'artifact-media artifact-media--physical', 'data-tilt': '', 'data-tilt-max': '8', 'data-tilt-glare': 'true', 'data-tilt-scale': '1.015' },
          record.slug === 'witf'
            ? el('div', { class: 'witf-viewer-container', id: 'witf-viewer' })
            : el('img', {
            src: image,
            alt: record.presentation.alt,
            width: selectedAsset?.width ?? media.width,
            height: selectedAsset?.height ?? media.height,
            loading: record.slug === 'witf' ? 'eager' : 'lazy',
            decoding: 'async',
            ...(record.slug === 'witf' ? { fetchpriority: 'high' } : {}),
            }),
          el('figcaption', {}, `${record.category} / ${record.status}`),
        )
      : null,
    el(
      'div',
      { class: 'artifact-context' },
      createAnnotationBlock(record, lens, el),
      createMetricAnnotation(record, lens, el),
    ),
  );
}

export function systemsSheet(record, lens) {
  const labels = topologyLabels(record);

  return el(
    'article',
    { class: `artifact artifact--systems artifact--${record.slug}`, 'data-artifact': record.slug, 'data-reveal': 'up', 'data-reveal-delay': '100' },
    createArtifactHeader(record, record.slug === 'omniroute' ? 'Upstream routing overview' : record.slug === 'substrate' ? 'Policy routing sheet' : 'Runtime topology', el),
    record.slug === 'omniroute' ? renderOmniRouteTopology(lens) : el(
      'div',
      {
        class: 'systems-diagram',
        /* The diagram's accessible name is the only description it needs.
           A second described-by paragraph repeated this exact sentence as
           visible copy under the diagram, so it was removed. */
        role: 'img',
        'aria-label': record.presentation.alt,
      },
      createTopologyNodes(labels, el),
    ),
    el(
      'div',
      { class: 'artifact-context' },
      createAnnotationBlock(record, lens, el),
      createMetricAnnotation(record, lens, el),
    ),
  );
}

export function experimentNote(record, lens) {
  return el(
    'article',
    { class: `artifact artifact--experiment artifact--${record.slug}`, 'data-artifact': record.slug, 'data-reveal': 'up', 'data-reveal-delay': '200' },
    createArtifactHeader(record, record.slug === 'netweave' ? 'Simulation field note' : 'Fork-delta experiment', el),
    el(
      'div',
      {
        class: 'experiment-sheet',
        /* Accessible name only — the removed described-by paragraph
           duplicated this sentence as visible copy. */
        role: 'img',
        'aria-label': record.presentation.alt,
      },
      experimentRows(record).map(([term, detail], index) =>
        el(
          'div',
          { class: 'experiment-row' },
          el('span', {}, String(index + 1).padStart(2, '0')),
          el('strong', {}, term),
          el('p', {}, detail),
        ),
      ),
    ),
    el(
      'div',
      { class: 'artifact-context' },
      createAnnotationBlock(record, lens, el),
      createMetricAnnotation(record, lens, el),
    ),
  );
}

export function createArtifact(record, lens) {
  const renderers = {
    'physical-plate': physicalPlate,
    'systems-sheet': systemsSheet,
    'experiment-note': experimentNote,
  };
  const render = renderers[record.presentation?.type] ?? systemsSheet;
  const artifact = render(record, lens);

  const family = ARTIFACT_FAMILY_MAP[record.slug];
  if (family) {
    artifact.setAttribute('data-family', family);
    artifact.style.setProperty('--family-accent', `var(--family-${family}-active, var(--family-${family}))`);
    artifact.style.setProperty('--family-accent-ink', `var(--family-${family}-ink-active, var(--family-${family}-ink, var(--family-${family}-active, var(--family-${family}))))`);
  }

  // Category badge overlay on the media area
  if (record.category) {
    const badge = el('span', { class: 'artifact-badge' }, record.category);
    artifact.prepend(badge);
  }

  return artifact;
}

export {
  createEvidenceLabel,
  createMetricAnnotation,
  evidenceLabel,
  metricAnnotation,
};

export const createPhysicalPlate = physicalPlate;
export const createSystemsSheet = systemsSheet;
export const createExperimentNote = experimentNote;
