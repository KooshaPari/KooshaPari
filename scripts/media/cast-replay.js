// Asciinema v2 .cast local replay — parser, playback, and renderer.
// Progressive disclosure: fetches on user action, renders via textContent,
// strips ANSI safely, bounded playback, abort/cleanup, no fake telemetry.

const ESC = '\u001b';
const ANSI_RE = new RegExp(
  `${ESC}\\[[\\x30-\\x3f]*[\\x20-\\x2f]*[\\x40-\\x7e]`
  + `|${ESC}\\][\\s\\S]*?(?:${ESC}\\x5c|\x07)`
  + `|${ESC}[()][AB012]`
  + `|${ESC}[>#]`,
  'g',
);

export function stripAnsi(text) {
  if (typeof text !== 'string') return '';
  return text.replace(ANSI_RE, '');
}

export function parseCastLines(raw) {
  if (typeof raw !== 'string' || raw.length === 0) {
    return { header: null, frames: [], totalDuration: 0, error: 'empty payload' };
  }

  const lines = raw.split('\n');
  let header = null;
  const frames = [];
  let error = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      error = `malformed JSON at line ${i + 1}`;
      continue;
    }

    if (i === 0 && parsed && typeof parsed === 'object' && parsed.version != null) {
      header = parsed;
      continue;
    }

    if (Array.isArray(parsed) && parsed.length >= 3) {
      const [delay, type, payload] = parsed;
      if (typeof delay === 'number' && delay >= 0) {
        frames.push({
          delay,
          type: String(type),
          payload: String(payload ?? ''),
        });
      }
    }
  }

  const totalDuration = frames.reduce((sum, f) => sum + f.delay, 0);

  return {
    header,
    frames,
    totalDuration,
    error,
  };
}

// --- Playback state machine ---

export function createCastReplay(frames, options = {}) {
  if (!Array.isArray(frames) || frames.length === 0) {
    return {
      pause: () => {},
      play: () => false,
      restart: () => {},
      stop: () => {},
      getCurrentText: () => '',
      getElapsed: () => 0,
      getPlaying: () => false,
    };
  }

  const { onStateChange, reducedMotion = false } = options;
  let frameIdx = 0;
  let playing = false;
  let timerId = null;
  let currentText = '';

  function buildTextUpTo(idx) {
    let text = '';
    for (let i = 0; i <= idx && i < frames.length; i += 1) {
      if (frames[i].type === 'o') text += frames[i].payload;
    }
    return text;
  }

  function elapsedAt(idx) {
    let total = 0;
    for (let i = 0; i <= idx && i < frames.length; i += 1) {
      total += frames[i].delay;
    }
    return total;
  }

  function emit() {
    if (typeof onStateChange === 'function') {
      onStateChange({
        playing,
        elapsed: elapsedAt(frameIdx - 1),
        text: currentText,
      });
    }
  }

  function totalDuration() {
    return frames.reduce((sum, f) => sum + f.delay, 0);
  }

  function scheduleNext() {
    clearTimeout(timerId);
    if (!playing) return;

    if (frameIdx >= frames.length) {
      playing = false;
      emit();
      return;
    }

    // Batch consecutive 0-delay frames: emit once after all are consumed,
    // avoiding redundant repaints in reduced-motion and keeping the DOM
    // in sync with the final visible state.
    if (frames[frameIdx].delay === 0) {
      while (frameIdx < frames.length && frames[frameIdx].delay === 0) {
        currentText = buildTextUpTo(frameIdx);
        frameIdx += 1;
      }
      if (frameIdx >= frames.length) playing = false;
      emit();
      if (playing) scheduleNext();
      return;
    }

    const waitMs = reducedMotion ? 0 : Math.max(frames[frameIdx].delay, 0.016) * 1000;

    timerId = setTimeout(() => {
      currentText = buildTextUpTo(frameIdx);
      frameIdx += 1;
      if (frameIdx >= frames.length) playing = false;
      emit();
      if (playing) scheduleNext();
    }, waitMs);
  }

  function play() {
    if (playing) return false;
    playing = true;
    emit();
    scheduleNext();
    return true;
  }

  function pause() {
    if (!playing) return;
    playing = false;
    clearTimeout(timerId);
    emit();
  }

  function restart() {
    clearTimeout(timerId);
    playing = false;
    frameIdx = 0;
    currentText = '';
    emit();
  }

  function stop() {
    clearTimeout(timerId);
    playing = false;
    frameIdx = 0;
    currentText = '';
  }

  function getCurrentText() {
    return buildTextUpTo(frameIdx - 1);
  }

  function getElapsed() {
    return elapsedAt(frameIdx - 1);
  }

  return {
    pause,
    play,
    restart,
    stop,
    getCurrentText,
    getElapsed,
    getPlaying: () => playing,
  };
}

