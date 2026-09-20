import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ICONS,
  VALIDATORS,
  ERROR_MESSAGES,
  validateField,
} from '../scripts/views/contact-helpers.js';

test('ICONS exposes the four glyphs the form references', () => {
  assert.ok(ICONS.email);
  assert.ok(ICONS.github);
  assert.ok(ICONS.linkedin);
  assert.ok(ICONS.check);
  for (const svg of Object.values(ICONS)) {
    assert.match(svg, /^<svg/);
    assert.match(svg, /<\/svg>$/);
  }
});

test('VALIDATORS.name accepts a 2+ character name', () => {
  assert.equal(VALIDATORS.name('Ko'), true);
  assert.equal(VALIDATORS.name('K'), false);
  assert.equal(VALIDATORS.name(''), false);
});

test('VALIDATORS.email accepts a well-formed address and rejects malformed ones', () => {
  for (const good of ['a@b.co', 'name@example.com', 'x@y.z']) {
    assert.equal(VALIDATORS.email(good), true, `should accept ${good}`);
  }
  for (const bad of ['missing-at', '@nodomain', 'noatsign.com', 'a@b']) {
    assert.equal(VALIDATORS.email(bad), false, `should reject ${bad}`);
  }
});

test('VALIDATORS.subject has the same 2+ character rule as name', () => {
  assert.equal(VALIDATORS.subject('Hi'), true);
  assert.equal(VALIDATORS.subject('H'), false);
});

test('VALIDATORS.message requires 10+ characters', () => {
  assert.equal(VALIDATORS.message('123456789'), false);
  assert.equal(VALIDATORS.message('1234567890'), true);
});

test('VALIDATORS trim whitespace before checking length', () => {
  assert.equal(VALIDATORS.name('   Ko   '), true);
  assert.equal(VALIDATORS.email('  a@b.co  '), true);
});

test('ERROR_MESSAGES has a copy line for every validator', () => {
  for (const name of Object.keys(VALIDATORS)) {
    assert.ok(ERROR_MESSAGES[name], `missing message for ${name}`);
    assert.ok(ERROR_MESSAGES[name].length > 5);
  }
});

test('validateField returns "valid" for acceptable input', () => {
  assert.equal(validateField('name', 'Koosha'), 'valid');
  assert.equal(validateField('email', 'k@x.co'), 'valid');
});

test('validateField returns "invalid" for unacceptable input', () => {
  assert.equal(validateField('name', 'K'), 'invalid');
  assert.equal(validateField('email', 'no-at'), 'invalid');
  assert.equal(validateField('message', 'short'), 'invalid');
});

test('validateField returns "empty" for null / undefined / empty input', () => {
  assert.equal(validateField('name', ''), 'empty');
  assert.equal(validateField('email', null), 'empty');
  assert.equal(validateField('subject', undefined), 'empty');
});

test('validateField returns "invalid" for unknown field names (no validator)', () => {
  assert.equal(validateField('mystery', 'whatever'), 'invalid');
});

import { createTimerGroup } from '../scripts/views/contact-helpers.js';

test('createTimerGroup.set schedules a callback after the delay', async () => {
  const tg = createTimerGroup();
  let called = 0;
  tg.set(() => { called += 1; }, 10);
  assert.equal(tg.size(), 1);
  await new Promise((r) => setTimeout(r, 25));
  assert.equal(called, 1);
  assert.equal(tg.size(), 0, 'completed timers are removed from the group');
});

test('createTimerGroup.set tracks multiple pending timers independently', async () => {
  const tg = createTimerGroup();
  const order = [];
  tg.set(() => order.push('a'), 30);
  tg.set(() => order.push('b'), 10);
  tg.set(() => order.push('c'), 20);
  assert.equal(tg.size(), 3);
  await new Promise((r) => setTimeout(r, 60));
  assert.deepEqual(order, ['b', 'c', 'a']);
  assert.equal(tg.size(), 0);
});

test('createTimerGroup.clear cancels every pending timer', async () => {
  const tg = createTimerGroup();
  let called = 0;
  tg.set(() => { called += 1; }, 10);
  tg.set(() => { called += 1; }, 50);
  tg.clear();
  assert.equal(tg.size(), 0, 'clear empties the group immediately');
  await new Promise((r) => setTimeout(r, 80));
  assert.equal(called, 0, 'cleared timers never fire');
});

test('createTimerGroup.clear is idempotent (safe on empty group)', () => {
  const tg = createTimerGroup();
  tg.clear();
  tg.clear();
  assert.equal(tg.size(), 0);
});

test('createTimerGroup supports double-submit pattern (clear on next schedule)', async () => {
  const tg = createTimerGroup();
  let firstChain = 0;
  let secondChain = 0;
  tg.set(() => { firstChain += 1; }, 50);
  // simulate user clicking again before the first chain resolves
  tg.clear();
  tg.set(() => { secondChain += 1; }, 10);
  await new Promise((r) => setTimeout(r, 80));
  assert.equal(firstChain, 0, 'cleared chain never fires');
  assert.equal(secondChain, 1, 'new chain fires');
});
