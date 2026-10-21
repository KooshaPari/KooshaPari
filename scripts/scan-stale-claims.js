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
 * The measured count is a REQUIRED INPUT, not something this script
 * computes. It is passed with --measured, and the caller is expected
 * to have measured it from a real test run.
 *
 * That is a deliberate constraint. This script runs inside the unit
 * suite's own gate, and the unit suite is what produces the count. If
 * the script spawned the suite to measure the count, the suite would
 * spawn the script, which would spawn the suite. The measurement is
 * made once, by whoever runs the gate, and handed in.
 *
 * The alternative — hardcoding the count — is the defect the script
 * exists to detect. Round 6r's failure was exactly a count that had
 * drifted from its measurement. A constant here would be a second
 * place to forget to update.
 *
 * Exit code 0 = no sibling instance found.
 * Exit code 1 = at least one sibling instance.
 * Exit code 2 = the script was invoked incorrectly.
 *
 * Usage: node scripts/scan-stale-claims.js --measured 787 [--json]
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The measured unit-suite count, read from --measured.
 *
 * @returns {number|null} the count, or null when it was not supplied.
 */
function readMeasured() {
  const index = process.argv.indexOf('--measured');
  if (index === -1) return null;
  const parsed = Number(process.argv[index + 1]);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function trackedMarkdownFiles() {
  const out = execFileSync('git', ['ls-files', '-z', '*.md'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\0').filter(Boolean);
}

const MEASURED = readMeasured();

if (MEASURED === null) {
  console.error(
    'scan-stale-claims: --measured <N> is required.\n' +
      'The count must come from a real test run. Pass the number the run reported.\n' +
      'The scanner will not guess, and it will not hardcode one: a constant here\n' +
      'would be a second place for the count to drift, which is the defect this\n' +
      'script exists to detect.',
  );
  process.exit(2);
}

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
// The round lists in this repository wrap across lines. `STATE.md`
// reads
//
//     the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,
//     6i, 6j, 6k, 6l, 6m, 6n, 6o, 6p, 6q) — 14 round
//     entries.
//
// A LINE-scoped check reads neither list correctly: the tokens are
// split across two lines, and neither line carries both the
// "HUMAN_REVIEW" marker and the round token. A line-scoped check
// therefore examines two lines in the whole tree and finds no round
// token on either — it cannot report the round 6r defect it exists
// to detect. The paragraph scope is the scope the defect is written
// in.
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
//      correction itself, not a defect. `STATE.md` and
//      `HUMAN_REVIEW.md` both carry such a paragraph for 6h and
//      6i-correction.
//
//   2. A paragraph that is itself a dated record. A deploy receipt
//      from 2026-10-19 may say what it said on 2026-10-19.
//
//   3. A paragraph inside a HUMAN_REVIEW.md round entry. A round
//      entry is a dated record by construction: the round 6o entry
//      names 6h and 6i-correction because it is describing the
//      history that preceded it. This is the SAME region model Class
//      A uses, and it is applied for the same reason: a round entry
//      is a record of a moment, not a claim about the present.
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
