/**
 * The cast player transport, exercised through its public controller.
 *
 * `tests/cast-player.test.js` covers the chrome contract and the scrubber
 * in isolation; nothing there drives the transport, so the player's own
 * handlers went unexercised. These tests stub `window` and `fetch` so the
 * module takes the real load path (it skips the fetch entirely when
 * `window` is undefined, which is the case under `node --test`): the module
 * parses the recording, builds a timeline, and enables the scrubber.
 *
 * The recording is a minimal `.cast` document the parser accepts: a header
 * line plus three output events. The offsets are deltas in seconds, so the
 * recording runs ten seconds, long enough for a seek step to be observable
 * rather than clamped to the end.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { initCastPlayers } from '../scripts/media/cast-player.js';
import {
  CLASS_STATE_FINISHED,
  CLASS_STATE_PAUSED,
  LABEL_PAUSE,
  LABEL_PLAY,
} from '../scripts/media/cast-player-helpers.js';
import { SEEK_STEP_MS } from '../scripts/media/cast-timeline.js';

const CAST_SOURCE = [
  '{"version": 2, "width": 80, "height": 24, "timestamp": 1700000000, "env": {"SHELL": "/bin/zsh", "TERM": "xterm-256color"}}',
  '[1.0, "o", "first line\\r\\n"]',
  '[2.5, "o", "second line\\r\\n"]',
  '[6.0, "o", "third line\\r\\n"]',
  '',
].join('\n');

// The globals the module reads directly; each is restored after a test.
const GLOBALS = ['document', 'window', 'fetch', 'requestAnimationFrame', 'cancelAnimationFrame'];

/**
 * Install a document, a window, and a fetch that serves `CAST_SOURCE`.
 * The renderer reads the bare global `document`, so the globals must stay
 * installed for the whole test, not only for the mount.
 */
async function withPlayer(run) {
  const saved = new Map(GLOBALS.map((key) => [key, globalThis[key]]));
  const savedError = console.error;
  const { document } = parseHTML('<html><body></body></html>');
  Object.assign(globalThis, {
    document,
    window: { document },
    fetch: async () => ({ ok: true, status: 200, text: async () => CAST_SOURCE }),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
  });
  console.error = () => {};
  try {
    await run({ document });
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
    console.error = savedError;
  }
}

/**
 * Build a player container, initialise it, and drain the microtask queue so
 * the recording is parsed and the timeline is built. The controller is
 * returned even when the load fails.
 */
async function mount(env, src = '/demo.cast') {
  const container = env.document.createElement('div');
  container.className = 'cast-player';
  container.setAttribute('data-src', src);
  container.setAttribute('data-title', 'Demo session');
  env.document.body.appendChild(container);
  const [player] = initCastPlayers(env.document);
  await new Promise((resolve) => setImmediate(resolve));
  return player;
}

const slider = (player) => player.el.querySelector('[role="slider"]');
const attr = (el, name) => el.getAttribute(name);
const duration = (player) => Number(attr(slider(player), 'aria-valuemax'));
const transport = (player) => player.el.querySelector('button[aria-label]');
const isPaused = (player) => player.el.classList.contains(CLASS_STATE_PAUSED);
const isFinished = (player) => player.el.classList.contains(CLASS_STATE_FINISHED);
const click = (el) => el.dispatchEvent(new el.ownerDocument.defaultView.Event('click'));

/**
 * Dispatch a keydown on the player root and report whether the handler
 * consumed it. The handler ignores any event whose target is not the root
 * itself, so the event must go on the controller's own element. linkedom
 * exposes its own Event class, so `key` is assigned directly rather than
 * passed through the constructor.
 */
function pressKey(player, key) {
  const event = new player.el.ownerDocument.defaultView.Event('keydown', {
    bubbles: true,
    cancelable: true,
  });
  event.key = key;
  player.el.dispatchEvent(event);
  return event.defaultPrevented;
}

test('the player parses its recording and enables the scrubber', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    const seek = slider(player);
    assert.ok(seek, 'the player must build a seek slider');
    assert.equal(
      attr(seek, 'aria-disabled'),
      'false',
      'the slider is enabled once the recording has loaded',
    );
    assert.ok(duration(player) > 0, 'the slider learns the recording duration');
  });
});

