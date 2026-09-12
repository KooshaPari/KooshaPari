import { el } from '../components/dom.js';

function svgElement(tag, attributes = {}, ...children) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  for (const child of children.flat(Infinity)) {
    if (child != null) node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function validateDiagram(definition = {}) {
  const nodes = Array.isArray(definition.nodes) ? definition.nodes : [];
  const ids = new Set(nodes.map(({ id }) => id));
  const edges = Array.isArray(definition.edges) ? definition.edges : [];
  return {
    valid: nodes.length >= 2 && ids.size === nodes.length && edges.every(({ from, to }) => ids.has(from) && ids.has(to)),
    nodes,
    edges,
  };
}

export function diagramFromCaseStudy(project) {
  const labels = project.caseStudy?.diagram?.split('\n').filter(Boolean) ?? [];
  const nodes = labels.filter((label) => !/^[|v\s-]+$/i.test(label)).slice(0, 5)
    .map((label, index) => ({ id: `n${index + 1}`, label: label.trim() }));
  return { summary: project.presentation?.alt ?? project.summary, nodes, edges: nodes.slice(1).map((node, index) => ({ from: nodes[index].id, to: node.id })) };
}

export function renderDiagram(definition, { title = 'System diagram' } = {}) {
  const { valid, nodes, edges } = validateDiagram(definition);
  if (!valid) return el('p', { class: 'diagram-fallback' }, definition?.summary ?? 'Diagram data is unavailable.');
  const descriptionId = `diagram-${nodes.map(({ id }) => id).join('-')}`;
  const svg = svgElement('svg', { class: 'case-svg-diagram', viewBox: `0 0 640 ${Math.max(180, nodes.length * 88)}`, role: 'img', 'aria-labelledby': `${descriptionId}-title ${descriptionId}-desc` },
    svgElement('title', { id: `${descriptionId}-title` }, title),
    svgElement('desc', { id: `${descriptionId}-desc` }, definition.summary ?? ''),
    edges.map(({ from, to }) => {
      const source = nodes.findIndex((node) => node.id === from);
      const target = nodes.findIndex((node) => node.id === to);
      return svgElement('line', { x1: 320, y1: 65 + source * 88, x2: 320, y2: 95 + target * 88, class: 'case-svg-diagram__edge' });
    }),
    nodes.map((node, index) => svgElement('g', { class: 'case-svg-diagram__node', transform: `translate(80 ${20 + index * 88})` }, svgElement('rect', { width: 480, height: 48, rx: 2 }), svgElement('text', { x: 18, y: 30 }, node.label))),
  );
  const reader = el('div', { class: 'case-diagram-reader' },
    el('p', {}, title),
    el('ol', { class: 'case-diagram-reader__nodes' }, nodes.map((node) => el('li', {}, node.label))),
    el('p', {}, 'Connections'),
    el('ul', { class: 'case-diagram-reader__edges' }, edges.map(({ from, to }) => el('li', {}, `${nodes.find((node) => node.id === from).label} → ${nodes.find((node) => node.id === to).label}`))),
  );
  return el('figure', { class: 'case-diagram-figure' }, svg, reader, el('figcaption', {}, definition.summary ?? 'Static diagram summary.'));
}
