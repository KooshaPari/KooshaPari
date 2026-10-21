import {
  mkdirSync,
  mkdtempSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

/**
 * Shared scaffolding for the Lighthouse sweep's negative controls.
 *
 * WHY AN ISOLATED TREE, AND NOT THE REPOSITORY.
 *
 * These controls used to write their file into the repository's own
 * `docs/` tree and `git add -f` it, so that the sweep's `git ls-files`
 * would find it. That made the repository a shared mutable object
 * during the test run, and it broke other things:
 *
 *   - Any other process that ran `git ls-files` during the window saw
 *     a file that was about to disappear. The stale-claim scanner
 *     copies the tracked Markdown, and it crashed with ENOENT when
 *     the control file vanished mid-copy.
 *
 *   - The `git rm --cached` cleanup FAILED when the file had already
 *     been removed by a concurrent run, and the failure surfaced as an
 *     unrelated test error.
 *
 *   - The index was mutated, so a concurrent `git add -A` could stage
 *     the control file, and a concurrent `git commit` could commit it.
 *
 * A test that mutates the repository is a test that can corrupt the
 * repository. These controls build a throwaway tree with its own
 * `git init`, plant the file there, and sweep that tree. The
 * repository is never touched, so the controls can run concurrently
 * with anything else.
 *
 * @param {string} rel   repo-relative path of the control file
 * @param {string} body  the file's contents
 * @returns {{dir: string, rel: string}} the temp tree and the path within it
 */
export function plantControl(rel, body) {
  const dir = mkdtempSync(join(tmpdir(), 'sweep-lh-'));
  execFileSync('git', ['init', '-q'], { cwd: dir, stdio: 'pipe' });
  const abs = join(dir, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body);
  execFileSync('git', ['add', '-f', rel], { cwd: dir, stdio: 'pipe' });
  return { dir, rel };
}

/**
 * Plant a control, sweep the isolated tree, and return only the claims
 * that the sweep reported as uncovered for the planted file.
 *
 * The temp tree is removed before this returns, so callers never have to
 * manage cleanup themselves and cannot leak a tree on an assertion
 * failure.
 *
 * @param {string} rel   repo-relative path of the control file
 * @param {string} body  the file's contents
 * @param {(sweep: (opts: {root: string}) => any) => any} sweep
 * @returns {any[]} the uncovered claims for the planted file
 */
export function sweepControl(rel, body, sweep) {
  const { dir } = plantControl(rel, body);
  try {
    const result = sweep({ root: dir });
    return result.uncovered.filter((c) => c.file === rel);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
