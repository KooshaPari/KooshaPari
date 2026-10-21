#!/usr/bin/env node
/**
 * A/B the round 6p sweep against the round 6q sweep on the SAME tree.
 *
 * Round 6p's sweep searched ONE pattern family — the numeric form
 * `100/100/100/100` — per line. Round 6q's script searches both the
 * numeric and prose forms against whitespace-collapsed text.
 *
 * This harness reconstructs the 6p method faithfully (same pattern,
 * same per-line scope, same "is there a dated correction nearby" test)
 * and runs it against the same tracked Markdown set the 6q script
 * enumerates. It then reports, per claim site, which sweep saw it.
 *
 * Usage: node ab-sweep.mjs
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(REPO_ROOT);

// ---------------------------------------------------------------------------
// Reconstruction of the round 6p sweep method.
//
// The 6q commit message states the method exactly: "the sweep searched
// one pattern family only — the numeric form `100/100/100/100`". The 6p
// round required "a dated correction" near each claim. Both properties
// are reproduced here without reference to the 6q script's internals.
// ---------------------------------------------------------------------------

/** The numeric form only. Same family the 6p sweep searched. */
const NUMERIC_CLAIM = /100\s*\/\s*100\s*\/\s*100\s*\/\s*100/;

/** Dated correction markers, as a 6p-style sweep would look for them. */
const CORRECTION_MARKERS = [
  'Corrected 2026-10-19',
  'Corrected in round 6q',
  'Re-verified 2026-10-19',
  'Re-verification (2026-10-19',
  'not reproducible',
  'not a stable property',
  'not** claimed as a stable',
  'not stable across batches',
  'The score is not stable',
  'as observed',
  'observed Performance',
  '52-100',
  'Performance 52-100',
];

const WINDOW = 14;

