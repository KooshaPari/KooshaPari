/**
 * The CLI, against the real tree, and the negative control.
 *
 * The scanner is the mechanism that closes the defect class round 6r
 * corrected. A correction to one paragraph does not establish that no
 * other paragraph carries the same defect, so the scanner is what makes
 * that claim checkable. These tests therefore check two things:
 *
 *   1. The CLI, against the real tree. The scanner must find the
 *      repository's own current claims and must not report them.
 *
 *   2. The NEGATIVE CONTROL. The scanner must actually fail when a
 *      stale claim is present. A scanner that reports nothing always
 *      passes the first kind of test, so this one is the only evidence
 *      that the scanner detects anything at all.
 *
 * The negative control is run against a TEMPORARY COPY of the tree, not
 * against the working tree. Planting a defect in `STATE.md` and
 * restoring it afterwards is a race: any other process reading the file
 * in that window sees the planted value, and a failure between plant and
 * restore leaves the tree dirty. The copy keeps the real tree untouched.
 *
 * The rules themselves are tested in `stale-claim-rules.test.js` and the
 * class predicates in `stale-claim-classes.test.js`.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  REPO_ROOT,
  ROUND_6R_CORRECTED,
  ROUND_6R_DEFECT,
  SCANNER,
  correctParagraph,
  measureSuite,
  runScanner,
  runScannerInCopy,
} from './helpers/stale-claim-support.js';

/**
 * The measured count, MEASURED BY MEASURING.
 *
 * This is the count the scanner is given, and it comes from an actual
 * run of the suite. It does NOT come from `STATE.md`.
 *
 * WHY NOT. The first version of this file read the count out of
 * `STATE.md` and then compared `STATE.md` against it. That is
 * circular: the two numbers are the same number by construction, so
 * the check can never fail, no matter how far the document has drifted.
 * It reported 787/787 while the suite actually held 832 tests, and the
 * test that was supposed to prove the tree was clean proved only that
 * the document agreed with itself.
 *
 * The round 6r defect is a stale count in a prose document. A check
 * that reads its expected value from the document under test cannot
 * detect it. The expected value has to come from somewhere else.
 *
 * HOW IT IS MEASURED. The suite is run once, in a child process, and
 * its own summary block is parsed. The count is therefore the count
 * the test runner itself reports, not a number this file guessed.
 *
 * The suite is run ONCE and the result is shared by every test in this
 * file, because running it per-test would make the file quadratic in
 * the size of the suite.
 *
 * The measured run excludes this file, for the reason given in
 * `measureSuite`. It also excludes the other stale-claim test files:
 * they are part of the suite, and they are counted from their own
 * source, so the number the scanner is given is the number the suite
 * would report.
 */
const MEASURED = measureSuite([
  'tests/stale-claim-scan.test.js',
  'tests/stale-claim-rules.test.js',
  'tests/stale-claim-classes.test.js',
]);

/**
 * The count `STATE.md` CLAIMS.
 *
 * This is the value under test. It is read from the document, and it
 * is compared against `MEASURED` — which was measured independently.
 * A difference between the two is the defect the scanner exists to
 * find, and it is asserted directly, without the scanner.
 *
 * @returns {number}
 */
function readClaimedFromState() {
  const state = readFileSync(join(REPO_ROOT, 'STATE.md'), 'utf8');
  const m = /Unit suite:\s*(\d+)\/\1\s+PASS/.exec(state);
  assert.ok(m, 'STATE.md must state a unit-suite count of the form "Unit suite: N/N PASS"');
  return Number(m[1]);
}

// ---------------------------------------------------------------------------
// 0. The measurement itself.
//
// These two tests are the foundation everything else rests on. They
// are placed first because a failure in either of them invalidates
// every other result in this file.
// ---------------------------------------------------------------------------

test('the suite count is measured, not assumed', () => {
  // The count this file uses came from running the suite. If the
  // measurement silently returned a wrong number, every downstream
  // check would be checking against the wrong thing, so the count is
  // asserted to be a plausible positive integer.
  assert.ok(Number.isInteger(MEASURED), 'the measured count must be an integer');
  assert.ok(MEASURED > 0, 'the measured count must be positive');
});

