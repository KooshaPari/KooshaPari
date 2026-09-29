import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, cpSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

// `node --test` runs test files concurrently, and build-output.test.js reads the
// real bundled/ tree. Rebuilding in place let the bundler's stale-hash cleanup
// delete a file another test was reading, failing intermittently with ENOENT.
// Every rebuild here runs against a throwaway copy of the repo instead.
function withRepoCopy(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'koosha-js-bundle-'));
  try {
    cpSync(ROOT, dir, {
      recursive: true,
      filter: (src) => {
        const rel = src.slice(ROOT.length);
        return !rel.includes('/node_modules') && !rel.includes('/.git');
      },
    });
    // The bundler imports esbuild, so the copy needs the installed dependency
    // tree. Symlinking node_modules resolves it without duplicating it.
    symlinkSync(resolve(ROOT, 'node_modules'), join(dir, 'node_modules'), 'dir');
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function currentBundle(root) {
  const manifest = JSON.parse(readFileSync(resolve(root, 'bundled/manifest.json'), 'utf8'));
  return readFileSync(resolve(root, 'bundled', manifest['app.bundle.js']), 'utf8');
}

test('bundle build succeeds and emits a parseable IIFE', () => {
  withRepoCopy(root => {
    const out = execFileSync(process.execPath, ['scripts/bundle-js.js'], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.match(out, /Bundled \d+ modules/);
    const bundle = currentBundle(root);
    assert.doesNotThrow(() => new Function(bundle), 'bundle must parse as valid JS');
    assert.doesNotMatch(bundle, /\bfrom\s*["'][^"']+["']\s*;?\s*$/m, 'no dangling import/export-from clause');
  });
});

test('bundle inlines re-exported modules instead of dropping them', () => {
  withRepoCopy(root => {
    // data/phenotype.js re-exports PUBLIC_RECORD from phenotype-public-record.js.
    // The bundler must walk that dependency and inline its body; before support
    // for `export ... from`, the statement was neither followed nor stripped and
    // the build aborted with a transform error.
    execFileSync(process.execPath, ['scripts/bundle-js.js'], { cwd: root, encoding: 'utf8' });
    const bundle = currentBundle(root);
    assert.match(bundle, /Santa Monica/, 'IDENTITY from data/phenotype.js is bundled');
    assert.match(bundle, /Script Kiddie/, 'PUBLIC_RECORD body from the re-exported module is bundled');
  });
});

test('bundle manifest points at the only emitted bundle', () => {
  withRepoCopy(root => {
    execFileSync(process.execPath, ['scripts/bundle-js.js'], { cwd: root, encoding: 'utf8' });
    const manifest = JSON.parse(readFileSync(resolve(root, 'bundled/manifest.json'), 'utf8'));
    const files = readdirSync(resolve(root, 'bundled')).filter(f => f.endsWith('.js'));
    assert.deepEqual(files, [manifest['app.bundle.js']]);
  });
});

// Every module body is concatenated into one IIFE and const/let are rewritten to
// var, so two modules declaring the same top-level name silently share one
// binding. That shipped once: counter-animate.js declared
// `const SELECTOR = '[data-count-to]'` while scroll-reveal-helpers.js exports
// `SELECTOR = '[data-reveal]'`, so the reveal system scanned for counters,
// matched none of its elements, and never revealed anything on any page.
//
// The guard has to see every form a top-level declaration can take after
// stripDeclarations runs, or it reintroduces the same class of bug quietly.
// One repo copy covers every case: the guard exits before minification, so an
// aborted build is fast, and duplicating the tree per case is the real cost.
test('build aborts on any cross-module top-level name collision', () => {
  withRepoCopy(root => {
    // `clamp` is declared by magnetic-helpers.js. Injecting it into a different
    // module is a genuine cross-module collision; injecting a second `clamp`
    // into magnetic-helpers.js itself would not be, since two declarations in
    // one module body are the same binding, not a collision.
    const cases = [
      'const clamp = 1;',
      'let clamp = 1;',
      'function clamp() {}',
      'async function clamp() {}',
      'class clamp {}',
      'var clamp = 1;',
      // Multi-declarator: only the first name is visible to a naive regex, so
      // the guard has to walk the rest of the statement too.
      'const alpha = 1, clamp = 2;',
      // A semicolon inside a nested literal must not be mistaken for the end
      // of the statement, or the later declarator is missed.
      'const alpha = [1, 2].map((n) => n), clamp = 2;',
    ];
    for (const decl of cases) {
      const target = resolve(root, 'scripts/perspective-tilt-helpers.js');
      const original = readFileSync(target, 'utf8');
      writeFileSync(target, `${original}\n${decl}\n`);
      try {
        execFileSync(process.execPath, ['scripts/bundle-js.js'], {
          cwd: root,
          encoding: 'utf8',
          stdio: 'pipe',
        });
        assert.fail(`guard missed declaration form: ${decl}`);
      } catch (e) {
        if (e instanceof assert.AssertionError) throw e;
        const output = `${e.stdout ?? ''}${e.stderr ?? ''}`;
        assert.match(output, /top-level name collision/i, `guard must name the failure mode for: ${decl}`);
        assert.match(output, /\bclamp\b/, `guard must report clamp for: ${decl}`);
      } finally {
        writeFileSync(target, original);
      }
    }
  });
});

test('collision guard ignores block-scoped declarations', () => {
  withRepoCopy(root => {
    // Only column-0 declarations share the IIFE scope. An indented,
    // block-scoped `clamp` cannot collide across modules, and a guard that
    // flagged it would make the build unusable.
    const target = resolve(root, 'scripts/perspective-tilt-helpers.js');
    const original = readFileSync(target, 'utf8');
    writeFileSync(
      target,
      `${original}\nexport function probe() {\n  const clamp = 1;\n  return clamp;\n}\n`,
    );
    try {
      const out = execFileSync(process.execPath, ['scripts/bundle-js.js'], {
        cwd: root,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      assert.match(out, /Bundled \d+ modules/, 'block-scoped names must not abort the build');
    } finally {
      writeFileSync(target, original);
    }
  });
});

// stripDeclarations removes `import x from '...'` and `import {a} from '...'`
// but not the bare side-effect form `import './setup.js'`. A bare import that
// survives stripping is emitted verbatim into the IIFE, where it is a syntax
// error, so the whole bundle fails to parse at load time. No current source
// module used the form, which is exactly why it stayed latent: the defect only
// appears the day someone adds a side-effect import.
test('bundle strips bare side-effect imports and still executes', () => {
  withRepoCopy(root => {
    const sideEffect = resolve(root, 'scripts/perspective-tilt-helpers.js');
    const entry = resolve(root, 'scripts/app.js');
    const sideEffectOriginal = readFileSync(sideEffect, 'utf8');
    const entryOriginal = readFileSync(entry, 'utf8');

    // A string literal, not a variable name: the output is minified, so an
    // identifier-based marker would be renamed and could never be matched.
    // Literals survive minification unchanged.
    writeFileSync(
      sideEffect,
      `${sideEffectOriginal}\nvar BARE_IMPORT_MARKER = 'bare-import-marker-41';\n`,
    );
    writeFileSync(entry, `import './perspective-tilt-helpers.js';\n${entryOriginal}`);
    try {
      execFileSync(process.execPath, ['scripts/bundle-js.js'], { cwd: root, encoding: 'utf8' });
      const bundle = currentBundle(root);
      assert.doesNotMatch(bundle, /import\s+['"]/, 'no bare import may survive into the IIFE');
      assert.doesNotThrow(() => new Function(bundle), 'bundle must parse as valid JS');
      assert.match(
        bundle,
        /bare-import-marker-41/,
        'the bare-imported module body is inlined, not dropped',
      );
    } finally {
      writeFileSync(sideEffect, sideEffectOriginal);
      writeFileSync(entry, entryOriginal);
    }
  });
});
