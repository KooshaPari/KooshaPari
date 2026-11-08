import { el } from '../components/dom.js';

/* ================================================================
   Project Diagrams — per-project SVG diagram definitions and
   renderers used by the semantic visual factory.

   Each definition includes nodes, edges, title, summary, and a
   reader (accessible textual equivalent). The renderer produces
   an SVG figure with an expandable reader section.
   ================================================================ */

// ── Per-project diagram definitions ─────────────────────────────

const BYTEPORT_DIAGRAM = {
  id: 'byteport',
  title: 'BytePort deployment pipeline',
  summary: 'Conceptual deployment pipeline: a declarative configuration is validated, planned, and applied through the AWS provider boundary.',
  nodes: [
    { id: 'config', label: 'Declarative config', x: 24, y: 16 },
    { id: 'validate', label: 'Validate', x: 24, y: 112 },
    { id: 'plan', label: 'Plan diff', x: 24, y: 208 },
    { id: 'execute', label: 'Apply / destroy', x: 24, y: 304 },
    { id: 'aws', label: 'AWS boundary', x: 340, y: 208 },
  ],
  edges: [
    { from: 'config', to: 'validate', d: 'M134 72 V112' },
    { from: 'validate', to: 'plan', d: 'M134 168 V208' },
    { from: 'plan', to: 'execute', d: 'M134 264 V304' },
    { from: 'execute', to: 'aws', d: 'M244 332 H340', dashed: true },
  ],
  reader: [
    'A declarative configuration describes the desired AWS infrastructure state.',
    'Validation checks syntactic and structural correctness before any API call.',
    'Plan diff shows what would change; current vs. desired state are compared.',
    'Apply or destroy executes the transition through the AWS provider boundary.',
    'The AWS boundary separates local intent from remote infrastructure effects.',
  ],
};

const TRACERA_DIAGRAM = {
  id: 'tracera',
  title: 'Tracera traceability chain',
  summary: 'Conceptual audit chain: workflow events are captured, chained, and made verifiable for traceability and audit.',
  nodes: [
    { id: 'event', label: 'Workflow event', x: 24, y: 16 },
    { id: 'capture', label: 'Capture', x: 24, y: 112 },
    { id: 'chain', label: 'Append-only chain', x: 24, y: 208 },
    { id: 'verify', label: 'Verify', x: 24, y: 304 },
    { id: 'audit', label: 'Audit boundary', x: 340, y: 208 },
  ],
  edges: [
    { from: 'event', to: 'capture', d: 'M134 72 V112' },
    { from: 'capture', to: 'chain', d: 'M134 168 V208' },
    { from: 'chain', to: 'verify', d: 'M134 264 V304' },
    { from: 'chain', to: 'audit', d: 'M244 236 H340', dashed: true },
  ],
  reader: [
    'A workflow event (commit, deployment, agent action) initiates the trace.',
    'Capture extracts structured provenance from the event source.',
    'The append-only chain records each entry with a hash-linked reference.',
    'Verify confirms chain integrity against the recorded references.',
    'The audit boundary exposes verified chain state for external review.',
  ],
};

const CLIPROXYAPI_DIAGRAM = {
  id: 'cliproxyapi',
  title: 'CLIProxyAPI++ provider routing',
  summary: 'Conceptual multi-provider routing: a client request is authenticated, routed to an eligible provider, and returned through the proxy boundary.',
  nodes: [
    { id: 'client', label: 'Client request', x: 24, y: 16 },
    { id: 'auth', label: 'Auth + quotas', x: 24, y: 112 },
    { id: 'route', label: 'Route selection', x: 24, y: 208 },
    { id: 'provider', label: 'Provider execution', x: 24, y: 304 },
    { id: 'fallback', label: 'Fallback path', x: 340, y: 208 },
  ],
  edges: [
    { from: 'client', to: 'auth', d: 'M134 72 V112' },
    { from: 'auth', to: 'route', d: 'M134 168 V208' },
    { from: 'route', to: 'provider', d: 'M134 264 V304' },
    { from: 'provider', to: 'fallback', d: 'M244 332 H340 V236', dashed: true },
    { from: 'fallback', to: 'route', d: 'M340 208 V168 H244', dashed: true },
  ],
  reader: [
    'A client request enters the proxy boundary.',
    'Authentication and quota checks are applied before routing.',
    'Route selection picks an eligible provider based on configuration.',
    'Provider execution sends the request to the upstream model API.',
    'On failure, the fallback path may re-enter route selection within configured limits.',
  ],
};

