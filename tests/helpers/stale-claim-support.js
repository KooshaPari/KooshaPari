/**
 * Shared fixtures and helpers for the stale-claim scanner tests.
 *
 * These are the pieces the stale-claim test files have in
 * common: where the repository is, how to run the scanner, how to
 * measure the suite, and the verbatim round 6r paragraph.
 *
 * Nothing here is a test. This module holds no `test()` calls, so
 * importing it adds nothing to the suite count. The files that use
 * it are:
 *
 *   tests/stale-claim-classes.test.js    the class predicates
 *   tests/stale-claim-rules.test.js      the rules, as pure functions
 *   tests/stale-claim-scan.test.js       the measurement and the CLI
 *   tests/stale-claim-controls.test.js   the negative controls
 *   tests/stale-claim-gates.test.js      the gate wiring
 */

import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { roundEntryRanges } from '../../scripts/stale-claim-rules.js';
import {
  listTestFiles,
  measureSuite,
  MEASURED_EXCLUSIONS,
} from '../../scripts/stale-claim-measure.js';

// This module lives in `tests/helpers/`, so the repository root is two
// levels up.
export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SCANNER = join(REPO_ROOT, 'scripts', 'scan-stale-claims.js');

export { listTestFiles, MEASURED_EXCLUSIONS };

/**
 * The suite's own count, measured by running the suite.
 *
 * The measurement itself lives in `scripts/stale-claim-measure.js`, so
 * the CLI and the tests share ONE definition of how the count is
 * produced. This wrapper exists only so the tests read the same way
 * they did before the module was extracted.
 *
 * @param {string[]} exclude  repo-relative paths of the files to exclude
 * @returns {number}
 */
export function suiteCount(exclude = MEASURED_EXCLUSIONS) {
  return measureSuite({ exclude }).count;
}

/**
 * Run the scanner against the real tree.
 *
 * @param {number} measured
 * @param {string[]} extra
 * @returns {{status: number, stdout: string, stderr: string}}
 */
export function runScanner(measured, extra = []) {
  const args = [SCANNER, '--measured', String(measured), ...extra];
  return runScannerRaw(args);
}

/**
 * Run the scanner with exactly the arguments given, and nothing added.
 *
 * `runScanner` always supplies `--measured N`, because most tests want
 * to pin the count the scanner is given. This one does not, so a test
 * can exercise the NO-ARGUMENT entry point — the one the round's own
 * documentation names, and the one a gate invokes. A test that only
 * ever ran the scanner with an explicit count would not have noticed
 * that the no-argument form exited 2.
 *
 * @param {string[]} args
 * @returns {{status: number, stdout: string, stderr: string}}
 */
