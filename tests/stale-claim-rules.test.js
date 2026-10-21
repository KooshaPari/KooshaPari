/**
 * The rules, as pure functions.
 *
 * Each rule is exercised against a synthetic line that is known to be one
 * thing or the other. Nothing here touches the tree: the tree's own
 * documents are checked by `stale-claim-scan.test.js`, and the class
 * predicates by `stale-claim-classes.test.js`.
 *
 * The subject of these tests is the DECISION, not the document. A rule
 * that can be satisfied by a broken scanner is not a rule, so each
 * fixture here is written so that exactly one rule can fire.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  classifyCount,
  fencedLineSet,
  regionsOf,
  roundEntryRanges,
  testCountFigures,
} from '../scripts/stale-claim-rules.js';

import {
  ROUND_6R_CORRECTED,
  ROUND_6R_DEFECT,
} from './helpers/stale-claim-support.js';

/**
 * Classify a single figure in a synthetic document.
 *
 * @param {string[]} lines
 * @param {number} measured
 * @param {number} i        the line index of the figure
 * @param {string} file
 * @returns {{current: boolean, reason: string}}
 */
function classifyIn(lines, measured, i, file = 'DOC.md') {
  const figures = testCountFigures(lines, i, measured);
  assert.ok(figures.length, `expected a test-count figure on line ${i + 1}`);
  return classifyCount({
    file,
    measured,
    lines,
    i,
    figure: figures[0],
    allFigures: figures,
    regions: regionsOf(file, lines),
  });
}

test('the round 6r defect is rejected', () => {
  const lines = ROUND_6R_DEFECT.split('\n');
  const figures = testCountFigures(lines, 3, 787);
  assert.equal(figures.length, 1, 'the defective paragraph holds one figure');
  assert.equal(figures[0].text, '774/774');

  const verdict = classifyCount({
    file: 'STATE.md',
    measured: 787,
    lines,
    i: 3,
    figure: figures[0],
    allFigures: figures,
    regions: regionsOf('STATE.md', lines),
  });

  assert.equal(
    verdict.current,
    false,
    'the round 6r defect must be reported as a current claim that disagrees with the measurement',
  );
});

test('the once-correct round 6r paragraph is now a defect', () => {
  // The paragraph round 6r corrected the defect to was correct when it
  // was written. It is not correct now: the count has moved and the
  // list omits rounds that have since gained entries. It is held here
  // as a NEGATIVE control, and the count figure in it is what the
  // rules must reject.
  const lines = ROUND_6R_CORRECTED.split('\n');
  const figures = testCountFigures(lines, 3, 787);
  assert.equal(figures.length, 1, 'the paragraph holds one figure');
  assert.equal(figures[0].text, '787/787');

  const verdict = classifyCount({
    file: 'STATE.md',
    measured: 837,
    lines,
    i: 3,
    figure: figures[0],
    allFigures: figures,
    regions: regionsOf('STATE.md', lines),
  });

  assert.equal(
    verdict.current,
    false,
    'a count of 787 is not current when the suite measures 837',
  );
});

test('a figure that matches the measured count is current', () => {
  const lines = ['The unit suite is 787/787 PASS, 0 fail.'];
  const verdict = classifyIn(lines, 787, 0);
  assert.equal(verdict.current, true);
  assert.match(verdict.reason, /matches the measured count/);
});

test('a figure that differs from the measured count and carries no annotation is stale', () => {
  const lines = ['The unit suite is 774/774 PASS, 0 fail.'];
  const verdict = classifyIn(lines, 787, 0);
  assert.equal(verdict.current, false);
  assert.match(verdict.reason, /asserted as current but differs/);
});

test('a figure qualified by a round in the same clause is historical', () => {
  const lines = ['- Unit suite: 787/787 PASS, 0 fail (774/774 at round 6p,', '  plus 13 new tests added since).'];
  const verdict = classifyIn(lines, 787, 0);
  // The FIRST figure on the line is the measured one. The second is
  // the historical one.
  const figures = testCountFigures(lines, 0, 787);
  const second = figures[1];
  assert.ok(second, 'expected two figures on the line');
  const verdict2 = classifyCount({
    file: 'DOC.md',
    measured: 787,
    lines,
    i: 0,
    figure: second,
    allFigures: figures,
    regions: regionsOf('DOC.md', lines),
  });
  assert.equal(verdict2.current, true);
  assert.match(verdict2.reason, /names the round, commit, or date/);
});

test('a figure qualified by a commit in the same clause is historical', () => {
  // The shape of HUMAN_REVIEW.md:440: "The 714/714 was 711/711
  // across 72 files at `02962d5`".
  //
  // The fixture deliberately carries NO archival phrase. An archival
  // phrase would be caught by an earlier rule, and the test would
  // pass without ever reaching the same-clause marker rule. This
  // fixture isolates that one rule: the commit is what qualifies the
  // figure, and nothing else does.
  const lines = [
    'The unit test suite was 711/711 across 72 test files at `02962d5`.',
  ];
  const verdict = classifyIn(lines, 787, 0);
  assert.equal(verdict.current, true);
  assert.match(verdict.reason, /names the round, commit, or date/);
});

