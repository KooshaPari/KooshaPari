import test from 'node:test';
import assert from 'node:assert/strict';

import {
  READER_STORAGE_KEY,
  READER_TOGGLED_KEY,
  ID_ANNOUNCEMENTS,
  ID_READER_TOGGLE,
  SELECTOR_VIEW_ROOT_HEADING,
  DATA_READER,
  ANNOUNCE_ACTIVE,
  ANNOUNCE_INACTIVE,
  SR_ONLY_CSS,
  shouldIgnoreShortcut,
  isReaderKey,
  isEscapeKey,
  parseStoredBoolean,
  initialReaderMode,
  readerAttrValue,
  readerAnnouncement,
} from '../scripts/reader-state-helpers.js';

test('shouldIgnoreShortcut: rejects null/missing events', () => {
  assert.equal(shouldIgnoreShortcut(null), true);
  assert.equal(shouldIgnoreShortcut(undefined), true);
});

test('shouldIgnoreShortcut: passes plain keydown', () => {
  const event = { key: 'r', target: { closest: () => null } };
  assert.equal(shouldIgnoreShortcut(event), false);
});

test('shouldIgnoreShortcut: rejects modifier keys', () => {
  for (const modifier of ['ctrlKey', 'metaKey', 'altKey']) {
    const event = { key: 'r', target: { closest: () => null }, [modifier]: true };
    assert.equal(shouldIgnoreShortcut(event), true, modifier);
  }
});

test('shouldIgnoreShortcut: rejects events inside inputs/textareas/selects/textbox roles', () => {
  const inputEvent = { key: 'r', target: { closest: (s) => (s.includes('input') ? {} : null) } };
  assert.equal(shouldIgnoreShortcut(inputEvent), true);
  const textareaEvent = { key: 'r', target: { closest: (s) => (s.includes('textarea') ? {} : null) } };
  assert.equal(shouldIgnoreShortcut(textareaEvent), true);
  const selectEvent = { key: 'r', target: { closest: (s) => (s.includes('select') ? {} : null) } };
  assert.equal(shouldIgnoreShortcut(selectEvent), true);
  const textboxEvent = { key: 'r', target: { closest: (s) => (s.includes('textbox') ? {} : null) } };
  assert.equal(shouldIgnoreShortcut(textboxEvent), true);
});

test('shouldIgnoreShortcut: rejects contenteditable targets', () => {
  const event = { key: 'r', target: { isContentEditable: true, closest: () => null } };
  assert.equal(shouldIgnoreShortcut(event), true);
});

test('shouldIgnoreShortcut: rejects defaultPrevented / isComposing / repeat', () => {
  for (const flag of ['defaultPrevented', 'isComposing', 'repeat']) {
    const event = { key: 'r', target: { closest: () => null }, [flag]: true };
    assert.equal(shouldIgnoreShortcut(event), true, flag);
  }
});

test('shouldIgnoreShortcut: tolerates missing closest() (text nodes)', () => {
  const event = { key: 'r', target: {} };
  assert.equal(shouldIgnoreShortcut(event), false);
});

test('isReaderKey: matches r/R', () => {
  assert.equal(isReaderKey({ key: 'r' }), true);
  assert.equal(isReaderKey({ key: 'R' }), true);
  assert.equal(isReaderKey({ key: 's' }), false);
  assert.equal(isReaderKey({}), false);
  assert.equal(isReaderKey(null), false);
});

test('isEscapeKey: matches Escape only', () => {
  assert.equal(isEscapeKey({ key: 'Escape' }), true);
  assert.equal(isEscapeKey({ key: 'escape' }), false);
  assert.equal(isEscapeKey({ key: 'Esc' }), false);
  assert.equal(isEscapeKey({}), false);
  assert.equal(isEscapeKey(null), false);
});

test('parseStoredBoolean: strict string match', () => {
  assert.equal(parseStoredBoolean('true'), true);
  assert.equal(parseStoredBoolean('false'), false);
  assert.equal(parseStoredBoolean('TRUE'), null);
  assert.equal(parseStoredBoolean('1'), null);
  assert.equal(parseStoredBoolean(''), null);
  assert.equal(parseStoredBoolean(null), null);
  assert.equal(parseStoredBoolean(undefined), null);
});

test('initialReaderMode: defaults to false', () => {
  assert.equal(initialReaderMode(), false);
});

test('initialReaderMode: stored value beats prefersReducedMotion', () => {
  assert.equal(initialReaderMode({ storedValue: 'true', prefersReducedMotion: false }), true);
  assert.equal(initialReaderMode({ storedValue: 'false', prefersReducedMotion: true }), false);
});

test('initialReaderMode: prefersReducedMotion beats default', () => {
  assert.equal(initialReaderMode({ prefersReducedMotion: true, defaultValue: false }), true);
  assert.equal(initialReaderMode({ prefersReducedMotion: false, defaultValue: false }), false);
  assert.equal(initialReaderMode({ prefersReducedMotion: false, defaultValue: true }), true);
});

test('initialReaderMode: invalid stored value falls through to reducedMotion', () => {
  assert.equal(initialReaderMode({ storedValue: 'maybe', prefersReducedMotion: true }), true);
  assert.equal(initialReaderMode({ storedValue: 'maybe', prefersReducedMotion: false }), false);
});

test('readerAttrValue: maps boolean to data attribute', () => {
  assert.equal(readerAttrValue(true), 'true');
  assert.equal(readerAttrValue(false), 'false');
});

test('readerAnnouncement: maps boolean to text', () => {
  assert.equal(readerAnnouncement(true), ANNOUNCE_ACTIVE);
  assert.equal(readerAnnouncement(false), ANNOUNCE_INACTIVE);
});

test('constants: stable storage keys and ids', () => {
  assert.equal(READER_STORAGE_KEY, 'koosha-atelier-reader');
  assert.equal(READER_TOGGLED_KEY, 'koosha-atelier-reader-toggled');
  assert.equal(ID_ANNOUNCEMENTS, 'announcements');
  assert.equal(ID_READER_TOGGLE, 'reader-toggle');
  assert.equal(DATA_READER, 'reader');
  assert.ok(SELECTOR_VIEW_ROOT_HEADING.startsWith('#view-root'));
});

test('SR_ONLY_CSS: visually-hidden recipe', () => {
  assert.ok(SR_ONLY_CSS.includes('clip: rect(0, 0, 0, 0)'));
  assert.ok(SR_ONLY_CSS.includes('overflow: hidden'));
  assert.ok(SR_ONLY_CSS.includes('position: absolute'));
});
