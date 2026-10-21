/**
 * Measure the unit-suite test count, the way the suite itself reports it.
 *
 * WHY THIS EXISTS.
 *
 * The stale-claim scanner checks whether a document's stated test count
 * agrees with the suite's actual count. To check that, it needs the
 * count. The obvious implementations are all wrong in one direction or
 * the other:
 *
 *   - Hardcoding it. This is the defect the scanner exists to detect. A
 *     constant in the scanner is a second place for the count to drift,
 *     and a count that drifts in the scanner is indistinguishable from
 *     a count that drifts in a document.
 *
 *   - Measuring it inside the test run. The scanner's own tests are
 *     part of the suite. A suite that measures itself measures a
 *     partially-constructed count, and the recursion never terminates
 *     cleanly.
 *
 *   - Measuring it by spawning the suite from the scanner. This works,
 *     and it is what this module does, PROVIDED the spawned run
 *     excludes the stale-claim test files. Without that exclusion the
 *     child would run the tests that measure the suite, and the child
 *     would spawn another child.
 *
 * So the measurement is made ONCE, by a process that is not itself
 * part of the measured run. The excluded files' own tests are counted
 * from their source, so the number this returns is the number the full
 * suite reports.
 *
 * The `NODE_TEST_CONTEXT` marker must be removed for the child. The
 * node test runner sets it to mark a process that is already inside a
 * test run; an inherited marker makes the child skip its files and
 * print no summary at all.
 *
 * This module is imported by BOTH the CLI and the test helper, so
 * there is one measurement and one definition of the exclusion list.
 */

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The test files that are excluded from the measured run.
 *
 * These are the test files that can call `measureSuite()`. Each of them
 * would otherwise cause the child run to spawn another child, and the
 * recursion would not terminate. The exclusion is an explicit list
 * rather than a glob, so what was measured is stated rather than
 * implied.
 *
 * THE LIST IS DERIVED, NOT WRITTEN. It is every test file that
 * imports the measurement helper, found by searching the test tree
 * for that import. A hand-written list is a copy that goes stale
 * exactly the way the documents under test went stale, and a file
 * added to the list by hand is a file that will be forgotten when it
 * is split, renamed, or added. Worse, the failure mode is silent
 * until it is catastrophic: a test file that measures the suite and
 * is NOT in this list makes the measurement recurse forever, and the
 * first symptom is a test run that never finishes.
 *
 * Deriving the list means a new measuring test file is excluded the
 * moment it is written, whether or not anyone remembers to update
 * this comment.
 *
 * The exclusion costs nothing in coverage. Every assertion in the
 * stale-claim tests is about the TREE — the documents, the scanner, the
 * rules — and the tests these files contribute to the count are
 * counted here explicitly, from their own source.
 *
 * @param {string} root
 * @returns {string[]}
 */
export function measuredExclusions(root = REPO_ROOT) {
  const marker = 'stale-claim-support.js';
  const dir = join(root, 'tests');
  const excluded = [];
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    // The tree has no `tests/` directory. This happens when the
    // scanner runs against a COPY of the tree, which carries the
    // documents and the scripts but not the test suite. The copy's
    // scanner is always given an explicit `--measured` count, so it
    // never needs to measure anything, and an empty exclusion list is
    // correct for it.
    return excluded;
  }
  for (const name of names) {
    if (!name.endsWith('.test.js')) continue;
    const rel = join('tests', name);
    let source = '';
    try {
      source = readFileSync(join(dir, name), 'utf8');
    } catch {
      continue;
    }
    if (source.includes(marker)) excluded.push(rel);
  }
  return excluded.sort();
}

/**
 * The test files that are excluded from the measured run.
 *
 * Computed once, at module load, from the test tree itself. See
 * `measuredExclusions` for why this is derived rather than written.
 */
export const MEASURED_EXCLUSIONS = measuredExclusions();

/**
 * The test files of this repository, in a stable order.
 *
 * Only the top level of `tests/` is scanned. The stale-claim tests
 * live there, and a nested layout would need a recursive walk that
 * nothing else in this repository uses.
 *
 * @param {string} root
 * @returns {string[]}
 */
export function listTestFiles(root = REPO_ROOT) {
  return readdirSync(join(root, 'tests'))
    .filter((name) => name.endsWith('.test.js'))
    .sort()
    .map((name) => join('tests', name));
}

/**
 * Count the tests an excluded file contributes, from its own source.
 *
 * A top-level `test(` call is one test, which is what the runner
 * counts. Counting from source rather than writing down a literal
 * means the number cannot drift when a test is added there.
 *
 * @param {string[]} exclude  repo-relative paths
 * @param {string} root
 * @returns {number}
 */
export function countOwnTests(exclude, root = REPO_ROOT) {
  let own = 0;
  for (const rel of exclude) {
    const source = readFileSync(join(root, rel), 'utf8');
    own += (source.match(/^test\(/gm) ?? []).length;
  }
  return own;
}

/**
 * Measure the unit-suite test count.
 *
 * @param {object} [options]
 * @param {string[]} [options.exclude]  repo-relative paths to exclude
 * @param {string} [options.root]        the repository root
 * @param {boolean} [options.requirePass]  fail if the measured run did not pass
 * @returns {{count: number, passed: boolean, measured: number, own: number, output: string}}
 */
export function measureSuite(options = {}) {
  const {
    exclude = MEASURED_EXCLUSIONS,
    root = REPO_ROOT,
    requirePass = true,
  } = options;

  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;

  const others = listTestFiles(root).filter((f) => !exclude.includes(f));
  const result = spawnSync(process.execPath, ['--test', ...others], {
    cwd: root,
    encoding: 'utf8',
    env,
    maxBuffer: 64 * 1024 * 1024,
  });

  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

  const m = /^ℹ tests (\d+)$/m.exec(output);
  if (!m) {
    const err = new Error(
      `the suite must report a test count. Output was:\n${output.slice(-2000)}`,
    );
    err.output = output;
    throw err;
  }

  const failedMatch = /^ℹ fail (\d+)$/m.exec(output);
  const failed = failedMatch ? Number(failedMatch[1]) : null;
  const passed = failed === 0;

  if (requirePass && !passed) {
    const err = new Error(
      `the suite must pass for the measured count to be meaningful. Output was:\n${output.slice(-2000)}`,
    );
    err.output = output;
    throw err;
  }

  const own = countOwnTests(exclude, root);
  return {
    count: Number(m[1]) + own,
    passed,
    measured: Number(m[1]),
    own,
    output,
  };
}
