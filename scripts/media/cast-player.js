/* ================================================================
   Cast Player — asciinema .cast file terminal replay engine.

   Parses .cast recordings and renders them into a terminal-like
   viewport with typewriter playback: transport controls, a
   seekable scrubber, a clock readout, and keyboard operation.

   Usage:
     import { initCastPlayers } from './media/cast-player.js';
     initCastPlayers();           // auto-discovers .cast-player[data-src]

   Expected HTML:
     <div class="cast-player"
          data-src="/path/to/recording.cast"
          data-title="Terminal session">
     </div>

   Modules
     cast-timeline.js              pure .cast parsing, timeline math, clock format
     cast-player-chrome.js         markup construction
     cast-scrubber.js              APG media seek-slider interaction
     cast-player-helpers.js        DOM/transport constants + pure helpers

   Accessibility
     The scrubber is a role="slider" with aria-valuemin/max/now plus a
     minute:second aria-valuetext, driven by Arrow/Home/End/PageUp/
     PageDown keys and pointer drag. Transport controls are real
     <button> elements and the player reports state through a polite
     live region, so the whole surface is operable without a pointer.
   ================================================================ */

import { buildChrome } from './cast-player-chrome.js';
import { createScrubber } from './cast-scrubber.js';
import {
  buildCastTimeline,
  formatClock,
  formatPosition,
  indexAt,
  parseCast,
  SEEK_STEP_MS,
  timelineDuration,
} from './cast-timeline.js';
import {
  ATTR_DATA_SRC,
  ATTR_DATA_TITLE,
  ATTR_DATA_SPEED,
  CLASS_LINE,
  CLASS_SPEED_BTN_ACTIVE,
  CLASS_STATE_PAUSED,
  CLASS_STATE_FINISHED,
  CLASS_VISUALLY_HIDDEN,
  PLAY_GLYPH,
  PAUSE_GLYPH,
  LABEL_PLAY,
  LABEL_PAUSE,
  ANNOUNCE_PLAYING,
  ANNOUNCE_PAUSED,
  ANNOUNCE_FINISHED,
  ANNOUNCE_UNAVAILABLE,
  ID_ANNOUNCEMENTS,
  KEY_SPACE,
  KEY_ARROW_LEFT,
  KEY_ARROW_RIGHT,
  LOAD_TIMEOUT_MS,
  SELECTOR_PLAYER,
  isOutputEvent,
  splitCastFrame,
  clampElapsed,
  computeElapsedDelta,
  estimatedTerminalWidth,
  isPlaybackShortcut,
  isScrubWheel,
  wheelSeekDelta,
  initialPlayerState,
} from './cast-player-helpers.js';

/* ---- Player controller -------------------------------------- */

/**
 * Locate a polite live region for transport announcements, creating a
 * visually hidden fallback inside the player when the shared site
 * region (scripts/reader-state.js) has not been installed.
 *
 * @param {HTMLElement} root
 * @returns {HTMLElement|null}
 */
function resolveAnnounceRegion(root) {
  const shared = document.getElementById(ID_ANNOUNCEMENTS);
  if (shared) return shared;

  const local = document.createElement('span');
  local.className = CLASS_VISUALLY_HIDDEN;
  local.setAttribute('role', 'status');
  local.setAttribute('aria-live', 'polite');
  root.append(local);
  return local;
}

