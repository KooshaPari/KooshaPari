/**
 * The NEGATIVE CONTROLS: the scanner must actually fail when a stale
 * claim is present.
 *
 * A scanner that reports nothing always passes the "is the tree clean?"
 * test, so that test alone proves nothing. The only evidence that the
 * scanner detects anything at all is a control in which a defect is
 * present and the scanner says so.
 *
 * Every control here plants a defect and requires the scanner to name
 * it. The controls are run against a TEMPORARY COPY of the tree, not
 * against the working tree. Planting a defect in `STATE.md` and
 * restoring it afterwards is a race: any other process reading the
 * file in that window sees the planted value, and a failure between
 * plant and restore leaves the tree dirty. The copy keeps the real
 * tree untouched.
 *
 * The controls run in BOTH directions. A scanner that reports
 * everything is as useless as one that reports nothing, so there is a
 * control here for a paragraph that is correct by construction and
 * must be accepted.
 *
 * The scanner's behaviour against the real tree, and the measurement it
 * compares against, are asserted in `stale-claim-scan.test.js`. The
 * rules are in `stale-claim-rules.test.js` and the class predicates in
 * `stale-claim-classes.test.js`.
 */

import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  ROUND_6R_CORRECTED,
  ROUND_6R_DEFECT,
  correctParagraph,
  runScannerInCopy,
  suiteCount,
} from './helpers/stale-claim-support.js';

const MEASURED = suiteCount();

/**
 * Replace a pattern in the copy's `STATE.md`.
 *
 * The replacement is asserted to have changed the file, so a plant
 * that silently does nothing fails loudly instead of passing as a
 * clean scan.
 *
 * @param {string} dir
 * @param {RegExp} pattern
 * @param {string} replacement
 * @returns {void}
 */
function plant(dir, pattern, replacement) {
  const path = join(dir, 'STATE.md');
  const original = readFileSync(path, 'utf8');
  const planted = original.replace(pattern, replacement);
  assert.notEqual(planted, original, 'the plant must change the file');
  writeFileSync(path, planted);
}

// ---------------------------------------------------------------------------
// 1. The count.
// ---------------------------------------------------------------------------

test('the scanner detects a planted stale current claim', () => {
  const result = runScannerInCopy(MEASURED, (dir) => {
    // Plant a stale CURRENT claim: the same sentence shape as the
    // real one, with a count that disagrees with the measured one and
    // no dated annotation.
    plant(dir, /Unit suite: \d+\/\d+ PASS, 0 fail/, 'Unit suite: 774/774 PASS, 0 fail');
  });

  assert.equal(result.status, 1, 'the scanner must exit 1 on a planted stale claim');
  const report = JSON.parse(result.stdout);
  const finding = report.findings.find((f) => f.file === 'STATE.md');
  assert.ok(finding, 'the finding must name STATE.md');
  assert.equal(finding.kind, 'A-count');
  assert.equal(finding.text, '774/774');
  assert.match(finding.note, /asserted as current but differs/);
});

test('the scanner does not flag a planted historical observation', () => {
  // The same count, but the clause that governs it says when it was
  // measured. It is a record, not a claim, and must survive.
  //
  // The marker has to govern THE FIGURE, not a neighbouring one.
  // The earlier form of this test planted
  //   "787/787 PASS, 0 fail (774/774 at round 6p, plus 13 new tests since)"
  // and asserted it was clean. It is not. "at round 6p" qualifies
  // the 774/774 that follows it, and the 787/787 in front of it is a
  // current claim that disagrees with the measurement -- the round
  // 6r defect, planted by the test that was meant to exclude it.
  // The clause boundary falls between the two figures, so each is
  // judged on its own.
  const result = runScannerInCopy(MEASURED, (dir) => {
    plant(
      dir,
      /Unit suite: \d+\/\d+ PASS, 0 fail/,
      'Unit suite: 787/787 PASS, 0 fail (measured at round 6q commit 492969c).',
    );
  });

  assert.equal(result.status, 0, 'a historical observation must not be flagged');
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.findings, []);
});

test('a marker that governs a neighbouring figure does not rescue this one', () => {
  // The inverse of the case above, and the shape the round 6r defect
  // actually took: a current figure followed by a dated one. The
  // dated figure is historical; the current one is not, and the
  // marker that makes the second historical must not silence the
  // first.
  const result = runScannerInCopy(MEASURED, (dir) => {
    plant(
      dir,
      /Unit suite: \d+\/\d+ PASS, 0 fail/,
      'Unit suite: 787/787 PASS, 0 fail (774/774 at round 6p, plus 13 new tests since).',
    );
  });

  assert.equal(result.status, 1, 'the stale current figure must be flagged');
  const report = JSON.parse(result.stdout);
  const finding = report.findings.find((f) => f.file === 'STATE.md' && f.kind === 'A-count');
  assert.ok(finding, 'the finding must name the current figure');
  assert.equal(finding.text, '787/787', 'the figure flagged must be the current one, not the dated one');
  assert.ok(
    !report.findings.some((f) => f.text === '774/774'),
    'the dated figure must not be flagged',
  );
});

// ---------------------------------------------------------------------------
// 2. The round list.
// ---------------------------------------------------------------------------

