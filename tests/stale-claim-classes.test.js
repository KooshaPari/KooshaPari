/**
 * The CLASS predicates, and the Class C check, as unit tests.
 *
 * These live in their own file rather than in `stale-claim-scan.test.js`
 * for the same reason the predicates live in `stale-claim-classes.js`:
 * the file was already at 590 lines, over the 500-line hard limit, and
 * a concern that has its own file is easier to find than a concern
 * that has to be hunted for inside a long one.
 *
 * The concern here is CLASS C — the completeness check — and the
 * predicates it depends on.
 *
 * WHAT CLASS C IS. Class B asks whether every round NAMED in a list
 * has a `HUMAN_REVIEW.md` entry. Class C asks the other question:
 * whether every entry is NAMED.
 *
 * The two are not the same check, and the difference is where the
 * round 6r defect lived. Round 6r's list named two rounds that had no
 * entry (6h, 6i-correction) and omitted four that did (6n, 6o, 6p,
 * 6q). Class B catches the first half. Only Class C catches the
 * second.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  claimsCompleteness,
  claimsRoundEntries,
  deniesExistence,
  listedRounds,
  paragraphsOf,
  ROUND_TOKEN,
} from '../scripts/stale-claim-classes.js';

// ---------------------------------------------------------------------------
// 1. The round token.
// ---------------------------------------------------------------------------

test('the round token accepts a single letter', () => {
  ROUND_TOKEN.lastIndex = 0;
  assert.deepEqual('6c'.match(ROUND_TOKEN), ['6c']);
});

test('the round token accepts a multi-letter round name', () => {
  // This is the defect that was fixed. The earlier token was
  // `6[a-z]`, which matched every real round in this tree but would
  // have silently missed any round whose name has two or more
  // letters. A phantom round of that shape would have been invisible
  // to the one check that exists to catch phantom rounds.
  for (const token of ['6zz', '6abc', '6ii']) {
    ROUND_TOKEN.lastIndex = 0;
    assert.deepEqual(token.match(ROUND_TOKEN), [token], `${token} must be a round token`);
  }
});

test('the round token accepts a hyphenated suffix', () => {
  ROUND_TOKEN.lastIndex = 0;
  assert.deepEqual('6i-correction'.match(ROUND_TOKEN), ['6i-correction']);
});

test('the round token does not match inside a dotted number', () => {
  // `3.6s` is a version, not round `6s`.
  ROUND_TOKEN.lastIndex = 0;
  assert.equal('3.6s'.match(ROUND_TOKEN), null);
});

test('the round token does not match inside a word', () => {
  // The token must not START inside a longer run of word characters.
  // The lookbehind is what enforces this.
  for (const text of ['x6c', 'a6bc']) {
    ROUND_TOKEN.lastIndex = 0;
    assert.equal(text.match(ROUND_TOKEN), null, `${text} must not hold a round token`);
  }
});

test('the round token matches a whole multi-letter run', () => {
  // The converse of the test above, and the deliberate consequence
  // of broadening the letter run. `6cat` is now a three-letter round
  // token, not a `6c` followed by stray text. That is the same change
  // that makes `6zz` visible, and it is why the broadening was
  // measured against the real tree before it was adopted: the cost
  // was four extra tokens, none of them in a round-entry list.
  ROUND_TOKEN.lastIndex = 0;
  assert.deepEqual('6cat'.match(ROUND_TOKEN), ['6cat']);
});

test('the round token is lowercase only', () => {
  // Round names in this repository are lowercase. An uppercase token
  // is not a round, and treating it as one would be a false positive.
  for (const text of ['6C', '6D', '6C, 6D']) {
    ROUND_TOKEN.lastIndex = 0;
    assert.equal(text.match(ROUND_TOKEN), null, `${text} must not hold a round token`);
  }
});

// ---------------------------------------------------------------------------
// 2. Paragraph scope.
// ---------------------------------------------------------------------------

test('paragraphsOf splits on blank lines', () => {
  const paragraphs = paragraphsOf(['one', 'two', '', 'three', '']);
  assert.equal(paragraphs.length, 2);
  assert.equal(paragraphs[0].text, 'one\ntwo');
  assert.equal(paragraphs[0].start, 0);
  assert.equal(paragraphs[0].end, 1);
  assert.equal(paragraphs[1].text, 'three');
  assert.equal(paragraphs[1].start, 3);
});

test('paragraphsOf keeps a wrapped list in one paragraph', () => {
  // The defect's list wraps across two lines. A line scope would
  // split it and see no list at all.
  const lines = [
    'the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,',
    '6h, 6i, 6i-correction, 6j, 6k, 6l, 6m).',
  ];
  const paragraphs = paragraphsOf(lines);
  assert.equal(paragraphs.length, 1);
  assert.equal(paragraphs[0].text, lines.join('\n'));
});

// ---------------------------------------------------------------------------
// 3. listedRounds — the multiple-parenthesised-group defect.
// ---------------------------------------------------------------------------

test('listedRounds reads the round list, not the commit range', () => {
  // This is the second defect that was fixed. The paragraph holds TWO
  // parenthesised groups: a commit range and the round list. Taking
  // the first group would read "c1a13de through the round 6q close"
  // as the list, find one token in it, and skip the paragraph
  // entirely — which is precisely the failure Class C exists to
  // catch.
  const text = `The post-20th-pass arc is closed: 17 commits pushed to
\`origin/main\` (c1a13de through the round 6q close),
all 5 items in the 06 doc are CLOSED/DECIDED, the unit
suite is 787/787 PASS, and \`HUMAN_REVIEW.md\` carries
the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,
6i, 6j, 6k, 6l, 6m, 6n, 6o, 6p, 6q) — 14 round
entries.`;

  assert.deepEqual(listedRounds(text), [
    '6c', '6d', '6e', '6f', '6g', '6i', '6j', '6k', '6l', '6m', '6n', '6o', '6p', '6q',
  ]);
});

test('listedRounds returns null when there is no list', () => {
  assert.equal(listedRounds('a paragraph with no parentheses'), null);
  assert.equal(listedRounds('a paragraph with (one token 6c)'), null);
});

test('listedRounds returns the tokens in lower case', () => {
  // The token is lowercase-only, so this is a defensive normalisation
  // rather than a transformation that fires on real input. It is
  // asserted because the round entries in `HUMAN_REVIEW.md` are
  // compared against the tokens as a set, and a case difference
  // between the two would silently drop an entry.
  assert.deepEqual(listedRounds('trail (6c, 6d)'), ['6c', '6d']);
});

// ---------------------------------------------------------------------------
// 4. The predicates.
// ---------------------------------------------------------------------------

test('claimsRoundEntries accepts an enumerated audit trail', () => {
  // This is the form the round 6r defect used. It never says
  // "entries" on the same line as the list — in the defect paragraph
  // it never says it at all. A predicate that required the literal
  // word would miss the defect it exists to detect.
  const text = `\`HUMAN_REVIEW.md\` carries
the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,
6h, 6i, 6i-correction, 6j, 6k, 6l, 6m).`;
  assert.equal(claimsRoundEntries(text), true);
});

test('claimsRoundEntries accepts the word entries', () => {
  const text = '`HUMAN_REVIEW.md` carries 14 round entries.';
  assert.equal(claimsRoundEntries(text), true);
});

test('claimsRoundEntries rejects a bare mention of one round', () => {
  // A single token next to the phrase is a mention, not a list of
  // entries. Class B must not fire on it.
  assert.equal(claimsRoundEntries('the round 6c audit trail'), false);
});

test('claimsRoundEntries rejects a paragraph about something else', () => {
  assert.equal(claimsRoundEntries('the unit suite is 787/787 PASS'), false);
});

test('claimsCompleteness accepts a completeness claim', () => {
  for (const text of [
    '`HUMAN_REVIEW.md` carries the complete round-6 audit trail (6c, 6d).',
    '`HUMAN_REVIEW.md` carries the full round-6 audit trail (6c, 6d).',
    '`HUMAN_REVIEW.md` holds all 15 round entries.',
    '`HUMAN_REVIEW.md` holds 15 round entries.',
  ]) {
    assert.equal(claimsCompleteness(text), true, `${text} must be a completeness claim`);
  }
});

test('claimsCompleteness rejects a plain enumeration', () => {
  // A list that does not claim to be the whole set is not a
  // completeness claim, and Class C must not fire on it.
  assert.equal(
    claimsCompleteness('`HUMAN_REVIEW.md` carries the audit trail (6c, 6d).'),
    false,
  );
});

test('deniesExistence accepts a correction', () => {
  assert.equal(
    deniesExistence('Neither has its own heading in that file, and neither appears in it.'),
    true,
  );
  assert.equal(deniesExistence('the round does not exist'), true);
});

test('deniesExistence rejects a paragraph that merely lacks an entry', () => {
  // The check is a denial of EXISTENCE, and it must not fire on a
  // paragraph that simply does not mention the round.
  assert.equal(deniesExistence('the unit suite is 787/787 PASS'), false);
});