function trackedMarkdownFiles() {
  const out = execFileSync('git', ['ls-files', '-z', '*.md'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\0').filter(Boolean);
}

/**
 * The 6p-style sweep: per-line numeric match, annotated if a dated
 * correction marker appears within WINDOW lines.
 */
function sweep6p() {
  const files = trackedMarkdownFiles();
  const found = [];
  const uncovered = [];
  for (const file of files) {
    let lines;
    try {
      lines = readFileSync(file, 'utf8').split('\n');
    } catch {
      continue;
    }
    lines.forEach((line, i) => {
      if (!NUMERIC_CLAIM.test(line)) return;
      const around = lines.slice(Math.max(0, i - WINDOW), i + WINDOW + 1).join('\n');
      const annotated = CORRECTION_MARKERS.some((m) => around.includes(m));
      const site = { file, line: i + 1, text: line.trim(), annotated };
      found.push(site);
      if (!annotated) uncovered.push(site);
    });
  }
  return { found, uncovered, fileCount: files.length };
}

// ---------------------------------------------------------------------------
// Round 6q sweep, via its own committed script.
// ---------------------------------------------------------------------------

const q = JSON.parse(
  execFileSync('node', ['scripts/sweep-lighthouse-claims.js', '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  }),
);

console.log('=== A/B: round 6p sweep vs round 6q sweep, same tree ===\n');

const p = sweep6p();

console.log('--- coverage ---');
console.log(`  tracked Markdown files : p=${p.fileCount}  q=${q.trackedMarkdownFiles}`);
console.log(`  claim sites found      : p=${p.found.length}  q=${q.counts.claims}`);
console.log(`  p form breakdown       : numeric only (by construction)`);
console.log(`  q form breakdown       : numeric=${q.counts.numericForm} prose=${q.counts.proseForm}`);
console.log(`  q status breakdown     : annotated=${q.counts.annotated} adjudicated=${q.counts.adjudicated} quotation=${q.counts.quotation} uncovered=${q.counts.uncovered}`);
console.log(`  p uncovered            : ${p.uncovered.length}`);
console.log(`  q uncovered            : ${q.counts.uncovered}`);

// --- the decisive comparison: sites 6q saw that 6p could not ---
console.log('\n--- sites 6q detected that the 6p numeric-only sweep could NOT detect ---');
const pSeen = new Set(p.found.map((s) => `${s.file}:${s.line}`));
const qOnly = q.claims.filter((c) => !pSeen.has(`${c.file}:${c.line}`));
console.log(`  count: ${qOnly.length}`);
console.log(`  of which prose form: ${qOnly.filter((c) => c.form === 'prose').length}`);
console.log(`  of which numeric form (wrapped across lines, invisible per-line): ${qOnly.filter((c) => c.form === 'numeric').length}`);
console.log('');
for (const c of qOnly) {
  console.log(`  ${c.file}:${c.line} [${c.form}] status=${c.status}`);
  console.log(`      ${c.text.slice(0, 110)}`);
}

// --- the reverse direction ---
console.log('\n--- sites the 6p sweep saw that 6q did NOT report as a claim ---');
const qSeen = new Set(q.claims.map((c) => `${c.file}:${c.line}`));
const pOnly = p.found.filter((s) => !qSeen.has(`${s.file}:${s.line}`));
console.log(`  count: ${pOnly.length}`);
for (const s of pOnly) {
  console.log(`  ${s.file}:${s.line} annotated=${s.annotated}`);
  console.log(`      ${s.text.slice(0, 110)}`);
}

// --- negative control: does the 6p sweep miss a REAL stale claim? ---
console.log('\n--- negative control: inject an unannotated prose claim, see which sweep catches it ---');
const probe = 'docs/sessions/_ab_probe.md';
const probeBody = [
  '# Probe',
  '',
  'The production deployment shows 100 across the four standard categories.',
  '',
].join('\n');
const probeNumeric = [
  '# Probe',
  '',
  'The production deployment scores 100 / 100 / 100 / 100 across the board.',
  '',
].join('\n');

function runSweepScriptJson() {
  // The sweep exits 1 when it finds an uncovered claim. That is the
  // correct behaviour for a probe that plants a stale claim, so the
  // non-zero exit is expected and its stdout is still parsed.
  try {
    const stdout = execFileSync('node', ['scripts/sweep-lighthouse-claims.js', '--json'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    return JSON.parse(stdout);
  } catch (err) {
    if (err.stdout) return JSON.parse(err.stdout);
    throw err;
  }
}

const { writeFileSync, rmSync } = await import('node:fs');
function runWithProbe(body) {
  writeFileSync(probe, body);
  execFileSync('git', ['add', '-f', probe], { encoding: 'utf8' });
  try {
    const pRes = sweep6p();
    const qRes = runSweepScriptJson();
    return {
      pFound: pRes.found.filter((s) => s.file === probe).length,
      pUncovered: pRes.uncovered.filter((s) => s.file === probe).length,
      qFound: qRes.claims.filter((c) => c.file === probe).length,
      qUncovered: qRes.uncovered.filter((c) => c.file === probe).length,
    };
  } finally {
    rmSync(probe, { force: true });
    execFileSync('git', ['rm', '--cached', '-f', probe], { encoding: 'utf8' });
  }
}

const proseProbe = runWithProbe(probeBody);
console.log(`  prose claim "shows 100 across the four standard categories":`);
console.log(`    6p sweep: found=${proseProbe.pFound} uncovered=${proseProbe.pUncovered}`);
console.log(`    6q sweep: found=${proseProbe.qFound} uncovered=${proseProbe.qUncovered}`);

const numericProbe = runWithProbe(probeNumeric);
console.log(`  numeric claim "100 / 100 / 100 / 100" (single line):`);
console.log(`    6p sweep: found=${numericProbe.pFound} uncovered=${numericProbe.pUncovered}`);
console.log(`    6q sweep: found=${numericProbe.qFound} uncovered=${numericProbe.qUncovered}`);

// --- wrapped numeric probe ---
const wrappedProbe = [
  '# Probe',
  '',
  'The production deployment scores 100 / 100 / 100',
  '/ 100 across the board.',
  '',
].join('\n');
const wrappedRes = runWithProbe(wrappedProbe);
console.log(`  numeric claim hard-wrapped across two lines:`);
console.log(`    6p sweep: found=${wrappedRes.pFound} uncovered=${wrappedRes.pUncovered}`);
console.log(`    6q sweep: found=${wrappedRes.qFound} uncovered=${wrappedRes.qUncovered}`);

console.log('\n=== conclusion ===');
const saw = (n) => (n > 0 ? 'DETECTED' : 'MISSED');
console.log(`  prose claim  "shows 100 across the four standard categories":`);
console.log(`    6p numeric-only per-line sweep : ${saw(proseProbe.pFound)}`);
console.log(`    6q dual-form collapsed sweep   : ${saw(proseProbe.qFound)}`);
console.log(`  numeric claim "100 / 100 / 100 / 100" on one line:`);
console.log(`    6p numeric-only per-line sweep : ${saw(numericProbe.pFound)}`);
console.log(`    6q dual-form collapsed sweep   : ${saw(numericProbe.qFound)}`);
console.log(`  numeric claim hard-wrapped across two lines:`);
console.log(`    6p numeric-only per-line sweep : ${saw(wrappedRes.pFound)}`);
console.log(`    6q dual-form collapsed sweep   : ${saw(wrappedRes.qFound)}`);
console.log('');
console.log(`  real-tree coverage: 6p saw ${p.found.length} claim sites, 6q saw ${q.counts.claims}.`);
console.log(`  sites only 6q could see: ${qOnly.length} (${qOnly.filter((c) => c.form === 'prose').length} prose, ${qOnly.filter((c) => c.form === 'numeric').length} wrapped numeric).`);
console.log(`  sites only 6p could see: ${pOnly.length}.`);
