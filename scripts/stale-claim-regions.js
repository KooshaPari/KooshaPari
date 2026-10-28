/**
 * The regions of a file, and whether each is a CURRENT claim or a
 * HISTORICAL observation.
 *
 * This module is STAGE 1 of the scanner's decision. It answers one
 * question: which lines of a document are a record of a past
 * observation, and which are claims about the present? A figure in a
 * historical region is preserved rather than rewritten.
 *
 * The stage that follows — judging a figure within its region by the
 * text that governs it — lives in `stale-claim-rules.js`, together
 * with the patterns the decision uses (`stale-claim-patterns.js`) and
 * the text it reads (`stale-claim-scope.js`).
 *
 * The rule this stage implements is the one round 6r applied by hand:
 * a dated round entry keeps the count it reported when it ran.
 */

import {
  CURRENT_DOCUMENTS,
  DEPLOY_SCOPED,
  ROUND_ENTRY,
  SESSION_SCOPED,
} from './stale-claim-patterns.js';

/**
 * The line ranges occupied by HUMAN_REVIEW.md round entries, and the
 * round tokens.
 *
 * A round entry opens on a line that reads "**Round 6x (date): title"
 * and runs until the blockquote ends. Round 6c is not a blockquote;
 * the pattern allows for that.
 *
 * @param {string[]} lines
 * @returns {Array<{round: string, start: number, end: number}>}
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
