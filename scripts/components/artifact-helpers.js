/**
 * Pure helpers for the artifact component.
 *
 * The orchestrator (artifact.js) is DOM-bound; this file is what the
 * orchestrator imports and what the unit tests exercise.
 *
 *   - annotation(record, lens): picks the lens-appropriate annotation text
 *     from the record (presentation first, then engineering fallback, then
 *     summary) — used by annotationBlock
 *   - topologyLabels(record): the 4 node labels for the systems topology
 *     diagram (custom set for substrate, generic for everything else)
 *   - experimentRows(record): the 4 (term, detail) pairs for the experiment
 *     note (custom set for netweave, generic for everything else)
 *   - ARTIFACT_FAMILY_MAP: slug → family CSS suffix for accent styling
 *   - createArtifactHeader(record, label, el): factory-injected DOM tree
 *   - createAnnotationBlock(record, lens, el): factory-injected DOM tree
 *   - createTopologyNodes(labels, el): factory-injected node + arrow DOM
 */

export function annotation(record, lens) {
  return record.presentation?.annotations?.[lens]
    ?? record.presentation?.annotations?.engineering
    ?? record.summary;
}

export function topologyLabels(record) {
  if (record.slug === 'substrate') {
    return ['HTTP / CLI / MCP / A2A', 'policy + budget', 'health + fallback', 'provider execution'];
  }
  return ['agent bursts', 'process observation', 'coalesce + queue', 'shared host state'];
}

export function experimentRows(record) {
  if (record.slug === 'netweave') {
    return [
      ['Route layer', 'A* over directed road graph'],
      ['Traffic layer', 'Per-road cellular automata'],
      ['Observed', 'Congestion, waves, gridlock'],
      ['Boundary', 'Congestion-aware rerouting remained future work'],
    ];
  }
  return [
    ['Upstream', 'jundot/omlx / attributed'],
    ['Fork delta', 'Routing + Rust performance cores'],
    ['Method', 'Backend comparison + evaluation'],
    ['Boundary', 'Research scope / support varies'],
  ];
}

export const ARTIFACT_FAMILY_MAP = {
  netweave: 'netweave',
  sharecli: 'sharecli',
  omniroute: 'omniroute',
  'gmk-arch': 'physical',
  witf: 'physical',
  'dss-cipher': 'physical',
  substrate: 'substrate',
  'phenotype-omlx': 'omlx',
};

export function createArtifactHeader(record, label, el) {
  return el(
    'header',
    { class: 'artifact-header' },
    el('p', { class: 'atelier-label' }, label),
    el('h2', {}, el('a', { href: `/work/${record.slug}` }, record.title)),
    el('p', { class: 'artifact-summary' }, record.summary),
  );
}

export function createAnnotationBlock(record, lens, el) {
  return el(
    'div',
    { class: 'artifact-annotation' },
    el('span', { 'aria-hidden': 'true' }, lens === 'product' ? 'P' : 'E'),
    el('p', {}, annotation(record, lens)),
  );
}

export function createTopologyNodes(labels, el) {
  return labels.map((label, index) => [
    el(
      'div',
      { class: 'systems-node' },
      el('span', {}, String(index + 1).padStart(2, '0')),
      el('strong', {}, label),
    ),
    index < labels.length - 1
      ? el('span', { class: 'systems-route', 'aria-hidden': 'true' }, '->')
      : null,
  ]);
}