export function runScannerRaw(args) {
  try {
    const stdout = execFileSync('node', [SCANNER, ...args], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
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

/**
 * Run the scanner against a temporary copy of the tree.
 *
 * The copy carries the tracked Markdown and the scanner's own scripts.
 * It gets a fresh `git init` and `git add -A`, because the scanner
 * enumerates files through `git ls-files` and a bare directory is not
 * a repository.
 *
 * The copy is deliberately NOT a working-tree or a git worktree. It is
 * a plain directory with a fresh index, so nothing in the real tree —
 * the index, the working tree, the stash — can be disturbed by a test
 * that writes to it.
 *
 * @param {number} measured
 * @param {(dir: string) => void} mutate  runs against the copy
 * @returns {{status: number, stdout: string, stderr: string}}
 */
export function runScannerInCopy(measured, mutate) {
  const dir = mkdtempSync(join(tmpdir(), 'stale-claim-scan-'));
  try {
    // The tracked Markdown.
    const tracked = execFileSync('git', ['ls-files', '-z', '*.md'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    for (const rel of tracked.split('\0').filter(Boolean)) {
      const dest = join(dir, rel);
      mkdirSync(dirname(dest), { recursive: true });
      try {
        copyFileSync(join(REPO_ROOT, rel), dest);
      } catch (err) {
        // The file vanished between `git ls-files` and the copy.
        //
        // This is not hypothetical. `tests/sweep-lighthouse-claims.test.js`
        // writes a control file into the repository's own `docs/` tree,
        // `git add -f`s it, and removes it afterwards. A concurrent
        // `git ls-files` sees the file; by the time it is copied, it is
        // gone. The control file is a test artefact, not a document,
        // so skipping it is correct.
        if (err.code !== 'ENOENT') throw err;
      }
    }

    // The scanner and the modules it imports. These may be untracked
    // in the working tree, so they are copied from disk rather than
    // from the index.
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    for (const name of readdirSync(join(REPO_ROOT, 'scripts'))) {
      if (name.endsWith('.js')) {
        copyFileSync(join(REPO_ROOT, 'scripts', name), join(dir, 'scripts', name));
      }
    }

    // A fresh repository, so `git ls-files` enumerates the copy.
    execFileSync('git', ['init', '-q'], { cwd: dir });
    execFileSync('git', ['add', '-A'], { cwd: dir });

    mutate(dir);

    try {
      const stdout = execFileSync(
        'node',
        [join(dir, 'scripts', 'scan-stale-claims.js'), '--measured', String(measured), '--json'],
        { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      );
      return { status: 0, stdout, stderr: '' };
    } catch (err) {
      return {
        status: err.status ?? 1,
        stdout: err.stdout ?? '',
        stderr: err.stderr ?? '',
      };
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * The rounds that have a `HUMAN_REVIEW.md` entry, in the order the file
 * gives them.
 *
 * Derived from the tree, not written down. A written-down list is a
 * copy that goes stale exactly the way the documents under test went
 * stale, and a control that is itself stale tests nothing.
 *
 * @returns {string[]}
 */
export function currentRounds() {
  const lines = readFileSync(join(REPO_ROOT, 'HUMAN_REVIEW.md'), 'utf8').split('\n');
  return roundEntryRanges(lines).map((e) => e.round);
}

/**
 * A closing paragraph that is correct by construction.
 *
 * It states the measured count and lists every round that has an
 * entry, so a scanner that flags it is flagging a paragraph that is
 * telling the truth. The paragraph is built from the tree, so it stays
 * correct as the tree changes.
 *
 * @param {number} measured
 * @returns {string}
 */
export function correctParagraph(measured) {
  const rounds = currentRounds();
  return `The post-20th-pass arc is closed: 17 commits pushed to
\`origin/main\` (c1a13de through the round 6q close),
all 5 items in the 06 doc are CLOSED/DECIDED, the unit
suite is ${measured}/${measured} PASS, and \`HUMAN_REVIEW.md\` carries
the complete round-6 audit trail (${rounds.join(', ')}) — ${rounds.length} round
entries.`;
}

/**
 * The round 6r defective paragraph, character for character.
 *
 * This is the text that sat in `STATE.md` before commit 4222594
 * corrected it. The rules must reject it. It is the primary negative
 * control for the whole defect class, and it is held here verbatim
 * rather than reconstructed, so a future edit to the repository's
 * prose cannot quietly change what the control tests.
 */
export const ROUND_6R_DEFECT = `The post-20th-pass arc is closed: 13 commits pushed to
\`origin/main\` (c1a13de through the round 6m close),
all 5 items in the 06 doc are CLOSED/DECIDED, the unit
suite is 774/774 PASS, and \`HUMAN_REVIEW.md\` carries
the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,
6h, 6i, 6i-correction, 6j, 6k, 6l, 6m).`;

/**
 * The paragraph round 6r corrected the defect to.
 *
 * It is held as a HISTORICAL artifact. At the time it was correct: the
 * suite measured 787, and the rounds it named were the rounds that
 * had entries. Both statements stopped being true as round 6r itself
 * added an entry and later rounds added more.
 *
 * It is therefore a NEGATIVE control, not a positive one. Planted
 * today, the scanner must reject it: the count 787 disagrees with the
 * measurement, and the list omits rounds that now have entries. A
 * positive control built from this text would be asserting that the
 * scanner accepts a claim it is right to reject.
 */
export const ROUND_6R_CORRECTED = `The post-20th-pass arc is closed: 17 commits pushed to
\`origin/main\` (c1a13de through the round 6q close),
all 5 items in the 06 doc are CLOSED/DECIDED, the unit
suite is 787/787 PASS, and \`HUMAN_REVIEW.md\` carries
the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,
6i, 6j, 6k, 6l, 6m, 6n, 6o, 6p, 6q) — 14 round
entries.`;
