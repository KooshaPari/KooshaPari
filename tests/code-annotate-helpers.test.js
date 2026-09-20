import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LANG_ALIASES,
  detectLanguage,
  tokeniseCode,
  escapeHtml,
  parseMarkers,
  stripMarker,
} from '../scripts/media/code-annotate-helpers.js';

test('detectLanguage resolves language-XXX class names through the alias map', () => {
  assert.equal(detectLanguage({ className: 'language-typescript' }), 'typescript');
  assert.equal(detectLanguage({ className: 'language-js' }), 'javascript');
  assert.equal(detectLanguage({ className: 'language-py' }), 'python');
  assert.equal(detectLanguage({ className: 'language-sh' }), 'bash');
  assert.equal(detectLanguage({ className: 'language-rs' }), 'rust');
});

test('detectLanguage returns the raw class name when no alias matches', () => {
  assert.equal(detectLanguage({ className: 'language-elixir' }), 'elixir');
  assert.equal(detectLanguage({ className: 'language-clojure' }), 'clojure');
});

test('detectLanguage falls back to data-lang when there is no language- class', () => {
  assert.equal(detectLanguage({ className: '', dataset: { lang: 'kotlin' } }), 'kotlin');
  assert.equal(detectLanguage({ className: 'highlight', dataset: { lang: 'go' } }), 'go');
});

test('detectLanguage returns null when no language signal is present', () => {
  assert.equal(detectLanguage({ className: 'highlight', dataset: {} }), null);
  assert.equal(detectLanguage({}), null);
  assert.equal(detectLanguage({ className: '' }), null);
});

test('LANG_ALIASES covers the common short forms', () => {
  assert.equal(LANG_ALIASES.js, 'javascript');
  assert.equal(LANG_ALIASES.ts, 'typescript');
  assert.equal(LANG_ALIASES.tsx, 'typescript');
  assert.equal(LANG_ALIASES.jsx, 'javascript');
  assert.equal(LANG_ALIASES.py, 'python');
  assert.equal(LANG_ALIASES.rb, 'ruby');
  assert.equal(LANG_ALIASES.sh, 'bash');
  assert.equal(LANG_ALIASES.shell, 'bash');
  assert.equal(LANG_ALIASES.zsh, 'bash');
  assert.equal(LANG_ALIASES.yml, 'yaml');
  assert.equal(LANG_ALIASES.md, 'markdown');
  assert.equal(LANG_ALIASES.rs, 'rust');
});

test('escapeHtml escapes &, <, and > but leaves quotes alone', () => {
  assert.equal(escapeHtml('hello'), 'hello');
  assert.equal(escapeHtml('a < b'), 'a &lt; b');
  assert.equal(escapeHtml('a > b'), 'a &gt; b');
  assert.equal(escapeHtml('a & b'), 'a &amp; b');
  assert.equal(escapeHtml('<a href="x">'), '&lt;a href="x"&gt;');
});

test('tokeniseCode wraps recognised tokens in spans and leaves whitespace alone', () => {
  const out = tokeniseCode('const x = 1;');
  assert.match(out, /<span class="tok-kw">const<\/span>/);
  assert.match(out, /<span class="tok-num">1<\/span>/);
  assert.match(out, /<span class="tok-op">=<\/span>/);
  // no class wrapping for whitespace
  assert.doesNotMatch(out, /<span[^>]*>\s<\/span>/);
});

test('tokeniseCode marks line comments before keyword recognition (priority)', () => {
  const out = tokeniseCode('// const x = 1;');
  // The whole comment line should be marked as a comment, not split into tokens.
  assert.match(out, /<span class="tok-cmt">\/\/ const x = 1;<\/span>/);
});

test('tokeniseCode marks string literals before keyword recognition (priority)', () => {
  const out = tokeniseCode('"const x = 1;"');
  assert.match(out, /<span class="tok-str">"const x = 1;"<\/span>/);
});

test('tokeniseCode returns plain escaped text when no rules match', () => {
  const out = tokeniseCode('hello world');
  assert.equal(out, 'hello world');
});

test('tokeniseCode treats < and > as operators, so HTML metacharacters inside code are not literal-escaped', () => {
  // Operators are recognised first; the rendering pipeline is responsible for
  // never placing tokenised output into a context where unescaped '<' matters.
  const out = tokeniseCode('a < b');
  assert.match(out, /<span class="tok-op">&lt;<\/span>/);
  // The HTML escaping of the surrounding text still happens (whitespace runs).
  assert.match(out, /a /);
});

test('parseMarkers returns null for lines without markers', () => {
  assert.equal(parseMarkers('const x = 1;'), null);
  assert.equal(parseMarkers(''), null);
  assert.equal(parseMarkers('// just a comment'), null);
});

test('parseMarkers recognises the line-comment marker form with a payload', () => {
  const m = parseMarkers('// [!annotation:this is a note]');
  assert.deepEqual(m, { type: 'annotation', payload: 'this is a note' });
});

test('parseMarkers recognises the block-comment marker form with a payload', () => {
  const m = parseMarkers('/* [!callout:warning] */');
  assert.deepEqual(m, { type: 'callout', payload: 'warning' });
});

test('parseMarkers defaults the payload to an empty string when only the type is supplied', () => {
  assert.deepEqual(parseMarkers('// [!highlight]'), { type: 'highlight', payload: '' });
  assert.deepEqual(parseMarkers('/* [!highlight] */'), { type: 'highlight', payload: '' });
});

test('stripMarker removes the marker comment from a code line', () => {
  assert.equal(stripMarker('// [!highlight]const x = 1;'), 'const x = 1;');
  assert.equal(stripMarker('const x = 1; // [!highlight]'), 'const x = 1;');
  // The block-comment regex does not consume a leading whitespace run, so the
  // marker-only prefix leaves a single space; the caller relies on
  // processCodeBlock's cleanCode content for the actual render.
  assert.equal(stripMarker('/* [!annotation:hello] */ const x = 1;'), ' const x = 1;');
});

test('stripMarker leaves non-marker lines unchanged', () => {
  assert.equal(stripMarker('const x = 1;'), 'const x = 1;');
  assert.equal(stripMarker('// just a comment'), '// just a comment');
});
