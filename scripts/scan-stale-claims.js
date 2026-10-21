#!/usr/bin/env node
/**
 * Round 6s: scan for SIBLING INSTANCES of the defect class that round 6r
 * corrected in STATE.md.
 *
 * The 6r defect was: a closing summary stated a count (774/774) that
 * had drifted from the measured value (787/787), and named rounds that
 * did not exist as entries. The correction was applied to one paragraph.
 * A correction to one paragraph does not establish that no other
 * paragraph carries the same defect.
 *
 * Two classes are checked:
 *
 *   CLASS A — a CURRENT unit-suite count asserted anywhere in the
 *             tracked Markdown that disagrees with the measured count.
 *             A figure that belongs to a dated round record is a
 *             historical observation, not a current claim, and the 6r
 *             correction explicitly required that those be annotated
 *             rather than rewritten.
 *
 *   CLASS B — a round named as a HUMAN_REVIEW.md round entry when no
 *             such entry exists.
 *
 * The measured count is MEASURED, not supplied. The scanner runs the
 * suite itself, in a child process that excludes the three
 * stale-claim test files, and counts the excluded files' own tests
 * from their source. The number the scanner uses is therefore the
 * number the suite reports.
 *
 * That is a deliberate constraint. Hardcoding the count would be the
 * defect the script exists to detect: a constant here is a second
 * place for the count to drift, and a count that drifts in the
 * scanner is indistinguishable from a count that drifts in a document.
 * Measuring it inside the test run is impossible for the same reason
 * — the scanner's own tests are part of the suite. So the measurement
 * is made by a process that is not part of the measured run.
 *
 * `--measured N` overrides the measurement. It exists for the case
 * where the caller has already measured the suite and does not want
 * it measured twice, and for the tests that need to check the
 * scanner against a specific count.
 *
 * Exit code 0 = no sibling instance found.
 * Exit code 1 = at least one sibling instance.
 * Exit code 2 = the script was invoked incorrectly.
 *
 * Usage: node scripts/scan-stale-claims.js [--measured N] [--json]
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  classifyCount,
  DEPLOY_SCOPED,
  fencedLineSet,
  regionAt,
  regionsOf,
  roundEntryRanges,
  SESSION_SCOPED,
  testCountFigures,
} from './stale-claim-rules.js';

import {
  claimsCompleteness,
  claimsRoundEntries,
  deniesExistence,
  listedRounds,
  paragraphsOf,
  ROUND_TOKEN,
} from './stale-claim-classes.js';

import { measureSuite, REPO_ROOT } from './stale-claim-measure.js';

/**
 * The measured unit-suite count.
 *
 * `--measured N` wins when it is present and valid. Otherwise the
 * suite is measured here, by a child run that excludes the
 * stale-claim test files.
 *
 * @returns {{count: number, source: string}}
 */
function resolveMeasured() {
  const index = process.argv.indexOf('--measured');
  if (index !== -1) {
    const parsed = Number(process.argv[index + 1]);
    if (Number.isInteger(parsed) && parsed > 0) {
      return { count: parsed, source: 'supplied with --measured' };
    }
    console.error(
      `scan-stale-claims: --measured must be a positive integer.\n` +
        `Received: ${process.argv[index + 1]}`,
    );
    process.exit(2);
  }

  try {
    const result = measureSuite();
    return {
      count: result.count,
      source: 'measured by running the suite',
    };
  } catch (err) {
    console.error(
      `scan-stale-claims: the suite could not be measured.\n${err.message}\n\n` +
        `Pass the count from a real run with --measured N to proceed.`,
    );
    process.exit(2);
  }
}

