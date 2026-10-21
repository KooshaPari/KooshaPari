#!/usr/bin/env node
/**
 * sweep-lighthouse-claims.js — audit every tracked Markdown file for
 * Lighthouse score claims, and verify that each one carries a dated
 * correction or is explicitly adjudicated as a different run.
 *
 * Why this exists (2026-10-19, round 6q):
 *   Round 6p reported a "repository-wide stale-claim sweep" that found
 *   zero uncovered sites. That sweep searched ONE pattern family — the
 *   numeric form `100/100/100/100` — and so could not see the same
 *   falsified claim written in prose ("shows 100 across the four
 *   standard categories"). A completeness claim that cannot be re-run
 *   is the same failure mode it was meant to catch.
 *
 *   This script makes the sweep re-runnable and auditable:
 *   - it enumerates EVERY tracked .md file, not a hand-picked list
 *   - it matches BOTH numeric and prose forms
 *   - it requires a dated correction marker within N lines of each claim
 *   - it carries an explicit allowlist for claims about OTHER runs
 *     (historical local previews, earlier dates, different sites),
 *     each with a written reason
 *
 * Exit code 0 = every claim is annotated or adjudicated.
 * Exit code 1 = at least one uncovered claim.
 *
 * Usage: node scripts/sweep-lighthouse-claims.js [--json] [--window N]
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Numeric form: the exact four-category all-100 string. */
const NUMERIC_CLAIM = /100\s*\/\s*100\s*\/\s*100\s*\/\s*100/;

/**
 * Prose form: a Performance/perf score stated in a sentence, or a
 * generic "shows 100" / "scored 100". Deliberately broad — a claim in
 * prose is exactly what a numeric-only sweep misses.
 *
 * The verb forms matter. A pattern that matches only "shows 100"
 * silently misses "showed 100" and "scoring 100", which is how a
 * claim can survive a sweep that appears to pass. Every inflection
 * that can carry a score claim is listed.
 */
const PROSE_CLAIM =
  /\b(?:performance|perf)\b[^.!?]{0,80}?\b(?:100|99|95)\b|\bshow(?:s|ed|ing)?\s+100\b|\bscor(?:e|es|ed|ing)\s+100\b/i;

/**
 * A dated correction marker. Its presence within the annotation window
 * means the claim has been superseded and the correction is visible to
 * a reader who lands on that line.
 */
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

/**
 * Claims that are about a DIFFERENT run than the production
 * kooshapari-site batch of 2026-10-19. These are not stale — they
 * accurately record what their own batch measured, and rewriting them
 * would falsify history. Each carries a written reason.
 */
const ADJUDICATED_OTHER_RUNS = new Map([
  [
    'docs/sessions/20260916-phenodesign/PERF_AUDIT.md',
    '2026-09-16 local Vite preview (localhost:4197), Performance 72-96, a different site build',
  ],
  [
    'docs/sessions/20260915-deep-audit/00_AUDIT.md',
    '2026-09-15 deep audit, Performance 99, and it is about bot bypass rather than score stability',
  ],
  [
    'docs/sessions/20260915-deep-audit/01_PLAN.md',
    '2026-09-15 plan table restating the 2026-09-15 audit value of 99',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/output-audit/audit-report-2026-09-12.md',
    '2026-09-12 preview deployment, Performance 95, a different host and form factor',
  ],
  [
    'docs/sessions/2026-10-14-doc-proliferation-cleanup/LIGHTHOUSE_REPORT.md',
    '2026-08-29 placeholder that explicitly claims NO scores',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/08_RESUME_PROJECT_HANDOFF.md',
    'marks Lighthouse as NOT RUN; a status, not a score claim',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/04_ARC_CLOSING.md',
    'lists Lighthouse as a future step, not a score claim',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/05_ROUND5_OVERVIEW.md',
    'counts lighthouse JSON artifacts in output/, not a score claim',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/accessibility-report/ACCESSIBILITY_REPORT.md',
    'a future instruction to run axe/Lighthouse, not a score claim',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/audit-readiness/2026-09-05-portfolio-prompt-inventory.md',
    'records that historical Lighthouse reports held no scores',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/audit-readiness/2026-09-07-program-audit.md',
    'records that the Lighthouse baseline held no scores',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/audit-readiness/2026-09-07-requirement-traceability.md',
    'records that the Lighthouse baseline held no scores',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/migration-status/MIGRATION_STATUS.md',
    'lists Lighthouse as a pending pre-cutover step, not a score claim',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/portfolio-handoff/portfolio-implementation-handoff.md',
    'a forward-looking instruction to run Lighthouse, not a score claim',
  ],
  [
    'docs/sessions/2026-10-15-doc-proliferation-round-2/verification-report/VERIFICATION_REPORT.md',
    'lists Lighthouse as a pending verification step, not a score claim',
  ],
  [
    'docs/sessions/20260913-ui-ux-sprint/03_DAG_WBS.md',
    'an unchecked acceptance target (Performance >= 90), not an observation',
  ],
  [
    'docs/sessions/20261010-grader-adjudication/00_FINDINGS.md',
    'explains that a heading count differs between JS-on and JS-off, no score claim',
  ],
  [
    'docs/superpowers/plans/2026-09-01-technical-atelier-redesign.md',
    'a 2026-09-01 plan instructing a future Lighthouse run',
  ],
  [
    'docs/audits/2026-10-17/kooshapari.md',
    'a 2026-10-17 audit of a different local path, names Lighthouse as a future step',
  ],
]);