test('STATE.md claims the measured count', () => {
  // THE central assertion of round 6s.
  //
  // The document's claim and the measurement are two independent
  // facts. If they differ, the document is stale, and that is the
  // round 6r defect.
  //
  // This assertion is made WITHOUT the scanner, so it cannot be
  // satisfied by a scanner that is itself broken, and it cannot be
  // satisfied by a document that agrees with a stale copy of itself.
  const claimed = readClaimedFromState();
  assert.equal(
    claimed,
    MEASURED,
    `STATE.md claims ${claimed}/${claimed} but the suite holds ${MEASURED} tests`,
  );
});

// ---------------------------------------------------------------------------
// 1. The CLI, against the real tree.
// ---------------------------------------------------------------------------

test('the scanner refuses to run without a measured count', () => {
  let status = 0;
  try {
    execFileSync('node', [SCANNER], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    status = err.status ?? 1;
    assert.match(err.stderr ?? '', /--measured <N> is required/);
  }
  assert.equal(status, 2, 'the scanner must exit 2 when --measured is absent');
});

test('the scanner refuses a non-numeric measured count', () => {
  let status = 0;
  try {
    execFileSync('node', [SCANNER, '--measured', 'abc'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    status = err.status ?? 1;
  }
  assert.equal(status, 2, 'the scanner must exit 2 when --measured is not a number');
});

test('the scanner reports no finding against the real tree', () => {
  const result = runScanner(MEASURED);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /No sibling instance of the round 6r defect class was found/);
});

test('the scanner reports the measured count and the round entries it found', () => {
  const result = runScanner(MEASURED, ['--json']);
  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.measuredTestCount, MEASURED);
  assert.ok(report.humanReviewRoundEntries.length >= 15, 'expected at least 15 round entries');
  assert.ok(report.checksRun > 0, 'expected the scanner to run checks');
  assert.deepEqual(report.findings, []);
});

test('a measured count that does not match the tree produces findings', () => {
  // 12345 is a count that no figure in the tree can match. Every
  // current claim then disagrees with it, and the scanner must say so.
  const result = runScanner(12345, ['--json']);
  assert.equal(result.status, 1, 'the scanner must exit 1 when it finds a sibling instance');
  const report = JSON.parse(result.stdout);
  assert.ok(report.findings.length > 0, 'expected at least one finding');
  // The findings must name real files and real lines.
  for (const finding of report.findings) {
    assert.ok(finding.file, 'a finding must name a file');
    assert.ok(finding.line > 0, 'a finding must name a line');
    assert.ok(finding.note.length > 0, 'a finding must carry a reason');
  }
});

// ---------------------------------------------------------------------------
// 2. The negative control.
// ---------------------------------------------------------------------------

test('the scanner detects a planted stale current claim', () => {
  const result = runScannerInCopy(MEASURED, (dir) => {
    const path = join(dir, 'STATE.md');
    const original = readFileSync(path, 'utf8');
    // Plant a stale CURRENT claim: the same sentence shape as the
    // real one, with a count that disagrees with the measured one and
    // no dated annotation.
    const planted = original.replace(
      /Unit suite: \d+\/\d+ PASS, 0 fail/,
      'Unit suite: 774/774 PASS, 0 fail',
    );
    assert.notEqual(planted, original, 'the plant must change the file');
    assert.match(planted, /Unit suite: 774\/774 PASS, 0 fail/);
    writeFileSync(path, planted);
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
    const path = join(dir, 'STATE.md');
    const original = readFileSync(path, 'utf8');
    const planted = original.replace(
      /Unit suite: \d+\/\d+ PASS, 0 fail/,
      'Unit suite: 787/787 PASS, 0 fail (measured at round 6q commit 492969c).',
    );
    assert.notEqual(planted, original, 'the plant must change the file');
    assert.match(planted, /measured at round 6q commit 492969c/);
    writeFileSync(path, planted);
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
    const path = join(dir, 'STATE.md');
    const original = readFileSync(path, 'utf8');
    const planted = original.replace(
      /Unit suite: \d+\/\d+ PASS, 0 fail/,
      'Unit suite: 787/787 PASS, 0 fail (774/774 at round 6p, plus 13 new tests since).',
    );
    assert.notEqual(planted, original, 'the plant must change the file');
    writeFileSync(path, planted);
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

test('the scanner detects a planted nonexistent round entry', () => {
  const result = runScannerInCopy(MEASURED, (dir) => {
    const path = join(dir, 'STATE.md');
    const original = readFileSync(path, 'utf8');
    // Plant a round that has no HUMAN_REVIEW.md entry into the
    // enumerated round list. The list wraps across two lines, so the
    // plant replaces the whole wrapped list with a single line.
    const planted = original.replace(
      /the complete round-6 audit trail \([^)]*\)/,
      'the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g, 6i, 6j, 6k, 6l, 6m, 6n, 6o, 6p, 6q, 6zz)',
    );
    assert.notEqual(planted, original, 'the plant must change the file');
    assert.match(planted, /6zz\)/);
    writeFileSync(path, planted);
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
    const path = join(dir, 'STATE.md');
    const original = readFileSync(path, 'utf8');
    const planted = original.replace(
      /the complete round-6 audit trail \([^)]*\)/,
      'the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g, 6i, 6j, 6k, 6l, 6m, 6n, 6o, 6p, 6q)',
    );
    assert.notEqual(planted, original, 'the plant must change the file');
    writeFileSync(path, planted);
  });

  assert.equal(result.status, 1, 'the scanner must exit 1 on an incomplete round list');
  const report = JSON.parse(result.stdout);
  const missing = report.findings.find((f) => f.kind === 'C-missing');
  assert.ok(missing, 'the finding must be a C-missing finding');
  assert.equal(missing.file, 'STATE.md');
});

test('the scanner detects the verbatim round 6r defective paragraph', () => {
  // The strongest control: the exact text that sat in STATE.md before
  // commit 4222594 corrected it. The scanner must report BOTH classes
  // of the defect — the stale count AND the two rounds that never had
  // an entry.
  const result = runScannerInCopy(MEASURED, (dir) => {
    const path = join(dir, 'STATE.md');
    const original = readFileSync(path, 'utf8');
    const planted = original.replace(
      /The post-20th-pass arc is closed:[^]*?entries\./,
      ROUND_6R_DEFECT,
    );
    assert.notEqual(planted, original, 'the plant must change the file');
    assert.match(planted, /774\/774 PASS/);
    writeFileSync(path, planted);
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
    const path = join(dir, 'STATE.md');
    const original = readFileSync(path, 'utf8');
    const planted = original.replace(
      /The post-20th-pass arc is closed:[^]*?entries\./,
      correct,
    );
    assert.notEqual(planted, original, 'the plant must change the file');
    writeFileSync(path, planted);
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
    const path = join(dir, 'STATE.md');
    const original = readFileSync(path, 'utf8');
    const planted = original.replace(
      /The post-20th-pass arc is closed:[^]*?entries\./,
      ROUND_6R_CORRECTED,
    );
    assert.notEqual(planted, original, 'the plant must change the file');
    writeFileSync(path, planted);
  });

  assert.equal(result.status, 1, 'the once-correct paragraph is stale now');
  const report = JSON.parse(result.stdout);

  const count = report.findings.find((f) => f.kind === 'A-count' && f.file === 'STATE.md');
  assert.ok(count, 'the stale count must be reported');
  assert.equal(count.text, '787/787');

  const missing = report.findings.find((f) => f.kind === 'C-missing' && f.file === 'STATE.md');
  assert.ok(missing, 'the omitted rounds must be reported');
});

test('the scanner reports the same findings on a copy as on the real tree', () => {
  // The copy must be a faithful stand-in. If the scanner's verdict
  // changed because of the copy, every other test here would be
  // measuring the copy rather than the tool.
  const result = runScannerInCopy(MEASURED, () => {});
  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.findings, []);
  assert.equal(report.measuredTestCount, MEASURED);
  assert.ok(report.checksRun > 0);
});
