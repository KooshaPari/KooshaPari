import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { buildChrome } from '../scripts/media/cast-player-chrome.js';
import { createScrubber } from '../scripts/media/cast-scrubber.js';
import { SEEK_PAGE_MS, SEEK_STEP_MS, SPEED_LADDER } from '../scripts/media/cast-timeline.js';

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

/**
 * Dispatch a keydown and report whether the handler called preventDefault.
 *
 * linkedom exposes its own Event class (Node's global Event is not
 * compatible with its dispatchEvent) and does not ship KeyboardEvent,
 * so the `key` property is assigned directly.
 */
function pressKey(target, key) {
  const event = new globalThis.document.defaultView.Event('keydown', {
    bubbles: true,
    cancelable: true,
  });
  event.key = key;
  target.dispatchEvent(event);
  return event.defaultPrevented;
}

test('chrome exposes the full APG seek-slider contract on the scrubber', () => {
  withDOM(() => {
    const dom = buildChrome('demo');

    assert.equal(dom.scrubber.getAttribute('role'), 'slider');
    assert.equal(dom.scrubber.getAttribute('tabindex'), '0');
    assert.equal(dom.scrubber.getAttribute('aria-valuemin'), '0');
    assert.equal(dom.scrubber.getAttribute('aria-valuemax'), '0');
    assert.equal(dom.scrubber.getAttribute('aria-valuenow'), '0');
    assert.equal(dom.scrubber.getAttribute('aria-valuetext'), '0:00 of 0:00');
    assert.equal(dom.scrubber.getAttribute('aria-label'), 'Seek through recording');
    assert.equal(dom.scrubber.getAttribute('aria-disabled'), 'true',
      'seek must be announced as unavailable until a recording loads');
  });
});

test('chrome builds a complete transport with a clock and every speed', () => {
  withDOM(() => {
    const dom = buildChrome('demo');

    assert.equal(dom.playBtn.tagName, 'BUTTON');
    assert.equal(dom.playBtn.getAttribute('aria-label'), 'Play');
    assert.equal(dom.restartBtn.getAttribute('aria-label'), 'Restart from beginning');

    assert.equal(dom.speedBtns.length, SPEED_LADDER.length);
    assert.deepEqual(
      dom.speedBtns.map((b) => b.textContent),
      SPEED_LADDER.map((s) => `${s}x`),
    );
    // Exactly one speed is presented as pressed, and it is normal speed.
    const pressed = dom.speedBtns.filter((b) => b.getAttribute('aria-pressed') === 'true');
    assert.equal(pressed.length, 1);
    assert.equal(pressed[0].dataset.speed, '1');

    assert.equal(dom.clockNow.textContent, '0:00');
    assert.equal(dom.clockTotal.textContent, '0:00');
  });
});

test('chrome keeps decorative dots and the cursor out of the a11y tree', () => {
  withDOM(() => {
    const dom = buildChrome('demo');

    assert.equal(dom.root.querySelector('.cast-player__dots').getAttribute('aria-hidden'), 'true');
    assert.equal(dom.cursor.getAttribute('aria-hidden'), 'true');
  });
});

test('chrome does not stack a second live region per player', () => {
  withDOM(() => {
    const dom = buildChrome('demo');
    assert.equal(dom.root.querySelectorAll('[role="status"], [aria-live]').length, 0,
      'transport announcements must reuse the site-wide #announcements region');
  });
});

