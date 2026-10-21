/**
 * The SCOPE of the text that governs a figure.
 *
 * A figure is bound to the text AROUND IT, not to its paragraph and
 * not to its document. Both of those were tried, and each is wrong in
 * a way that matters.
 *
 * PARAGRAPH scope is too coarse. `STATE.md` line 53 reads
 *
 *     - Unit suite: 787/787 PASS, 0 fail (774/774 at round 6p,
 *       +2 for the `runWarnings` field and +11 for the claim
 *       sweep, both added in round 6q).
 *
 * The 787/787 is a current claim. The 774/774 is a historical
 * observation. Both sit in one paragraph.
 *
 * SENTENCE scope is also too coarse, for the same reason: Markdown
 * wraps lines, and the wrapping point frequently falls between a
 * figure and the phrase that qualifies it. `HUMAN_REVIEW.md` line
 * 240 reads "714/714 across 73 files." as a complete sentence, while
 * the phrase that makes it historical — "Unit count re-measured at
 * 12d51c8" — sits three lines earlier, in the previous sentence.
 *
 * The scopes here, from coarsest to finest:
 *
 *   WINDOW  the figure's line, plus the lines that continue its
 *           clause, plus the lines that follow, cut at a blank line
 *           or a new list item.
 *
 *   CLAUSE  the window, cut at the nearest full stop or semicolon on
 *           either side, and at the neighbouring figures.
 *
 *   PRECEDING CLAUSE
 *           the clause immediately before the figure's own. A figure
 *           may inherit its measurement from the clause that
 *           introduces it.
 */

import { HISTORICAL_MARKER } from './stale-claim-patterns.js';

/**
 * The paragraph (blank-line delimited block) containing line `i`.
 */
export function paragraphOf(lines, i) {
  let start = i;
  while (start > 0 && lines[start - 1].trim() !== '') start -= 1;
  let end = i;
  while (end < lines.length - 1 && lines[end + 1].trim() !== '') end += 1;
  return { start, end, text: lines.slice(start, end + 1).join('\n') };
}

/**
 * The lines that fall inside a fenced code block.
 *
 * A figure in a fenced block is sample output or decorative ASCII, not
 * a claim about the repository's state. The radar-hero mockup in the
 * design-constitution skill is one such block.
 */
