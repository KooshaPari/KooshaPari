import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { createShareCliWorkbench, SHARECLI_STATES, renderShareCliWorkbench } from '../scripts/media/sharecli-workbench.js';

test('Burst illustration contains four distinct capsules and a stationary rail', () => {
  const previous = globalThis.document;
  globalThis.document = parseHTML('<html><body></body></html>').document;
  try {
    const root = renderShareCliWorkbench(document);
    const source = root.querySelector('.sharecli-workbench__object-illustration').getAttribute('src');
    const markup = decodeURIComponent(source.slice(source.indexOf(',') + 1));
    const visual = parseHTML(markup).document;
    assert.equal(visual.querySelectorAll('[data-object="capsule"]').length, 4);
    assert.equal(visual.querySelectorAll('[data-highlighted="true"]').length, 1);
    assert.ok(visual.querySelector('[data-object="stationary-base"]'));
    assert.equal(visual.querySelectorAll('animate, animateTransform').length, 0);
  } finally { globalThis.document = previous; }
});

test('ShareCLI workbench exposes four bounded illustrative runtime states', () => {
  assert.deepEqual(SHARECLI_STATES.map((state) => state.id), ['burst', 'coalesce', 'observe', 'recover']);
  assert.ok(SHARECLI_STATES.every((state) => state.title && state.description && state.readerSequence));
  assert.ok(SHARECLI_STATES.every((state) => !/throughput|latency|live telemetry|terminal recording/i.test(`${state.title} ${state.description}`)));
});

test('ShareCLI workbench is visitor-stepped and resettable without playback', () => {
  const workbench = createShareCliWorkbench();
  // Motion is exposed alongside state so a renderer can read the visitor's
  // discrete choice; the default is off to preserve parity for static,
  // no-JavaScript, and reduced-motion contexts.
  assert.deepEqual(workbench.get(), { state: 0, motion: false });
  assert.equal(workbench.next(), true);
  assert.deepEqual(workbench.get(), { state: 1, motion: false });
  assert.equal(workbench.selectState(3), true);
  assert.deepEqual(workbench.get(), { state: 3, motion: false });
  assert.equal(workbench.selectState(4), false);
  assert.equal(workbench.reset(), true);
  assert.deepEqual(workbench.get(), { state: 0, motion: false });
  assert.equal(typeof workbench.play, 'undefined');
});

test('ShareCLI workbench keeps its fixture and static-fallback limits visible', () => {
  const workbench = createShareCliWorkbench();
  assert.match(workbench.fallbackText(), /static/i);
  assert.match(workbench.fallbackText(), /reduced motion/i);
  assert.match(workbench.evidenceBoundary(), /fixture/i);
  assert.match(workbench.evidenceBoundary(), /not.*terminal/i);
});

// Precision-object presentation: every state names a material and an object
// primitive so the Workbench never falls back to raw frame/pixel vocabulary.
test('each ShareCLI state names a precision material and an object primitive', () => {
  const materialVocabulary = /\b(graphite|anodized aluminum|brushed titanium|sintered ceramic|cast aluminum|ceramic|aluminum|titanium|steel|polymer|brass|glass|porcelain|graphite-anodized)\b/i;
  const primitiveVocabulary = /\b(capsule|barrel|blade|block|stratum|shell|plate|rod|sheet|cylinder|peg|rivet|joint|disc|ring|strip|sleeve|clamp|core|stand|column|cart|stand-off|spacer|pin|shaft|hub|cast|frame|bracket|insert)\b/i;
  assert.ok(SHARECLI_STATES.every((state) => typeof state.material === 'string' && state.material.length > 0),
    'every state must declare a precision material');
  assert.ok(SHARECLI_STATES.every((state) => typeof state.objectPrimitive === 'string' && state.objectPrimitive.length > 0),
    'every state must declare an object primitive');
  assert.ok(SHARECLI_STATES.every((state) => materialVocabulary.test(state.material)),
    'every state material must use precision material vocabulary');
  assert.ok(SHARECLI_STATES.every((state) => primitiveVocabulary.test(state.objectPrimitive)),
    'every state objectPrimitive must use object vocabulary, not frame/pixel language');
  assert.ok(SHARECLI_STATES.every((state) => typeof state.materialLabel === 'string' && state.materialLabel.length > 0),
    'every state must declare an object-first materialLabel');
  assert.ok(SHARECLI_STATES.every((state) => typeof state.objectLabel === 'string' && state.objectLabel.length > 0),
    'every state must declare an object-first objectLabel');
  // Surface copy must be object-first. Anti-patterns target video/raster
  // vocabulary ("video frame", "frame rate", "pixel grid", "pixel count")
  // — structural object words like "cradle" or "frame" used as a primitive
  // are legitimate precision vocabulary.
  const rasterLanguage = /\bvideo\s*frame|\bframe\s*(rate|buffer|per\s*second)|frames?\s*per\s*second|\bpixel\s*(grid|count|art|resolution|density|raster)|\bpixels?\s*(per|tall|wide|high|across|count)|rasteri[sz]ed|scanline|interlaced|progressive\s*scan\b/i;
  assert.ok(SHARECLI_STATES.every((state) => !rasterLanguage.test(state.objectLabel)),
    'objectLabel must describe the artifact as an object, not in video or raster language');
});

