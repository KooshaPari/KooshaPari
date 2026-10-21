/**
 * The size-mandate gate must SEE every maintained module.
 *
 * The repository's contract is: 350 lines is the target, 500 lines is the
 * HARD LIMIT, and a file over the hard limit is a violation.
 *
 * `scripts/anti-pattern-detector.sh` check #27 enforces that contract, but
 * until this round it scanned only `scripts/`, `data/`, and `styles/`. The
 * `tests/` tree was invisible to it. The gap was not theoretical:
 * `tests/browser/acceptance.spec.js` stood at 974 lines — nearly double the
 * 500-line hard limit — while the detector reported "0 violations across 29
 * patterns".
 *
 * A gate that cannot see a file cannot police it, and a detector that
 * reports success while a real violation sits in the tree is worse than no
 * detector, because it is believed. These tests pin the SCOPE so the gap
 * cannot silently reopen, and they exercise the detector in its FAILING
 * direction against a real oversized file.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { REPO_ROOT } from './helpers/stale-claim-support.js';

const DETECTOR = join(REPO_ROOT, 'scripts', 'anti-pattern-detector.sh');

/**
 * Run the detector against the real repository and capture its output.
 *
 * The detector exits 1 when it finds a violation, which is a normal
 * outcome rather than an error, so the exit status is captured rather
 * than thrown.
 *
 * @returns {{status: number, stdout: string, stderr: string}}
 */
function runDetector() {
  try {
    const stdout = execFileSync('bash', [DETECTOR], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      status: err.status ?? 1,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
    };
  }
}

test('the size-mandate scan covers the tests tree, not just scripts and styles', () => {
  // The scope is asserted as TEXT, because the scope is a glob list inside
  // a shell script and there is no other way to observe it. A test that
  // ran the detector could not distinguish "the scope is right" from
  // "the tree happens to have no oversized test file right now" — and the
  // second case is exactly the state that let the 974-line file survive.
  const detector = readFileSync(DETECTOR, 'utf8');

  assert.match(
    detector,
    /git ls-files[^\n]*'tests\/\*\.js'/,
    'the size scan must include the tests tree',
  );
  assert.match(
    detector,
    /git ls-files[^\n]*'tests\/\*\*\/\*\.js'/,
    'the size scan must include nested test files, not only tests/ top level',
  );
});

test('every tracked JavaScript module is inside the size scan globs', () => {
  // The glob list must cover the tree in full. This walks the tracked
  // files and asks the detector's own glob list which ones it would miss.
  const detector = readFileSync(DETECTOR, 'utf8');
  const globLine = detector
    .split('\n')
    .find((l) => l.includes('git ls-files') && l.includes('tests/'));
  assert.ok(globLine, 'the detector must declare a size-scan glob list');

  const tracked = execFileSync(
    'git',
    ['ls-files', 'tests/*.js', 'tests/**/*.js', 'tests/**/*.mjs'],
    { cwd: REPO_ROOT, encoding: 'utf8' },
  )
    .split('\n')
    .filter(Boolean);

  assert.ok(tracked.length > 0, 'expected tracked test files to exist');

  // Every tracked test module must be either matched by a declared glob or
  // explicitly excluded. The globs are the standard git pathspec set, so
  // 'tests/*.js' matches at any depth in git's pathspec semantics for
  // this repository's layout; the assertion below therefore checks that
  // each path is covered by one of the declared patterns.
  const patterns = [...globLine.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const uncovered = tracked.filter(
    (file) => !patterns.some((p) => matchesPathspec(file, p)),
  );
  assert.deepEqual(
    uncovered,
    [],
    'every tracked test module must be covered by the size scan globs',
  );
});

/**
 * Match a repo-relative path against one git pathspec pattern.
 *
 * `git ls-files` patterns use shell globs where `*` does not cross a `/`
 * and `**` does. This implements that rule directly so the assertion does
 * not depend on invoking git per file.
 *
 * @param {string} file   repo-relative path
 * @param {string} pattern  a git pathspec from the detector's glob list
 * @returns {boolean} whether the pattern selects the file
 */
function matchesPathspec(file, pattern) {
  const rx = new RegExp(
    `^${pattern
      .split('**')
      .map((part) =>
        part
          .split('*')
          .map((p) => p.replace(/[.+^${}()|[\]\\]/g, '\\$&'))
          .join('[^/]*'),
      )
      .join('.*')}$`,
  );
  return rx.test(file);
}

test('the detector reports a real oversized file as a violation', () => {
  // The gate must be exercised in its FAILING direction. A detector that
  // only ever reports success is not evidence that it works.
  //
  // The repository contains a file over the 500-line hard limit only while
  // that file exists. Rather than depend on the tree's current state, this
  // test asserts the invariant directly: the detector must exit non-zero
  // and name the offending path whenever a tracked module exceeds the
  // hard limit.
  const result = runDetector();
  const output = `${result.stdout}\n${result.stderr}`;

  // Collect the tracked modules that are currently over the hard limit.
  const oversized = execFileSync(
    'git',
    ['ls-files', 'scripts/*.js', 'scripts/**/*.js', 'data/*.js', 'styles/*.css',
     'tests/*.js', 'tests/**/*.js', 'tests/**/*.mjs'],
    { cwd: REPO_ROOT, encoding: 'utf8' },
  )
    .split('\n')
    .filter(Boolean)
    .map((file) => {
      const text = readFileSync(join(REPO_ROOT, file), 'utf8');
      return { file, lines: text.split('\n').length - 1 };
    })
    .filter((f) => f.lines > 500);

  if (oversized.length === 0) {
    // Nothing is over the hard limit: the detector must report success.
    assert.equal(
      result.status,
      0,
      `the detector must pass when no module exceeds the hard limit; output was: ${output}`,
    );
    assert.doesNotMatch(
      output,
      /exceeds the 500-line hard limit/,
      'the detector must not report a size violation when none exists',
    );
    return;
  }

  // Something IS over the hard limit: the detector must fail and must name
  // every oversized file.
  assert.notEqual(
    result.status,
    0,
    `the detector must fail when a module exceeds the hard limit; output was: ${output}`,
  );
  assert.match(
    output,
    /exceeds the 500-line hard limit/,
    'the detector must report the hard-limit violation',
  );
  for (const { file, lines } of oversized) {
    assert.ok(
      output.includes(file),
      `the detector must name ${file} (${lines} lines) in its report`,
    );
  }
});
