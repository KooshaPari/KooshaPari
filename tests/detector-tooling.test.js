/**
 * The detector must not report a confident falsehood when its tools are absent.
 *
 * `scripts/anti-pattern-detector.sh` shells out to `rg` (ripgrep). Almost
 * every one of its 29 patterns is a "is this thing present?" question, and
 * `rg -q` answers "no" when the binary does not exist — not because the
 * thing is absent, but because the question could not be asked.
 *
 * The consequence is that a missing tool produces a long, specific,
 * entirely fabricated list of violations: every HTML file reported as
 * missing its `<main>` landmark, its `lang` attribute, and its skip link;
 * `styles/base.css` reported as missing the global focus ring; and so on.
 * It looks like a content regression. It is a missing binary.
 *
 * This was not hypothetical. GitHub's `ubuntu-latest` image does not ship
 * ripgrep, and CI ran the detector without it for six consecutive commits
 * before 2026-10-21. Every one of those runs failed with a fabricated
 * violation list naming files that had the required markup, and the
 * failure was read as a content problem rather than an environment one.
 *
 * These tests pin two things:
 *
 *   1. The detector refuses to run without `rg`, and says so.
 *   2. It refuses with a DISTINCT exit code (2), so a caller can tell
 *      "the tree has violations" (1) from "I could not look at the tree" (2).
 *
 * The second matters because a gate that cannot distinguish its own
 * inability to observe from an actual finding is a gate that can be
 * trusted to be believed when it should not be.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { REPO_ROOT } from './helpers/stale-claim-support.js';

const DETECTOR = join(REPO_ROOT, 'scripts', 'anti-pattern-detector.sh');

/**
 * Run the detector with a PATH that deliberately lacks ripgrep.
 *
 * The PATH is assembled rather than mutated so the test cannot affect the
 * parent process, and so the detector's own `command -v rg` sees exactly
 * what a CI runner without ripgrep would show it.
 *
 * THE STUB DIRECTORY IS UNIQUE PER INVOCATION.
 *
 * This used to live at a fixed path under the repository (`output/no-rg-path`),
 * which made it a shared mutable object. Two suite runs overlapping — the
 * stale-claim scanner's nested measurement run and the parent run, or two
 * CI jobs on the same checkout — would `rm -rf` the directory out from
 * under each other. The observable symptom was the detector failing to
 * spawn at all: the `bash` symlink had been deleted between the directory
 * being populated and the detector being executed, so the spawn raised
 * ENOENT, the catch block reported `err.status ?? 1`, and the test saw
 * exit 1 with EMPTY output where it expected exit 2 with a message.
 *
 * That failure was reported as "the detector does not exit 2 when its
 * tooling is absent", which is a claim about the detector's behaviour and
 * was false. The detector was never consulted. This is the same class of
 * defect as the missing-tool bug this file exists to pin: an environment
 * failure presented as a content failure.
 *
 * A unique temporary directory per invocation removes the sharing
 * entirely. The directory is created under the system temp dir rather
 * than in the repository, so the test does not leave anything in the tree
 * and does not depend on `output/` existing.
 *
 * @returns {{status: number, stdout: string, stderr: string}}
 */
