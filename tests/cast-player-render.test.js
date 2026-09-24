import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { createCastRenderer } from '../scripts/media/cast-player-render.js';
import { CLASS_LINE } from '../scripts/media/cast-player-helpers.js';

/** Install a fresh linkedom document for the duration of `run`. */
function withDOM(run) {
  const previous = globalThis.document;
  globalThis.document = parseHTML('<html><body></body></html>').document;
  try {
    return run();
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
}

/** Build output/cursor/terminal elements and a renderer bound to them. */
function setup() {
  const terminal = document.createElement('div');
  const output = document.createElement('div');
  const cursor = document.createElement('span');
  cursor.className = 'cast-player__cursor';
  output.append(cursor);
  terminal.append(output);
  document.body.append(terminal);
  const renderer = createCastRenderer({ output, cursor, terminal });
  return { terminal, output, cursor, renderer };
}

const TIMELINE = [
  { time: 0, type: 'o', data: 'start' },
  { time: 1, type: 'o', data: 'mid' },
  { time: 2, type: 'o', data: 'end' },
];

test('clearOutput resets the viewport to cursor-only and scrolls to top', () => {
  withDOM(() => {
    const { terminal, output, cursor, renderer } = setup();
    output.append(document.createTextNode('stale text'));
    terminal.scrollTop = 42;

    renderer.clearOutput();

    assert.equal(output.textContent, '');
    assert.equal(output.childNodes.length, 1);
    assert.equal(output.firstChild, cursor);
    assert.equal(terminal.scrollTop, 0);
  });
});

test('appendEvent ignores non-output event types', () => {
  withDOM(() => {
    const { output, renderer } = setup();
    renderer.appendEvent({ type: 'm', data: 'resize marker' });
    renderer.appendEvent(null);
    assert.equal(output.textContent, '');
  });
});

test('appendEvent splits frames on newlines into classed line divs', () => {
  withDOM(() => {
    const { output, cursor, renderer } = setup();
    renderer.appendEvent({ type: 'o', data: 'first\nsecond' });

    const lines = output.querySelectorAll(`.${CLASS_LINE}`);
    assert.equal(lines.length, 1);
    assert.match(output.textContent, /^first/);
    assert.ok(lines[0].textContent.includes('second'));
    // The cursor migrates into the newest line so later frames append there.
    assert.equal(cursor.parentNode, lines[0]);
  });
});

test('appendEvent collapses carriage returns instead of making line divs', () => {
  withDOM(() => {
    const { output, renderer } = setup();
    renderer.appendEvent({ type: 'i', data: 'a\r\rb' });
    assert.equal(output.querySelectorAll(`.${CLASS_LINE}`).length, 0);
    assert.equal(output.textContent, 'ab');
  });
});

test('renderAt renders only due events and sets eventIdx', () => {
  withDOM(() => {
    const { output, renderer } = setup();
    const state = { eventIdx: 0 };

    renderer.renderAt(TIMELINE, state, 1000);

    assert.match(output.textContent, /start/);
    assert.match(output.textContent, /mid/);
    assert.doesNotMatch(output.textContent, /end/);
    assert.equal(state.eventIdx, 2);
  });
});

test('renderAt re-renders from a clean slate after a backwards seek', () => {
  withDOM(() => {
    const { output, renderer } = setup();
    const state = { eventIdx: 0 };

    renderer.flushTo(TIMELINE, state, 2000);
    assert.equal(state.eventIdx, 3);

    renderer.renderAt(TIMELINE, state, 500);

    assert.equal(state.eventIdx, 1);
    assert.match(output.textContent, /start/);
    assert.doesNotMatch(output.textContent, /mid/);
  });
});

test('flushTo consumes only events due since the last frame', () => {
  withDOM(() => {
    const { output, renderer } = setup();
    const state = { eventIdx: 0 };

    renderer.flushTo(TIMELINE, state, 500);
    assert.equal(state.eventIdx, 1);
    assert.match(output.textContent, /start/);
    assert.doesNotMatch(output.textContent, /mid/);

    renderer.flushTo(TIMELINE, state, 1200);
    assert.equal(state.eventIdx, 2);
    assert.match(output.textContent, /mid/);
  });
});

test('flushTo is a no-op past the end of the timeline', () => {
  withDOM(() => {
    const { renderer, output } = setup();
    const state = { eventIdx: TIMELINE.length };
    renderer.flushTo(TIMELINE, state, 99999);
    assert.equal(state.eventIdx, TIMELINE.length);
    assert.equal(output.textContent, '');
  });
});