export function fencedLineSet(lines) {
  const inFence = new Set();
  let fence = null;
  lines.forEach((line, i) => {
    const m = /^\s*(`{3,}|~{3,})/.exec(line);
    if (m) {
      const marker = m[1][0];
      if (fence === null) {
        fence = marker;
      } else if (fence === marker) {
        fence = null;
      }
      inFence.add(i);
      return;
    }
    if (fence !== null) inFence.add(i);
  });
  return inFence;
}

/**
 * The nearest preceding section heading of line `i`, and the lines it
 * governs. A heading scope ends at the next heading of the same or
 * higher level.
 */
export function sectionOf(lines, i) {
  const headingRe = /^(#{1,6})\s/;
  let start = -1;
  let level = 0;
  let text = '';
  for (let j = i; j >= 0; j -= 1) {
    const m = headingRe.exec(lines[j]);
    if (m) {
      start = j;
      level = m[1].length;
      text = lines[j];
      break;
    }
  }
  if (start < 0) return null;
  let end = lines.length - 1;
  for (let j = start + 1; j < lines.length; j += 1) {
    const m = headingRe.exec(lines[j]);
    if (m && m[1].length <= level) {
      end = j - 1;
      break;
    }
  }
  return { start, end, text };
}

/**
 * The window of text around a figure.
 *
 * The window extends BACKWARD to the start of the figure's own line,
 * and to the preceding lines while they continue the same clause.
 * `HUMAN_REVIEW.md` line 132 reads "reports 714/714 pass across 73
 * test files —", and the clause that establishes it as historical
 * ("the unit count below is re-measured at this commit") is two lines
 * earlier.
 *
 * The window extends FORWARD to the end of the figure's line and the
 * lines that follow, cut at a blank line or a new list item.
 *
 * @param {string[]} lines
 * @param {number} i         the line index of the figure
 * @param {number} col       the character offset of the figure within
 *                           its line
 * @returns {{before: string, after: string}}
 */
export function governingText(lines, i, col) {
  const BACK = 3;
  const FORWARD = 3;

  // The backward extent: the start of the figure's own line, plus any
  // preceding lines that continue the same clause.
  let startLine = i;
  for (let j = i; j > 0 && i - j < BACK; j -= 1) {
    const prev = lines[j - 1].trim();
    if (prev === '' || /[.!?]\s*$/.test(prev) || /^([-*>|#]|\d+\.)\s/.test(prev)) break;
    startLine = j - 1;
  }

  // The forward extent: following lines, cut at the first boundary.
  const endLine = Math.min(lines.length - 1, i + FORWARD);
  let stopLine = endLine;
  for (let j = i + 1; j <= endLine; j += 1) {
    const line = lines[j];
    if (line.trim() === '') {
      stopLine = j - 1;
      break;
    }
    if (/^([-*>|#]|\d+\.)\s/.test(line.trim())) {
      stopLine = j - 1;
      break;
    }
  }

  const ownLine = lines[i];
  const before = [
    ...lines.slice(startLine, i),
    ownLine.slice(0, col),
  ].join('\n');
  const after = [
    ownLine.slice(col),
    ...lines.slice(i + 1, stopLine + 1),
  ].join('\n');

  return { before, after };
}

/**
 * The clause that governs a figure.
 *
 * A clause is a run of text bounded by a full stop, a semicolon, and
 * the neighbouring figures. Markdown wraps lines freely, so a clause
 * is found in the joined text of the governing window rather than in
 * any single line.
 *
 * A comma is NOT a bound, and neither is a colon. The prose
 * qualifies a figure with a comma more often than with a semicolon:
 * "714/714 pass across 73 test files, re-run 2026-10-14 at
 * `184f71f`" is one clause.
 *
 * @param {string[]} lines
 * @param {number} i
 * @param {object} figure  {num, den, text, col}
 * @param {Array} figures  every figure on line `i`
 * @returns {{before: string, after: string}}
 */
export function clauseText(lines, i, figure, figures) {
  const { before, after } = governingText(lines, i, figure.col);

  // The forward bound: the next figure on this line, or a clause
  // delimiter, whichever comes first.
  let afterCut = after;
  for (const other of figures) {
    if (other.col <= figure.col) continue;
    const rel = other.col - figure.col;
    if (rel < afterCut.length) afterCut = afterCut.slice(0, rel);
  }
  const fwd = /[.;]/.exec(afterCut);
  if (fwd) afterCut = afterCut.slice(0, fwd.index);

  // The backward bound: the previous figure on this line, or a clause
  // delimiter, whichever comes last.
  let beforeCut = before;
  for (const other of figures) {
    if (other.col >= figure.col) continue;
    const rel = other.col;
    if (rel > beforeCut.length - 1) continue;
    beforeCut = beforeCut.slice(0, rel);
  }
  const back = /[.;][^\n]*$/.exec(beforeCut);
  if (back) beforeCut = beforeCut.slice(0, back.index + 1);

  return { before: beforeCut, after: afterCut };
}

/**
 * The clause immediately before the figure's own clause.
 *
 * The repository writes "**re-measured 2026-10-15 at `c11e429` (the
 * 19th-pass commit) - same 714/714 across 73 files**, the
 * pre-commit hook ran the full test suite and reported 714/714 / 0
 * fail**" as two clauses: the first names the measurement, the
 * second reports the result. The second clause's figures inherit the
 * first clause's measurement.
 *
 * @param {string[]} lines
 * @param {number} i
 * @param {object} figure
 * @param {Array} figures
 * @returns {{before: string, after: string}|null}
 */
export function precedingClause(lines, i, figure, figures) {
  const { before } = governingText(lines, i, figure.col);

  // The text before the figure, cut at the last clause delimiter.
  const delim = /[.;][^\n]*$/.exec(before);
  if (!delim) return null;

  return { before: before.slice(delim.index + 1), after: '' };
}

/**
 * The distance in characters from a figure to the nearest historical
 * marker in its governing text.
 *
 * The distance is measured from the figure itself: backwards through
 * the text before it, forwards through the text after it. A marker
 * that appears on both sides is credited to the nearer one.
 *
 * @param {string} before
 * @param {string} after
 * @returns {number} the distance, or Infinity when no marker is present
 */
export function nearestMarkerDistance(before, after) {
  let best = Infinity;

  HISTORICAL_MARKER.lastIndex = 0;
  let m = HISTORICAL_MARKER.exec(before);
  while (m) {
    // The figure is at the end of `before`.
    best = Math.min(best, before.length - (m.index + m[0].length));
    m = HISTORICAL_MARKER.exec(before);
  }

  HISTORICAL_MARKER.lastIndex = 0;
  m = HISTORICAL_MARKER.exec(after);
  while (m) {
    best = Math.min(best, m.index);
    m = HISTORICAL_MARKER.exec(after);
  }

  return best;
}
