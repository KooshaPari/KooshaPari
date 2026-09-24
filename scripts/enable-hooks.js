#!/usr/bin/env node
/**
 * enable-hooks.js — postinstall hook-path activation.
 *
 * core.hooksPath is a LOCAL git config, so a fresh clone silently loses the
 * pre-commit gate (anti-pattern detector + test suite) until someone runs
 * `git config` by hand. npm install now does it automatically. Never fails
 * the install: environments without git or a .git directory (CI archives,
 * vercel build sandboxes) just skip.
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

try {
  if (existsSync(`${root}.git`)) {
    execFileSync('git', ['config', 'core.hooksPath', 'scripts/git-hooks'], { cwd: root });
    console.log('[postinstall] core.hooksPath -> scripts/git-hooks (pre-commit gate active)');
  } else {
    console.log('[postinstall] no .git present; skipping hooksPath');
  }
} catch (err) {
  console.log(`[postinstall] hooksPath not set: ${String(err.message).split('\n')[0]}`);
}