test('scrubber steps back and forward by the documented keyboard amounts', () => {
  withDOM(() => {
    const dom = buildChrome('demo');
    const sought = [];
    const scrubber = createScrubber({
      element: dom.scrubber,
      fill: dom.fill,
      thumb: dom.thumb,
      getDurationMs: () => 120000,
      getElapsedMs: () => 60000,
      onSeek: (ms) => sought.push(ms),
      onToggle: () => sought.push('toggle'),
    });
    scrubber.setEnabled(true);

    pressKey(dom.scrubber, 'ArrowRight');
    pressKey(dom.scrubber, 'ArrowLeft');
    pressKey(dom.scrubber, 'PageUp');
    pressKey(dom.scrubber, 'PageDown');
    pressKey(dom.scrubber, 'Home');
    pressKey(dom.scrubber, 'End');

    assert.deepEqual(sought, [
      60000 + SEEK_STEP_MS,
      60000 - SEEK_STEP_MS,
      60000 + SEEK_PAGE_MS,
      60000 - SEEK_PAGE_MS,
      0,
      120000,
    ]);
  });
});

test('scrubber maps Space and Enter to transport toggling, not seeking', () => {
  withDOM(() => {
    const dom = buildChrome('demo');
    const calls = [];
    const scrubber = createScrubber({
      element: dom.scrubber,
      fill: dom.fill,
      thumb: dom.thumb,
      getDurationMs: () => 120000,
      getElapsedMs: () => 0,
      onSeek: (ms) => calls.push(['seek', ms]),
      onToggle: () => calls.push(['toggle']),
    });
    scrubber.setEnabled(true);

    assert.equal(pressKey(dom.scrubber, ' '), true, 'Space must be preventDefault-ed');
    assert.equal(pressKey(dom.scrubber, 'Enter'), true);
    assert.deepEqual(calls, [['toggle'], ['toggle']]);
  });
});

test('scrubber ignores input entirely before a recording has loaded', () => {
  withDOM(() => {
    const dom = buildChrome('demo');
    const calls = [];
    const scrubber = createScrubber({
      element: dom.scrubber,
      fill: dom.fill,
      thumb: dom.thumb,
      getDurationMs: () => 0,
      getElapsedMs: () => 0,
      onSeek: (ms) => calls.push(['seek', ms]),
      onToggle: () => calls.push(['toggle']),
    });

    pressKey(dom.scrubber, 'ArrowRight');
    pressKey(dom.scrubber, 'Home');
    pressKey(dom.scrubber, ' ');

    assert.deepEqual(calls, [], 'an unloaded player must not respond to transport keys');
  });
});

test('scrubber sync writes the ARIA position and geometry from one source', () => {
  withDOM(() => {
    const dom = buildChrome('demo');
    let duration = 80000;
    let elapsed = 20000;
    const scrubber = createScrubber({
      element: dom.scrubber,
      fill: dom.fill,
      thumb: dom.thumb,
      getDurationMs: () => duration,
      getElapsedMs: () => elapsed,
      onSeek: () => {},
      onToggle: () => {},
    });
    scrubber.setEnabled(true);

    scrubber.sync();
    assert.equal(dom.fill.style.width, '25%');
    assert.equal(dom.thumb.style.left, '25%');
    assert.equal(dom.scrubber.getAttribute('aria-valuenow'), '20000');

    elapsed = 80000;
    scrubber.sync();
    assert.equal(dom.fill.style.width, '100%');
    assert.equal(dom.scrubber.getAttribute('aria-valuenow'), '80000');

    // A zero-length recording must not divide by zero or overrun the track.
    duration = 0;
    elapsed = 5000;
    scrubber.sync();
    assert.equal(dom.fill.style.width, '0%');
    assert.equal(dom.scrubber.getAttribute('aria-valuenow'), '5000');
  });
});

test('scrubber setEnabled drives the aria-disabled state both ways', () => {
  withDOM(() => {
    const dom = buildChrome('demo');
    const scrubber = createScrubber({
      element: dom.scrubber,
      fill: dom.fill,
      thumb: dom.thumb,
      getDurationMs: () => 1000,
      getElapsedMs: () => 0,
      onSeek: () => {},
      onToggle: () => {},
    });

    scrubber.setEnabled(false);
    assert.equal(dom.scrubber.getAttribute('aria-disabled'), 'true');

    scrubber.setEnabled(true);
    assert.equal(dom.scrubber.getAttribute('aria-disabled'), 'false');
  });
});