test('pressing play offers to pause and leaves the player unpaused', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    const playBtn = transport(player);
    assert.ok(playBtn, 'the player must build a transport button');
    player.play();
    assert.equal(isPaused(player), false, 'a playing player is not marked paused');
    assert.equal(
      attr(playBtn, 'aria-label'),
      LABEL_PAUSE,
      'the transport button offers to pause a playing recording',
    );
  });
});

test('pausing marks the player paused and restores the play label', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    const playBtn = transport(player);
    player.play();
    player.pause();
    assert.equal(isPaused(player), true, 'a paused player is marked paused');
    assert.equal(
      attr(playBtn, 'aria-label'),
      LABEL_PLAY,
      'the transport button offers to play a paused recording',
    );
  });
});

test('the play button toggles the transport', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    const playBtn = transport(player);
    click(playBtn);
    assert.equal(isPaused(player), false, 'the first click starts playback');
    click(playBtn);
    assert.equal(isPaused(player), true, 'the second click pauses playback');
  });
});

test('seeking moves the clock and writes the position to the slider', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    player.seek(500);
    assert.equal(
      attr(slider(player), 'aria-valuenow'),
      '500',
      'the slider reports the sought position',
    );
    assert.match(
      attr(slider(player), 'aria-valuetext'),
      /0:00/,
      'the slider reports the position as a clock',
    );
  });
});

test('seeking past the end finishes the recording', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    player.seek(duration(player) + 10_000);
    assert.equal(isFinished(player), true, 'seeking past the end marks the recording finished');
  });
});

test('resetting returns the clock to zero and clears the finished state', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    player.seek(duration(player) + 10_000);
    assert.equal(isFinished(player), true);
    player.resetPlayback();
    assert.equal(isFinished(player), false, 'a reset recording is no longer finished');
    assert.equal(
      attr(slider(player), 'aria-valuenow'),
      '0',
      'a reset recording is back at the start',
    );
  });
});

test('the speed control marks exactly one speed as pressed', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    const speedBtns = [...player.el.querySelectorAll('button[data-speed]')];
    assert.ok(speedBtns.length > 1, 'the player must offer more than one speed');
    const target = speedBtns.find((btn) => attr(btn, 'aria-pressed') !== 'true');
    click(target);
    const pressed = speedBtns.filter((btn) => attr(btn, 'aria-pressed') === 'true');
    assert.equal(pressed.length, 1, 'exactly one speed is pressed');
    assert.equal(
      attr(pressed[0], 'data-speed'),
      attr(target, 'data-speed'),
      'the pressed speed is the one that was clicked',
    );
  });
});

test('the restart control rewinds the recording and starts it again', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    player.seek(800);
    const restartBtn = [...player.el.querySelectorAll('button')].find((btn) =>
      (attr(btn, 'aria-label') || '').toLowerCase().includes('restart'),
    );
    assert.ok(restartBtn, 'the player must offer a restart control');
    click(restartBtn);
    assert.equal(
      attr(slider(player), 'aria-valuenow'),
      '0',
      'restart rewinds the recording to the start',
    );
  });
});

test('the space key on the player root toggles playback', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    assert.equal(pressKey(player, ' '), true, 'the player consumes the space key');
    assert.equal(isPaused(player), false, 'the space key starts playback');
  });
});

test('an arrow key on the player root seeks by one step', async () => {
  await withPlayer(async (env) => {
    const player = await mount(env);
    assert.equal(pressKey(player, 'ArrowRight'), true, 'the player consumes the arrow key');
    assert.equal(
      attr(slider(player), 'aria-valuenow'),
      String(SEEK_STEP_MS),
      'the arrow key seeks forward by the documented step',
    );
  });
});

test('a failed load reports the failure and keeps the slider disabled', async () => {
  await withPlayer(async (env) => {
    globalThis.fetch = async () => ({ ok: false, status: 404, text: async () => '' });
    const player = await mount(env, '/missing.cast');
    const seek = slider(player);
    assert.ok(seek, 'the player still builds its chrome');
    assert.equal(
      attr(seek, 'aria-disabled'),
      'true',
      'the slider stays disabled when the recording cannot load',
    );
    assert.match(
      player.el.textContent,
      /Error loading recording/,
      'the failure is reported in the terminal output',
    );
  });
});
