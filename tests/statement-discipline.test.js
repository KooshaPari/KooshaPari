// tests/statement-discipline.test.js
// One-shot discipline gate for the .statement utility class.
//
// The .statement utility class implements a single oversized display moment
// per page (Pentagram poster convention). The voice-fit hypothesis is
// conditional on that one-shot discipline holding — if downstream authors
// reach for .statement on case-study titles or work-catalog banners, it
// stops being one-shot and starts being a typographic gimmick across the
// surface.
//
// This test parses every source view file (the design-time intent) and
// every shipped CSS file, then asserts:
//   - The .statement class is applied at most once across all view files
//     (one application is the home lead h1 in scripts/views/home.js).
//   - The home view MUST apply the class (homeCount >= 1) — the candidate
//     requires this.
//   - The .statement rule is defined exactly once across styles/*.css
//     (only the one definition in styles/main.css).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const VIEWS_DIR = 'scripts/views';
const STYLES_DIR = 'styles';

// Match a class attribute whose value list contains the token "statement".
// Covers JS object literals (single OR double quoted, with optional other
// tokens in the value list, e.g. class: 'statement' or class: "statement foo").
const CLASS_ATTR_RE = /class\s*[:=]\s*['"]([^'"]*)['"]/g;

// Match the start of a .statement rule definition in CSS:
//   .statement { ...
// Anchored on a word boundary and the opening brace so prose mentions
// of the class do not match.
const RULE_DEF_RE = /(^|\n)\s*\.statement\s*\{/g;

function listFiles(path, ext) {
  return readdirSync(path).filter((name) => name.endsWith(ext));
}

// Count "statement" token occurrences in class-attribute values within
// a single source file. Each match contributes a count of 1 even when
// the value contains the token multiple times — that is itself a defect
// and the assertion below will catch it.
function countStatementInClasses(source) {
  let n = 0;
  for (const m of source.matchAll(CLASS_ATTR_RE)) {
    const tokens = m[1].split(/\s+/).filter(Boolean);
    if (tokens.includes('statement')) n++;
  }
  return n;
}

const viewFiles = listFiles(VIEWS_DIR, '.js');
const styleFiles = listFiles(STYLES_DIR, '.css');

const viewStats = viewFiles.map((name) => {
  const source = readFileSync(join(VIEWS_DIR, name), 'utf8');
  return { name, count: countStatementInClasses(source) };
});

const totalCount = viewStats.reduce((sum, v) => sum + v.count, 0);
const homeStats = viewStats.find((v) => v.name === 'home.js');
const homeCount = homeStats ? homeStats.count : 0;

const styleStats = styleFiles.map((name) => {
  const source = readFileSync(join(STYLES_DIR, name), 'utf8');
  // Count unique rule definitions, not prose mentions.
  return { name, count: (source.match(RULE_DEF_RE) || []).length };
});
const totalStyleCount = styleStats.reduce((sum, s) => sum + s.count, 0);

test('discipline: .statement is single-use across all views', () => {
  // One application total — the home lead h1 — and never more.
  assert.ok(totalCount <= 1,
    `.statement must be applied at most once across views; found ${totalCount}` +
    viewStats.filter((v) => v.count > 0).map((v) => ` (${v.name}=${v.count})`).join(''));
});

test('discipline: home view applies the .statement class', () => {
  // The candidate requires the home route to be the surface that carries
  // the one-shot display statement. If home.js loses the class, the move
  // silently disappears from the page.
  assert.ok(homeCount >= 1,
    `scripts/views/home.js must apply .statement; found ${homeCount}`);
});

test('discipline: .statement has exactly one rule definition across styles/*.css', () => {
  // A single source of truth for the rule. No duplicate definitions,
  // no shadow rules in case-studies.css or anywhere else.
  assert.equal(totalStyleCount, 1,
    `.statement must have exactly one rule definition; found ${totalStyleCount}` +
    styleStats.filter((s) => s.count > 0).map((s) => ` (${s.name}=${s.count})`).join(''));
});