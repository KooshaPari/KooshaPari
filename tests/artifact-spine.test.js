// tests/artifact-spine.test.js
// Integration test: verify the ASCII project spine renders inside physical-product
// artifacts produced by scripts/components/artifact.js. Uses linkedom as a DOM.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { PROJECTS } from '../data/projects.js';
import { createArtifact } from '../scripts/components/artifact.js';

function withDom(fn) {
  const previous = globalThis.document;
  globalThis.document = parseHTML('<html><body></body></html>').document;
  try {
    return fn();
  } finally {
    globalThis.document = previous;
  }
}

test('gmk-arch artifact renders the ASCII spine with metrics', () => {
  withDom(() => {
    const record = PROJECTS.find((p) => p.slug === 'gmk-arch');
    const artifact = createArtifact(record, 'engineering');
    const spine = artifact.querySelector('.ascii-spine');
    assert.ok(spine, 'expected .ascii-spine on gmk-arch artifact');
    assert.equal(spine.getAttribute('aria-hidden'), 'true');
    assert.equal(spine.getAttribute('data-slug'), 'gmk-arch');
    assert.match(spine.textContent, /gmk-arch/);
    assert.match(spine.textContent, /~4,900/);
    assert.match(spine.textContent, /~\$432K/);
    assert.match(spine.textContent, /142K\+/);
    // Status glyph for 'historical' = 'o'
    assert.equal(spine.getAttribute('data-status-glyph'), 'o');
  });
});

test('witf artifact does NOT render the ASCII spine (it ships its own viewer)', () => {
  withDom(() => {
    const record = PROJECTS.find((p) => p.slug === 'witf');
    const artifact = createArtifact(record, 'engineering');
    const spine = artifact.querySelector('.ascii-spine');
    assert.equal(spine, null, 'witf should not render the spine');
  });
});

test('physical-plate WITHOUT metrics does NOT render the spine', () => {
  withDom(() => {
    const record = {
      slug: 'no-metrics',
      title: 'No metrics',
      status: 'historical',
      category: 'physical-product',
      summary: '',
      metrics: [],
      presentation: { type: 'physical-plate', alt: 't' },
    };
    const artifact = createArtifact(record, 'engineering');
    const spine = artifact.querySelector('.ascii-spine');
    assert.equal(spine, null, 'no metrics → no spine');
  });
});

test('systems-sheet artifact does NOT render the spine', () => {
  withDom(() => {
    const record = {
      slug: 'systems-test',
      title: 'Systems',
      status: 'current',
      category: 'systems',
      summary: '',
      metrics: [['1', 'one', 'e'], ['2', 'two', 'e']], // metrics present but category is systems
      presentation: { type: 'systems-sheet', alt: 'sys' },
    };
    const artifact = createArtifact(record, 'engineering');
    const spine = artifact.querySelector('.ascii-spine');
    assert.equal(spine, null, 'systems category → no spine');
  });
});

test('ai-ml category artifact does NOT render the spine', () => {
  withDom(() => {
    const record = {
      slug: 'aiml-test',
      title: 'AI/ML',
      status: 'current',
      category: 'ai-ml',
      summary: '',
      metrics: [['42%', 'pass rate', 'e']],
      presentation: { type: 'experiment-note', alt: 'aiml' },
    };
    const artifact = createArtifact(record, 'engineering');
    const spine = artifact.querySelector('.ascii-spine');
    assert.equal(spine, null, 'ai-ml category → no spine');
  });
});

test('witf physical-plate with metrics is excluded (ships its own viewer)', () => {
  withDom(() => {
    const record = {
      slug: 'witf',
      title: 'WITF',
      status: 'historical',
      category: 'physical-product',
      summary: '',
      metrics: [['~15 -> ~100 -> ~50', 'unit planning sequence', 'canonical user fact']],
      presentation: { type: 'physical-plate', alt: 't' },
    };
    const artifact = createArtifact(record, 'engineering');
    const spine = artifact.querySelector('.ascii-spine');
    assert.equal(spine, null, 'witf is excluded from the spine');
  });
});

test('spine sits before the header (banner position)', () => {
  withDom(() => {
    const record = PROJECTS.find((p) => p.slug === 'gmk-arch');
    const artifact = createArtifact(record, 'engineering');
    const children = [...artifact.children];
    const spineIdx = children.findIndex((c) => c.classList?.contains('ascii-spine'));
    const headerIdx = children.findIndex((c) => c.classList?.contains('artifact-header'));
    assert.ok(spineIdx >= 0 && headerIdx >= 0, 'spine and header must both exist');
    assert.ok(spineIdx < headerIdx, `spine (${spineIdx}) must precede header (${headerIdx})`);
  });
});

test('spine carries the correct status glyph for current research projects', () => {
  // Sanity: even though systems/ai-ml don't render, the mapping is correct.
  withDom(() => {
    // Use a synthetic record to confirm statusGlyph mapping is honored in DOM.
    const record = {
      slug: 'test-spine',
      title: 'Test',
      status: 'research',
      category: 'physical-product',
      summary: '',
      metrics: [['1', 'one', 'e'], ['2', 'two', 'e'], ['3', 'three', 'e']],
      presentation: { type: 'physical-plate', alt: 't' },
    };
    const artifact = createArtifact(record, 'engineering');
    const spine = artifact.querySelector('.ascii-spine');
    assert.ok(spine);
    // 'research' maps to 'O'
    assert.equal(spine.getAttribute('data-status-glyph'), 'O');
  });
});
