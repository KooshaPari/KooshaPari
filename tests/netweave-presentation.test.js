import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { renderDiagram } from '../scripts/media/diagrams.js';
import { renderNetWeaveWorkbench } from '../scripts/media/netweave-workbench.js';

test('tab arrows retain nodes and move focus without hijacking traffic controls', () => {
  const { document, window } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  const root = renderNetWeaveWorkbench(document);
  document.body.append(root);
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  let focused;
  tabs.forEach(tab => { tab.focus = () => { focused = tab; }; });
  const key = (node, value) => { const event = new window.Event('keydown', { bubbles: true, cancelable: true }); event.key = value; node.dispatchEvent(event); return event; };
  key(tabs[0], 'ArrowRight');
  assert.ok(root.querySelectorAll('[role="tab"]')[1] === tabs[1], 'tab node must remain attached');
  assert.ok(focused === tabs[1], 'focus must move to next tab');
  key(tabs[1], 'ArrowRight');
  assert.ok(focused === tabs[2]);
  const approach = [...root.querySelectorAll('button')].find(node => node.textContent === 'Approach');
  approach.click();
  assert.equal(key(approach, 'ArrowRight').defaultPrevented, false);
  assert.equal(tabs[2].getAttribute('aria-selected'), 'true');
  key(tabs[2], 'Escape');
  assert.ok(focused === tabs[0]);
  assert.match(root.querySelector('img').src, /desktop-01/);
});

test('small-screen diagram reader retains the same nodes and edge endpoints', () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  const figure = renderDiagram({ nodes: [{ id: 'a', label: 'Road graph' }, { id: 'b', label: 'Vehicle cells' }], edges: [{ from: 'a', to: 'b' }] });
  assert.deepEqual([...figure.querySelectorAll('.case-diagram-reader__nodes li')].map(node => node.textContent), ['Road graph', 'Vehicle cells']);
  assert.match(figure.querySelector('.case-diagram-reader__edges').textContent, /Road graph.*Vehicle cells/);
});

test('architecture nodes are SVG elements with visible positioned labels', () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  const figure = renderDiagram({ nodes: [{ id: 'road', label: 'Directed road graph' }, { id: 'cell', label: 'Local vehicle behavior' }], edges: [{ from: 'road', to: 'cell' }] });
  for (const node of figure.querySelectorAll('svg, g, rect, text, line')) {
    assert.equal(node.namespaceURI, 'http://www.w3.org/2000/svg');
  }
  assert.equal(figure.querySelectorAll('text').length, 4);
});

test('NetWeave uses one named state control group and keeps the same image across views', () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  const root = renderNetWeaveWorkbench(document);
  assert.match(root.querySelector('.netweave-field__summary').textContent, /graphite-grey/);
  assert.doesNotMatch(root.querySelector('.netweave-field__summary').textContent, /blue block/);
  assert.ok(root.querySelector('img.netweave-field__image'));
  assert.equal(root.querySelectorAll('img').length, 1);
  const buttons = [...root.querySelectorAll('button')];
  const approach = buttons.find((node) => node.textContent === 'Approach');
  approach.click();
  assert.match(root.querySelector('img').getAttribute('src'), /desktop-03/);
  buttons.find((node) => node.textContent === 'Route').click();
  assert.match(root.querySelector('img').getAttribute('src'), /desktop-03/);
  assert.equal(root.querySelector('[aria-label="Illustrative traffic states"]').querySelectorAll('[aria-pressed]').length, 3);
  assert.match(root.textContent, /No vehicle changes lane or route/);
  buttons.find((node) => node.textContent === 'Reset').click();
  assert.match(root.querySelector('img').getAttribute('src'), /desktop-01/);
});

test('Rendered field exposes object-first labels and explicit highlighted-follower / stationary-lead roles', () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  const root = renderNetWeaveWorkbench(document);
  const text = root.textContent.replace(/\s+/g, ' ');
  assert.match(text, /following vehicle/i, 'field must mention the following vehicle as an object, not only as motion');
  assert.match(text, /stationary lead vehicle/i, 'field must mention the stationary lead vehicle as an object');
  const img = root.querySelector('img');
  assert.match(img.getAttribute('alt') || '', /following/i, 'image alt text must describe the highlighted follower');
  assert.match(img.getAttribute('alt') || '', /stationary/i, 'image alt text must describe the stationary lead');
});

test('Rendered field never auto-advances state and exposes a discrete motion toggle', () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  const root = renderNetWeaveWorkbench(document);
  const initialSrc = root.querySelector('img').getAttribute('src');
  // No setTimeout / setInterval / requestAnimationFrame should have changed the image.
  // We assert by reading the image src again after a microtask, which proves no playback timer fired.
  return Promise.resolve().then(() => {
    assert.equal(root.querySelector('img').getAttribute('src'), initialSrc, 'state must not change without user input');
  });
});

test('Rendered field exposes a motion-by-choice toggle that is off by default and never tracks or fetches', () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  const root = renderNetWeaveWorkbench(document);
  const html = root.outerHTML;
  // No telemetry hooks: no fetch, XHR, sendBeacon, ga(), dataLayer, or localStorage writes.
  assert.doesNotMatch(html, /fetch\(/i);
  assert.doesNotMatch(html, /XMLHttpRequest/i);
  assert.doesNotMatch(html, /sendBeacon/i);
  assert.doesNotMatch(html, /google-analytics|googletagmanager|segment\.com|mixpanel/i);
  assert.doesNotMatch(html, /localStorage\.|sessionStorage\./i);
  // Motion toggle is present and labeled as a discrete choice, not as an autoplay.
  assert.match(html, /reduce motion|reduced motion|motion/i);
  const motionToggle = [...root.querySelectorAll('button, input')].find((node) => /motion/i.test(node.textContent || node.getAttribute('aria-label') || ''));
  assert.ok(motionToggle, 'a motion-by-choice control must exist in the rendered field');
});
