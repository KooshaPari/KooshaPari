/**
 * The patterns and constants that the stale-claim rules use.
 *
 * These are separated from the rules themselves because they are
 * DATA, and data is easier to argue about when it is in one place.
 * Every threshold in this file was measured against the real tree,
 * not guessed, and each one says so at its definition.
 */

/**
 * The historical markers: a commit SHA, an ISO date, or a named round.
 *
 * A SHA is matched in two forms. The backticked form (`` `6f9478f` ``)
 * is the unambiguous one. The bare form is needed because the prose
 * also writes SHAs without backticks — HUMAN_REVIEW.md line 439 reads
 * "ran the full test suite on both 63b6d03 and 12d51c8 and reported
 * 714/714 / 0 fail on each". The bare form must contain at least one
 * digit and one hex letter, which keeps ordinary words out: "feedback"
 * and "decade" are not matched, because neither contains a digit.
 *
 * This regex is used with `exec` in a loop, so it carries the `g` flag.
 * A non-global regex would return the same match forever.
 */
export const HISTORICAL_MARKER =
  /`[0-9a-f]{7,40}`|\b(?=[0-9a-f]*[a-f])(?=[0-9a-f]*\d)[0-9a-f]{7,40}\b|\b20\d{2}-\d{2}-\d{2}\b|\bround\s+6[a-z](?:-[a-z]+)?\b/gi;

/**
 * A bare commit SHA.
 */
export const BARE_SHA = /\b(?=[0-9a-f]*[a-f])(?=[0-9a-f]*\d)[0-9a-f]{7,40}\b/;

/**
 * The generic marker-proximity threshold, kept for callers that do not
 * distinguish same-clause from cross-clause markers.
 *
 * The threshold was set from the measured distances in this tree, not
 * guessed. Every figure in the tracked Markdown that is NOT the
 * measured count has its nearest marker at one of these distances:
 *
 *     11  STATE.md:53                  "774/774 at round 6p"
 *     11  docs/deploy/2026-10-19.md:43 "767/767 at round 6i"
 *     23  HUMAN_REVIEW.md:178          "carried forward from `6f9478f`"
 *     27  HUMAN_REVIEW.md:439          "711/711 ... at `02962d5`"
 *     38  docs/deploy/2026-10-19.md:43 "774/774 pass, 0 fail, 19s"
 *     42  HUMAN_REVIEW.md:439          "re-run 2026-10-14 at `184f71f`"
 *     54  HUMAN_REVIEW.md:132          "the same count as `184f71f`"
 *     72+ ... (the rest are further still)
 *
 * The largest gap in that distribution is between 54 and 114. A
 * threshold of 60 characters sits inside that gap, so it separates
 * the figures that carry a nearby qualifier from the figures that do
 * not.
 */
export const MARKER_PROXIMITY = 60;

/**
 * How close a marker must be to a figure to govern it, when the
 * marker is inside the figure's OWN CLAUSE.
 *
 * A marker in the same clause as the figure is about the figure. The
 * threshold here is tight because a same-clause marker is
 * unambiguous.
 *
 * The threshold was set from the measured distances in this tree. The
 * nearest same-clause marker to a non-measured figure is 11
 * characters away ("774/774 at round 6p"), and the next is 27
 * ("711/711 ... at `02962d5`"). Nothing in the tree places a
 * same-clause marker between 39 and 100 characters from a figure, so
 * 60 sits inside the gap.
 */
export const CLAUSE_PROXIMITY = 60;

/**
 * How close a marker must be to a figure to govern it, when the
 * marker is in a DIFFERENT clause.
 *
 * A marker in another clause is not necessarily about the figure.
 * The round 6r defect proves it. The defective paragraph read:
 *
 *     The post-20th-pass arc is closed: 13 commits pushed to
 *     `origin/main` (c1a13de through the round 6m close),
 *     all 5 items in the 06 doc are CLOSED/DECIDED, the unit
 *     suite is 774/774 PASS, and `HUMAN_REVIEW.md` carries
 *     the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,
 *     6h, 6i, 6i-correction, 6j, 6k, 6l, 6m).
 *
 * The "round 6m close" is 73 characters from the 774/774 figure. It
 * qualifies the COMMIT RANGE, not the test count. A rule that
 * accepts it would have missed the exact defect round 6r fixed.
 *
 * So a cross-clause marker must be CLOSE. The measured distance for
 * the cross-clause case in this tree is 79 (HUMAN_REVIEW.md:439,
 * where the preceding clause names `6f9478f` and `12d51c8`), and the
 * one that must NOT be accepted is 73. The gap between 73 and 79 is
 * too narrow to rest a threshold on, so the cross-clause rule
 * requires an ARCHIVAL PHRASE as well, which is how the repository's
 * prose actually signals inheritance.
 */
