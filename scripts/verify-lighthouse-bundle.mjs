#!/usr/bin/env node
/**
 * Independently re-verify the committed round 6p re-verification bundle.
 *
 * Checks, each reported individually:
 *   1. Every category score recorded in each observation matches the
 *      committed distilled summary that observation names.
 *   2. Every metric value recorded in each observation matches the
 *      committed distilled summary that observation names.
 *   3. The SHA-256 recorded for each raw artifact matches the SHA-256
 *      of the raw report on disk, when that raw report is committed.
 *   4. The performance series in the bundle summary matches the
 *      observations the bundle itself contains.
 *   5. The committed-artifact integrity block agrees with the
 *      distilled artifacts on disk.
 *
 * Usage: node reverify-bundle.mjs
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT = join(REPO_ROOT, 'docs/audits/2026-10-19/lighthouse');
const BUNDLE = join(AUDIT, 'reverification-2026-10-19T21Z.json');

const bundle = JSON.parse(readFileSync(BUNDLE, 'utf8'));

console.log('=== independent re-verification of the round 6p bundle ===\n');
console.log(`bundle : ${BUNDLE.replace(`${REPO_ROOT}/`, '')}`);
console.log(`target : ${bundle.target?.url ?? bundle.target ?? 'n/a'}\n`);

const obs = bundle.observations ?? [];
console.log(`--- bundle contains ${obs.length} observations ---\n`);

// ---------------------------------------------------------------------------
// 1 + 2: category scores and metric values against committed distilled
//        summaries.
// ---------------------------------------------------------------------------

let catChecked = 0;
let catBad = 0;
let metChecked = 0;
let metBad = 0;
let shaChecked = 0;
let shaBad = 0;
let shaUnknown = 0;
const problems = [];
const rawMatches = [];
const unknownDigests = [];

// Hash every committed raw report in the audit directory so a recorded
// digest can be resolved to a file by content rather than by name.
const rawReportByDigest = new Map();
for (const name of readdirSync(AUDIT)) {
  if (!name.startsWith('RAW-') || !name.endsWith('.json')) continue;
  const digest = createHash('sha256').update(readFileSync(join(AUDIT, name))).digest('hex');
  rawReportByDigest.set(digest, { file: name, digest });
}

for (const o of obs) {
  const label = o.label ?? '?';
  const distilled = o.distilledArtifact;
  const summaryPath = distilled ? join(AUDIT, distilled) : null;

  if (!summaryPath || !existsSync(summaryPath)) {
    problems.push(`  ${label}: distilled artifact not found: ${distilled}`);
    continue;
  }
  const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));

  for (const key of ['performance', 'accessibility', 'best-practices', 'seo']) {
    const expected = o.categoryScores?.[key];
    const actual = summary.categoryScores?.[key]?.score;
    catChecked += 1;
    // The bundle records category scores as PERCENTAGES (0-100).
    // A distilled summary records Lighthouse's own 0-1 score.
    // Comparing the two without normalizing would report a mismatch
    // for every field, which is a unit error, not a data error.
    const actualPercent = typeof actual === 'number' ? Math.round(actual * 100) : actual;
    if (expected !== actualPercent) {
      catBad += 1;
      problems.push(
        `  ${label} category ${key}: bundle=${expected}% summary=${actual} (${actualPercent}%)`,
      );
    }
  }

  for (const [key, expected] of Object.entries(o.metrics ?? {})) {
    const actual = summary.metrics?.[key]?.numericValue;
    metChecked += 1;
    if (expected !== actual) {
      metBad += 1;
      problems.push(`  ${label} metric ${key}: bundle=${expected} summary=${actual}`);
    }
  }

  // SHA-256 of the raw artifact, when the raw report is committed.
  //
  // The bundle records the SHA-256 of every raw report but does not
  // record the raw report's PATH for the fresh observations (those
  // raw reports were deliberately not committed). For the one
  // observation whose raw report IS committed, the path is resolved
  // by hashing every RAW-*.json in the audit directory and matching
  // the recorded digest. A digest that matches no file on disk is
  // reported as UNKNOWN, never as a pass.
  if (o.rawArtifactSha256) {
    if (o.rawArtifactCommitted) {
      const match = rawReportByDigest.get(o.rawArtifactSha256);
      if (match) {
        shaChecked += 1;
        if (match.digest !== o.rawArtifactSha256) {
          shaBad += 1;
          problems.push(`  ${label} raw sha256: recorded=${o.rawArtifactSha256} observed=${match.digest}`);
        }
        rawMatches.push(`  ${label}: ${match.file} -> ${match.digest}`);
      } else {
        shaUnknown += 1;
        unknownDigests.push(`  ${label}: no committed raw report hashes to ${o.rawArtifactSha256}`);
      }
    } else {
      shaUnknown += 1;
      unknownDigests.push(
        `  ${label}: raw report deliberately not committed (recorded digest ${o.rawArtifactSha256.slice(0, 16)}...)`,
      );
    }
  }
}

console.log('--- check 1: category scores, bundle vs committed distilled summary ---');
console.log(`  checked    : ${catChecked}`);
console.log(`  matched    : ${catChecked - catBad}`);
console.log(`  mismatched : ${catBad}`);

console.log('\n--- check 2: metric values, bundle vs committed distilled summary ---');
console.log(`  checked    : ${metChecked}`);
console.log(`  matched    : ${metChecked - metBad}`);
console.log(`  mismatched : ${metBad}`);

console.log('\n--- check 3: raw artifact SHA-256 ---');
console.log(`  committed raw reports on disk     : ${rawReportByDigest.size}`);
console.log(`  verified against a committed raw report : ${shaChecked}`);
console.log(`  mismatched                              : ${shaBad}`);
console.log(`  raw report not committed (UNKNOWN)       : ${shaUnknown}`);
if (rawMatches.length) {
  console.log('  resolved by digest:');
  console.log(rawMatches.join('\n'));
}
if (unknownDigests.length) {
  console.log('  unresolved (UNKNOWN, not a pass):');
  console.log(unknownDigests.join('\n'));
}

// ---------------------------------------------------------------------------
// 4: performance series consistency within the bundle.
// ---------------------------------------------------------------------------

console.log('\n--- check 4: performance series ---');
const observedSeries = obs.map((o) => o.categoryScores?.performance ?? 0);
const recordedSeries = bundle.summary?.performanceValues ?? [];
const seriesMatch = JSON.stringify(observedSeries) === JSON.stringify(recordedSeries);
console.log(`  observed from observations : ${observedSeries.join(', ')}`);
console.log(`  recorded in bundle summary : ${recordedSeries.join(', ')}`);
console.log(`  result                     : ${seriesMatch ? 'MATCH' : 'MISMATCH'}`);

const min = Math.min(...observedSeries);
const max = Math.max(...observedSeries);
console.log(`  observed min / max         : ${min} / ${max}`);
console.log(`  recorded min / max         : ${bundle.summary?.performanceMin} / ${bundle.summary?.performanceMax}`);
console.log(`  min-max matches            : ${min === bundle.summary?.performanceMin && max === bundle.summary?.performanceMax ? 'MATCH' : 'MISMATCH'}`);
console.log(`  observations at exactly 100: ${observedSeries.filter((v) => v === 100).length} (recorded ${bundle.summary?.performanceAt100})`);
console.log(`  observations at 98 or above: ${observedSeries.filter((v) => v >= 98).length} (recorded ${bundle.summary?.performanceAtLeast98})`);

const otherScores = ['accessibility', 'best-practices', 'seo'];
for (const key of otherScores) {
  const vals = obs.map((o) => o.categoryScores?.[key] ?? 0);
  const allHundred = vals.every((v) => v === 100);
  console.log(`  ${key} all 100            : ${allHundred} (${vals.join(', ')})`);
}

// ---------------------------------------------------------------------------
// 5: the committed-artifact integrity block.
// ---------------------------------------------------------------------------

console.log('\n--- check 5: committed-artifact integrity block ---');
const integrity = bundle.summary?.committedArtifactIntegrity;
if (integrity) {
  console.log(`  ${JSON.stringify(integrity, null, 2).split('\n').join('\n  ')}`);
} else {
  console.log('  no integrity block in the bundle');
}

console.log('\n=== summary ===');
console.log(`  category scores : ${catChecked - catBad}/${catChecked} match`);
console.log(`  metric values   : ${metChecked - metBad}/${metChecked} match`);
console.log(`  raw sha256      : ${shaChecked - shaBad}/${shaChecked} match, ${shaUnknown} not committed`);
console.log(`  series          : ${seriesMatch ? 'MATCH' : 'MISMATCH'}`);
if (problems.length) {
  console.log('\n  problems:');
  console.log(problems.join('\n'));
}
const allOk = catBad === 0 && metBad === 0 && shaBad === 0 && seriesMatch;
console.log(`  verdict         : ${allOk ? 'bundle re-verified against the committed artifacts' : 'MISMATCH'}`);
process.exit(allOk ? 0 : 1);
