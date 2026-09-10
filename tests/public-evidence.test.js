import test from 'node:test';
import assert from 'node:assert/strict';
import { PROJECTS } from '../data/projects.js';
import { evidenceLabel, publicEvidenceSummary } from '../scripts/components/evidence.js';

test('public evidence labels retain source distinctions without internal filenames', () => {
  assert.equal(publicEvidenceSummary({ evidence: 'github-pass1-after.md' }), 'Repository documentation and project history');
  assert.equal(publicEvidenceSummary({ evidence: 'omniroute-evidence-ledger.md' }), 'Upstream contribution records');
  assert.equal(publicEvidenceSummary({ evidence: '/private/new-ledger.json' }), 'Supporting project evidence is being assembled');
  const previous = globalThis.document;
  globalThis.document = {
    createElement: () => ({ nodeType: 1, children: [], setAttribute() {}, append(...nodes) { this.children.push(...nodes); } }),
    createTextNode: text => ({ nodeType: 3, textContent: text }),
  };
  const text = node => node.nodeType === 3 ? node.textContent : node.children.map(text).join(' ');
  try {
    for (const project of PROJECTS) {
      const original = project.evidence;
      const rendered = text(evidenceLabel(project, 'engineering'));
      assert.doesNotMatch(rendered, /\.md\b|\.json\b|ledger|pass1|Canonical user brief/i);
      assert.equal(project.evidence, original);
    }
  } finally { globalThis.document = previous; }
});