function runDetectorWithoutRipgrep() {
  const stubDir = mkdtempSync(join(tmpdir(), 'no-rg-path-'));

  // A directory of symlinks to the tools the detector needs, minus rg.
  // `rg` is simply not linked, so `command -v rg` fails the way it does on
  // a runner that never installed it.
  const needed = [
    'bash', 'find', 'grep', 'wc', 'sed', 'awk', 'head', 'sort', 'uniq',
    'tr', 'cut', 'cat', 'ls', 'git', 'node', 'basename', 'dirname',
  ];
  for (const tool of needed) {
    let resolved = '';
    try {
      resolved = execFileSync('command', ['-v', tool], {
        encoding: 'utf8',
        shell: '/bin/bash',
      }).trim();
    } catch {
      continue;
    }
    if (!resolved) continue;
    try {
      execFileSync('ln', ['-sf', resolved, join(stubDir, tool)]);
    } catch {
      // A tool that cannot be linked is simply absent from the stub PATH.
    }
  }

  try {
    const stdout = execFileSync('bash', [DETECTOR], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, PATH: stubDir },
    });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    // A NON-ZERO EXIT and a FAILED SPAWN are different events, and they
    // must not be reported as the same number.
    //
    // `err.status` is the detector's own exit code and is only present
    // when the child actually ran. When the child could not be started
    // at all — ENOENT on the executable, EACCES, a killed process — there
    // is no status, and the old `err.status ?? 1` collapsed that case
    // into exit 1, which is the detector's code for "the tree has
    // violations". A test asserting on that number would then be
    // asserting on a fact about the test harness and reading as a fact
    // about the detector.
    //
    // A spawn failure is surfaced as a distinct, unmistakable status so
    // that no assertion can mistake it for the detector's behaviour.
    const spawned = typeof err.status === 'number';
    return {
      status: spawned ? err.status : 127,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? (spawned ? '' : `spawn failed: ${err.message}`),
      spawned,
    };
  } finally {
    rmSync(stubDir, { recursive: true, force: true });
  }
}

test('the detector refuses to run without ripgrep', () => {
  const result = runDetectorWithoutRipgrep();
  const output = `${result.stdout}\n${result.stderr}`;

  assert.ok(
    result.spawned,
    `the detector must have actually run; it did not spawn. output was: ${output}`,
  );
  assert.notEqual(
    result.status,
    0,
    `the detector must not report success without its tooling; output was: ${output}`,
  );
  assert.match(
    output,
    /ripgrep/i,
    'the detector must say that ripgrep is the missing tool',
  );
  assert.match(
    output,
    /not on PATH|is not installed|install/i,
    'the detector must say the tool is absent and how to obtain it',
  );
});

test('the missing-tool exit code is distinct from a violation', () => {
  // Exit 1 means "the tree has violations". Exit 2 means "the detector
  // could not look at the tree". A caller that cannot tell those apart
  // will treat an environment failure as a content failure — which is
  // exactly what happened for six consecutive CI runs.
  const result = runDetectorWithoutRipgrep();

  assert.ok(
    result.spawned,
    `the detector must have actually run; it did not spawn. output was: ${result.stdout}${result.stderr}`,
  );
  assert.equal(
    result.status,
    2,
    `the detector must exit 2 when its tooling is absent; output was: ${result.stdout}${result.stderr}`,
  );

  const output = `${result.stdout}\n${result.stderr}`;
  assert.doesNotMatch(
    output,
    /violations? found/i,
    'a missing tool must not be reported as a list of violations',
  );
  assert.doesNotMatch(
    output,
    /missing <main>|missing lang|missing skip link|missing global/,
    'a missing tool must not fabricate content violations on correct files',
  );
});

test('the detector declares its ripgrep dependency in its own source', () => {
  // The precondition is pinned as text so it cannot be deleted silently.
  // A guard that is not written down is a guard that is not there.
  const detector = readFileSync(DETECTOR, 'utf8');

  assert.match(
    detector,
    /command -v rg/,
    'the detector must check for ripgrep before running its checks',
  );
  assert.match(
    detector,
    /exit 2/,
    'the missing-tool path must use a distinct exit code',
  );
});

test('the CI workflow installs ripgrep before running the detector', () => {
  // The dependency is declared where the tool is actually used. Without
  // this step the detector runs on a runner that has no rg, and reports
  // fabricated violations.
  const workflow = readFileSync(
    join(REPO_ROOT, '.github', 'workflows', 'ci.yml'),
    'utf8',
  );

  const installIndex = workflow.toLowerCase().indexOf('install ripgrep');
  const detectorIndex = workflow.toLowerCase().indexOf('anti-pattern-detector.sh');

  assert.ok(
    installIndex !== -1,
    'the CI workflow must install ripgrep',
  );
  assert.ok(
    detectorIndex !== -1,
    'the CI workflow must run the anti-pattern detector',
  );
  assert.ok(
    installIndex < detectorIndex,
    'ripgrep must be installed BEFORE the detector runs',
  );
});