// Roles give every state object vocabulary: which block is the highlighted
// pusher vs the stationary base, etc., so the renderer, alt text, and parity
// copy agree without resorting to motion-only vocabulary.
test('each ShareCLI state declares object roles and a non-illustrative provenance note', () => {
  const roleVocabulary = /\b(pusher|stationary-base|coalesced-stand|recover-stand|observer|highlighted|lead)\b/i;
  assert.ok(SHARECLI_STATES.every((state) => Array.isArray(state.objectRoles) && state.objectRoles.length > 0),
    'every state must enumerate object roles');
  assert.ok(SHARECLI_STATES.every((state) => state.objectRoles.every((role) => roleVocabulary.test(role))),
    'object roles must use the precision-object role vocabulary');
  assert.ok(SHARECLI_STATES.every((state) => typeof state.highlightedRole === 'string' && typeof state.leadRole === 'string'),
    'every state must declare a highlightedRole and leadRole');
  assert.ok(SHARECLI_STATES.every((state) => typeof state.provenance === 'string' && /illustrative|fixture|not.*terminal|not.*recorded/i.test(state.provenance)),
    'every state must carry a non-illustrative provenance note that distinguishes the Workbench from real terminal recordings');
  // Alt text and description must describe the artifact as an object, not
  // in video/raster language.
  const rasterLanguage = /\bvideo\s*frame|\bframe\s*(rate|buffer|per\s*second)|frames?\s*per\s*second|\bpixel\s*(grid|count|art|resolution|density|raster)|\bpixels?\s*(per|tall|wide|high|across|count)|rasteri[sz]ed|scanline|interlaced|progressive\s*scan\b/i;
  assert.ok(SHARECLI_STATES.every((state) => !rasterLanguage.test(`${state.altText} ${state.description}`)),
    'altText and description must describe the artifact as an object, not in video or raster language');
});

// Visitor-stepped motion is a discrete choice. The Workbench exposes a
// setMotionEnabled / isMotionEnabled pair so a renderer can check the
// visitor's choice; the default is off, parity for static/no-JS/reduced
// motion contexts is preserved, and there is still no autoplay.
test('ShareCLI workbench exposes visitor-stepped motion-by-choice that defaults off', () => {
  const workbench = createShareCliWorkbench();
  // Default motion is off so static, no-JavaScript, and reduced-motion contexts keep parity.
  assert.equal(workbench.isMotionEnabled(), false);
  // Public API exposes the discrete choice to renderers.
  assert.equal(typeof workbench.setMotionEnabled, 'function');
  assert.equal(typeof workbench.isMotionEnabled, 'function');
  // Motion is a visitor choice, never an autoplay: get() exposes it; there is still no play().
  assert.deepEqual(workbench.get(), { state: 0, motion: false });
  assert.equal(workbench.play, undefined);
  // Toggling motion does not change the selected state.
  assert.equal(workbench.setMotionEnabled(true), true);
  assert.equal(workbench.isMotionEnabled(), true);
  assert.equal(workbench.get().state, 0);
  // setMotionEnabled is idempotent and never advances the state by itself.
  assert.equal(workbench.setMotionEnabled(true), false);
  assert.equal(workbench.get().state, 0);
  // Reset turns motion back off so the next visitor starts from the same baseline.
  assert.equal(workbench.reset(), true);
  assert.equal(workbench.isMotionEnabled(), false);
});

