import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { sweep } from '../scripts/sweep-lighthouse-claims.js';

const SCRIPT = new URL('../scripts/sweep-lighthouse-claims.js', import.meta.url)
  .pathname;
const REPO = new URL('..', import.meta.url).pathname;

/**
 * The sweep's whole purpose is to catch a stale Lighthouse claim that a
 * narrower search would miss. A detector that cannot fail is not a
 * detector, so these tests pin three things:
 *
 *   1. the real repository currently has zero uncovered claims
 *   2. a synthetic stale claim IS detected (positive control)
 *   3. the same claim written in PROSE is ALSO detected — this is the
 *      exact case round 6p missed
 */

test('the tracked repository currently has no uncovered Lighthouse claim', () => {
  const result = sweep();
  assert.deepEqual(
    result.uncovered.map((c) => `${c.file}:${c.line} ${c.text}`),
    [],
    'every Lighthouse claim must be annotated, adjudicated, or a quotation',
  );
});

test('the sweep finds claims in numeric form', () => {
  const result = sweep();
  const numeric = result.claims.filter((c) => c.form === 'numeric');
  assert.ok(numeric.length > 0, 'expected numeric-form claims to exist');
  assert.ok(
    numeric.every((c) => c.status !== 'uncovered'),
    'no numeric-form claim may be uncovered',
  );
});

test('the sweep finds claims in prose form', () => {
  const result = sweep();
  const prose = result.claims.filter((c) => c.form === 'prose');
  assert.ok(
    prose.length > 0,
    'the prose pattern must match at least one real claim, otherwise it is untested',
  );
});

test('the round 6p miss — a prose claim in the audit README — is now covered', () => {
  const result = sweep();
  const readmeClaims = result.claims.filter((c) =>
    c.file.endsWith('docs/audits/2026-10-19/lighthouse/README.md'),
  );
  // The prose claim in the "Comparison to the prior evidence" section
  // reads "showed 100 across the" / "four standard categories" — the
  // phrase is split across a line break.
  const comparison = readmeClaims.find((c) =>
    c.text.includes('showed 100 across the'),
  );
  assert.ok(
    comparison,
    'the prose-form comparison claim must be detected by the sweep',
  );
  assert.equal(comparison.status, 'annotated');
  assert.equal(comparison.form, 'prose');
});

test('a claim split across a line break is still detected', () => {
  // The round 6p miss was hard-wrapped: "shows 100 across the" /
  // "four standard categories" sit on two lines. A per-line matcher
  // cannot see that split, so this pins the line-map behaviour.
  const result = sweep();
  const split = result.claims.find(
    (c) =>
      c.file.endsWith('docs/audits/2026-10-19/lighthouse/README.md') &&
      c.text.includes('showed 100 across the'),
  );
  assert.ok(
    split,
    'the line-wrapped prose claim must be detected by the sweep',
  );
  assert.equal(split.status, 'annotated');
});

/**
 * Negative control. The claim below is written the way a genuine stale
 * claim would read. It must be reported as uncovered, otherwise the
 * sweep is not actually capable of failing.
 */
test('a synthetic stale claim is detected as uncovered', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sweep-lh-'));
  const rel = 'docs/audits/2026-10-19/lighthouse/zz-sweep-negative-control.md';
  const abs = join(REPO, rel);
  const body = [
    '# Negative control',
    '',
    'The production site shows 100 across the four standard categories',
    'and every run scored 100 / 100 / 100 / 100 without exception.',
    '',
  ].join('\n');

  writeFileSync(abs, body);
  execFileSync('git', ['add', '-f', rel], { cwd: REPO, stdio: 'pipe' });

  try {
    const result = sweep();
    const caught = result.uncovered.filter((c) => c.file === rel);
    assert.ok(
      caught.some((c) => c.form === 'prose'),
      'the prose form must be caught',
    );
    assert.ok(
      caught.some((c) => c.form === 'numeric'),
      'the numeric form must be caught',
    );
    // The injected text yields 1 numeric + 2 prose matches: the
    // "shows 100 across ..." phrase, and "scored 100 / 100 / ...".
    assert.equal(caught.length, 3);
    assert.equal(
      caught.filter((c) => c.form === 'numeric').length,
      1,
      'exactly one numeric claim in the injected control',
    );
  } finally {
    execFileSync('git', ['rm', '-f', '--cached', rel], {
      cwd: REPO,
      stdio: 'pipe',
    });
    rmSync(abs, { force: true });
    rmSync(dir, { recursive: true, force: true });
  }
});

/**
 * Negative control for the exemption mechanism itself.
 *
 * The exemption is an explicit in-document marker
 * (`<!-- sweep:quotation -->`) scoped to the paragraph that carries
 * it. Two properties must hold:
 *
 *   1. a claim in a marked paragraph is excused
 *   2. a claim in an UNMARKED paragraph, in the same file and in the
 *      same section, is still reported as uncovered
 *
 * Property 2 is the one that matters. If the exemption leaked beyond
 * the marked paragraph, it would silently excuse a genuine stale
 * claim — the exact failure the first version of this sweep had.
 */
test('the quotation annotation excuses only the paragraph that carries it', () => {
  const rel = 'docs/audits/2026-10-19/lighthouse/zz-sweep-quotation-scope.md';
  const abs = join(REPO, rel);
  const body = [
    '# Quotation scope control',
    '',
    '<!-- sweep:quotation -->',
    'The production site shows 100 across the four standard categories.',
    '',
    'The production site also shows 100 across the four standard categories.',
    '',
  ].join('\n');

  writeFileSync(abs, body);
  execFileSync('git', ['add', '-f', rel], { cwd: REPO, stdio: 'pipe' });

  try {
    const result = sweep();
    const caught = result.uncovered.filter((c) => c.file === rel);
    assert.equal(
      caught.length,
      1,
      'exactly the unmarked claim must be uncovered; the marked one must be exempt',
    );
    assert.ok(caught[0].text.includes('also shows 100 across the'));
  } finally {
    execFileSync('git', ['rm', '-f', '--cached', rel], {
      cwd: REPO,
      stdio: 'pipe',
    });
    rmSync(abs, { force: true });
  }
});

