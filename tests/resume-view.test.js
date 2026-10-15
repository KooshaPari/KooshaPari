// Resume view — tests for lens-aware skill derivation and the role timeline.
//
// renderResume(root, lens) reads PERSONAS[lens].competencies to build the skill
// rows, so the skills block is the only lens-dependent part of the view: the
// timeline, education, and lede are shared. We mount the view into a linkedom
// document and assert on the rendered skill-row text rather than on any
// internal helper, so a regression that silently re-hardcodes the engineering
// persona fails here instead of shipping.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { renderResume } from '../scripts/views/resume.js';

const dom = () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  return document;
};

const render = (lens) => {
  const document = dom();
  const root = document.createElement('div');
  renderResume(root, lens);
  return root;
};

// The skill-row text as it appears on screen, in render order.
const skillNames = (root) =>
  [...root.querySelectorAll('.resume-skill__name')].map((node) => node.textContent);

const ENGINEERING_COMPETENCIES = [
  'Systems & Runtime',
  'Distributed Backends',
  'AI / Agent Infra',
  'Performance & Tooling',
  'Code Quality & Lifecycle',
  'Hardware / Virtualization',
];

const PRODUCT_COMPETENCIES = [
  'Product Discovery',
  'Roadmap & Prioritization',
  'Cross-functional Leadership',
  'Commercial / Unit Economics',
  'Stakeholder & Sponsor Mgmt',
  'Risk & Compliance Framing',
];

test('renderResume renders the engineering competency rows for the default lens', () => {
  const names = skillNames(render('engineering'));
  assert.deepEqual(names, ENGINEERING_COMPETENCIES,
    'the engineering lens must surface its six competency axes in order');
});

test('renderResume renders the product competency rows for the product lens', () => {
  const names = skillNames(render('product'));
  assert.deepEqual(names, PRODUCT_COMPETENCIES,
    'the product lens must surface its six competency axes in order');
  for (const engineeringOnly of ENGINEERING_COMPETENCIES) {
    assert.ok(!names.includes(engineeringOnly),
      `product lens must not leak the engineering competency "${engineeringOnly}"`);
  }
});

test('renderResume produces different skill sets per lens', () => {
  const engineering = skillNames(render('engineering'));
  const product = skillNames(render('product'));
  const overlap = engineering.filter((name) => product.includes(name));
  assert.deepEqual(overlap, [], 'the two lenses must not share any competency axis');
  assert.equal(engineering.length, product.length,
    'both personas carry the same number of competencies, so the sets must differ by content alone');
});

test('renderResume falls back to engineering skills for an unknown lens', () => {
  const names = skillNames(render('nonsense'));
  assert.deepEqual(names, ENGINEERING_COMPETENCIES,
    'an unrecognised lens must degrade to the engineering persona rather than throwing');
});

test('renderResume renders the same four roles under every lens', () => {
  for (const lens of ['engineering', 'product', 'nonsense']) {
    const root = render(lens);
    const nodes = [...root.querySelectorAll('.resume-node')];
    assert.equal(nodes.length, 4, `${lens} must render all four timeline nodes`);
    const companies = [...root.querySelectorAll('.resume-node__company')].map((n) => n.textContent);
    assert.deepEqual(companies,
      ['Phenotype.', 'Akoma', 'CVS Health', 'Atoms.Tech'],
      `${lens} timeline is lens-independent and must keep the same four roles`);
  }
});

test('renderResume announces the role-count lede through an aria-live region', () => {
  const lede = render('product').querySelector('.lede');
  assert.ok(lede, 'the resume view keeps its lede paragraph');
  assert.equal(lede.getAttribute('aria-live'), 'polite',
    'the lede is the live region the lens switcher updates for assistive tech');
  assert.match(lede.textContent, /^4 roles, one thread:/,
    'the live lede states the role count and the shared thread');
});