/**
 * The GATES: the scanner must be reachable from the places that run
 * automatically.
 *
 * "Durable tooling" is a claim about what happens AFTER this round
 * ends. A scanner that nothing runs is a script, not a gate: it will
 * drift out of date the same way the documents did, because nothing
 * checks it. The round 6s close was reviewed against this and the
 * scanner was found wired into neither the pre-commit hook nor CI.
 *
 * These tests assert the WIRING, not the scanner's behaviour. The
 * behaviour is asserted in `stale-claim-scan.test.js`; what is
 * asserted here is that the scanner is reachable from the two places
 * that run automatically, and that its public entry point works
 * without arguments.
 *
 * The entry-point test EXECUTES the scanner with no arguments and
 * requires exit 0. A string-matching test on the npm script would
 * pass even if the script exited 2 when run, which is exactly what the
 * first version of the scanner did: it required `--measured N` and
 * exited 2 without it. The command in the round's own documentation
 * therefore failed every time it was invoked the way a gate invokes a
 * command. Only running it proves the entry point exists.
 *
 * The gate is also exercised in its FAILING direction. A gate that has
 * only ever been observed to pass proves nothing about whether it
 * blocks. The negative control plants a stale claim in a COPY of the
 * tree and requires the scanner to exit non-zero and report it.
 */

import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  REPO_ROOT,
  runScannerInCopy,
  runScannerRaw,
} from './helpers/stale-claim-support.js';

// ---------------------------------------------------------------------------
// The wiring.
// ---------------------------------------------------------------------------

// 3. The gates.
//
// "Durable tooling" is a claim about what happens AFTER this round
// ends. A scanner that nothing runs is a script, not a gate: it will
// drift out of date the same way the documents did, because nothing
// checks it.
//
// These tests assert the WIRING, not the scanner's behaviour. The
// behaviour is asserted above; what is asserted here is that the
// scanner is reachable from the two places that run automatically.
// ---------------------------------------------------------------------------

test('the pre-commit hook runs the scanner when Markdown is staged', () => {
  const hook = readFileSync(join(REPO_ROOT, 'scripts', 'git-hooks', 'pre-commit'), 'utf8');
  assert.match(
    hook,
    /scan-stale-claims\.js/,
    'the pre-commit hook must invoke the stale-claim scanner',
  );
  assert.match(
    hook,
    /\*\.md\)\s+SCAN_MARKDOWN=1/,
    'the hook must trigger the scanner on staged Markdown',
  );
});

test('the CI workflow runs the scanner', () => {
  const ci = readFileSync(join(REPO_ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');
  assert.match(
    ci,
    /scan-stale-claims\.js/,
    'the CI workflow must invoke the stale-claim scanner',
  );
});

test('the scanner is reachable as a named npm script', () => {
  // The npm script is the entry point a person types. It must exist and
  // it must not require arguments, because an entry point that exits 2
  // when invoked the obvious way is not an entry point.
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.scripts['scan:stale-claims'], 'the npm script must exist');
  assert.match(
    pkg.scripts['scan:stale-claims'],
    /scan-stale-claims\.js$/,
    'the npm script must invoke the scanner',
  );
  assert.doesNotMatch(
    pkg.scripts['scan:stale-claims'],
    /--measured/,
    'the npm script must not require a count the caller would have to measure',
  );
});

// ---------------------------------------------------------------------------
// The entry point, EXECUTED.
//
// The tests above assert that the wiring strings exist. A string can
// exist while the thing it names does not work. These run the commands.
// ---------------------------------------------------------------------------

test('the documented entry point runs with no arguments and exits 0', () => {
  // This is the command the round's own documentation names. It is the
  // command a gate invokes. It must work with no arguments.
  //
  // The first version of the scanner required `--measured N` and
  // exited 2 without it. Every test above would have passed against
  // that version, because the npm script did not contain `--measured`
  // and the hook did contain the scanner's name. Only running it
  // catches that.
  const result = runScannerRaw([]);
  assert.equal(
    result.status,
    0,
    `the scanner must exit 0 against the real tree; stderr was: ${result.stderr}`,
  );
  assert.match(
    result.stdout,
    /measurement source\s*:\s*measured by running the suite/,
    'with no arguments the scanner must MEASURE the suite, not assume a count',
  );
});

test('the entry point rejects a count that is not a number', () => {
  // A count that cannot be parsed must be refused, not silently
  // ignored. If it were ignored, a caller could pass garbage and get
  // a clean report that examined nothing.
  const result = runScannerRaw(['--measured', 'not-a-number']);
  assert.notEqual(result.status, 0, 'a non-numeric count must not be accepted');
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /measured/i,
    'the refusal must name the offending argument',
  );
});

test('the gate BLOCKS a planted stale claim rather than only passing', () => {
  // A gate observed only in its passing direction proves nothing. This
  // plants a stale current count in a copy of the tree and requires
  // the scanner to fail and to name the file and the figure.
  const result = runScannerInCopy(842, (dir) => {
    const state = join(dir, 'STATE.md');
    const text = readFileSync(state, 'utf8').replace(
      /Unit suite:\s*\d+\/\d+\s+PASS/,
      'Unit suite: 777/777 PASS',
    );
    writeFileSync(state, text);
  });
  assert.notEqual(result.status, 0, 'the scanner must fail on a planted stale claim');
  const report = JSON.parse(result.stdout);
  assert.ok(report.findings.length > 0, 'the scanner must report the planted claim');
  const finding = report.findings.find((f) => f.file === 'STATE.md');
  assert.ok(finding, 'the finding must name the file it was found in');
  assert.equal(finding.kind, 'A-count');
  assert.match(
    finding.text,
    /777\/777/,
    'the finding must name the figure that disagrees with the measurement',
  );
});
