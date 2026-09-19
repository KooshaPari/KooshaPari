#!/usr/bin/env node
/**
 * Simple ES module bundler for the portfolio site.
 *
 * Reads scripts/app.js as the entry point, follows all static
 * `import ... from '...'` statements recursively, and concatenates
 * every reachable module into a single IIFE-wrapped bundle.
 *
 * Usage:  node scripts/bundle-js.js
 * Output: dist/bundled/app.bundle.js
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');
const ENTRY = resolve(ROOT, 'scripts/app.js');
const OUT_DIR = resolve(ROOT, 'bundled');
const ENTRY_BASE = 'app.bundle.js';

// --- Content-hash suffix helpers (shared contract with bundle-css.js) ---

function shortHash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function hashedName(base, hash) {
  // "app.bundle.js" -> "app.bundle.<hash>.js"
  const dot = base.lastIndexOf('.');
  return `${base.slice(0, dot)}.${hash}${base.slice(dot)}`;
}

// --- Dependency graph walker ---

const registry = new Map();   // absolutePath -> { code, exports, deps }
const loadOrder = [];

function resolveImportPath(from, spec) {
  const dir = dirname(from);
  let target = resolve(dir, spec);
  if (!target.endsWith('.js')) target += '.js';
  return target;
}

function loadModule(absPath) {
  if (registry.has(absPath)) return;

  const raw = readFileSync(absPath, 'utf8');
  // Strip block comments and line comments before scanning for imports
  const noComments = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const imports = [];
  const deps = [];

  // Extract all static `import ... from '...'` declarations (single & multi-line)
  const importRe = /import\s+(?:(\{[^}]*\}|[\w*$_]+(?:\s*,\s*\{[^}]*\})?)\s+from\s+)?['"]([^'"]+)['"];?/g;
  const exportList = [];
  let m;
  while ((m = importRe.exec(noComments)) !== null) {
    const spec = m[2];
    if (spec.startsWith('node:')) continue;          // skip Node built-ins
    const depPath = resolveImportPath(absPath, spec);
    imports.push({ spec, path: depPath, fullMatch: m[0] });

    // Capture named exports from this import for the variable hoisting
    const binding = m[1] || '';
    const namedMatch = binding.match(/\{([^}]+)\}/);
    if (namedMatch) {
      namedMatch[1].split(',').forEach((s) => {
        const part = s.trim();
        if (!part) return;
        // Handle `foo as bar` aliases
        const aliasMatch = part.match(/^(\w+)\s+as\s+(\w+)$/);
        if (aliasMatch) {
          exportList.push({ local: aliasMatch[2], source: depPath });
        } else {
          exportList.push({ local: part, source: depPath });
        }
      });
    } else if (binding.trim()) {
      // Default import: `import Foo from '...'`
      exportList.push({ local: binding.trim(), source: depPath });
    }
  }

  // Recurse into dependencies
  for (const imp of imports) {
    loadModule(imp.path);
    deps.push(imp.path);
  }

  registry.set(absPath, {
    code: raw,
    exports: exportList,
    deps,
  });
  loadOrder.push(absPath);
}

// --- Strip import/export statements from module source ---

function stripDeclarations(source) {
  let out = source;
  // Remove `import ... from '...';` (single & multi-line)
  out = out.replace(/import\s+(?:\{[^}]*\}|[\w*$_]+(?:\s*,\s*\{[^}]*\})?)\s+from\s+['"][^'"]+['"];?\n?/g, '');
  // Remove `export default ...`
  out = out.replace(/export\s+default\s+/g, '');
  // Remove `export { ... }` / `export { ... as ... }`
  out = out.replace(/export\s+\{[^}]*\};?\n?/g, '');
  // Remove `export function` / `export const` / `export let` / `export class`
  out = out.replace(/export\s+(function|const|let|class|async\s+function)\s+/g, '$1 ');
  // Convert const/let to var so they don't conflict with hoisted var declarations
  out = out.replace(/^(const|let)\s+/gm, 'var ');
  return out;
}

// --- Build ---

loadModule(ENTRY);
// cursor.js is deliberately NOT bundled. It is loaded by an explicit
// `import('/scripts/cursor.js')` in the HTML, and this bundler emits an IIFE
// with no exports, so an inlined copy could never satisfy that import — it was
// pure dead weight duplicated on the wire.

// Gather every unique export symbol across all modules, deduplicated.
// `importers` records who asked for each symbol so an unresolvable symbol can be
// reported with its origin instead of shipping as a silent `undefined`.
const seen = new Set();
const hoistedVars = [];
const importers = new Map();
for (const absPath of loadOrder) {
  const mod = registry.get(absPath);
  for (const { local, source } of mod.exports) {
    if (!importers.has(local)) importers.set(local, []);
    importers
      .get(local)
      .push({ from: relative(ROOT, absPath), module: relative(ROOT, source) });
    if (!seen.has(local)) {
      seen.add(local);
      hoistedVars.push(local);
    }
  }
}

// Concatenate each module's body (stripped of import/export declarations)
const bodies = loadOrder.map((absPath) => {
  const mod = registry.get(absPath);
  return stripDeclarations(mod.code);
});

// --- Hoisted-export guard ---
//
// The bundle flattens every module into one IIFE scope and declares the union
// of imported names as `var`s. That only works when the imported name matches
// the name the exporting module actually defines. An `import { a as b }` alias
// whose source defines `a` leaves `b` declared but never assigned, so the call
// site throws `TypeError: b is not a function` in the browser while every static
// check stays green. Fail the build instead.
const allBodies = bodies.join('\n');
const unresolved = hoistedVars.filter((name) => {
  // Export names are arbitrary identifiers (`$` and `$$` are real ones in this
  // codebase), so escape them before interpolating into a pattern.
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const defined = new RegExp(
    `(?:^|[^\\w$.])(?:(?:async\\s+)?function|class)\\s+${escaped}\\s*[(<]|(?:^|[^\\w$.])${escaped}\\s*=`,
  );
  return !defined.test(allBodies);
});
if (unresolved.length > 0) {
  console.error('\nBundle aborted: imported names are never defined.');
  console.error('Each name below is declared in the IIFE but no module body assigns it,');
  console.error('so its call site would throw at runtime. Import the exporting module\'s');
  console.error('own export name instead of aliasing a generic one.\n');
  for (const name of unresolved) {
    for (const site of importers.get(name) ?? []) {
      console.error(`  ${name}`);
      console.error(`    imported by ${site.from}`);
      console.error(`    resolved to ${site.module}`);
    }
  }
  console.error('');
  process.exit(1);
}

// Assemble the final bundle wrapped in an IIFE, then minify
const rawBundle = `(function () {
'use strict';
${hoistedVars.length ? `var ${hoistedVars.join(', ')};` : ''}
${bodies.join('\n')}
})();
`;
// Minify with esbuild JS API
const esbuild = await import('esbuild');
const result = await esbuild.transform(rawBundle, { minify: true });
const bundle = result.code;
const rawKB = (Buffer.byteLength(rawBundle) / 1024).toFixed(1);
const minKB = (Buffer.byteLength(bundle) / 1024).toFixed(1);
console.log(`Minified: ${rawKB} KB -> ${minKB} KB`);

// Compute content hash and write hashed output. Remove stale bundles first
// so leftover hashes from previous builds don't leak into the served site.
const hash = shortHash(bundle);
const hashedFile = hashedName(ENTRY_BASE, hash);
const OUT = resolve(OUT_DIR, hashedFile);

mkdirSync(OUT_DIR, { recursive: true });
for (const entry of readdirSync(OUT_DIR)) {
  if (entry === 'manifest.json') continue;
  rmSync(resolve(OUT_DIR, entry), { force: true });
}
writeFileSync(OUT, bundle);

if (!existsSync(OUT)) {
  console.error('Bundle write failed!');
  process.exit(1);
}

// Manifest maps logical entry name -> hashed filename. JSON, not hashed —
// vercel.json serves it `public, max-age=300, must-revalidate` so consumers
// see fresh hashed names after every deploy.
const manifest = { [ENTRY_BASE]: hashedFile };
writeFileSync(
  resolve(OUT_DIR, 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);

const sizeKB = (Buffer.byteLength(bundle) / 1024).toFixed(1);
console.log(`Bundled ${loadOrder.length} modules -> ${relative(ROOT, OUT)} (${sizeKB} KB)`);
console.log(`Manifest written to ${relative(ROOT, resolve(OUT_DIR, 'manifest.json'))}`);
