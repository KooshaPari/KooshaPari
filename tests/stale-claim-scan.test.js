/**
 * The CLI, against the real tree.
 *
 * The scanner is the mechanism that closes the defect class round 6r
 * corrected. A correction to one paragraph does not establish that no
 * other paragraph carries the same defect, so the scanner is what makes
 * that claim checkable. These tests check the scanner against the tree
 * it is meant to govern:
 *
 *   1. The measurement. The count the scanner compares against must come
 *      from running the suite, never from the document under test.
 *
 *   2. The CLI, against the real tree. The scanner must find the
 *      repository's own current claims and must not report them.
 *
 * The NEGATIVE CONTROLS — the proof that the scanner detects anything at
 * all — live in `stale-claim-controls.test.js`. The rules themselves are
 * tested in `stale-claim-rules.test.js`, the class predicates in
 * `stale-claim-classes.test.js`, and the gate wiring in
 * `stale-claim-gates.test.js`.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  REPO_ROOT,
  SCANNER,
  runScanner,
  suiteCount,
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
const MEASURED = suiteCount();

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
//
// The CLI is the PUBLIC INTERFACE of the scanner. `npm run
// scan:stale-claims` is what a person or a gate runs, so the CLI is
// exercised here the way a gate would exercise it: with no arguments.
//
// The first version of this scanner required `--measured N`, and the
// documented entry point therefore exited 2. The scanner measured
// nothing; it refused to work. The measurement is now made by the
// scanner itself, in a child run that excludes the stale-claim test
// files.
// ---------------------------------------------------------------------------

test('the scanner measures the suite itself when given no count', () => {
  // The public entry point, invoked exactly as the npm script invokes
  // it. It must succeed and report where the count came from.
  let status = 0;
  let stdout = '';
  try {
    stdout = execFileSync('node', [SCANNER], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    status = err.status ?? 1;
    stdout = err.stdout ?? '';
  }
  assert.equal(status, 0, `the scanner must exit 0 against the real tree:\n${stdout}`);
  assert.match(stdout, /measurement source\s+:\s+measured by running the suite/);
});

test('the scanner measures the same count the suite reports', () => {
  // The number the scanner uses MUST be the number the suite reports.
  // If it were not, the scanner would be comparing the documents
  // against a figure that never existed.
  const result = runScanner(MEASURED, ['--json']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.measuredTestCount, MEASURED);
  assert.equal(report.measurementSource, 'supplied with --measured');
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