// --- DOM Renderer ---

export function renderCastReplay(recording, documentRef = document) {
  const container = documentRef.createElement('div');
  container.className = 'sharecli-cast-replay';

  let castState = 'idle';
  let replay = null;
  let stateChangeHandler = null;
  let loadAbort = null;
  let loadTimer = null;

  const castContainer = documentRef.createElement('div');
  castContainer.className = 'sharecli-cast-replay__terminal';
  castContainer.setAttribute('role', 'region');
  castContainer.setAttribute('aria-label', `Terminal replay: ${recording.label}`);
  container.appendChild(castContainer);

  const controls = documentRef.createElement('div');
  controls.className = 'sharecli-cast-replay__controls';
  container.appendChild(controls);

  function clearLoadTimeout() {
    if (loadTimer != null) {
      clearTimeout(loadTimer);
      loadTimer = null;
    }
  }

  function clearLoadAbort() {
    if (loadAbort != null) {
      loadAbort.abort();
      loadAbort = null;
    }
  }

  function cleanupReplay() {
    if (replay != null) {
      replay.stop();
      replay = null;
    }
    if (stateChangeHandler != null) {
      container.removeEventListener('statechange', stateChangeHandler);
      stateChangeHandler = null;
    }
  }

  function renderControls(replayCtrl) {
    controls.textContent = '';

    const playBtn = documentRef.createElement('button');
    playBtn.className = 'btn btn--sm';
    playBtn.textContent = 'Play';
    playBtn.addEventListener('click', () => {
      if (replayCtrl.getPlaying()) {
        replayCtrl.pause();
        playBtn.textContent = 'Play';
      } else {
        replayCtrl.play();
        playBtn.textContent = 'Pause';
      }
    });

    const restartBtn = documentRef.createElement('button');
    restartBtn.className = 'btn btn--sm';
    restartBtn.textContent = 'Restart';
    restartBtn.addEventListener('click', () => {
      replayCtrl.restart();
      castContainer.textContent = stripAnsi(replayCtrl.getCurrentText());
      playBtn.textContent = 'Play';
    });

    controls.appendChild(playBtn);
    controls.appendChild(restartBtn);
  }

  function loadError(err) {
    castState = 'error';
    cleanupReplay();
    clearLoadTimeout();

    castContainer.textContent = '';

    const msg = documentRef.createElement('p');
    msg.textContent = `Could not load recording: ${err.message || err}`;
    castContainer.appendChild(msg);

    // Preserve the download link so the visitor can still save the file.
    const dl = documentRef.createElement('a');
    dl.className = 'text-link';
    dl.href = recording.href;
    dl.download = `sharecli-${recording.id}-real.cast`;
    dl.textContent = 'Download recording instead';
    castContainer.appendChild(dl);

    controls.textContent = '';
  }

  // Reduced-motion check: default true for Node / no matchMedia context.
  const prefersReducedMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : true;

  // Load button: progressive disclosure — fetches on user action only.
  const loadBtn = documentRef.createElement('button');
  loadBtn.className = 'btn btn--sm';
  loadBtn.textContent = 'Load recording';
  loadBtn.addEventListener('click', async () => {
    if (castState === 'loading') return;
    castState = 'loading';
    loadBtn.textContent = 'Loading\u2026';
    loadBtn.disabled = true;
    castContainer.textContent = 'Fetching recording\u2026';

    loadAbort = new AbortController();
    loadTimer = setTimeout(() => {
      clearLoadAbort();
      loadError(new Error('Recording load timed out'));
    }, 15000);

    try {
      const response = await fetch(recording.href, { signal: loadAbort.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.text();
      clearLoadTimeout();
      const parsed = parseCastLines(raw);
      if (parsed.error && parsed.frames.length === 0) {
        throw new Error(parsed.error);
      }

      castState = 'ready';
      castContainer.textContent = '';
      replay = createCastReplay(parsed.frames, {
        reducedMotion: prefersReducedMotion,
        onStateChange: (state) => {
          castContainer.textContent = stripAnsi(state.text);
        },
      });

      // Static transcript: show full text immediately for reduced-motion.
      if (prefersReducedMotion) {
        castContainer.textContent = stripAnsi(replay.getCurrentText());
      }

      renderControls(replay);
    } catch (err) {
      if (err.name === 'AbortError') return;
      loadError(err);
    }
  });

  controls.appendChild(loadBtn);

  // Cleanup when removed from DOM.
  if (typeof MutationObserver !== 'undefined') {
    const removalObserver = new MutationObserver(() => {
      if (!documentRef.contains(container)) {
        removalObserver.disconnect();
        clearLoadTimeout();
        clearLoadAbort();
        cleanupReplay();
      }
    });
    removalObserver.observe(documentRef.body || documentRef, { childList: true, subtree: true });
  }

  return container;
}
