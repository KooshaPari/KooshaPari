/**
 * main-helpers.test.js — Unit tests for pure helpers extracted from main.js.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PAGE_LABELS,
  DEFAULT_DESCRIPTION,
  extractWorkSlug,
  findProjectBySlug,
  buildPageTitle,
  buildPageDescription,
  isProjectDetailRoute,
  activeTabFor,
  SELECTOR_TAB,
  SELECTOR_VIEW_ROOT,
  CLASS_TAB_ACTIVE,
  ATTR_ARIA_SELECTED,
  radarAngleFor,
  radarPointFor,
  radarAxisEnd,
  radarRingRadii,
  radarRingPoints,
  radarLabelAnchor,
  radarBaselineAnchor,
  radarLabelPoint,
  radarScorePoint,
  radarRingLabelY,
  radarRingTierRadius,
  barRect,
} from '../scripts/main-helpers.js';

/* ── PAGE METADATA ──────────────────────────────────────────────── */

test('PAGE_LABELS contains the expected view-to-label map', () => {
  assert.equal(PAGE_LABELS.home, 'Home');
  assert.equal(PAGE_LABELS.engineering, 'Engineering work');
  assert.equal(PAGE_LABELS.product, 'Product / Program work');
  assert.equal(PAGE_LABELS.work, 'Selected work');
  assert.equal(PAGE_LABELS.resume, 'Resume');
  assert.equal(PAGE_LABELS.contact, 'Contact');
});

test('PAGE_LABELS is frozen', () => {
  assert.equal(Object.isFrozen(PAGE_LABELS), true);
});

test('DEFAULT_DESCRIPTION matches the inline fallback', () => {
  assert.match(DEFAULT_DESCRIPTION, /Koosha Paridehpour/);
});

test('extractWorkSlug returns the slug for "work/{slug}" routes', () => {
  assert.equal(extractWorkSlug('work/portfolio-site'), 'portfolio-site');
  assert.equal(extractWorkSlug('work/helio'), 'helio');
});

test('extractWorkSlug returns null for non-work views', () => {
  assert.equal(extractWorkSlug('home'), null);
  assert.equal(extractWorkSlug('engineering'), null);
  assert.equal(extractWorkSlug(''), null);
  assert.equal(extractWorkSlug('work'), null); // no slash
  assert.equal(extractWorkSlug(null), null);
  assert.equal(extractWorkSlug(undefined), null);
});

test('findProjectBySlug returns the matching project', () => {
  const projects = [
    { slug: 'a', title: 'A' },
    { slug: 'b', title: 'B' },
  ];
  assert.deepEqual(findProjectBySlug('a', projects), { slug: 'a', title: 'A' });
  assert.deepEqual(findProjectBySlug('b', projects), { slug: 'b', title: 'B' });
});

test('findProjectBySlug returns null for missing slug or projects', () => {
  assert.equal(findProjectBySlug('nope', [{ slug: 'a' }]), null);
  assert.equal(findProjectBySlug(null, [{ slug: 'a' }]), null);
  assert.equal(findProjectBySlug('a', null), null);
  assert.equal(findProjectBySlug('a', []), null);
});

test('buildPageTitle formats project title route', () => {
  assert.equal(
    buildPageTitle('work/portfolio-site', { title: 'Portfolio Site' }),
    'Portfolio Site — Koosha Paridehpour'
  );
});

test('buildPageTitle falls back to PAGE_LABELS for known views', () => {
  assert.equal(buildPageTitle('home', null), 'Home — Koosha Paridehpour');
  assert.equal(buildPageTitle('engineering', null), 'Engineering work — Koosha Paridehpour');
  assert.equal(buildPageTitle('contact', null), 'Contact — Koosha Paridehpour');
});

test('buildPageTitle falls back to "Portfolio" for unknown views', () => {
  assert.equal(buildPageTitle('mystery', null), 'Portfolio — Koosha Paridehpour');
});

test('buildPageDescription uses project summary when present', () => {
  assert.equal(
    buildPageDescription({ summary: 'A custom summary.' }),
    'A custom summary.'
  );
});

test('buildPageDescription uses DEFAULT_DESCRIPTION when no project', () => {
  assert.equal(buildPageDescription(null), DEFAULT_DESCRIPTION);
  assert.equal(buildPageDescription({}), DEFAULT_DESCRIPTION);
});

/* ── TAB ROUTING ────────────────────────────────────────────────── */

test('isProjectDetailRoute recognises "work/{slug}"', () => {
  assert.equal(isProjectDetailRoute('work/a'), true);
  assert.equal(isProjectDetailRoute('work/portfolio-site'), true);
});

test('isProjectDetailRoute rejects other routes', () => {
  assert.equal(isProjectDetailRoute('home'), false);
  assert.equal(isProjectDetailRoute('work'), false);
  assert.equal(isProjectDetailRoute(''), false);
  assert.equal(isProjectDetailRoute(null), false);
  assert.equal(isProjectDetailRoute(undefined), false);
});

test('activeTabFor returns the work tab for project detail routes', () => {
  assert.equal(activeTabFor('work/portfolio-site'), 'work');
  assert.equal(activeTabFor('work/anything'), 'work');
});

test('activeTabFor returns the view itself for non-project routes', () => {
  assert.equal(activeTabFor('home'), 'home');
  assert.equal(activeTabFor('engineering'), 'engineering');
});

test('tab constants match orchestrator expectations', () => {
  assert.equal(SELECTOR_TAB, '.tab');
  assert.equal(SELECTOR_VIEW_ROOT, '#view-root');
  assert.equal(CLASS_TAB_ACTIVE, 'active');
  assert.equal(ATTR_ARIA_SELECTED, 'aria-selected');
});

