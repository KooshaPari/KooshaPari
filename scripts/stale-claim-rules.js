/**
 * The rules that decide whether a count in the repository's prose is
 * a CURRENT claim or a HISTORICAL observation.
 *
 * This module is the decision logic. The data it decides with lives in
 * `stale-claim-patterns.js`, and the text it reads lives in
 * `stale-claim-scope.js`.
 *
 * The decision has two stages.
 *
 * STAGE 1 — THE REGION. A figure in a historical region is a record
 * of a past observation, and is preserved rather than rewritten. This
 * is the rule round 6r applied by hand: a dated round entry keeps the
 * count it reported when it ran.
 *
 * STAGE 2 — THE CLAUSE. A figure in a current region is judged by the
 * text that actually talks about it. If that text names the round,
 * commit, or date at which the figure was measured, the figure is a
 * historical observation even though it sits in a current region.
 *
 * Stage 2 exists because `STATE.md` line 53 reads:
 *
 *     - Unit suite: 787/787 PASS, 0 fail (774/774 at round 6p,
 *       +2 for the `runWarnings` field and +11 for the claim
 *       sweep, both added in round 6q).
 *
 * The 787/787 is a current claim. The 774/774 is a historical
 * observation. They share a paragraph.
 */

import {
  ARCHIVAL_PHRASE,
  CLAUSE_PROXIMITY,
  COUNT_RE,
  CROSS_CLAUSE_PROXIMITY,
  CURRENT_DOCUMENTS,
  DEPLOY_SCOPED,
  ROUND_ENTRY,
  SESSION_SCOPED,
  UNIT_COUNT_CONTEXT,
} from './stale-claim-patterns.js';

import {
  clauseText,
  nearestMarkerDistance,
  precedingClause,
} from './stale-claim-scope.js';

export {
  ARCHIVAL_PHRASE,
  BARE_SHA,
  CLAUSE_PROXIMITY,
  COUNT_RE,
  CROSS_CLAUSE_PROXIMITY,
  CURRENT_DOCUMENTS,
  DEPLOY_SCOPED,
  HISTORICAL_MARKER,
  MARKER_PROXIMITY,
  ROUND_ENTRY,
  SESSION_SCOPED,
  UNIT_COUNT_CONTEXT,
} from './stale-claim-patterns.js';

export {
  clauseText,
  fencedLineSet,
  governingText,
  nearestMarkerDistance,
  paragraphOf,
  precedingClause,
  sectionOf,
} from './stale-claim-scope.js';

/**
 * The line ranges occupied by HUMAN_REVIEW.md round entries, and the
 * round tokens.
 *
 * A round entry opens on a line that reads "**Round 6x (date): title"
 * and runs until the blockquote ends. Round 6c is not a blockquote;
 * the pattern allows for that.
 */
export function roundEntryRanges(lines) {
  const entries = [];
  let current = null;

  lines.forEach((line, i) => {
    const m = ROUND_ENTRY.exec(line);
    if (m) {
      if (current) current.end = i - 1;
      current = { round: m[1].toLowerCase(), start: i, end: lines.length - 1 };
      entries.push(current);
      return;
    }
    // A round entry block ends at the first blank line that is not
    // inside the blockquote.
    if (current && line.trim() === '' && !line.startsWith('>')) {
      current.end = i - 1;
      current = null;
    }
  });

  return entries;
}

/**
 * The current and historical regions of a file.
 *
 * A region is historical when it is a dated session record, a dated
 * deploy record, a dated audit, or a dated round entry in
 * `HUMAN_REVIEW.md`. Everything else is current.
 *
 * @param {string} file
 * @param {string[]} lines
 * @returns {Array<{start: number, end: number, historical: boolean, reason: string}>}
 */
export function regionsOf(file, lines) {
  const regions = [];

  if (SESSION_SCOPED.test(file) && !CURRENT_DOCUMENTS.has(file)) {
    regions.push({
      start: 0,
      end: lines.length - 1,
      historical: true,
      reason: 'the file is a dated record',
    });
    return regions;
  }

  if (DEPLOY_SCOPED.test(file) && !CURRENT_DOCUMENTS.has(file)) {
    regions.push({
      start: 0,
      end: lines.length - 1,
      historical: true,
      reason: 'the file is a dated deploy record',
    });
    return regions;
  }

  if (file !== 'HUMAN_REVIEW.md') {
    regions.push({
      start: 0,
      end: lines.length - 1,
      historical: false,
      reason: 'the file is a current document',
    });
    return regions;
  }

  // HUMAN_REVIEW.md: the round trail begins at the first round entry
  // and runs to the end. Everything before it is the current region.
  const entries = roundEntryRanges(lines);
  if (!entries.length) {
    regions.push({
      start: 0,
      end: lines.length - 1,
      historical: false,
      reason: 'the file has no round entries',
    });
    return regions;
  }

  const first = entries.reduce((a, b) => (a.start <= b.start ? a : b));
  regions.push({
    start: 0,
    end: first.start - 1,
    historical: false,
    reason: 'the current summary region, before the round trail',
  });

  // Each round entry is its own historical region.
  for (const entry of entries) {
    regions.push({
      start: entry.start,
      end: entry.end,
      historical: true,
      reason: `a dated round entry (round ${entry.round})`,
    });
  }

  return regions;
}

