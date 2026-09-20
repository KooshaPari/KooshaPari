/**
 * WITF viewer pure helpers.
 *
 * Everything in here is a pure function or a function whose only side effect is on a
 * passed-in DOM node. They have no module-level state, no three.js references, and no
 * implicit globals beyond the ones the caller already depends on (document, window).
 *
 * The orchestrator that ties them together lives in `witf-viewer.js`. Splitting the
 * helpers out lets us unit-test each concern without spinning up three.js, a WebGL
 * context, an IntersectionObserver, or any of the async choreography the orchestrator
 * coordinates. The orchestrator imports these helpers and stitches them together.
 */

import { POSTER_SRC, POSTER_ALT } from './witf-poster.js';

/**
 * Reject if `promise` has not settled within `ms`.
 * The timer is always cleared so a late rejection cannot surface as an
 * unhandled one after the race has already resolved.
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} label
 * @returns {Promise<T>}
 */
export function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Cached WebGL capability probe. Returns null until the first probe runs so callers
 * can tell a fresh probe apart from a cached miss. The module-level cache lives here
 * because the probe is expensive enough that we want one result per session.
 *
 * @type {boolean | null}
 */
let _webglSupport = null;

/**
 * Probe once per session and release the probe context.
 *
 * This used to build a fresh WebGL context on every home render (measured: 7
 * contexts after 7 in-app navigations) and never release them. Browsers cap
 * live WebGL contexts per page, so the probe both cost a context creation per
 * render and eventually forced the oldest context to be dropped.
 *
 * @param {{ createElement?: typeof document.createElement }} [deps] - injection seam for tests
 * @returns {boolean}
 */
export function webglSupported(deps = {}) {
  if (_webglSupport !== null) return _webglSupport;
  const createElement = deps.createElement ?? document.createElement.bind(document);
  try {
    const canvas = createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    _webglSupport = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    _webglSupport = false;
  }
  return _webglSupport;
}

/**
 * Reset the cached WebGL probe result. Tests use this; production code never needs to.
 * @returns {void}
 */
export function _resetWebglCacheForTests() {
  _webglSupport = null;
}

/**
 * Visitor prefers reduced motion. Returns false in environments without matchMedia.
 *
 * @param {MediaQueryList | { matches: boolean } | null | undefined} [mq]
 * @returns {boolean}
 */
