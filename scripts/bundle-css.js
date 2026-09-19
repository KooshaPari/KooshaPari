#!/usr/bin/env node
/**
 * bundle-css.js
 *
 * Concatenates individual CSS files from styles/ into three bundle files
 * under styles/bundled/:
 *   - core.css      — design-system foundation (tokens, base, shell, responsive)
 *   - components.css — interactive UI elements
 *   - pages.css     — page-specific layouts
 *
 * Each bundle is minified: block/line comments stripped (URLs preserved),
 * redundant whitespace collapsed, and insignificant spaces removed.
 * A comment header with the original file list is kept in a banner.
 */

import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// --- Content-hash suffix helpers ---
//
// Each bundle is emitted as `<base>.<hash>.css` where `<hash>` is the first
// 8 hex chars of SHA-256 over the minified output. A `manifest.json` file
// maps logical name -> hashed filename so consumers can resolve without
// hard-coding. The unhashed legacy `<base>.css` is removed at the end —
// there is no backwards-compat shim.

function shortHash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function hashedName(base, hash) {
  // base is "core.css" -> "core.<hash>.css"
  const dot = base.lastIndexOf('.');
  return `${base.slice(0, dot)}.${hash}${base.slice(dot)}`;
}

// --- CSS Minifier (zero-dependency) ---

