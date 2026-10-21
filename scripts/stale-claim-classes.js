/**
 * The CLASSES of stale claim the round 6s scanner checks, and the
 * predicates that decide whether a paragraph belongs to a class.
 *
 * These are separated from the scanner itself for the same reason the
 * rules are separated from the patterns: data and predicates are
 * easier to argue about when they are in one place, and they can be
 * tested without running a scan.
 *
 * The scanner in `scan-stale-claims.js` is the driver. This module
 * answers the questions the driver asks:
 *
 *   - Does this paragraph CLAIM that the rounds it names are
 *     `HUMAN_REVIEW.md` round entries?      (`claimsRoundEntries`)
 *   - Does this paragraph CLAIM that its list is the WHOLE set of
 *     round entries?                        (`claimsCompleteness`)
 *   - Does this paragraph say the round does NOT exist, which makes
 *     an absent round deliberate?           (`deniesExistence`)
 *   - Which rounds does this paragraph's list name? (`listedRounds`)
 *   - Which paragraphs are there in this file? (`paragraphsOf`)
 *
 * THE ROUND TOKEN. A round is "6" followed by one or more lowercase
 * letters, and optionally a hyphenated suffix: `6c`, `6i`,
 * `6i-correction`.
 *
 * The letter run is NOT restricted to a single character. An earlier
 * version of this regex was `6[a-z](?:-[a-z]+)?`, which matched every
 * real round in this tree but would have SILENTLY MISSED any round
 * whose name has two or more letters — `6zz`, `6abc`. A phantom
 * round of that shape would have been invisible to the check that
 * exists to catch phantom rounds.
 *
 * The measured cost of broadening it, over the tracked Markdown of
 * this tree, is four extra tokens, none of which is in a paragraph
 * that claims to be a round-entry list:
 *
 *     6dwdn    HUMAN_REVIEW.md:1004
 *     6px      docs/sessions/2026-10-12-constitution-reconciliation/
 *     6browser docs/sessions/2026-10-15-doc-proliferation-round-2/
 *     6vw      docs/sessions/20260919-site-overhaul/01_AUDIT.md:135
 *
 * The `(?<![\w.])` lookbehind keeps the token from starting inside a
 * longer run of word characters, and the `\b` keeps it from ending
 * inside one. Together they stop `3.6s` from being read as round
 * `6s`, which is the mistake the single-letter form made possible
 * when it was written without the lookbehind.
 */

/**
 * The round token. Global, so it must be reset before each use.
 */
export const ROUND_TOKEN = /(?<![\w.])\b(6[a-z]+(?:-[a-z]+)?)\b/g;

/**
 * The paragraphs of a file, as {start, end, text} records.
 *
 * A paragraph is a blank-line-delimited block. This is the scope the
 * round lists are written in: they wrap across lines, and only the
 * paragraph holds one whole.
 *
 * @param {string[]} lines
 * @returns {Array<{start: number, end: number, text: string}>}
 */
export function paragraphsOf(lines) {
  const paragraphs = [];
  let start = 0;
  for (let i = 0; i <= lines.length; i += 1) {
    if (i === lines.length || lines[i].trim() === '') {
      if (i > start) {
        paragraphs.push({
          start,
          end: i - 1,
          text: lines.slice(start, i).join('\n'),
        });
      }
      start = i + 1;
    }
  }
  return paragraphs;
}

/**
 * The rounds named by an enumerated list inside a paragraph.
 *
 * The paragraph may hold SEVERAL parenthesised groups. The round 6s
 * paragraph holds two:
 *
 *     `origin/main` (c1a13de through the round 6q close),
 *     ...
 *     the complete round-6 audit trail (6c, 6d, 6e, ...) — 14 round
 *     entries.
 *
 * The first is a COMMIT RANGE and the second is the ROUND LIST.
 * Taking the first group would read "c1a13de through the round 6q
 * close" as the list, find one token in it, and skip the paragraph
 * entirely — which is precisely the failure the completeness check
 * exists to catch. Every parenthesised group is therefore examined,
 * and the one that holds the most round tokens is the list.
 *
 * @param {string} text
 * @returns {string[]|null} the tokens, or null when there is no list.
 */