export function prefersReducedMotion(mq) {
  if (mq) return mq.matches;
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Visitor uses a coarse pointer (touch). Returns false in environments without matchMedia.
 *
 * @param {MediaQueryList | { matches: boolean } | null | undefined} [mq]
 * @returns {boolean}
 */
export function isCoarsePointer(mq) {
  if (mq) return mq.matches;
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Replace the contents of `container` with the static poster image. This is the fallback
 * path when WebGL is unsupported, the visitor prefers reduced motion, or the three.js
 * CDN never loaded.
 *
 * @param {HTMLElement} container
 * @param {{ src?: string, alt?: string }} [poster]
 * @returns {HTMLImageElement}
 */
export function showPoster(container, poster = {}) {
  const src = poster.src ?? POSTER_SRC;
  const alt = poster.alt ?? POSTER_ALT;
  // Use innerHTML to clear, matching what the original orchestrator did.
  container.innerHTML = '';
  const img = container.ownerDocument.createElement('img');
  img.setAttribute('src', src);
  img.setAttribute('alt', alt);
  img.setAttribute('loading', 'lazy');
  img.setAttribute('decoding', 'async');
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;aspect-ratio:16/9;';
  container.appendChild(img);
  return img;
}

/**
 * Create and append a loading indicator. The orchestrator removes it once three.js
 * and the GLB have both loaded, or when the catch block falls back to the poster.
 *
 * @param {HTMLElement} container
 * @param {string} [text]
 * @returns {HTMLDivElement}
 */
export function createLoadingIndicator(container, text = 'Loading 3D model\u2026') {
  const el = container.ownerDocument.createElement('div');
  el.className = 'witf-viewer-loading';
  el.textContent = text;
  container.appendChild(el);
  return el;
}

/**
 * Build the interaction hint with the right copy for the visitor's pointer type.
 *
 * @param {HTMLElement} container
 * @param {{ coarse?: boolean, touch?: string, mouse?: string }} [text]
 * @returns {HTMLDivElement}
 */
export function createHint(container, text = {}) {
  const coarse = text.coarse ?? isCoarsePointer();
  const touch = text.touch ?? 'Pinch to zoom \u00b7 Drag to rotate';
  const mouse = text.mouse ?? 'Drag to rotate \u00b7 Scroll to zoom';
  const el = container.ownerDocument.createElement('div');
  el.className = 'witf-viewer-hint';
  el.textContent = coarse ? touch : mouse;
  container.appendChild(el);
  return el;
}

/**
 * Fade and remove the interaction hint, but only once. Subsequent calls are no-ops
 * so the orchestrator can call this from both the interaction listener and the
 * auto-fade timer without racing on visibility.
 *
 * @param {HTMLDivElement | null} hintEl
 * @param {{ faded?: boolean, hiddenClass?: string, fadeMs?: number }} [state]
 * @returns {void}
 */
export function fadeHint(hintEl, state = {}) {
  const faded = state.faded ?? false;
  const hiddenClass = state.hiddenClass ?? 'witf-viewer-hint--hidden';
  const fadeMs = state.fadeMs ?? 600;
  if (faded || !hintEl) return;
  hintEl.classList.add(hiddenClass);
  setTimeout(() => { hintEl.remove(); }, fadeMs);
}

/**
 * Build an IntersectionObserver-driven lazy-load gate. The returned `observe(container)`
 * function fires `onReady(container)` the first time the container scrolls within
 * `rootMargin` of the viewport. After firing, the gate is disconnected automatically.
 *
 * Returns a plain object so the orchestrator can disconnect on cleanup without holding
 * on to a class instance.
 *
 * @param {(container: HTMLElement) => void} onReady
 * @param {{ rootMargin?: string, io?: typeof IntersectionObserver }} [opts]
 * @returns {{ observe: (container: HTMLElement) => void, disconnect: () => void, kind: 'io' | 'none' }}
 */
export function createLazyLoadGate(onReady, opts = {}) {
  const rootMargin = opts.rootMargin ?? '300px';
  const IO = opts.io ?? (typeof IntersectionObserver !== 'undefined' ? IntersectionObserver : null);
  if (!IO) return { observe: () => onReady, disconnect: () => {}, kind: 'none' };
  let gate = null;
  return {
    kind: 'io',
    observe(container) {
      gate = new IO((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        gate?.disconnect();
        onReady(container);
      }, { rootMargin });
      gate.observe(container);
    },
    disconnect() { gate?.disconnect(); gate = null; },
  };
}

/**
 * Build an IntersectionObserver that flips a single boolean `frameEnabled` flag whenever
 * the container crosses the viewport threshold. The animation loop reads the flag and
 * skips drawing while the container is offscreen — this keeps the auto-rotate scene
 * from burning GPU for the rest of the session after the visitor scrolls past.
 *
 * @param {HTMLElement} container
 * @param {{ rootMargin?: string, onChange?: (enabled: boolean) => void, io?: typeof IntersectionObserver }} [opts]
 * @returns {{ kind: 'io' | 'noop', setEnabled?: (enabled: boolean) => void }}
 */
export function createVisibilityToggle(container, opts = {}) {
  const rootMargin = opts.rootMargin ?? '100px';
  const onChange = opts.onChange ?? (() => {});
  const IO = opts.io ?? (typeof IntersectionObserver !== 'undefined' ? IntersectionObserver : null);
  if (!IO) return { kind: 'noop', setEnabled: onChange };
  const view = new IO((entries) => {
    for (const entry of entries) onChange(entry.isIntersecting);
  }, { rootMargin });
  view.observe(container);
  return { kind: 'io', setEnabled: onChange };
}
