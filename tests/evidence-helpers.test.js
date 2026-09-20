import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EVIDENCE_LABELS,
  publicEvidenceSummary,
  preferredMetric,
  createMetricAnnotation,
  createEvidenceLabel,
} from '../scripts/components/evidence-helpers.js';

function makeStubEl() {
  const calls = [];
  const flatten = (kids) => kids.flatMap(k => Array.isArray(k) ? flatten(k) : [k]);
  const make = (tag, attrs = {}, ...kids) => {
    const children = flatten(kids);
    calls.push({ tag, attrs, children });
    return { tag, attrs, children };
  };
  return { el: make, calls };
}

test('EVIDENCE_LABELS covers both lenses', () => {
  assert.equal(EVIDENCE_LABELS.product, 'Product evidence');
  assert.equal(EVIDENCE_LABELS.engineering, 'Engineering evidence');
});

test('publicEvidenceSummary maps known ledger names to public copy', () => {
  assert.equal(publicEvidenceSummary({ evidence: 'github-pass1-after.md' }), 'Repository documentation and project history');
  assert.equal(publicEvidenceSummary({ evidence: 'EVIDENCE_LEDGER.md' }), 'Retained project records');
  assert.equal(publicEvidenceSummary({ evidence: 'omniroute-evidence-ledger.md' }), 'Upstream contribution records');
});

test('publicEvidenceSummary falls back to a generic line for unknown sources', () => {
  assert.equal(publicEvidenceSummary({ evidence: 'private-notes.md' }), 'Supporting project evidence is being assembled');
  assert.equal(publicEvidenceSummary({}), 'Supporting project evidence is being assembled');
});

test('preferredMetric returns null when metrics is empty or missing', () => {
  assert.equal(preferredMetric({}, 'engineering'), null);
  assert.equal(preferredMetric({ metrics: [] }, 'engineering'), null);
});

test('preferredMetric picks index 0 by default', () => {
  const m = preferredMetric({ metrics: [['12ms', 'latency', 'p95']] }, 'engineering');
  assert.deepEqual(m, ['12ms', 'latency', 'p95']);
});

test('preferredMetric picks index 1 for product lens when 2+ metrics exist', () => {
  const m = preferredMetric({ metrics: [['12ms', 'latency', 'p95'], ['8%', 'adoption', 'week 4']] }, 'product');
  assert.deepEqual(m, ['8%', 'adoption', 'week 4']);
});

test('preferredMetric falls back to index 0 for product lens when only 1 metric', () => {
  const m = preferredMetric({ metrics: [['12ms', 'latency', 'p95']] }, 'product');
  assert.deepEqual(m, ['12ms', 'latency', 'p95']);
});

test('createMetricAnnotation returns null when no metric is preferred', () => {
  const { el } = makeStubEl();
  assert.equal(createMetricAnnotation({}, 'engineering', el), null);
});

test('createMetricAnnotation builds div > strong, span, small', () => {
  const { el, calls } = makeStubEl();
  const out = createMetricAnnotation(
    { metrics: [['12ms', 'latency', 'p95']] },
    'engineering',
    el,
  );
  assert.equal(out.tag, 'div');
  assert.equal(out.attrs.class, 'metric-annotation');
  assert.equal(out.attrs.role, 'note');
  assert.equal(out.attrs['aria-label'], 'latency: 12ms');
  assert.equal(calls.length, 4);
  // children are evaluated before the parent el() call
  assert.equal(calls[0].tag, 'strong');
  assert.equal(calls[1].tag, 'span');
  assert.equal(calls[2].tag, 'small');
  assert.equal(calls[3].tag, 'div');
});

test('createEvidenceLabel uses "Engineering evidence" for non-product lens', () => {
  const { el, calls } = makeStubEl();
  const out = createEvidenceLabel({ evidence: 'EVIDENCE_LEDGER.md' }, 'engineering', el);
  assert.equal(out.tag, 'p');
  const labelSpan = calls.find(c => c.tag === 'span' && c.children[0] === 'Engineering evidence');
  assert.ok(labelSpan);
});

test('createEvidenceLabel uses "Product evidence" for product lens', () => {
  const { el, calls } = makeStubEl();
  createEvidenceLabel({ evidence: 'EVIDENCE_LEDGER.md' }, 'product', el);
  const labelSpan = calls.find(c => c.tag === 'span' && c.children[0] === 'Product evidence');
  assert.ok(labelSpan);
});

test('createEvidenceLabel omits the media small copy when no assets', () => {
  const { el, calls } = makeStubEl();
  createEvidenceLabel({ evidence: 'EVIDENCE_LEDGER.md' }, 'engineering', el);
  assert.ok(!calls.some(c => c.tag === 'small'));
});

test('createEvidenceLabel adds the media small copy when assets are present', () => {
  const { el, calls } = makeStubEl();
  createEvidenceLabel({ evidence: 'EVIDENCE_LEDGER.md', presentation: { assets: [{ src: 'a' }, { src: 'b' }] } }, 'engineering', el);
  const small = calls.find(c => c.tag === 'small');
  assert.ok(small);
  assert.match(small.children[0], /2 manifest-traced files/);
});

test('createEvidenceLabel uses singular "file" for one asset', () => {
  const { el, calls } = makeStubEl();
  createEvidenceLabel({ evidence: 'EVIDENCE_LEDGER.md', presentation: { assets: [{ src: 'a' }] } }, 'engineering', el);
  const small = calls.find(c => c.tag === 'small');
  assert.ok(small);
  assert.match(small.children[0], /1 manifest-traced file\b/);
});