/**
 * Negative control for the numeric form's own line-wrap blind spot.
 *
 * The numeric form is the ONLY form the round 6p sweep searched, so a
 * gap in it is the most consequential gap in this script. Its matcher
 * ran per-line while the prose matcher ran against the
 * whitespace-collapsed text — so the four-category string, hard-wrapped
 * across two lines, was invisible to the form that mattered most.
 *
 * This control was found by accident: a documentation edit re-wrapped
 * the string "100 / 100 / 100 / 100" across a line break, and the
 * sweep's claim count silently fell by one. The defect is now fixed
 * and pinned here.
 */
test('a numeric claim split across a line break is still detected', () => {
  const rel = 'docs/audits/2026-10-19/lighthouse/zz-sweep-numeric-wrap.md';
  const abs = join(REPO, rel);
  const body = [
    '# Numeric wrap control',
    '',
    'The measured result was 100 / 100 / 100 /',
    '100 across the four standard categories.',
    '',
  ].join('\n');

  writeFileSync(abs, body);
  execFileSync('git', ['add', '-f', rel], { cwd: REPO, stdio: 'pipe' });

  try {
    const result = sweep();
    const caught = result.uncovered.filter((c) => c.file === rel);
    assert.ok(
      caught.some((c) => c.form === 'numeric'),
      'the wrapped numeric claim must be caught, not skipped',
    );
  } finally {
    execFileSync('git', ['rm', '-f', '--cached', rel], {
      cwd: REPO,
      stdio: 'pipe',
    });
    rmSync(abs, { force: true });
  }
});

/**
 * The documentation states the sweep's counts. Those numbers must be
 * the measured ones.
 *
 * Round 6q corrected its own documentation three times because a
 * stated count drifted from the live output: the total claim count,
 * the numeric-form count, and the per-status split all moved when
 * the script was fixed or when a paragraph was quoted inside a
 * correction. Every one of those moves was caught by a human
 * re-reading a diff. This test removes the human from the loop.
 *
 * The assertion is on the canonical marker each document carries,
 * not on a bare substring. A bare "does the document contain 64"
 * check is too weak: the number 63 already appears elsewhere in
 * these documents, so a wrong count written into the claim sentence
 * would pass a substring test. Each check below parses one
 * machine-readable line and compares it to the live measurement.
 */
test('the documented sweep counts match the measured counts', () => {
  const result = sweep();
  const byStatus = {};
  const byForm = {};
  for (const c of result.claims) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byForm[c.form] = (byForm[c.form] || 0) + 1;
  }

  const measured = {
    trackedMarkdownFiles: result.fileCount,
    claims: result.claims.length,
    annotated: byStatus.annotated || 0,
    adjudicated: byStatus.adjudicated || 0,
    quotation: byStatus.quotation || 0,
    uncovered: byStatus.uncovered || 0,
    proseForm: byForm.prose || 0,
    numericForm: byForm.numeric || 0,
  };

  // The canonical marker each document carries. It states the counts
  // as one machine-readable value, so a prose sentence elsewhere in
  // the document cannot drift away from the measured result without
  // this test failing.
  //
  // The marker is matched on the OPENING of the HTML comment, not on
  // the word "sweep:counts" alone: this document also mentions the
  // marker in prose, and a loose match would pick up that sentence
  // instead of the real one.
  const marker = '<!-- sweep:counts ';
  const docs = [
    'HUMAN_REVIEW.md',
    'STATE.md',
    'docs/audits/2026-10-19/lighthouse/README.md',
  ];

  for (const doc of docs) {
    const text = readFileSync(join(REPO, doc), 'utf8');
    const line = text
      .split('\n')
      .find((l) => l.includes(marker));
    assert.ok(
      line,
      `${doc} must carry a canonical "${marker}...-->" line`,
    );

    // The marker may sit inside a Markdown blockquote, so the line
    // can carry a "> " prefix and any number of backticks. Take the
    // substring between the first "{" and the last "}" on the line —
    // not the first "{" seen anywhere, which a blockquote prefix
    // could displace.
    const start = line.indexOf('{');
    const end = line.lastIndexOf('}');
    assert.ok(start !== -1 && end > start, `${doc} has a malformed canonical counts line`);
    let published;
    try {
      published = JSON.parse(line.slice(start, end + 1));
    } catch (err) {
      assert.fail(`${doc} has a malformed canonical counts line: ${err.message}`);
    }

    for (const [key, value] of Object.entries(measured)) {
      assert.equal(
        published[key],
        value,
        `${doc} publishes ${key}=${published[key]}, measured ${value}`,
      );
    }
  }
});

test('the script exits 0 when every claim is covered', () => {
  let code = 0;
  try {
    execFileSync('node', [SCRIPT], { cwd: REPO, stdio: 'pipe' });
  } catch (err) {
    code = err.status;
  }
  assert.equal(code, 0);
});

test('the script emits machine-readable JSON', () => {
  const out = execFileSync('node', [SCRIPT, '--json'], {
    cwd: REPO,
    encoding: 'utf8',
  });
  const parsed = JSON.parse(out);
  assert.ok(parsed.trackedMarkdownFiles > 100);
  assert.ok(Array.isArray(parsed.claims));
  assert.deepEqual(parsed.uncovered, []);
  assert.ok(parsed.generatedAtUtc);
});
