import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getIllustration,
  initTechIllustrations,
  ILLUSTRATIONS,
} from '../scripts/media/tech-illustrations.js';

test('ILLUSTRATIONS exposes the documented five illustrations', () => {
  const expected = new Set([
    'networkTopology', 'apiGateway', 'agentPipeline',
    'securityLayers', 'dataFlow',
  ]);
  assert.deepEqual(new Set(Object.keys(ILLUSTRATIONS)), expected);
});

test('Each illustration returns a non-empty SVG string', () => {
  for (const [name, fn] of Object.entries(ILLUSTRATIONS)) {
    const svg = fn();
    assert.equal(typeof svg, 'string');
    assert.ok(svg.startsWith('<svg'), `${name} should start with <svg>`);
    assert.ok(svg.includes('</svg>'), `${name} should close </svg>`);
  }
});

test('Each illustration uses a 200-wide viewBox for consistent horizontal scaling', () => {
  for (const [name, fn] of Object.entries(ILLUSTRATIONS)) {
    assert.match(fn(), /viewBox="0 0 200 /, `${name} missing shared width=200`);
  }
});

test('Illustrations use one of three standard height bands (120, 130, or 150)', () => {
  for (const [name, fn] of Object.entries(ILLUSTRATIONS)) {
    const svg = fn();
    assert.ok(/viewBox="0 0 200 (120|130|150)"/.test(svg), `${name} has unexpected viewBox height`);
  }
});

test('getIllustration returns null for unknown names', () => {
  assert.equal(getIllustration('not-a-real-illustration'), null);
  assert.equal(getIllustration(''), null);
});

test('getIllustration returns the SVG string for known names', () => {
  const svg = getIllustration('networkTopology');
  assert.ok(svg && svg.startsWith('<svg'));
});

test('initTechIllustrations replaces .tech-illustration[data-name] elements with the matching SVG', () => {
  const root = { innerHTML: '', getAttribute() { return ''; }, setAttribute() {} };
  // Provide a minimal document stub that returns our crafted element set.
  const elements = [
    { innerHTML: '', getAttribute: () => 'networkTopology' },
    { innerHTML: '', getAttribute: () => 'unknown-shape' },
    { innerHTML: '', getAttribute: () => 'apiGateway' },
  ];
  const doc = {
    querySelectorAll: () => elements,
  };
  initTechIllustrations(doc);
  assert.ok(elements[0].innerHTML.startsWith('<svg'));
  assert.equal(elements[1].innerHTML, ''); // unknown — left as is
  assert.ok(elements[2].innerHTML.startsWith('<svg'));
});