/**
 * The region containing line `i`.
 *
 * @param {Array} regions
 * @param {number} i
 * @returns {object|null}
 */
export function regionAt(regions, i) {
  for (const region of regions) {
    if (i >= region.start && i <= region.end) return region;
  }
  return null;
}

/**
 * The test-count figures on line `i`.
 *
 * A line can carry more than one figure, so every match on the line is
 * returned. Two conditions gate each one. The words around it must
 * mark it as a test count, and the figure must be in scope: either a
 * passing count with equal halves, or a figure that names the measured
 * count on one side, which is how a partially-failing suite is written
 * ("780/787").
 *
 * @param {string[]} lines
 * @param {number} i
 * @param {number} measured
 * @returns {Array<{num: number, den: number, text: string, col: number}>}
 */
export function testCountFigures(lines, i, measured) {
  const line = lines[i];
  const looksLikeTests = UNIT_COUNT_CONTEXT.test(
    lines.slice(Math.max(0, i - 2), i + 3).join(' '),
  );
  if (!looksLikeTests) return [];

  const found = [];
  COUNT_RE.lastIndex = 0;
  let m = COUNT_RE.exec(line);
  while (m) {
    const num = Number(m[1]);
    const den = Number(m[2]);
    if (num === den || num === measured || den === measured) {
      found.push({ num, den, text: `${m[1]}/${m[2]}`, col: m.index });
    }
    m = COUNT_RE.exec(line);
  }
  return found;
}

/**
 * Decide whether a figure is a current claim or a historical record.
 *
 * The verdict is `{current: boolean, reason: string}`. A figure is
 * `current: false` when it is asserted as the present state but
 * disagrees with the measured count and carries no dated annotation.
 *
 * @param {object} args
 * @param {string} args.file       the file's repository-relative path
 * @param {number} args.measured   the measured unit-suite count
 * @param {string[]} args.lines    the file's lines
 * @param {number} args.i          the zero-based line index of the figure
 * @param {object} args.figure     {num, den, text, col} for the figure
 * @param {Array}  args.allFigures every figure on the same line
 * @param {Array}  args.regions    the current/historical regions
 * @returns {{current: boolean, reason: string}}
 */
export function classifyCount({
  file,
  measured,
  lines,
  i,
  figure,
  allFigures,
  regions,
}) {
  const { num, den } = figure;

  if (num === measured && den === measured) {
    return { current: true, reason: 'matches the measured count' };
  }

  const region = regionAt(regions ?? [], i);
  if (region && region.historical) {
    return {
      current: true,
      reason: `${region.reason}: a historical observation`,
    };
  }

  // The governing text is the clause that actually talks about this
  // figure.
  const { before, after } = clauseText(lines, i, figure, allFigures ?? [figure]);
  const clause = `${before}\n${after}`;

  // An archival phrase marks the clause as a record of a past
  // observation, whether or not it also names a round or a commit.
  if (ARCHIVAL_PHRASE.test(clause)) {
    return {
      current: true,
      reason: 'the clause governing this figure marks it as a past observation',
    };
  }

  // The distance from the figure to the nearest marker, measured in
  // characters within the governing clause.
  const distance = nearestMarkerDistance(before, after);

  if (distance <= CLAUSE_PROXIMITY) {
    return {
      current: true,
      reason: `the clause governing this figure names the round, commit, or date it was measured at (${distance} characters away)`,
    };
  }

  // The qualifier may sit in the clause BEFORE this one. The
  // repository writes "**re-measured 2026-10-15 at `c11e429` (the
  // 19th-pass commit) - same 714/714 across 73 files**, the
  // pre-commit hook ran the full test suite and reported 714/714 / 0
  // fail**" as two clauses: the first names the measurement, the
  // second reports the result. The second clause's figures inherit
  // the first clause's measurement.
  //
  // A cross-clause marker alone is NOT enough. The round 6r defect
  // is the proof: its "round 6m close" sat 73 characters from the
  // 774/774 figure and qualified the COMMIT RANGE, not the test
  // count. The cross-clause rule therefore requires an ARCHIVAL
  // PHRASE, which is how the prose actually signals inheritance.
  const preceding = precedingClause(lines, i, figure, allFigures ?? [figure]);
  if (preceding) {
    const precedingText = `${preceding.before}\n${preceding.after}`;
    if (ARCHIVAL_PHRASE.test(precedingText)) {
      return {
        current: true,
        reason: 'the preceding clause marks this figure as a past observation',
      };
    }
    const precedingDistance = nearestMarkerDistance(preceding.before, preceding.after);
    if (precedingDistance <= CROSS_CLAUSE_PROXIMITY) {
      return {
        current: true,
        reason: `the preceding clause names the round, commit, or date this figure was measured at (${precedingDistance} characters away)`,
      };
    }
  }

  return {
    current: false,
    reason:
      'asserted as current but differs from the measured count and carries no dated annotation',
  };
}