function minifyCss(css) {
  let output = '';
  let i = 0;
  const len = css.length;

  while (i < len) {
    if (css[i] === '/' && css[i + 1] === '*') {
      // Block comment or @charset — find closing */
      const end = css.indexOf('*/', i + 2);
      if (end === -1) break;
      i = end + 2;
    } else if (css[i] === '/' && css[i + 1] === '/') {
      // Line comment — skip to newline
      const end = css.indexOf('\n', i + 2);
      i = end === -1 ? len : end + 1;
    } else if (css[i] === "'" || css[i] === '"') {
      // String literal — copy verbatim
      const quote = css[i];
      let j = i + 1;
      while (j < len && css[j] !== quote) {
        j = css[j] === '\\' ? j + 2 : j + 1;
      }
      output += css.slice(i, j + 1);
      i = j + 1;
    } else if (css[i] <= ' ') {
      // Whitespace — preserve a single space when between non-whitespace chars.
      // The subsequent collapse step will reduce runs of spaces to one.
      // This ensures descendant combinator spaces (e.g., '.foo a') survive.
      output += ' ';
      i++;
    } else {
      output += css[i];
      i++;
    }
  }

  // Collapse runs of spaces to a single space
  output = output.replace(/ +/g, ' ');

  // Protect arithmetic inside functional notation (clamp/calc/min/max).
  // CSS Values §10.1: inside these functions `+` and `-` require whitespace on
  // BOTH sides (e.g. `clamp(2.45rem, 1.73rem + 2.9vw, 3.9rem)`). The adjacent-
  // combinator collapse below would strip it, invalidating every clamp()-based
  // type token (51 font-size declarations). Bodies are parked in placeholders
  // in one innermost-first pass (nested functions handled by outer passes
  // seeing the placeholder body), minified safely, then restored verbatim.
  // The \u0001 sentinel never appears in source CSS, so placeholders cannot be
  // rematched.
  const mathBodies = [];
  let prevProtected = null;
  while (prevProtected !== output) {
    prevProtected = output;
    output = output.replace(
      /\b(clamp|calc|min|max)\(([^()]*)\)/g,
      (match, fn, body) => {
        mathBodies.push(body);
        return `\u0001${fn}\u0001(\u0001${mathBodies.length - 1}\u0001)`;
      },
    );
  }

  // Remove spaces inside function parentheses: calc( 100% - 20px ) → calc(100%-20px)
  output = output.replace(/\(\s+/g, '(');
  output = output.replace(/\s+\)/g, ')');

  // Remove space after colon in property values: font-size: 1rem → font-size:1rem
  // But preserve space after colon in pseudo-elements :hover, :before, etc.
  output = output.replace(/([^:])\s*:\s+/g, '$1:');

  // Remove space after comma in value lists (but NOT inside calc/log functions)
  output = output.replace(/,\s+/g, ',');

  // Remove space before semicolons
  output = output.replace(/\s+;/g, ';');

  // Remove space before closing braces
  output = output.replace(/\s+}/g, '}');

  // Remove space after opening braces
  output = output.replace(/{\s+/g, '{');

  // Remove space before opening braces (after selector, preserving selectors like `a .b {`)
  output = output.replace(/\s+{/g, '{');

  // Remove spaces around > child combinator
  output = output.replace(/\s*>\s*/g, '>');

  // Remove spaces around + adjacent combinator
  output = output.replace(/\s*\+\s*/g, '+');

  // Remove spaces around ~ sibling combinator
  output = output.replace(/\s*~\s*/g, '~');

  // Remove space after !important
  output = output.replace(/!important\s/g, '!important');

  // Remove space after ! in non-important (unlikely but clean up)
  output = output.replace(/! /g, '!');

  // Remove empty rule blocks left over after stripping
  output = output.replace(/[^{}]*\{\}/g, '');

  // Restore protected clamp/calc math bodies verbatim (whitespace intact)
  output = output.replace(
    /\u0001(clamp|calc|min|max)\u0001\(\u0001(\d+)\u0001\)/g,
    (match, fn, index) => `${fn}(${mathBodies[Number(index)]})`,
  );

  // Final cleanup: leading/trailing spaces on each remaining token
  output = output.replace(/^ +| +$/gm, '');

  return output;
}

const root = fileURLToPath(new URL('..', import.meta.url));
const stylesDir = join(root, 'styles');
const outDir = join(stylesDir, 'bundled');

// --- Bundle definitions (order matters) ---

const bundles = {
  'core.css': [
    'tokens.css',
    'base.css',
    'shell.css',
  ],
  'components.css': [
    'artifacts.css',
    'witf-viewer.css',
    'responsive.css',
    'cards.css',
    'cursor.css',
    'reveal.css',
    'transitions.css',
    'parallax.css',
    'image-reveal.css',
    'image-slider.css',
    'lightbox.css',
    'skeleton.css',
    'project-index.css',
    'work-catalog.css',
    'radar.css',
    'timeline.css',
    'resume-timeline.css',
    'perspective-tilt.css',
  ],
  'pages.css': [
    'hero.css',
    'main.css',
    'case-studies.css',
    'blog.css',
    'contact.css',
    'code-annotate.css',
    'cast-player.css',
    'construction-gate.css',
  ],
};

// --- Validate that every CSS file in styles/ is assigned to exactly one bundle ---

const allStyleFiles = (await readdir(stylesDir)).filter((f) => f.endsWith('.css'));
const bundled = new Set(Object.values(bundles).flat());

const unassigned = allStyleFiles.filter((f) => !bundled.has(f));
if (unassigned.length > 0) {
  console.error(`Warning: CSS files not assigned to any bundle: ${unassigned.join(', ')}`);
}

const assigned = Object.values(bundles).flat();
const dupes = assigned.filter((f, i) => assigned.indexOf(f) !== i);
if (dupes.length > 0) {
  console.error(`Warning: CSS files assigned to multiple bundles: ${[...new Set(dupes)].join(', ')}`);
}

// --- Build bundles ---

await mkdir(outDir, { recursive: true });

// Remove any stale hashed bundles + unhashed legacy outputs from a prior run.
// Only files we own are touched — `manifest.json` itself is the only non-hash
// artefact under styles/bundled/, and it gets rewritten below.
for (const entry of await readdir(outDir)) {
  if (entry === 'manifest.json') continue;
  await rm(join(outDir, entry), { force: true });
}

const stats = [];
const manifest = {};

for (const [bundleName, files] of Object.entries(bundles)) {
  const parts = [];

  // Header comment
  const headerLines = [
    `/* ========================================`,
    ` * Bundle: ${bundleName}`,
    ` * Files:  ${files.length}`,
    ` * Generated by scripts/bundle-css.js`,
    ` * ======================================== */`,
    '',
  ];
  parts.push(headerLines.join('\n'));

  // Concatenate each file with a section comment
  for (const file of files) {
    const filePath = join(stylesDir, file);
    const relPath = relative(root, filePath);
    let content;
    try {
      content = await readFile(filePath, 'utf8');
    } catch {
      console.error(`  Skipping missing file: ${relPath}`);
      continue;
    }

    parts.push(`/* --- ${relPath} --- */`);
    parts.push(content.trimEnd());
    parts.push(''); // trailing newline between files
  }

  const rawContent = parts.join('\n');
  const bundleContent = minifyCss(rawContent);
  const hash = shortHash(bundleContent);
  const hashedFile = hashedName(bundleName, hash);
  const outPath = join(outDir, hashedFile);
  await writeFile(outPath, bundleContent);

  // Logical name -> hashed filename. `bundleName` is e.g. "core.css"; consumers
  // resolve `${prefix}/${manifest[bundleName]}` from this.
  manifest[bundleName] = hashedFile;

  const rawBytes = Buffer.byteLength(rawContent);
  const bytes = Buffer.byteLength(bundleContent);
  stats.push({ name: bundleName, hashedFile, files: files.length, bytes, rawBytes });
}

// Write the manifest. JSON, not hashed — vercel.json serves it
// `public, max-age=300, must-revalidate` so consumers see fresh hashed names
// after every deploy.
await writeFile(
  join(outDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);

// --- Report ---

console.log('\nCSS Bundle Results:');
console.log('─'.repeat(72));
for (const s of stats) {
  const kb = (s.bytes / 1024).toFixed(1);
  const rawKb = (s.rawBytes / 1024).toFixed(1);
  const savings = ((1 - s.bytes / s.rawBytes) * 100).toFixed(0);
  console.log(`  ${s.name.padEnd(20)} ${s.hashedFile.padEnd(28)} ${String(s.files).padStart(3)} files  ${kb.padStart(7)} KB  (was ${rawKb}, -${savings}%)`);
}
console.log('─'.repeat(72));
const totalBytes = stats.reduce((sum, s) => sum + s.bytes, 0);
const totalRawBytes = stats.reduce((sum, s) => sum + s.rawBytes, 0);
const totalFiles = stats.reduce((sum, s) => sum + s.files, 0);
const totalSavings = ((1 - totalBytes / totalRawBytes) * 100).toFixed(0);
console.log(`  ${'TOTAL'.padEnd(20)} ${''.padEnd(28)} ${String(totalFiles).padStart(3)} files  ${(totalBytes / 1024).toFixed(1).padStart(7)} KB  (was ${(totalRawBytes / 1024).toFixed(1)}, -${totalSavings}%)`);
console.log(`\nManifest written to ${join(outDir, 'manifest.json')}`);
console.log(`Bundles written to ${outDir}`);
