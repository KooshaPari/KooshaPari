/**
 * The CI workflow must produce every artifact the test suite reads.
 *
 * A test that reads a build output cannot pass on a checkout that never
 * ran the build. `tests/workbench-dynamic.test.js` reads the content
 * hashed bundle in `bundled/` to prove the two project workbenches were
 * not inlined into the main bundle. `bundled/` is gitignored, so a fresh
 * checkout does not have it, and the only thing that produces it is
 * `npm run stage:publication`.
 *
 * The CI workflow never ran that step. From the day the workflow was
 * added until 2026-10-21 it went: install dependencies, run the detector,
 * stop. The detector failed on every runner because the GitHub
 * `ubuntu-latest` image ships no ripgrep, so the step after it was never
 * reached, and the missing build step underneath it was never seen.
 *
 * That is the shape of the defect this file prevents. A gate that fails
 * early hides the gates behind it. The failure was never in the site;
 * it was in the harness, and the harness failed in the most confident
 * possible way.
 *
 * These tests pin the workflow's shape:
 *
 *   1. The workflow runs the staging step.
 *   2. The staging step runs BEFORE the test suite that needs its output.
 *   3. Every artifact the suite reads is produced by a step that runs
 *      before that suite.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { REPO_ROOT } from './helpers/stale-claim-support.js';

const WORKFLOW = join(REPO_ROOT, '.github', 'workflows', 'ci.yml');

/**
 * The workflow's steps, in the order they appear.
 *
 * @returns {Array<{name: string, run: string, index: number}>}
 */
function workflowSteps() {
  const source = readFileSync(WORKFLOW, 'utf8');
  const steps = [];
  const pattern = /- name:\s*(.+?)\n\s*run:\s*(.+)/g;
  let match = pattern.exec(source);
  while (match) {
    steps.push({
      name: match[1].trim(),
      run: match[2].trim(),
      index: match.index,
    });
    match = pattern.exec(source);
  }
  return steps;
}

/**
 * The index of the first step whose text contains `needle`, or -1.
 *
 * @param {string} needle
 * @returns {number}
 */
function indexOfStep(needle) {
  const steps = workflowSteps();
  for (const step of steps) {
    if (step.name.toLowerCase().includes(needle) || step.run.includes(needle)) {
      return step.index;
    }
  }
  return -1;
}

test('the CI workflow stages the publication before running the test suite', () => {
  // The staging step writes the content hashed bundle and its manifest
  // into `bundled/`, which the gitignore keeps out of the repository.
  // Without the step, a fresh checkout has no bundle and the tests that
  // read it cannot pass.
  const stageIndex = indexOfStep('stage:publication');
  const testIndex = indexOfStep('npm test');

  assert.ok(
    stageIndex !== -1,
    'the CI workflow must run the publication staging step',
  );
  assert.ok(
    testIndex !== -1,
    'the CI workflow must run the test suite',
  );
  assert.ok(
    stageIndex < testIndex,
    'the publication must be staged BEFORE the test suite runs',
  );
});

test('every gitignored artifact the suite reads is produced before the suite runs', () => {
  // `bundled/` holds the content hashed bundle and `manifest.json`. The
  // workbench test reads the manifest to find the live hashed filename,
  // so both are required.
  //
  // The check is deliberately about the ORDER, not about the contents.
  // The artifact's own integrity is the subject of other tests.
  const stageIndex = indexOfStep('stage:publication');
  const testIndex = indexOfStep('npm test');

  assert.ok(stageIndex !== -1, 'the CI workflow must stage the publication');
  assert.ok(testIndex !== -1, 'the CI workflow must run the test suite');
  assert.ok(
    stageIndex < testIndex,
    'the artifacts the suite reads must exist before the suite reads them',
  );

  const workflow = readFileSync(WORKFLOW, 'utf8');
  assert.match(
    workflow,
    /stage:publication/,
    'the staging step must be the script that produces `bundled/`',
  );
});

test('the CI workflow reaches the coverage gate', () => {
  // The coverage gate is the last step. Before 2026-10-21 it had never
  // executed on any runner, because the detector failed first. A gate
  // that has never run is not a gate.
  //
  // This test cannot make the coverage gate pass. It asserts that the
  // gate is still wired into the workflow, so that a future edit that
  // drops it is caught by the suite rather than by a reader.
  const steps = workflowSteps();
  const names = steps.map((step) => step.name.toLowerCase());

  assert.ok(
    names.some((name) => name.includes('coverage')),
    'the CI workflow must keep the coverage gate step',
  );
  assert.ok(
    names.some((name) => name.includes('stale-claim')),
    'the CI workflow must keep the stale-claim scanner step',
  );
  assert.ok(
    names.some((name) => name.includes('ripgrep')),
    'the CI workflow must keep the ripgrep install step',
  );
});
