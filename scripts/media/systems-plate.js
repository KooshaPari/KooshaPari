import { el } from '../components/dom.js';

const NODES = [
  { id: 'callers', label: 'HTTP / CLI / MCP / A2A callers', x: 24, y: 34, width: 214 },
  { id: 'policy', label: 'policy boundary', x: 276, y: 34, width: 170 },
  { id: 'controls', label: 'health / retry / budget', x: 484, y: 34, width: 176 },
  { id: 'providers', label: 'provider execution', x: 276, y: 142, width: 170 },
];

const EDGES = [
  { from: 'callers', to: 'policy' },
  { from: 'policy', to: 'controls' },
  { from: 'controls', to: 'providers' },
];

export function createSubstratePlateDefinition() {
  return {
    title: 'Substrate policy routing plate',
    attribution: 'Substrate is presented as KooshaPari-owned repository work; no performance or scale claim is made.',
    summary: 'A static architecture drawing of the recorded Substrate boundary: callers enter a policy layer, controls make health, retry, and budget behavior explicit, and execution remains provider-dependent.',
    nodes: NODES.map((node) => ({ ...node })),
    edges: EDGES.map((edge) => ({ ...edge })),
    views: [
      { id: 'boundary', label: 'Boundary', description: 'The shared policy boundary separates callers from provider execution.' },
      { id: 'controls', label: 'Controls', description: 'Health, retry, fallback, rate-limit, and budget concerns remain inspectable.' },
      { id: 'limits', label: 'Limits', description: 'Provider behavior and operational policy depend on deployment configuration and live upstream availability.' },
    ],
  };
}

function nodeById(definition, id) { return definition.nodes.find((node) => node.id === id); }

export function renderSubstratePlate(documentRef = document) {
  const definition = createSubstratePlateDefinition();
  const titleId = 'substrate-plate-title';
  const descId = 'substrate-plate-description';
  const svg = el('svg', {
    class: 'systems-plate__svg', viewBox: '0 0 700 210', role: 'img',
    'aria-labelledby': `${titleId} ${descId}`,
  },
    el('title', { id: titleId }, definition.title),
    el('desc', { id: descId }, definition.summary),
    definition.edges.map((edge) => {
      const from = nodeById(definition, edge.from); const to = nodeById(definition, edge.to);
      return el('line', { class: 'systems-plate__edge', x1: from.x + from.width, y1: from.y + 27, x2: to.x, y2: to.y + 27 });
    }),
    definition.nodes.map((node, index) => el('g', { class: 'systems-plate__node', transform: `translate(${node.x} ${node.y})` },
      el('rect', { width: node.width, height: 54, rx: 2 }),
      el('text', { x: 12, y: 22, class: 'systems-plate__index' }, String(index + 1).padStart(2, '0')),
      el('text', { x: 42, y: 33 }, node.label),
    )),
  );
  const fallback = el('p', { class: 'systems-plate__fallback' }, definition.summary);
  const figure = el('figure', { class: 'systems-plate', 'data-plate': 'substrate' }, svg, el('figcaption', {}, 'Illustrative architecture; repository record, not runtime telemetry.'), fallback);
  // Keep this argument observable for lightweight DOM adapters and no-JS documentation.
  void documentRef;
  return figure;
}