/**
 * An explicit, in-document annotation marking a claim that is QUOTED
 * in order to document or correct it, rather than asserted.
 *
 * Why an in-document marker rather than a list of phrases here:
 *   A list of distinctive substrings in this file is invisible to a
 *   reader of the document, has to be edited every time a round quotes
 *   the claim again, and — as the negative control in
 *   tests/sweep-lighthouse-claims.test.js proved — a phrase loose
 *   enough to cover a real quotation is also loose enough to excuse a
 *   genuine stale claim.
 *
 *   A marker in the document is auditable where the claim is, cannot
 *   excuse a claim that does not carry it, and cannot drift out of
 *   sync with the text it describes. The exemption is scoped to the
 *   paragraph that carries the marker, so a stale claim written
 *   elsewhere in the same file is still reported.
 */
const QUOTATION_ANNOTATION = '<!-- sweep:quotation -->';

function trackedMarkdownFiles(root = REPO_ROOT) {
  const out = execFileSync('git', ['ls-files', '-z', '*.md'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\0').filter(Boolean);
}

/**
 * A claim is exempt as a quotation when the block that contains it
 * carries the explicit QUOTATION_ANNOTATION marker.
 *
 * A block is a run of consecutive lines bounded by a blank line, a
 * quote-only line, a heading, or the start of a Markdown list item.
 * A list item is ONE block: its header line and its wrapped body
 * lines belong together, and the marker may sit in any of them.
 *
 * List items are separate blocks from one another, so a marker in one
 * bullet cannot excuse a claim in the next one — a leak that would
 * silently hide a genuine stale claim.
 */
function isQuotation(lines, index) {
  const start = blockStart(lines, index);
  const end = blockEnd(lines, index);

  return lines
    .slice(start, end + 1)
    .some((line) => line.includes(QUOTATION_ANNOTATION));
}

/**
 * The first line of the block containing `index`.
 *
 * A list-item header belongs to the block of its own body, so the
 * walk stops at the header and includes it.
 */
function blockStart(lines, index) {
  let start = index;
  while (start > 0) {
    const prev = lines[start - 1];
    if (isListItemStart(prev)) return start - 1;
    if (isBlockBoundary(prev)) break;
    start -= 1;
  }
  return start;
}

/**
 * The last line of the block containing `index`.
 */
function blockEnd(lines, index) {
  let end = index;
  while (end < lines.length - 1) {
    const next = lines[end + 1];
    if (isBlockBoundary(next) || isListItemStart(next)) break;
    end += 1;
  }
  return end;
}

function isBlockBoundary(line) {
  const trimmed = line.trim();
  if (trimmed === '' || trimmed === '>') return true;
  return /^#{1,6}\s/.test(trimmed);
}

function isListItemStart(line) {
  return /^([-*+]|\d+\.)\s/.test(line.trim());
}

function hasNearbyCorrection(lines, index, window) {
  const around = lines
    .slice(Math.max(0, index - window), index + window + 1)
    .join('\n');
  return CORRECTION_MARKERS.some((m) => around.includes(m));
}

/**
 * Collapse a Markdown line-wrapped passage into a single normalized
 * string so a claim split across a line break is still detected.
 *
 * This matters: the round 6p miss in the audit README reads
 *
 *     the **production** domains and shows 100 across the
 *     four standard categories.
 *
 * — the phrase "100 across the four standard categories" is split
 * across two lines. A purely per-line matcher cannot see it, which
 * is exactly how a per-line sweep would have missed the very claim
 * that a prose sweep was supposed to catch.
 *
 * Returns the normalized text together with a parallel array mapping
 * each normalized character back to the 0-based source line it came
 * from, so a match offset can be reported against the real file.
 */
function normalizeWithLineMap(lines) {
  let text = '';
  const lineOf = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (i > 0) {
      text += ' ';
      lineOf.push(i - 1);
    }
    const collapsed = lines[i].replace(/\s+/g, ' ').trim();
    text += collapsed;
    for (let c = 0; c < collapsed.length; c += 1) lineOf.push(i);
  }

  return { text: text.toLowerCase(), lineOf };
}

/**
 * Find every position in the normalized text where a claim appears,
 * and map it back to a line number.
 *
 * Both forms are matched against the whitespace-collapsed text, never
 * against a single line. A per-line numeric matcher has the same blind
 * spot as a per-line prose matcher: the four-category string
 * "100 / 100 / 100 / 100" hard-wrapped as "100 / 100 / 100" on one line
 * and "/ 100" on the next is a real claim that a per-line sweep cannot
 * see. The numeric form was the *only* form the round 6p sweep
 * searched, so this gap sat directly on the form that mattered most.
 */
function findClaimSpans(lines) {
  const spans = [];

  const { text: normalized, lineOf } = normalizeWithLineMap(lines);

  const numericRe = new RegExp(NUMERIC_CLAIM.source, 'g');
  let numericMatch = numericRe.exec(normalized);
  while (numericMatch) {
    const lineIndex = lineOf[numericMatch.index] ?? 0;
    spans.push({
      index: lineIndex,
      form: 'numeric',
      text: lines[lineIndex] ? lines[lineIndex].trim() : numericMatch[0],
    });
    numericMatch = numericRe.exec(normalized);
  }

  // Prose: scan the normalized text so wrapped claims are caught, then
  // map the normalized offset back to the source line it starts on.
  const proseRe = new RegExp(PROSE_CLAIM.source, 'gi');
  let match = proseRe.exec(normalized);
  while (match) {
    const lineIndex = lineOf[match.index] ?? 0;
    spans.push({
      index: lineIndex,
      form: 'prose',
      text: lines[lineIndex] ? lines[lineIndex].trim() : match[0],
    });
    match = proseRe.exec(normalized);
  }

  // De-duplicate by line + form, keeping the first occurrence.
  const seen = new Set();
  return spans.filter((s) => {
    const key = `${s.index}:${s.form}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sweep({ window = 14, root = REPO_ROOT } = {}) {
  const files = trackedMarkdownFiles(root);
  const claims = [];
  const uncovered = [];
  const adjudicated = [];

  for (const file of files) {
    let lines;
    try {
      lines = readFileSync(join(root, file), 'utf8').split('\n');
    } catch {
      continue;
    }

    for (const span of findClaimSpans(lines)) {
      const i = span.index;
      const text = span.text;
      const claim = {
        file,
        line: i + 1,
        text,
        form: span.form,
      };

      if (isQuotation(lines, i)) {
        claim.status = 'quotation';
        claim.reason = `quoted inside a correction, marked with ${QUOTATION_ANNOTATION}`;
        claims.push(claim);
        continue;
      }

      const adjudicatedReason = ADJUDICATED_OTHER_RUNS.get(file);
      if (adjudicatedReason) {
        claim.status = 'adjudicated';
        claim.reason = adjudicatedReason;
        adjudicated.push(claim);
        claims.push(claim);
        continue;
      }

      if (hasNearbyCorrection(lines, i, window)) {
        claim.status = 'annotated';
        claims.push(claim);
        continue;
      }

      claim.status = 'uncovered';
      claims.push(claim);
      uncovered.push(claim);
    }
  }

  return { claims, uncovered, adjudicated, fileCount: files.length, window };
}

function main() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');
  const windowIdx = argv.indexOf('--window');
  const window = windowIdx >= 0 ? Number(argv[windowIdx + 1]) : 14;

  const result = sweep({ window });
  const byStatus = result.claims.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  const byForm = result.claims.reduce((acc, c) => {
    acc[c.form] = (acc[c.form] || 0) + 1;
    return acc;
  }, {});

  // The canonical count block. Documentation states these numbers in
  // prose, and a stated number can drift from the measured one
  // without anything failing. `counts` is the single machine-readable
  // statement of the sweep's result; the documentation is checked
  // against it by tests/sweep-lighthouse-claims.test.js.
  const counts = {
    trackedMarkdownFiles: result.fileCount,
    claims: result.claims.length,
    annotated: byStatus.annotated || 0,
    adjudicated: byStatus.adjudicated || 0,
    quotation: byStatus.quotation || 0,
    uncovered: byStatus.uncovered || 0,
    proseForm: byForm.prose || 0,
    numericForm: byForm.numeric || 0,
    annotationWindowLines: result.window,
  };

  if (asJson) {
    process.stdout.write(
      `${JSON.stringify(
        {
          generatedAtUtc: new Date().toISOString(),
          trackedMarkdownFiles: result.fileCount,
          annotationWindowLines: result.window,
          counts,
          claims: result.claims,
          uncovered: result.uncovered,
        },
        null,
        2,
      )}\n`,
    );
  } else {
    process.stdout.write('Lighthouse claim sweep\n');
    process.stdout.write('='.repeat(64) + '\n');
    process.stdout.write(
      `Tracked Markdown files scanned : ${result.fileCount}\n`,
    );
    process.stdout.write(
      `Annotation window             : +/- ${result.window} lines\n`,
    );
    process.stdout.write(`Claims found                  : ${result.claims.length}\n`);
    for (const status of ['annotated', 'adjudicated', 'quotation', 'uncovered']) {
      process.stdout.write(
        `  ${status.padEnd(24)}: ${byStatus[status] || 0}\n`,
      );
    }
    process.stdout.write('='.repeat(64) + '\n');

    if (result.uncovered.length) {
      process.stdout.write('\nUNCOVERED claims:\n');
      for (const c of result.uncovered) {
        process.stdout.write(`  ${c.file}:${c.line} [${c.form}] ${c.text}\n`);
      }
    } else {
      process.stdout.write(
        '\nAll claims are annotated, adjudicated, or quotations.\n',
      );
    }
  }

  process.exit(result.uncovered.length ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith('sweep-lighthouse-claims.js')) {
  main();
}