/* ── RADAR GEOMETRY ─────────────────────────────────────────────── */

test('radarAngleFor puts the first axis at -PI/2', () => {
  assert.equal(radarAngleFor(0, 4), -Math.PI / 2);
});

test('radarAngleFor distributes axes evenly around the circle', () => {
  const N = 6;
  const angles = Array.from({ length: N }, (_, i) => radarAngleFor(i, N));
  // All angles unique
  assert.equal(new Set(angles).size, N);
  // Range spans 2*PI
  assert.ok(angles[5] - angles[0] < 2 * Math.PI);
  // Each step is 2*PI/N
  const expected = (2 * Math.PI) / N;
  for (let i = 1; i < N; i++) {
    assert.ok(Math.abs(angles[i] - angles[i - 1] - expected) < 1e-9);
  }
});

test('radarPointFor returns the center for value=0', () => {
  const [x, y] = radarPointFor(100, 100, 0, 50, 0);
  assert.equal(x, 100);
  assert.equal(y, 100);
});

test('radarPointFor returns the ring edge for value=100', () => {
  // angle = 0 -> (cx + radius, cy)
  const [x, y] = radarPointFor(0, 0, 100, 50, 0);
  assert.equal(x, 50);
  assert.equal(y, 0);
});

test('radarPointFor scales linearly with value', () => {
  // value=50 should be at half radius
  const [x50] = radarPointFor(0, 0, 50, 40, 0);
  assert.equal(x50, 20);
});

test('radarAxisEnd places the axis tip at the outer ring', () => {
  // angle = 0, radius = 50 -> (50, 0)
  const [x, y] = radarAxisEnd(0, 0, 50, 0);
  assert.equal(x, 50);
  assert.equal(y, 0);
});

test('radarRingRadii returns the default four fractions', () => {
  assert.deepEqual(radarRingRadii(100), [25, 50, 75, 100]);
});

test('radarRingRadii accepts custom fractions', () => {
  assert.deepEqual(radarRingRadii(80, [0.5, 1]), [40, 80]);
});

test('radarRingPoints builds a "x,y x,y ..." polygon string', () => {
  const pts = radarRingPoints(4, 100, 50, 0, 0);
  // Should be 4 axis-position pairs separated by spaces
  const pairs = pts.split(' ');
  assert.equal(pairs.length, 4);
});

test('radarLabelAnchor is "end" when left of center', () => {
  assert.equal(radarLabelAnchor(50, 100), 'end');
  // 97 < 100 - 2 -> end
  assert.equal(radarLabelAnchor(97, 100, 2), 'end');
  // 98 < 98 is false, so this lands in the middle bucket
  assert.equal(radarLabelAnchor(98, 100, 2), 'middle');
});

test('radarLabelAnchor is "start" when right of center', () => {
  assert.equal(radarLabelAnchor(150, 100), 'start');
});

test('radarLabelAnchor is "middle" when within epsilon', () => {
  assert.equal(radarLabelAnchor(100, 100, 2), 'middle');
  assert.equal(radarLabelAnchor(101, 100, 2), 'middle');
  assert.equal(radarLabelAnchor(99, 100, 2), 'middle');
});

test('radarBaselineAnchor matches the y position relative to cy', () => {
  assert.equal(radarBaselineAnchor(50, 100), 'auto');
  assert.equal(radarBaselineAnchor(100, 100, 2), 'middle');
  assert.equal(radarBaselineAnchor(150, 100), 'hanging');
});

test('radarLabelPoint offsets by the given pixel distance', () => {
  // angle=0, radius=50, offset=22 -> (72, 0)
  const [x, y] = radarLabelPoint(0, 0, 50, 0, 22);
  assert.equal(x, 72);
  assert.equal(y, 0);
});

test('radarLabelPoint uses default offset of 22', () => {
  const [x] = radarLabelPoint(0, 0, 50, 0);
  assert.equal(x, 72);
});

test('radarScorePoint uses the default offset of 38', () => {
  // angle=0, radius=50, offset=38 -> (88, 0)
  const [x, y] = radarScorePoint(0, 0, 50, 0);
  assert.equal(x, 88);
  assert.equal(y, 0);
});

test('radarRingLabelY is "cy - ringRadius"', () => {
  assert.equal(radarRingLabelY(100, 25), 75);
  assert.equal(radarRingLabelY(0, 50), -50);
});

test('radarRingTierRadius distributes tier radii evenly', () => {
  // 4 tiers, radius 100 -> 0, 33.33, 66.67, 100
  assert.equal(radarRingTierRadius(0, 4, 100), 0);
  assert.ok(Math.abs(radarRingTierRadius(3, 4, 100) - 100) < 1e-9);
});

test('radarRingTierRadius guards against count=0', () => {
  // Math.max(1, 0-1) = 1, so division is by 1
  assert.equal(radarRingTierRadius(0, 0, 100), 0);
});

/* ── BAR GEOMETRY ──────────────────────────────────────────────── */

test('barRect places items with row gap', () => {
  const layout = { x: 10, y: 20, width: 100, height: 8, rowGap: 4 };
  const r0 = barRect(0, 50, 100, layout);
  assert.deepEqual(r0, { x: 10, y: 20, width: 50, height: 8 });
  const r1 = barRect(1, 50, 100, layout);
  assert.deepEqual(r1, { x: 10, y: 32, width: 50, height: 8 });
});

test('barRect clamps value to [0, max]', () => {
  const layout = { x: 0, y: 0, width: 100, height: 10, rowGap: 0 };
  assert.equal(barRect(0, 200, 100, layout).width, 100); // clamps at max
  assert.equal(barRect(0, -10, 100, layout).width, 0); // clamps at 0
});