test('an archival phrase marks a figure as historical', () => {
  // The shape of HUMAN_REVIEW.md:178. The phrase "carried forward
  // ... unchanged" is the repository's own signal that the count was
  // NOT re-measured. The figure is on the SECOND line, because the
  // Markdown wraps there.
  const lines = [
    'the unit count below is carried forward from `6f9478f` unchanged',
    'at 714/714 across 73 test files.',
  ];
  const verdict = classifyIn(lines, 787, 1);
  assert.equal(verdict.current, true);
  assert.match(verdict.reason, /marks it as a past observation/);
});

test('a marker in a different clause does not rescue a current claim', () => {
  // This is the shape of the round 6r defect. The marker names the
  // COMMIT RANGE, not the test count, and it sits in another clause
  // 73 characters away. A rule that accepted it would have missed
  // the exact defect round 6r fixed.
  const lines = [
    'The post-20th-pass arc is closed: 13 commits pushed to',
    '`origin/main` (c1a13de through the round 6m close),',
    'all 5 items in the 06 doc are CLOSED/DECIDED, the unit',
    'suite is 774/774 PASS, and `HUMAN_REVIEW.md` carries',
    'the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,',
    '6h, 6i, 6i-correction, 6j, 6k, 6l, 6m).',
  ];
  const verdict = classifyIn(lines, 787, 3);
  assert.equal(verdict.current, false);
  assert.match(verdict.reason, /asserted as current but differs/);
});

test('a figure inside a fenced code block is skipped by the scanner', () => {
  // The contract is split in two, deliberately.
  //
  // `testCountFigures` does NOT know about fences. It answers "is
  // this line a test-count line?", and a figure inside a fence can
  // be a test-count line.
  //
  // The fence is the SCANNER's concern: it computes the set of fenced
  // lines and skips them. `fencedLineSet` is what marks them.
  const lines = ['```text', 'unit suite 774/774 pass', '```'];
  const fenced = fencedLineSet(lines);
  assert.equal(fenced.has(0), true, 'the opening fence is fenced');
  assert.equal(fenced.has(1), true, 'the body of the fence is fenced');
  assert.equal(fenced.has(2), true, 'the closing fence is fenced');

  // The figure is found by the rule, and excluded by the fence set.
  assert.equal(testCountFigures(lines, 1, 787).length, 1);
  assert.equal(fenced.has(1), true);
});

test('a byte count is not a test-count candidate', () => {
  // "14377/4771/10110/12341 B" must not be read as a test count.
  const lines = ['4 .md files, 14377/4771/10110/12341 B read.'];
  assert.deepEqual(testCountFigures(lines, 0, 787), []);
});

test('a figure is not a candidate without test-count words nearby', () => {
  const lines = ['The bundle is 14377/4771 bytes.'];
  assert.deepEqual(testCountFigures(lines, 0, 787), []);
});

test('every figure on a line is returned, not just the first', () => {
  const lines = ['714/714 and 711/711 and 787/787 all reported by the unit suite.'];
  const figures = testCountFigures(lines, 0, 787);
  assert.equal(figures.length, 3);
  assert.deepEqual(figures.map((f) => f.text), ['714/714', '711/711', '787/787']);
});

test('HUMAN_REVIEW.md round entries are historical regions', () => {
  const lines = [
    '# Human review',
    '',
    'Preamble that is current.',
    '',
    '> **Round 6q (2026-10-20): a round.**',
    '> The unit suite is 714/714 pass.',
    '',
    '> **Round 6r (2026-10-21): another round.**',
    '> The unit suite is 787/787 pass.',
    '',
  ];
  const regions = regionsOf('HUMAN_REVIEW.md', lines);
  const round6q = regions.find((r) => r.reason.includes('6q'));
  assert.ok(round6q, 'expected a historical region for round 6q');
  assert.equal(round6q.historical, true);

  const entries = roundEntryRanges(lines);
  assert.deepEqual(entries.map((e) => e.round), ['6q', '6r']);
});

test('a dated session file is entirely historical', () => {
  const lines = ['# Session', '', 'The unit suite is 714/714 pass.'];
  const regions = regionsOf('docs/sessions/2026-10-15-example/00_OVERVIEW.md', lines);
  assert.equal(regions[0].historical, true);
});

test('a dated deploy record is entirely historical', () => {
  const lines = ['# Deploy', '', 'The unit suite is 774/774 pass.'];
  const regions = regionsOf('docs/deploy/2026-10-19.md', lines);
  assert.equal(regions[0].historical, true);
});
