import { el } from '../components/dom.js';
import { DIAGRAM_TOKENS, isMobileViewport } from './diagram-tokens.js';

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

function svgElement(tag, attributes = {}, ...children) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  for (const child of children.flat(Infinity)) {
    if (child != null) node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function renderSubstratePlate(documentRef = document, { forceMobile = null } = {}) {
  const definition = createSubstratePlateDefinition();
  const titleId = 'substrate-plate-title';
  const descId = 'substrate-plate-description';
  const T = DIAGRAM_TOKENS;
  const mobile = forceMobile ?? isMobileViewport();

  // Mobile: text fallback with accessible ordered list.
  if (mobile) {
    const list = el('ol', { class: 'systems-plate__mobile-list' },
      definition.nodes.map((node, index) =>
        el('li', {}, `${String(index + 1).padStart(2, '0')} ${node.label}`),
      ),
    );
    const summary = el('p', { class: 'systems-plate__fallback' }, definition.summary);
    const figure = el('figure', { class: 'systems-plate', 'data-plate': 'substrate' }, summary, list,
      el('figcaption', {}, 'Illustrative architecture; repository record, not runtime telemetry.'),
    );
    void documentRef;
    return figure;
  }

  // Desktop: SVG diagram with arrow marker definition.
  const defs = svgElement('defs', {},
    svgElement('marker', { id: 'systems-plate-arrow', viewBox: '0 0 10 7', refX: 10, refY: 3.5, markerWidth: 10, markerHeight: 7, orient: 'auto-start-reverse' },
      svgElement('polygon', { points: '0 0, 10 3.5, 0 7', fill: 'var(--arch-500)' })
    )
  );
  const svg = el('svg', {
    class: 'systems-plate__svg', viewBox: '0 0 700 210', role: 'img',
    'aria-labelledby': `${titleId} ${descId}`,
  },
    defs,
    el('title', { id: titleId }, definition.title),
    el('desc', { id: descId }, definition.summary),
    definition.edges.map((edge) => {
      const from = nodeById(definition, edge.from); const to = nodeById(definition, edge.to);
      return el('line', {
        class: 'systems-plate__edge',
        x1: from.x + from.width, y1: from.y + T.node.height / 2,
        x2: to.x, y2: to.y + T.node.height / 2,
        markerEnd: 'url(#systems-plate-arrow)',
      });
    }),
    definition.nodes.map((node, index) => el('g', { class: 'systems-plate__node', transform: `translate(${node.x} ${node.y})` },
      el('rect', { width: node.width, height: T.node.height, rx: T.node.rx }),
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
