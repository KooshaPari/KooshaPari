import test from 'node:test';
import assert from 'node:assert/strict';

import { PROJECTS, PROOF_POINTS } from '../data/projects.js';

const FORK_SLUGS = [
  'phenotype-omlx',
  'cliproxyapi-plusplus',
  'agentapi-plusplus',
  'mcpforge',
  'forgecode',
  'frostify',
];

const FEATURED_SLUGS = PROJECTS.filter((p) => p.featured).map((p) => p.slug);

test('portfolio contains exactly 15 project records', () => {
  assert.equal(PROJECTS.length, 15);
});

test('every project record has required structural fields', () => {
  for (const p of PROJECTS) {
    for (const key of ['id', 'slug', 'title', 'status', 'category', 'lens', 'summary', 'evidence']) {
      assert.ok(p[key], `${p.slug} missing required field "${key}"`);
    }
    assert.ok(Array.isArray(p.lens) && p.lens.length > 0, `${p.slug} lens must be non-empty array`);
  }
});

test('fork entries carry upstream provenance attribution', () => {
  for (const slug of FORK_SLUGS) {
    const p = PROJECTS.find((x) => x.slug === slug);
    assert.ok(p, `${slug} not found in PROJECTS`);
    assert.ok(
      typeof p.provenance === 'string' && p.provenance.length > 0,
      `${slug} missing provenance attribution`,
    );
  }
});

test('metrics tuples have three elements with evidence-class qualifier', () => {
  for (const p of PROJECTS) {
    if (!p.metrics) continue;
    for (const m of p.metrics) {
      assert.ok(Array.isArray(m) && m.length === 3, `${p.slug} metric must be [value, label, evidence]`);
      const [value, label, evidenceClass] = m;
      assert.ok(typeof value === 'string' && value.length > 0, `${p.slug} metric value empty`);
      assert.ok(typeof label === 'string' && label.length > 0, `${p.slug} metric label empty`);
      assert.ok(
        typeof evidenceClass === 'string' && evidenceClass.length > 0,
        `${p.slug} metric "${label}" missing evidence-class qualifier`,
      );
    }
  }
});

test('no project summary makes unverifiable quantitative claims', () => {
  const banned = [
    /high-concurrency/i,
    /\bA2A\b/,
    /~?59\.9k/i,
    /Rank\s+#\d/i,
    /125K\s+lines/i,
  ];
  for (const p of PROJECTS) {
    for (const re of banned) {
      assert.doesNotMatch(
        p.summary,
        re,
        `${p.slug} summary contains unverifiable claim matching ${re}`,
      );
    }
  }
});

test('omniroute metrics do not include unverifiable rank or star claims', () => {
  const omniroute = PROJECTS.find((p) => p.slug === 'omniroute');
  assert.ok(omniroute, 'omniroute not found');
  for (const m of omniroute.metrics) {
    assert.doesNotMatch(m[0], /#\d/, `${m[1]} has unverifiable rank value`);
    assert.doesNotMatch(m[1], /rank/i, `${m[1]} is an unverifiable rank claim`);
  }
});

test('substrate summary and presentation do not reference A2A as shipped', () => {
  const substrate = PROJECTS.find((p) => p.slug === 'substrate');
  assert.ok(substrate, 'substrate not found');
  assert.doesNotMatch(substrate.summary, /\bA2A\b/, 'substrate summary references unverified A2A');
  const alt = substrate.presentation?.alt ?? '';
  assert.doesNotMatch(alt, /\bA2A\b/, 'substrate presentation alt references unverified A2A');
});

test('sharecli summary does not claim unsupported concurrency scale', () => {
  const sharecli = PROJECTS.find((p) => p.slug === 'sharecli');
  assert.ok(sharecli, 'sharecli not found');
  assert.doesNotMatch(sharecli.summary, /high-concurrency/i, 'sharecli claims unsupported concurrency scale');
  // The case study explicitly states "No adoption or scale claim is made"
  const limitations = sharecli.caseStudy?.sections?.find(
    (s) => s[0] === 'Current limitations',
  );
  assert.ok(limitations, 'sharecli missing Current limitations section');
  assert.match(limitations[1], /No adoption or scale claim/i, 'sharecli limitations section must disclaim scale');
});

test('featured projects without metrics do not present unqualified numbers in summary', () => {
  const noMetricsFeatured = FEATURED_SLUGS.filter(
    (slug) => !PROJECTS.find((p) => p.slug === slug)?.metrics?.length,
  );
  for (const slug of noMetricsFeatured) {
    const p = PROJECTS.find((x) => x.slug === slug);
    // Summaries for metricless featured projects must not contain dollar amounts or counts
    assert.doesNotMatch(p.summary, /\$[\d,]+K?/i, `${slug} summary has dollar claim without metrics evidence`);
    assert.doesNotMatch(p.summary, /\d{2,}[+,]/, `${slug} summary has large number claim without metrics evidence`);
  }
});

test('NetWeave evidence string is transparent about pending artifacts', () => {
  const netweave = PROJECTS.find((p) => p.slug === 'netweave');
  assert.ok(netweave, 'netweave not found');
  assert.match(netweave.evidence, /to be attached/i, 'NetWeave evidence must indicate pending artifact attachment');
});

test('PROOF_POINTS tuple elements have exactly two string values', () => {
  for (const point of PROOF_POINTS) {
    assert.ok(Array.isArray(point) && point.length === 2, `proof point must be [value, label]`);
    assert.ok(typeof point[0] === 'string' && point[0].length > 0, 'proof point value must be non-empty string');
    assert.ok(typeof point[1] === 'string' && point[1].length > 0, 'proof point label must be non-empty string');
  }
});

test('physical product summaries do not claim independent revenue verification', () => {
  for (const slug of ['gmk-arch', 'witf']) {
    const p = PROJECTS.find((x) => x.slug === slug);
    assert.ok(p, `${slug} not found`);
    assert.doesNotMatch(
      p.summary,
      /verified|audited|independently confirmed/i,
      `${slug} summary implies independent verification`,
    );
  }
});

test('all fork summaries or provenance explicitly name the upstream project', () => {
  for (const slug of FORK_SLUGS) {
    const p = PROJECTS.find((x) => x.slug === slug);
    const combined = `${p.summary} ${p.provenance ?? ''}`;
    assert.match(
      combined,
      /upstream|fork of|attribution to|extension of/i,
      `${slug} does not explicitly reference upstream origin`,
    );
  }
});