test('the scanner detects a planted nonexistent round entry', () => {
  const result = runScannerInCopy(MEASURED, (dir) => {
    // Plant a round that has no HUMAN_REVIEW.md entry into the
    // enumerated round list. The list wraps across two lines, so the
    // plant replaces the whole wrapped list with a single line.
    plant(
      dir,
      /the complete round-6 audit trail \([^)]*\)/,
      'the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g, 6i, 6j, 6k, 6l, 6m, 6n, 6o, 6p, 6q, 6zz)',
    );
  });

  assert.equal(result.status, 1, 'the scanner must exit 1 on a nonexistent round entry');
  const report = JSON.parse(result.stdout);
  const finding = report.findings.find((f) => f.kind === 'B-round');
  assert.ok(finding, 'the finding must be a B-round finding');
  assert.equal(finding.text, '6zz');
  assert.equal(finding.file, 'STATE.md');
});

test('the scanner detects a planted incomplete round list', () => {
  // Class C. The list claims to be complete and omits a round that
  // has an entry. The list is planted with 6zz in it as well, so the
  // test proves the omitted round is reported separately from the
  // phantom one.
  const result = runScannerInCopy(MEASURED, (dir) => {
    plant(
      dir,
      /the complete round-6 audit trail \([^)]*\)/,
      'the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g, 6i, 6j, 6k, 6l, 6m, 6n, 6o, 6p, 6q)',
    );
  });

  assert.equal(result.status, 1, 'the scanner must exit 1 on an incomplete round list');
  const report = JSON.parse(result.stdout);
  const missing = report.findings.find((f) => f.kind === 'C-missing');
  assert.ok(missing, 'the finding must be a C-missing finding');
  assert.equal(missing.file, 'STATE.md');
});

// ---------------------------------------------------------------------------
// 3. The paragraph, verbatim.
// ---------------------------------------------------------------------------

test('the scanner detects the verbatim round 6r defective paragraph', () => {
  // The strongest control: the exact text that sat in STATE.md before
  // commit 4222594 corrected it. The scanner must report BOTH classes
  // of the defect — the stale count AND the two rounds that never had
  // an entry.
  const result = runScannerInCopy(MEASURED, (dir) => {
    plant(dir, /The post-20th-pass arc is closed:[^]*?entries\./, ROUND_6R_DEFECT);
  });

  assert.equal(result.status, 1, 'the scanner must exit 1 on the verbatim defect');
  const report = JSON.parse(result.stdout);

  const count = report.findings.find((f) => f.kind === 'A-count' && f.file === 'STATE.md');
  assert.ok(count, 'the stale count must be reported');
  assert.equal(count.text, '774/774');
  assert.match(count.note, /asserted as current but differs/);

  for (const phantom of ['6h', '6i-correction']) {
    const round = report.findings.find(
      (f) => f.kind === 'B-round' && f.text === phantom && f.file === 'STATE.md',
    );
    assert.ok(round, `the phantom round ${phantom} must be reported`);
    assert.match(round.note, /no such entry exists/);
  }
});

test('the scanner accepts a paragraph that is correct by construction', () => {
  // The control in the other direction. A scanner that reports
  // everything is as useless as one that reports nothing, so there must
  // be a paragraph it accepts.
  //
  // The paragraph is BUILT from the tree: it states the measured count
  // and lists every round that currently has an entry. A paragraph
  // copied from an earlier round would itself be stale, and a control
  // that is stale tests nothing.
  const correct = correctParagraph(MEASURED);
  const result = runScannerInCopy(MEASURED, (dir) => {
    plant(dir, /The post-20th-pass arc is closed:[^]*?entries\./, correct);
  });

  assert.equal(result.status, 0, 'a correct paragraph must not be flagged');
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.findings, []);
});

test('the scanner rejects the round 6r paragraph even where it was once correct', () => {
  // The paragraph round 6r corrected the defect to was CORRECT when it
  // was written: the suite measured 787, and the rounds it named were
  // the rounds that had entries.
  //
  // It is not correct now, and that is the point. Round 6r added its own
  // entry, so the list omits a round that has one, and the count is no
  // longer the measured count. A control that hard-codes the list of
  // rounds would have to be rewritten every time a round is added, and
  // the rewrite would be exactly the kind of hand-maintained copy that
  // the round 6r defect was.
  const result = runScannerInCopy(MEASURED, (dir) => {
    plant(dir, /The post-20th-pass arc is closed:[^]*?entries\./, ROUND_6R_CORRECTED);
  });

  assert.equal(result.status, 1, 'the once-correct paragraph is stale now');
  const report = JSON.parse(result.stdout);

  const count = report.findings.find((f) => f.kind === 'A-count' && f.file === 'STATE.md');
  assert.ok(count, 'the stale count must be reported');
  assert.equal(count.text, '787/787');

  const missing = report.findings.find((f) => f.kind === 'C-missing' && f.file === 'STATE.md');
  assert.ok(missing, 'the omitted rounds must be reported');
});

// ---------------------------------------------------------------------------
// 4. The copy is a faithful stand-in.
// ---------------------------------------------------------------------------

test('the scanner reports the same findings on a copy as on the real tree', () => {
  // The copy must be a faithful stand-in. If the scanner's verdict
  // changed because of the copy, every other control here would be
  // measuring the copy rather than the tool.
  const result = runScannerInCopy(MEASURED, () => {});
  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.findings, []);
  assert.equal(report.measuredTestCount, MEASURED);
  assert.ok(report.checksRun > 0);
});