export function listedRounds(text) {
  const groups = [...text.matchAll(/\(([^)]*)\)/g)];
  if (!groups.length) return null;

  let best = null;
  for (const group of groups) {
    ROUND_TOKEN.lastIndex = 0;
    const tokens = group[1].match(ROUND_TOKEN);
    if (!tokens || tokens.length < 2) continue;
    if (!best || tokens.length > best.length) best = tokens;
  }

  if (!best) return null;
  return best.map((t) => t.toLowerCase());
}

/**
 * A paragraph that claims the named rounds are HUMAN_REVIEW.md round
 * entries.
 *
 * The predicate has two halves, and both are needed.
 *
 * The first half is that the paragraph names the file, or calls the
 * list an "audit trail". The second half is that the paragraph ASSERTS
 * that the named rounds are entries.
 *
 * The second half has three acceptable forms, and the third is the one
 * the round 6r defect used:
 *
 *   - the paragraph says "entry" / "entries" / "heading" / "headings";
 *   - the paragraph says "round entries" or "round headings";
 *   - the paragraph ENUMERATES the rounds inside a parenthesised list
 *     that follows the phrase "audit trail" or "round-6 audit trail".
 *
 * The third form is what the defect paragraph carried:
 *
 *     `HUMAN_REVIEW.md` carries
 *     the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,
 *     6h, 6i, 6i-correction, 6j, 6k, 6l, 6m).
 *
 * It never says "entries" on the same line as the list, and it never
 * says it at all in the defect paragraph. A predicate that required
 * the literal word would miss the defect it exists to detect, which is
 * the same failure the line scope had.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function claimsRoundEntries(text) {
  const namesReview = /HUMAN_REVIEW|audit trail/i.test(text);
  if (!namesReview) return false;

  if (/\b(?:entry|entries|heading|headings)\b/i.test(text)) return true;
  if (/\bround[-\s]+(?:entries?|headings?)\b/i.test(text)) return true;

  // An enumerated list of round tokens directly after the phrase. The
  // list must hold at least TWO tokens: a single bare "6x" next to
  // the word "audit trail" is a mention, not a list of entries.
  const enumerated = /(?:audit\s+trail|round-6\s+audit\s+trail)[^()]{0,40}\(([^)]*)\)/i.exec(
    text,
  );
  if (!enumerated) return false;

  ROUND_TOKEN.lastIndex = 0;
  const tokens = enumerated[1].match(ROUND_TOKEN);
  return Boolean(tokens && tokens.length >= 2);
}

/**
 * A paragraph that claims its list is the WHOLE set of round entries.
 *
 * The words that mark one are "complete", "the full", "all", "every",
 * and "the N round entries" — a count, which asserts completeness by
 * another route.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function claimsCompleteness(text) {
  if (!/HUMAN_REVIEW|audit trail/i.test(text)) return false;

  if (/\b(?:complete|full|entire|whole)\b/i.test(text)) return true;
  if (/\ball\s+\d+\s+round\b/i.test(text)) return true;
  if (/\b\d+\s+round\s+entr(?:y|ies)\b/i.test(text)) return true;

  return false;
}

/**
 * A paragraph that says the round does not exist.
 *
 * The check is a denial of EXISTENCE, and it is deliberately narrow: it
 * must not fire on a paragraph that merely lacks an entry. The two
 * documented corrections in this tree both use the phrase "has its own
 * heading" or "does not occur".
 *
 * @param {string} text
 * @returns {boolean}
 */
export function deniesExistence(text) {
  return /neither has its own|does not exist|not an entry|never existed|no such/i.test(
    text,
  );
}
