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
     cast-timeline.js       pure .cast parsing, timeline math, clock format
     cast-player-chrome.js  markup construction
     cast-scrubber.js       APG media seek-slider interaction

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
  const shared = document.getElementById('announcements');
  if (shared) return shared;

  const local = document.createElement('span');
  local.className = 'visually-hidden';
  local.setAttribute('role', 'status');
  local.setAttribute('aria-live', 'polite');
  root.append(local);
  return local;
}

function createPlayer(container) {
  const src = container.getAttribute('data-src');
  const title = container.getAttribute('data-title') || '';
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
  let speed = 1;
  let playing = false;
  let finished = false;
  let startTime = 0;
  let elapsed = 0;        // accumulated playing time in ms at 1x
  let rafId = null;
  let eventIdx = 0;

  /* --- scrubber controller --- */

  const seekBar = createScrubber({
    element: scrubber,
    fill,
    thumb,
    getDurationMs: () => durationMs,
    getElapsedMs: () => elapsed,
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
    if (ev.type !== 'o' && ev.type !== 'i') return;

    // Strip carriage returns so progress-bar redraws collapse cleanly.
    const lines = ev.data.replace(/\r/g, '').split('\n');

    for (let li = 0; li < lines.length; li += 1) {
      if (li > 0) {
        const lineEl = document.createElement('div');
        lineEl.className = 'cast-player__line';
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
    eventIdx = indexAt(timeline, upToMs);
    terminal.scrollTop = terminal.scrollHeight;
  }

  /** Flush only the events that became due since the last frame. */
  function flushTo(upToMs) {
    while (eventIdx < timeline.length && timeline[eventIdx].time * 1000 <= upToMs) {
      appendEvent(timeline[eventIdx]);
      eventIdx += 1;
    }
    terminal.scrollTop = terminal.scrollHeight;
  }

  /* --- status --- */

  function syncPosition() {
    seekBar.sync();
    scrubber.setAttribute('aria-valuetext', formatPosition(elapsed, durationMs));
    clockNow.textContent = formatClock(elapsed);
  }

  function setPlayIcon(isPlaying) {
    playBtn.textContent = isPlaying ? '\u23f8' : '\u25b6';
    playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  }

  function announce(message) {
    if (announceRegion) announceRegion.textContent = message;
  }

  /* --- transport --- */

  function applySpeed(s) {
    speed = s;
    for (const btn of speedBtns) {
      const active = parseFloat(btn.dataset.speed) === s;
      btn.classList.toggle('cast-player__speed-btn--active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  function resetPlayback() {
    stopFrame();
    playing = false;
    finished = false;
    elapsed = 0;
    eventIdx = 0;
    clearOutput();
    root.classList.remove('cast-player--paused', 'cast-player--finished');
    setPlayIcon(false);
    syncPosition();
  }

  function markFinished() {
    elapsed = durationMs;
    finished = true;
    playing = false;
    stopFrame();
    root.classList.remove('cast-player--paused');
    root.classList.add('cast-player--finished');
    setPlayIcon(false);
    syncPosition();
  }

  function seek(targetMs, { announce: shouldAnnounce = true } = {}) {
    if (!timeline.length) return;

    elapsed = Math.max(0, Math.min(durationMs, targetMs));
    finished = false;
    root.classList.remove('cast-player--finished');
    renderAt(elapsed);
    syncPosition();

    if (shouldAnnounce) announce(formatPosition(elapsed, durationMs));
    if (elapsed >= durationMs) markFinished();
  }

  function stopFrame() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function tick(timestamp) {
    if (!playing) return;

    if (startTime === 0) startTime = timestamp;
    elapsed += (timestamp - startTime) * speed;
    startTime = timestamp;

    if (elapsed >= durationMs) {
      flushTo(durationMs);
      markFinished();
      announce('Playback finished');
      return;
    }

    flushTo(elapsed);
    syncPosition();
    rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (!timeline.length) return;

    if (finished) {
      elapsed = 0;
      eventIdx = 0;
      clearOutput();
      root.classList.remove('cast-player--finished');
    }

    playing = true;
    startTime = 0;
    root.classList.remove('cast-player--paused');
    setPlayIcon(true);
    announce('Playing');
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    playing = false;
    stopFrame();
    root.classList.add('cast-player--paused');
    setPlayIcon(false);
    announce('Paused');
  }

  function togglePlay() {
    if (playing) pause(); else play();
  }

  /* --- transport wiring --- */

  playBtn.addEventListener('click', togglePlay);

  restartBtn.addEventListener('click', () => {
    resetPlayback();
    play();
  });

  for (const btn of speedBtns) {
    btn.addEventListener('click', () => {
      applySpeed(parseFloat(btn.dataset.speed));
    });
  }

  // Player-level shortcuts, active only while focus is inside the
  // player itself so we never hijack page scrolling.
  root.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.target !== root) return;

    if (event.key === ' ') {
      event.preventDefault();
      togglePlay();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      seek(elapsed - SEEK_STEP_MS);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      seek(elapsed + SEEK_STEP_MS);
    }
  });

  // Shift+wheel scrubs the recording without hijacking plain scroll.
  terminal.addEventListener('wheel', (event) => {
    if (!event.shiftKey || !timeline.length) return;
    event.preventDefault();
    seek(elapsed + Math.sign(event.deltaY) * SEEK_STEP_MS, { announce: false });
  }, { passive: false });

  /* --- load & parse --- */

  // Skip fetch during prerender (Node has no relative-URL fetch)
  if (typeof window === 'undefined') {
    return { el: root, play, pause, resetPlayback, seek };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
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
        const estimated = parsed.header.term.cols * 0.6; // em-width of one cell
        if (estimated > 30 && estimated < 90) {
          terminal.style.width = `${estimated}em`;
          terminal.style.maxWidth = '100%';
        }
      }
    })
    .catch((err) => {
      console.error('[cast-player]', err);
      output.textContent = `Error loading recording: ${err.message}`;
      seekBar.setEnabled(false);
      announce('Recording unavailable');
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
  const containers = scope.querySelectorAll('.cast-player[data-src]');
  const players = [];
  for (const container of containers) {
    players.push(createPlayer(container));
  }
  return players;
}