// Parity text must explicitly cover the four contexts a precision artifact
// must respect: static, no-JavaScript, reduced-motion, and the provenance
// boundary that separates this Workbench from the real .cast recordings.
test('ShareCLI workbench parity text covers static, no-JS, reduced-motion, and provenance boundary', () => {
  const workbench = createShareCliWorkbench();
  assert.equal(typeof workbench.parityText, 'function');
  const parity = workbench.parityText();
  assert.match(parity, /static/i, 'parity text must name the static fallback');
  assert.match(parity, /no[- ]?javascript|no[- ]?js|without javascript/i, 'parity text must name the no-JavaScript fallback');
  assert.match(parity, /reduced motion/i, 'parity text must name the reduced-motion fallback');
  assert.match(parity, /illustrative|fixture|not.*terminal|not.*recorded|separate.*recording|separate.*workbench/i,
    'parity text must name the provenance boundary that separates this Workbench from real terminal recordings');
});

// Rendered field: surface copy and image alt text use the material/primitive
// vocabulary, the motion toggle is present as a discrete visitor choice, and
// the rendered field never auto-advances or tracks visitors.
test('ShareCLI workbench renders object-first labels and a discrete motion toggle', () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  const root = renderShareCliWorkbench(document);
  const buttons = [...root.querySelectorAll('button')];
  // Object-first material labels appear on the page for every state we step through.
  for (let index = 0; index < SHARECLI_STATES.length; index += 1) {
    const state = SHARECLI_STATES[index];
    const stateButton = buttons.find((node) => node.textContent === state.label);
    assert.ok(stateButton, `state button for ${state.id} must exist in the rendered field`);
    stateButton.click();
    const text = root.textContent.replace(/\s+/g, ' ');
    const escapedMaterial = state.material.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    assert.match(text, new RegExp(escapedMaterial, 'i'),
      `rendered field must surface the material vocabulary from ${state.id}`);
    assert.match(text, new RegExp(state.materialLabel.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'),
      `rendered field must surface the materialLabel from ${state.id}`);
    // Image alt text uses the object-first vocabulary, not video/raster language.
    const img = root.querySelector('img');
    assert.ok(img, 'workbench must render an image for every state');
    const alt = img.getAttribute('alt') || '';
    assert.match(alt, /\b(graphite|anodized|brushed|sintered|cast|aluminum|titanium|ceramic|steel|polymer|brass|glass|porcelain)\b/i,
      `image alt text for ${state.id} must use precision material vocabulary`);
    const rasterLanguage = /\bvideo\s*frame|\bframe\s*(rate|buffer|per\s*second)|frames?\s*per\s*second|\bpixel\s*(grid|count|art|resolution|density|raster)|\bpixels?\s*(per|tall|wide|high|across|count)|rasteri[sz]ed|scanline|interlaced|progressive\s*scan\b/i;
    assert.doesNotMatch(alt, rasterLanguage,
      `image alt text for ${state.id} must not use video or raster language`);
  }
  // A motion toggle is present, labeled as a discrete choice, not as an autoplay.
  assert.match(root.outerHTML, /motion/i);
  const motionToggle = [...root.querySelectorAll('button, input')].find((node) => /motion/i.test(node.textContent || node.getAttribute('aria-label') || ''));
  assert.ok(motionToggle, 'a discrete motion-by-choice control must exist in the rendered field');
  assert.match(motionToggle.textContent || '', /motion:\s*off/i, 'motion toggle must default to off');
  // No telemetry hooks: no fetch, XHR, sendBeacon, analytics, or storage writes.
  assert.doesNotMatch(root.outerHTML, /fetch\(/i);
  assert.doesNotMatch(root.outerHTML, /XMLHttpRequest/i);
  assert.doesNotMatch(root.outerHTML, /sendBeacon/i);
  assert.doesNotMatch(root.outerHTML, /google-analytics|googletagmanager|segment\.com|mixpanel/i);
  assert.doesNotMatch(root.outerHTML, /localStorage\.|sessionStorage\./i);
  // State does not auto-advance without a visitor click.
  const initialState = root.querySelector('img').getAttribute('alt');
  return Promise.resolve().then(() => {
    assert.equal(root.querySelector('img').getAttribute('alt'), initialState,
      'rendered state must not change without a visitor click');
  });
});