export const CROSS_CLAUSE_PROXIMITY = 40;

/**
 * A file that is itself a dated record.
 *
 * Three shapes count. A file under `docs/sessions/<date>-<name>/` is
 * a record OF THAT SESSION. A file named `docs/deploy/<date>.md` is
 * the record OF THAT DEPLOY. A file under `docs/audits/<date>/` is
 * the record OF THAT AUDIT. Every figure in each describes that
 * moment's state.
 */
export const SESSION_SCOPED = /^docs\/(?:sessions|audits)\//;

/**
 * A file that is a dated deploy record.
 */
export const DEPLOY_SCOPED = /^docs\/deploy\/\d{4}-\d{2}-\d{2}\.md$/;

/**
 * Archival phrases.
 *
 * These are the ways the repository's own prose marks a figure as a
 * record of a past observation. They are listed explicitly rather
 * than inferred from tense, because the prose is not uniform: the
 * same fact is written "was stated as", "was unchanged at", and
 * "when the paragraph was written" in three different places.
 *
 *   - "carried forward"      the count was not re-measured
 *   - "unchanged"            same reason, stated more tersely
 *   - "was stated as"        the sentence describes what a document
 *                            used to say
 *   - "when the paragraph was written"
 *                            the same, in the round 6r correction note
 *   - "re-measured"          the count was measured again, so the
 *                            figure belongs to that measurement
 *   - "the same count as"    the count is a copy of another
 *   - "previously" / "before"
 *                            the figure is compared against a later one
 */
export const ARCHIVAL_PHRASE =
  /\b(?:carried\s+forward|unchanged|was\s+stated\s+as|when\s+the\s+paragraph\s+was\s+written|re-?measured|the\s+same\s+count\s+as|previously|before)\b/i;

/**
 * Documents whose figures are read as claims about the present.
 *
 * `STATE.md` is the current-state document. `HUMAN_REVIEW.md` is the
 * round-by-round trail, whose round entries are historical by
 * construction; its closing summary is not.
 */
export const CURRENT_DOCUMENTS = new Set(['STATE.md', 'HUMAN_REVIEW.md']);

/**
 * A count written as "N/M".
 *
 * The lookarounds keep the match from starting or ending inside a
 * longer run of digits or slashes, so a byte count such as
 * "14377/4771/10110/12341 B" and a SHA fragment are not matched.
 */
export const COUNT_RE = /(?<![\d/])(\d{3,4})\s*\/\s*(\d{3,4})(?![\d/])/g;

/**
 * A count written as "N tests, N pass, N fail" or "N pass, N fail".
 *
 * The repository writes its suite figures both ways, and only the
 * fraction form was recognised. A count in this notation is a claim
 * about the same quantity as "N/M": the FIRST number is the total
 * suite size, which is what the scanner measures, and the second is
 * how many of them passed. The pair is normalised into the same
 * {num, den} shape as the fraction form, so the classifier that
 * decides current-versus-historical applies to both without change.
 *
 * The totals are three or four digits, matching COUNT_RE, so that
 * small per-file counts ("3 pass, 0 fail" in a test-name list) are
 * not treated as suite totals. The lookarounds keep the match from
 * starting inside a longer run of digits.
 */
export const COUNT_NOTATION_RE =
  /(?<![\d/])(\d{3,4})\s+tests?\s*,\s*(\d{3,4})\s+pass(?:ed|ing)?(?:\s*,\s*\d+\s+fail(?:ed|ing|ures?)?)?/g;

/**
 * Words that, near a figure, mark it as a count of TESTS.
 *
 * "pass" alone is not enough: "4 .md files, 14377/4771/10110/12341 B"
 * has no "pass", but "expect: 714/714 in 5.5s" does.
 */
export const UNIT_COUNT_CONTEXT =
  /\b(?:unit\s+suite|unit\s+tests?|test\s+suite|tests?\s+pass|tests?\s+run|suite\s+pass|pass(?:es|ed|ing)?\s+(?:across|in)\s+\d+|npm\s+test|tests?\b)/i;

/**
 * A HUMAN_REVIEW.md round entry: a blockquote paragraph whose first
 * line is "**Round 6x (date): title". Round 6c is not a blockquote.
 *
 * The letter run is not restricted to a single character, for the same
 * reason the scanner's round token is not: a round entry whose name has
 * two or more letters would otherwise be INVISIBLE to the check that
 * enumerates the entries, and an invisible entry cannot be detected as
 * missing from a completeness claim. The two forms must agree, or the
 * entry set and the claim set are drawn from different alphabets.
 */
export const ROUND_ENTRY = /^\s*(?:>\s*)?\*\*Round\s+(6[a-z]+(?:-[a-z]+)?)\s*\(/im;
