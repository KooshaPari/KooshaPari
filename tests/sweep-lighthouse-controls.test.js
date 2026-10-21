import test from 'node:test';
import assert from 'node:assert/strict';
import { sweep } from '../scripts/sweep-lighthouse-claims.js';
import { sweepControl } from './helpers/sweep-lighthouse-support.js';

/**
 * Negative controls for the Lighthouse sweep.
 *
 * A detector that cannot fail is not a detector. Each test below plants a
 * claim that a genuine stale claim would resemble, sweeps an ISOLATED
 * tree (see `helpers/sweep-lighthouse-support.js` for why isolation is
 * mandatory), and asserts that the sweep reports it.
 */

/**
 * Negative control. The claim below is written the way a genuine stale
 * claim would read. It must be reported as uncovered, otherwise the
 * sweep is not actually capable of failing.
 */
test('a synthetic stale claim is detected as uncovered', () => {
  const rel = 'docs/audits/2026-10-19/lighthouse/zz-sweep-negative-control.md';
  const body = [
    '# Negative control',
    '',
    'The production site shows 100 across the four standard categories',
    'and every run scored 100 / 100 / 100 / 100 without exception.',
    '',
  ].join('\n');

  const caught = sweepControl(rel, body, sweep);

  assert.ok(
    caught.some((c) => c.form === 'prose'),
    'the prose form must be caught',
  );
  assert.ok(
    caught.some((c) => c.form === 'numeric'),
    'the numeric form must be caught',
  );
  // The injected text yields 1 numeric + 2 prose matches: the
  // "shows 100 across ..." phrase, and "scored 100 / 100 / ...".
  assert.equal(caught.length, 3);
  assert.equal(
    caught.filter((c) => c.form === 'numeric').length,
    1,
    'exactly one numeric claim in the injected control',
  );
});

/**
 * Negative control for the exemption mechanism itself.
 *
 * The exemption is an explicit in-document marker
 * (`<!-- sweep:quotation -->`) scoped to the paragraph that carries
 * it. Two properties must hold:
 *
 *   1. a claim in a marked paragraph is excused
 *   2. a claim in an UNMARKED paragraph, in the same file and in the
 *      same section, is still reported as uncovered
 *
 * Property 2 is the one that matters. If the exemption leaked beyond
 * the marked paragraph, it would silently excuse a genuine stale
 * claim — the exact failure the first version of this sweep had.
 */
test('the quotation annotation excuses only the paragraph that carries it', () => {
  const rel = 'docs/audits/2026-10-19/lighthouse/zz-sweep-quotation-scope.md';
  const body = [
    '# Quotation scope control',
    '',
    '<!-- sweep:quotation -->',
    'The production site shows 100 across the four standard categories.',
    '',
    'The production site also shows 100 across the four standard categories.',
    '',
  ].join('\n');

  const caught = sweepControl(rel, body, sweep);

  assert.equal(
    caught.length,
    1,
    'exactly the unmarked claim must be uncovered; the marked one must be exempt',
  );
  assert.ok(caught[0].text.includes('also shows 100 across the'));
});

/**
 * Negative control for the numeric form's own line-wrap blind spot.
 *
 * The numeric form is the ONLY form the round 6p sweep searched, so a
 * gap in it is the most consequential gap in this script. Its matcher
 * ran per-line while the prose matcher ran against the
 * whitespace-collapsed text — so the four-category string, hard-wrapped
 * across two lines, was invisible to the form that mattered most.
 *
 * This control was found by accident: a documentation edit re-wrapped
 * the string "100 / 100 / 100 / 100" across a line break, and the
 * sweep's claim count silently fell by one. The defect is now fixed
 * and pinned here.
 */
test('a numeric claim split across a line break is still detected', () => {
  const rel = 'docs/audits/2026-10-19/lighthouse/zz-sweep-numeric-wrap.md';
  const body = [
    '# Numeric wrap control',
    '',
    'The measured result was 100 / 100 / 100 /',
    '100 across the four standard categories.',
    '',
  ].join('\n');

  const caught = sweepControl(rel, body, sweep);

  assert.ok(
    caught.some((c) => c.form === 'numeric'),
    'the wrapped numeric claim must be caught, not skipped',
  );
});
