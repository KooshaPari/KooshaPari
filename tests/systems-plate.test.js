import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  createSubstratePlateDefinition,
  renderSubstratePlate,
} from '../scripts/media/systems-plate.js';

test('Substrate plate keeps its ownership boundary explicit', () => {
  const substrate = createSubstratePlateDefinition();

  assert.equal(substrate.views.length, 3);
  assert.match(substrate.attribution, /Substrate/);
  assert.match(substrate.attribution, /owned/);
});

test('systems plate views describe architecture, not measured telemetry', () => {
  const plate = createSubstratePlateDefinition();
  assert.ok(plate.views.every(({ description }) => !/latency|throughput|success rate|p95/i.test(description)));
  assert.ok(plate.nodes.length >= 4);
  assert.ok(plate.edges.every(({ from, to }) => plate.nodes.some((node) => node.id === from) && plate.nodes.some((node) => node.id === to)));
});

/* ─── renderSubstratePlate ─── */

const dom = () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  return document;
};

test('renderSubstratePlate draws the desktop SVG with one edge per declared edge', () => {
  const document = dom();
  const definition = createSubstratePlateDefinition();
  const figure = renderSubstratePlate(document, { forceMobile: false });

  assert.equal(figure.getAttribute('data-plate'), 'substrate');
  assert.match(figure.className, /systems-plate/);

  const svg = figure.querySelector('svg');
  assert.ok(svg, 'desktop renders an svg diagram');
  assert.equal(svg.getAttribute('role'), 'img');
  assert.equal(svg.getAttribute('viewBox'), '0 0 700 210');

  // One <line> per declared edge, each pointing at the arrow marker. The
  // attribute is SVG-namespaced, so setAttribute preserves the camelCase
  // `markerEnd` that the SVG spec requires rather than lowercasing it.
  const edges = figure.querySelectorAll('line');
  assert.equal(edges.length, definition.edges.length);
  for (const edge of edges) {
    assert.equal(edge.getAttribute('markerEnd'), 'url(#systems-plate-arrow)');
    assert.match(edge.getAttribute('class'), /systems-plate__edge/);
  }

  // One <g> per node, positioned by the definition's x/y coordinates.
  const nodes = figure.querySelectorAll('g');
  assert.equal(nodes.length, definition.nodes.length);
  for (const [index, node] of definition.nodes.entries()) {
    assert.equal(nodes[index].getAttribute('transform'), `translate(${node.x} ${node.y})`);
  }

  // The arrow marker referenced by every edge is actually defined.
  assert.equal(figure.querySelector('marker').getAttribute('id'), 'systems-plate-arrow');
});

test('renderSubstratePlate wires each edge from the right edge of its source to the left of its target', () => {
  const document = dom();
  const definition = createSubstratePlateDefinition();
  const figure = renderSubstratePlate(document, { forceMobile: false });

  const byId = new Map(definition.nodes.map((node) => [node.id, node]));
  const lines = [...figure.querySelectorAll('line')];

  for (const [index, edge] of definition.edges.entries()) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    const line = lines[index];
    // Node height is 48 from the shared tokens; the edge is vertically centred.
    assert.equal(line.getAttribute('x1'), String(from.x + from.width), `${edge.from} right edge`);
    assert.equal(line.getAttribute('x2'), String(to.x), `${edge.to} left edge`);
    assert.equal(line.getAttribute('y1'), String(from.y + 24), `${edge.from} vertical centre`);
    assert.equal(line.getAttribute('y2'), String(to.y + 24), `${edge.to} vertical centre`);
  }
});

test('renderSubstratePlate numbers the SVG nodes 01..N in definition order', () => {
  const document = dom();
  const definition = createSubstratePlateDefinition();
  const figure = renderSubstratePlate(document, { forceMobile: false });

  const indexLabels = [...figure.querySelectorAll('.systems-plate__node text.systems-plate__index')]
    .map((node) => node.textContent);
  assert.deepEqual(
    indexLabels,
    definition.nodes.map((_, index) => String(index + 1).padStart(2, '0')),
  );
});

test('renderSubstratePlate labels the figure for assistive tech via title and desc', () => {
  const document = dom();
  const definition = createSubstratePlateDefinition();
  const figure = renderSubstratePlate(document, { forceMobile: false });

  const svg = figure.querySelector('svg');
  const labelledBy = svg.getAttribute('aria-labelledby').split(' ');
  const [titleId, descId] = labelledBy;

  // Both ids in aria-labelledby must resolve to real elements in the figure.
  assert.equal(figure.querySelector(`#${titleId}`).textContent, definition.title);
  assert.equal(figure.querySelector(`#${descId}`).textContent, definition.summary);
});

test('renderSubstratePlate falls back to a text list on mobile, not an SVG', () => {
  const document = dom();
  const definition = createSubstratePlateDefinition();
  const figure = renderSubstratePlate(document, { forceMobile: true });

  assert.equal(figure.querySelector('svg'), null, 'mobile must not ship the SVG diagram');

  // The ordered list is the accessible replacement: one numbered item per node.
  const items = [...figure.querySelectorAll('ol.systems-plate__mobile-list li')];
  assert.equal(items.length, definition.nodes.length);
  assert.deepEqual(items.map((li) => li.textContent), definition.nodes.map((node, index) =>
    `${String(index + 1).padStart(2, '0')} ${node.label}`));

  // The summary is still surfaced as prose so the content is never lost.
  assert.equal(figure.querySelector('.systems-plate__fallback').textContent, definition.summary);
});

test('renderSubstratePlate keeps the illustrative-not-telemetry caption in both modes', () => {
  const document = dom();
  for (const forceMobile of [true, false]) {
    const figure = renderSubstratePlate(document, { forceMobile });
    const caption = figure.querySelector('figcaption').textContent;
    assert.match(caption, /Illustrative architecture/);
    assert.match(caption, /not runtime telemetry/);
  }
});

test('renderSubstratePlate falls back to desktop when the viewport probe is unavailable', () => {
  const document = dom();
  // No global matchMedia: isMobileViewport must report false rather than throw,
  // so server-side rendering gets the full diagram.
  const previous = globalThis.window;
  delete globalThis.window;
  try {
    const figure = renderSubstratePlate(document);
    assert.ok(figure.querySelector('svg'), 'missing viewport probe must not suppress the diagram');
  } finally {
    globalThis.window = previous;
  }
});