const AGENTAPI_DIAGRAM = {
  id: 'agentapi',
  title: 'AgentAPI++ extension boundary',
  summary: 'Conceptual agent API extension: incoming requests pass through the extension layer before reaching the upstream agent interface.',
  nodes: [
    { id: 'request', label: 'Agent request', x: 24, y: 16 },
    { id: 'extension', label: 'Extension layer', x: 24, y: 112 },
    { id: 'upstream', label: 'Upstream agentapi', x: 24, y: 208 },
    { id: 'response', label: 'Response', x: 24, y: 304 },
    { id: 'boundary', label: 'Extension scope', x: 340, y: 112 },
  ],
  edges: [
    { from: 'request', to: 'extension', d: 'M134 72 V112' },
    { from: 'extension', to: 'upstream', d: 'M134 168 V208' },
    { from: 'upstream', to: 'response', d: 'M134 264 V304' },
    { from: 'extension', to: 'boundary', d: 'M244 140 H340', dashed: true },
  ],
  reader: [
    'An agent request enters the extension boundary.',
    'The extension layer applies <REDACTED>-specific additions.',
    'The upstream agentapi interface handles core agent functionality.',
    'The response returns through the same extension and upstream layers.',
    'Extension scope is limited; upstream attribution remains explicit.',
  ],
};

export const DIAGRAM_DEFINITIONS = {
  byteport: BYTEPORT_DIAGRAM,
  tracera: TRACERA_DIAGRAM,
  'cliproxyapi-plusplus': CLIPROXYAPI_DIAGRAM,
  'agentapi-plusplus': AGENTAPI_DIAGRAM,
};

// ── SVG helper (local to this module) ──────────────────────────
function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const child of children.flat(Infinity)) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

// ── Diagram renderer ────────────────────────────────────────────

function renderDiagramSVG(definition, prefix) {
  const w = 600;
  const h = 380;
  const nodeW = 210;
  const nodeH = 52;

  const defs = svg('defs', {},
    svg('marker', {
      id: `${prefix}-arrow`, viewBox: '0 0 10 10', refX: 10, refY: 5,
      markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse',
    }, svg('path', { d: 'M0 0 L10 5 L0 10 Z', fill: 'var(--family-accent, var(--arch-500))' })),
  );

  const edgeElements = definition.edges.map((edge) => {
    const attrs = {
      d: edge.d, fill: 'none', class: 'project-visual__edge',
      'marker-end': `url(#${prefix}-arrow)`,
    };
    if (edge.dashed) attrs['stroke-dasharray'] = '6 5';
    return svg('path', attrs);
  });

  const nodeElements = definition.nodes.map((node) => {
    const g = svg('g', {
      'data-node': node.id,
      class: 'project-visual__node',
      transform: `translate(${node.x} ${node.y})`,
    },
      svg('rect', { width: nodeW, height: nodeH, rx: 3 }),
      svg('text', { x: 14, y: 32 }, node.label),
    );
    return g;
  });

  return svg('svg', {
    class: 'project-visual__svg',
    viewBox: `0 0 ${w} ${h}`,
    role: 'img',
    'aria-labelledby': `${prefix}-title ${prefix}-desc`,
  },
    defs,
    svg('title', { id: `${prefix}-title` }, definition.title),
    svg('desc', { id: `${prefix}-desc` }, definition.summary),
    ...edgeElements,
    ...nodeElements,
  );
}

function renderDiagramReader(definition) {
  return el('details', { class: 'project-visual__reader' },
    el('summary', {}, 'Read diagram'),
    el('ol', {},
      definition.reader.map((step) => el('li', {}, step)),
    ),
  );
}

export function renderDiagramVisual(definition) {
  const prefix = `pv-${definition.id}`;
  const svgEl = renderDiagramSVG(definition, prefix);

  return el('figure', { class: 'project-visual project-visual--diagram', 'data-visual': definition.id },
    el('div', { class: 'project-visual__plate' },
      el('div', { class: 'project-visual__plate-header' },
        el('span', {}, `${definition.title}`),
        el('span', {}, 'Conceptual model'),
      ),
      svgEl,
    ),
    el('figcaption', {}, definition.summary),
    renderDiagramReader(definition),
  );
}