function trackedMarkdownFiles() {
  const out = execFileSync('git', ['ls-files', '-z', '*.md'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\0').filter(Boolean);
}

const { count: MEASURED, source: MEASURED_SOURCE } = resolveMeasured();

const findings = [];
const checks = [];

function record(kind, file, line, text, ok, note) {
  checks.push({ kind, file, line, ok });
  if (!ok) findings.push({ kind, file, line, text, note });
}

// ---------------------------------------------------------------------------
// CLASS A: a current unit-suite count that disagrees with the measured
//          count.
// ---------------------------------------------------------------------------

for (const file of trackedMarkdownFiles()) {
  let lines;
  try {
    lines = readFileSync(join(REPO_ROOT, file), 'utf8').split('\n');
  } catch {
    continue;
  }

  const regions = regionsOf(file, lines);
  const fenced = fencedLineSet(lines);

  lines.forEach((line, i) => {
    if (fenced.has(i)) return;

    const figures = testCountFigures(lines, i, MEASURED);
    if (!figures.length) return;

    for (const figure of figures) {
      const verdict = classifyCount({
        file,
        measured: MEASURED,
        lines,
        i,
        figure,
        allFigures: figures,
        regions,
      });

      record(
        'A-count',
        file,
        i + 1,
        figure.text,
        verdict.current,
        verdict.reason,
      );
    }
  });
}

// ---------------------------------------------------------------------------
// CLASS B: a round named as a HUMAN_REVIEW.md round entry when no such
//          entry exists.
//
// CLASS C: a COMPLETENESS claim over the round list whose list omits
//          a round that has a HUMAN_REVIEW.md entry.
//
// SCOPE. Both checks run over a PARAGRAPH, not a line.
//
// The round lists in this repository wrap across lines, so a
// LINE-scoped check examines two lines in the whole tree and finds no
// round token on either. It cannot report the round 6r defect it
// exists to detect. The paragraph scope is the scope the defect is
// written in.
//
// CLASS B asks whether every round NAMED in a list has an entry.
// CLASS C asks the other question: whether every entry is NAMED.
//
// The two are not the same check, and the difference is where the
// round 6r defect lived. Round 6r's list named two rounds that had no
// entry (6h, 6i-correction) and omitted four that did (6n, 6o, 6p,
// 6q). Class B catches the first half. Only Class C catches the
// second.
//
// Three shapes are EXEMPT from both, and each is checked against the
// whole paragraph rather than against a window around the token:
//
//   1. A paragraph that says the round does NOT exist. That is the
//      correction itself, not a defect.
//   2. A paragraph that is itself a dated record. A deploy receipt
//      from 2026-10-19 may say what it said on 2026-10-19.
//   3. A paragraph inside a HUMAN_REVIEW.md round entry. A round
//      entry is a dated record by construction.
//
// The predicates that decide whether a paragraph belongs to a class
// live in `stale-claim-classes.js`, with the round token itself.
//
// --------------------------------------------------------------------------

const humanReviewLines = readFileSync(join(REPO_ROOT, 'HUMAN_REVIEW.md'), 'utf8').split('\n');
const existingRounds = new Set(roundEntryRanges(humanReviewLines).map((e) => e.round));

for (const file of trackedMarkdownFiles()) {
  let lines;
  try {
    lines = readFileSync(join(REPO_ROOT, file), 'utf8').split('\n');
  } catch {
    continue;
  }

  // A dated record describes its own moment. Its round list is not a
  // claim about which entries exist now.
  const isDatedRecord =
    DEPLOY_SCOPED.test(file) || SESSION_SCOPED.test(file);

  // The regions of the file. A paragraph that lands inside a
  // historical region is a record, for the same reason Class A treats
  // it as one.
  const regions = regionsOf(file, lines);

  for (const paragraph of paragraphsOf(lines)) {
    const correcting = deniesExistence(paragraph.text);
    const region = regionAt(regions, paragraph.start);
    const historical = isDatedRecord || (region && region.historical);

    // ---- CLASS B -------------------------------------------------------
    if (claimsRoundEntries(paragraph.text)) {
      ROUND_TOKEN.lastIndex = 0;
      let m = ROUND_TOKEN.exec(paragraph.text);
      while (m) {
        const token = m[1].toLowerCase();
        const exists = existingRounds.has(token);

        if (exists) {
          record('B-round', file, paragraph.start + 1, token, true, 'the entry exists');
        } else if (correcting) {
          record(
            'B-round',
            file,
            paragraph.start + 1,
            token,
            true,
            'named inside a correction that denies it exists',
          );
        } else if (historical) {
          record(
            'B-round',
            file,
            paragraph.start + 1,
            token,
            true,
            'named inside a dated record, which describes its own moment',
          );
        } else {
          record(
            'B-round',
            file,
            paragraph.start + 1,
            token,
            false,
            'named as a HUMAN_REVIEW.md round entry, but no such entry exists',
          );
        }
        m = ROUND_TOKEN.exec(paragraph.text);
      }
    }

    // ---- CLASS C -------------------------------------------------------
    if (!claimsCompleteness(paragraph.text)) continue;
    if (correcting) continue;
    if (historical) continue;

    const listed = listedRounds(paragraph.text);
    if (!listed) continue;

    const named = new Set(listed);
    for (const round of existingRounds) {
      if (named.has(round)) continue;

      record(
        'C-missing',
        file,
        paragraph.start + 1,
        round,
        false,
        'the list claims to be complete but omits a round that has a HUMAN_REVIEW.md entry',
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const asJson = process.argv.includes('--json');

if (asJson) {
  process.stdout.write(
    `${JSON.stringify(
      {
        generatedAtUtc: new Date().toISOString(),
        measuredTestCount: MEASURED,
        measurementSource: MEASURED_SOURCE,
        humanReviewRoundEntries: [...existingRounds].sort(),
        checksRun: checks.length,
        findings,
      },
      null,
      2,
    )}\n`,
  );
} else {
  console.log('=== stale-claim sibling scan ===\n');
  console.log(`measured unit-suite count : ${MEASURED}`);
  console.log(`measurement source        : ${MEASURED_SOURCE}`);
  console.log(`HUMAN_REVIEW.md entries    : ${[...existingRounds].sort().join(', ')}`);
  console.log(`                           (${existingRounds.size} entries)`);
  console.log(`checks run                : ${checks.length}`);
  console.log(`findings                  : ${findings.length}\n`);
  for (const f of findings) {
    console.log(`  FINDING [${f.kind}] ${f.file}:${f.line}`);
    console.log(`    figure : ${f.text}`);
    console.log(`    reason : ${f.note}`);
  }
  if (!findings.length) {
    console.log('  No sibling instance of the round 6r defect class was found.');
  }
}

process.exit(findings.length ? 1 : 0);