function createPlayer(container) {
  const src = container.getAttribute(ATTR_DATA_SRC);
  const title = container.getAttribute(ATTR_DATA_TITLE) || '';
  if (!src) return null;

  const dom = buildChrome(title);
  const {
    root, terminal, output, cursor, scrubber, fill, thumb,
    clockNow, clockTotal, playBtn, restartBtn, speedBtns,
  } = dom;

  container.appendChild(root);

  // Announce through the site-wide live region when it exists, so we
  // never stack a second status region per player instance.
  const announceRegion = resolveAnnounceRegion(root);

  let timeline = [];
  let durationMs = 0;
  const state = initialPlayerState();

  /* --- scrubber controller --- */

  const seekBar = createScrubber({
    element: scrubber,
    fill,
    thumb,
    getDurationMs: () => durationMs,
    getElapsedMs: () => state.elapsed,
    onSeek: seek,
    onToggle: togglePlay,
  });

  /* --- rendering --- */

  function clearOutput() {
    output.textContent = '';
    output.append(cursor);
    terminal.scrollTop = 0;
  }

  function appendEvent(ev) {
    if (!isOutputEvent(ev)) return;

    // Strip carriage returns so progress-bar redraws collapse cleanly.
    const lines = splitCastFrame(ev.data);

    for (let li = 0; li < lines.length; li += 1) {
      if (li > 0) {
        const lineEl = document.createElement('div');
        lineEl.className = CLASS_LINE;
        lineEl.append(cursor);
        output.append(lineEl);
      }
      if (lines[li]) {
        // Insert before the cursor wherever it currently lives.
        cursor.parentNode.insertBefore(document.createTextNode(lines[li]), cursor);
      }
    }
  }

  /**
   * Render every event at or before `upToMs` from a clean slate.
   *
   * Seeking backwards is indistinguishable from a very fast replay,
   * so rather than maintaining a rewind path we re-render. The pass
   * is O(events) and runs at most once per seek.
   */
  function renderAt(upToMs) {
    clearOutput();
    for (let i = 0; i < timeline.length; i += 1) {
      if (timeline[i].time * 1000 > upToMs) break;
      appendEvent(timeline[i]);
    }
    state.eventIdx = indexAt(timeline, upToMs);
    terminal.scrollTop = terminal.scrollHeight;
  }

  /** Flush only the events that became due since the last frame. */
  function flushTo(upToMs) {
    while (state.eventIdx < timeline.length && timeline[state.eventIdx].time * 1000 <= upToMs) {
      appendEvent(timeline[state.eventIdx]);
      state.eventIdx += 1;
    }
    terminal.scrollTop = terminal.scrollHeight;
  }

  /* --- status --- */

  function syncPosition() {
    seekBar.sync();
    scrubber.setAttribute('aria-valuetext', formatPosition(state.elapsed, durationMs));
    clockNow.textContent = formatClock(state.elapsed);
  }

  function setPlayIcon(isPlaying) {
    playBtn.textContent = isPlaying ? PAUSE_GLYPH : PLAY_GLYPH;
    playBtn.setAttribute('aria-label', isPlaying ? LABEL_PAUSE : LABEL_PLAY);
  }

  function announce(message) {
    if (announceRegion) announceRegion.textContent = message;
  }

  /* --- transport --- */

  function applySpeed(s) {
    state.speed = s;
    for (const btn of speedBtns) {
      const active = parseFloat(btn.dataset.speed) === s;
      btn.classList.toggle(CLASS_SPEED_BTN_ACTIVE, active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  function resetPlayback() {
    stopFrame();
    state.playing = false;
    state.finished = false;
    state.elapsed = 0;
    state.eventIdx = 0;
    clearOutput();
    root.classList.remove(CLASS_STATE_PAUSED, CLASS_STATE_FINISHED);
    setPlayIcon(false);
    syncPosition();
  }

  function markFinished() {
    state.elapsed = durationMs;
    state.finished = true;
    state.playing = false;
    stopFrame();
    root.classList.remove(CLASS_STATE_PAUSED);
    root.classList.add(CLASS_STATE_FINISHED);
    setPlayIcon(false);
    syncPosition();
  }

  function seek(targetMs, { announce: shouldAnnounce = true } = {}) {
    if (!timeline.length) return;

    state.elapsed = clampElapsed(targetMs, durationMs);
    state.finished = false;
    root.classList.remove(CLASS_STATE_FINISHED);
    renderAt(state.elapsed);
    syncPosition();

    if (shouldAnnounce) announce(formatPosition(state.elapsed, durationMs));
    if (state.elapsed >= durationMs) markFinished();
  }

  function stopFrame() {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }

  function tick(timestamp) {
    if (!state.playing) return;

    if (state.startTime === 0) state.startTime = timestamp;
    state.elapsed += computeElapsedDelta(timestamp, state.startTime, state.speed);
    state.startTime = timestamp;

    if (state.elapsed >= durationMs) {
      flushTo(durationMs);
      markFinished();
      announce(ANNOUNCE_FINISHED);
      return;
    }

    flushTo(state.elapsed);
    syncPosition();
    state.rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (!timeline.length) return;

    if (state.finished) {
      state.elapsed = 0;
      state.eventIdx = 0;
      clearOutput();
      root.classList.remove(CLASS_STATE_FINISHED);
    }

    state.playing = true;
    state.startTime = 0;
    root.classList.remove(CLASS_STATE_PAUSED);
    setPlayIcon(true);
    announce(ANNOUNCE_PLAYING);
    state.rafId = requestAnimationFrame(tick);
  }

  function pause() {
    state.playing = false;
    stopFrame();
    root.classList.add(CLASS_STATE_PAUSED);
    setPlayIcon(false);
    announce(ANNOUNCE_PAUSED);
  }

  function togglePlay() {
    if (state.playing) pause(); else play();
  }

  /* --- transport wiring --- */

  playBtn.addEventListener('click', togglePlay);

  restartBtn.addEventListener('click', () => {
    resetPlayback();
    play();
  });

  function speedHandler(btn) {
    return () => applySpeed(parseFloat(btn.dataset.speed));
  }

  for (const btn of speedBtns) {
    btn.addEventListener('click', speedHandler(btn));
  }

  // Player-level shortcuts, active only while focus is inside the
  // player itself so we never hijack page scrolling.
  root.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.target !== root) return;
    if (!isPlaybackShortcut(event)) return;

    event.preventDefault();
    if (event.key === KEY_SPACE) {
      togglePlay();
    } else if (event.key === KEY_ARROW_LEFT) {
      seek(state.elapsed - SEEK_STEP_MS);
    } else if (event.key === KEY_ARROW_RIGHT) {
      seek(state.elapsed + SEEK_STEP_MS);
    }
  });

  // Shift+wheel scrubs the recording without hijacking plain scroll.
  terminal.addEventListener('wheel', (event) => {
    if (!isScrubWheel(event) || !timeline.length) return;
    event.preventDefault();
    seek(state.elapsed + wheelSeekDelta(event.deltaY), { announce: false });
  }, { passive: false });

  /* --- load & parse --- */

  // Skip fetch during prerender (Node has no relative-URL fetch)
  if (typeof window === 'undefined') {
    return { el: root, play, pause, resetPlayback, seek };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);
  fetch(src, { signal: controller.signal })
    .then((r) => {
      clearTimeout(timeout);
      if (!r.ok) throw new Error(`Failed to load cast file: ${r.status}`);
      return r.text();
    })
    .then((text) => {
      const parsed = parseCast(text);
      timeline = buildCastTimeline(parsed.events);
      durationMs = timelineDuration(timeline);

      seekBar.setEnabled(true);
      scrubber.setAttribute('aria-valuemax', String(durationMs));
      clockTotal.textContent = formatClock(durationMs);
      syncPosition();

      // Match the recorded terminal width when the container is unpinned.
      if (parsed.header?.term?.cols && !container.style.width) {
        const estimated = estimatedTerminalWidth(parsed.header.term.cols);
        if (estimated !== null) {
          terminal.style.width = `${estimated}em`;
          terminal.style.maxWidth = '100%';
        }
      }
    })
    .catch((err) => {
      console.error('[cast-player]', err);
      output.textContent = `Error loading recording: ${err.message}`;
      seekBar.setEnabled(false);
      announce(ANNOUNCE_UNAVAILABLE);
    });

  return { el: root, play, pause, resetPlayback, seek };
}

/* ---- Public API --------------------------------------------- */

/**
 * Auto-discover all .cast-player[data-src] elements and initialize
 * a player for each. Call once after DOM is ready.
 *
 * @param {Document|Element} [scope=document]  Search scope
 * @returns {Array<object>}  Array of player instances
 */
export function initCastPlayers(scope = document) {
  const containers = scope.querySelectorAll(SELECTOR_PLAYER);
  const players = [];
  for (const container of containers) {
    players.push(createPlayer(container));
  }
  return players;
}
