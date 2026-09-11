import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { PROJECTS } from '../data/projects.js';
import { createArtifact } from '../scripts/components/artifact.js';

for (const lens of ['engineering', 'product']) {
  test(`OmniRoute ${lens} artifact renders its conditional routing topology`, () => {
    const previous = globalThis.document;
    globalThis.document = parseHTML('<html><body></body></html>').document;
    try {
      const artifact = createArtifact(PROJECTS.find(({ slug }) => slug === 'omniroute'), lens);
      assert.doesNotMatch(artifact.textContent, /agent bursts|process observation|coalesce \+ queue|shared host state/);
      const svg = artifact.querySelector('svg[data-topology="omniroute"]');
      assert.ok(svg, 'OmniRoute needs its own SVG, not ShareCLI topology');
      const plate = artifact.querySelector('.omniroute-topology__plate');
      assert.ok(plate, 'routing object needs a bounded plate');
      assert.ok(plate.contains(svg));
      assert.match(plate.querySelector('.omniroute-topology__plate-header').textContent, /Conceptual model/);
      assert.deepEqual([...plate.querySelectorAll('.omniroute-topology__legend li')].map(node => node.textContent), ['Request / response path', 'Conditional failure path']);
      assert.equal(plate.querySelectorAll('animate, animateTransform, video').length, 0);
      assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg');
      assert.deepEqual([...svg.querySelectorAll('[data-node]')].map(n => n.getAttribute('data-node')),
        ['request', 'selection', 'execution', 'response', 'failure']);
      assert.deepEqual([...svg.querySelectorAll('[data-edge]')].map(n => n.getAttribute('data-edge')),
        ['request-selection', 'selection-execution', 'execution-response', 'execution-failure', 'failure-selection', 'failure-response']);
      assert.match(artifact.textContent, /provider breaker/);
      assert.match(artifact.textContent, /connection cooldown/);
      assert.match(artifact.textContent, /model lockout/);
      assert.match(artifact.textContent, /Conceptual/);
      assert.match(artifact.textContent, /not a universal execution trace/);
      const reader = artifact.querySelector('[data-topology-reader]');
      assert.ok(reader);
      assert.match(reader.textContent, /bounded/);
      assert.match(reader.textContent, /stop or exhausted/);
      assert.equal(reader.tagName, 'DETAILS');
      assert.equal(reader.hasAttribute('open'), false);
      assert.equal(reader.querySelectorAll('ol > li').length, 6);
      assert.equal(reader.querySelector('summary').textContent, 'Read routing paths');
      const mobile = artifact.querySelector('.omniroute-topology__mobile');
      assert.ok(mobile, 'Mobile needs readable HTML, not a scaled diagram');
      assert.deepEqual([...mobile.querySelectorAll('[data-mobile-node]')].map(n => n.getAttribute('data-mobile-node')),
        ['request', 'selection', 'execution', 'response', 'failure']);
      assert.match(mobile.textContent, /bounded retry/);
      assert.match(mobile.textContent, /stop or exhausted/);
      for (const id of svg.getAttribute('aria-labelledby').split(' ')) {
        assert.ok(artifact.querySelector(`[id="${id}"]`));
      }
    } finally { globalThis.document = previous; }
  });
}
