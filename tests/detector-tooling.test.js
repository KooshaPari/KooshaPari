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
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
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
 * @returns {{status: number, stdout: string, stderr: string}}
 */
function runDetectorWithoutRipgrep() {
  const stubDir = join(REPO_ROOT, 'output', 'no-rg-path');
  rmSync(stubDir, { recursive: true, force: true });
  mkdirSync(stubDir, { recursive: true });

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
    return {
      status: err.status ?? 1,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
    };
  } finally {
    rmSync(stubDir, { recursive: true, force: true });
  }
}

test('the detector refuses to run without ripgrep', () => {
  const result = runDetectorWithoutRipgrep();
  const output = `${result.stdout}\n${result.stderr}`;

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
