/**
 * Page Transition Engine
 *
 * Hooks into the router's `routechange` CustomEvent and wraps the
 * app's render call with coordinated fade-out / fade-in animations.
 *
 * Usage:
 *   import { initTransitions } from './transitions.js';
 *   initTransitions(router, { render });
 *
 * The engine is non-destructive: if JS is disabled or the CSS View
 * Transitions API is available, the appropriate path is taken.
 */

import {
  DURATION_OUT_MS,
  DURATION_IN_MS,
  DEBOUNCE_MS,
  SAFETY_NET_BUFFER_MS,
  CLASS_PREPARING,
  CLASS_OUT,
  CLASS_IN,
  CLASS_VISIBLE,
  SELECTOR_VIEW_ROOT,
  VIEW_ROOT_ID,
  transitionPlan,
  safetyNetMs,
  shouldReplaceQueue,
} from './transitions-helpers.js';

/* ── Lifecycle hooks ───────────────────────────────────────────────── */

/** @type {Array<(route: object) => void | Promise<void>>} */
const _beforeCallbacks = [];

/** @type {Array<(route: object) => void | Promise<void>>} */
const _afterCallbacks = [];

/* ── Helpers ───────────────────────────────────────────────────────── */

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function viewTransitionsSupported() {
  return 'startViewTransition' in document;
}

/** Wait for the next frame so the browser has time to paint. */
function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** Promise-based delay. */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Run an array of callbacks sequentially, awaiting each. */
async function runCallbacks(list, arg) {
  for (const cb of list) {
    await cb(arg);
  }
}

/* ── Core transition helpers ───────────────────────────────────────── */

/**
 * Animate the current page out.
 * Returns a Promise that resolves once the old content is hidden.
 *
 * @param {HTMLElement} container – the view-root element
 * @returns {Promise<void>}
 */
export function transitionOut(container) {
  return new Promise((resolve) => {
    if (prefersReducedMotion()) {
      container.innerHTML = '';
      return resolve();
    }

    container.classList.add(CLASS_PREPARING, CLASS_OUT);

    // Listen for the transition end, but fall back to timeout so we
    // never get stuck.
    const onEnd = () => {
      container.removeEventListener('transitionend', onEnd);
      container.innerHTML = '';
      container.classList.remove(CLASS_OUT);
      resolve();
    };

    container.addEventListener('transitionend', onEnd, { once: true });
    setTimeout(onEnd, safetyNetMs(DURATION_OUT_MS));
  });
}

/**
 * Inject new HTML into the container and animate it in.
 * Returns a Promise that resolves once the new content is fully visible.
 *
 * @param {HTMLElement} container – the view-root element
 * @param {string} newHTML – raw HTML string to inject
 * @returns {Promise<void>}
 */
export function transitionIn(container, newHTML) {
  return new Promise(async (resolve) => {
    if (prefersReducedMotion()) {
      container.innerHTML = newHTML;
      container.classList.remove(CLASS_PREPARING, CLASS_IN);
      return resolve();
    }

    // Inject content in the invisible state
    container.innerHTML = newHTML;
    container.classList.remove(CLASS_OUT);
    container.classList.add(CLASS_IN);

    // Let the browser paint the initial invisible state, then flip
    await nextFrame();
    container.classList.add(CLASS_VISIBLE);

    const onEnd = () => {
      container.removeEventListener('transitionend', onEnd);
      container.classList.remove(CLASS_IN, CLASS_VISIBLE, CLASS_PREPARING);
      resolve();
    };

    container.addEventListener('transitionend', onEnd, { once: true });
    setTimeout(onEnd, safetyNetMs(DURATION_IN_MS));
  });
}

/* ── Native CSS View Transitions path ──────────────────────────────── */

/**
 * Wrap a render call in the native CSS View Transitions API
 * (startViewTransition).
 *
 * @param {HTMLElement} viewRoot
 * @param {() => void} renderFn
 */
function nativeTransition(viewRoot, renderFn) {
  document.startViewTransition(() => {
    renderFn();
  });
}

/* ── Debounce / queue guard ────────────────────────────────────────── */

let _transitionQueue = null;   // active in-flight transition Promise
let _pendingRoute = null;      // latest route while a transition is running
let _timerId = null;

/* ── Public API ────────────────────────────────────────────────────── */

/**
 * Initialise the transition engine and hook it into the router.
 *
 * @param {object}   _router      – reserved for future router-specific hooks
 * @param {{ render: () => void, viewRoot?: HTMLElement }} options
 * @returns {{ destroy: () => void }} – teardown handle
 */
export function initTransitions(_router, { render: renderFn, viewRoot } = {}) {
  const root = viewRoot || document.getElementById(VIEW_ROOT_ID);
  if (!root || typeof renderFn !== 'function') {
    console.warn('[transitions] initTransitions requires a render function and a ' + SELECTOR_VIEW_ROOT);
    return { destroy() {} };
  }

  /**
   * Handle a single navigation: run before-callbacks → transition-out →
   * render → transition-in → after-callbacks.
   *
   * When a newer navigation arrives while one is in flight we skip the
   * full transition and jump to the pending route to avoid stacking
   * animations.
   */
  async function handleNavigation(route) {
    if (shouldReplaceQueue(_transitionQueue != null)) {
      _pendingRoute = route;
      return;
    }

    _pendingRoute = null;

    // Before-navigate hooks
    await runCallbacks(_beforeCallbacks, route);

    // Choose transition strategy
    const plan = transitionPlan({
      prefersReducedMotion: prefersReducedMotion(),
      viewTransitionsSupported: viewTransitionsSupported(),
    });
    if (plan === 'manual') {
      await transitionOut(root);
      renderFn();
      await transitionIn(root, '');
    } else {
      nativeTransition(root, () => {
        renderFn();
      });
    }

    // After-navigate hooks
    await runCallbacks(_afterCallbacks, route);

    // Check if a newer navigation arrived during the transition
    if (_pendingRoute) {
      const next = _pendingRoute;
      _pendingRoute = null;
      _transitionQueue = null;
      handleNavigation(next);
    } else {
      _transitionQueue = null;
    }
  }

  /** Debounced entry point wired to the router event. */
  function onRouteChange(event) {
    const route = event.detail;
    clearTimeout(_timerId);
    _timerId = setTimeout(() => {
      handleNavigation(route);
    }, DEBOUNCE_MS);
  }

  window.addEventListener('routechange', onRouteChange);

  return {
    destroy() {
      window.removeEventListener('routechange', onRouteChange);
      clearTimeout(_timerId);
      _transitionQueue = null;
      _pendingRoute = null;
    },
  };
}

/**
 * Register a callback that runs before the page-out animation starts.
 * The callback receives the incoming route object.
 *
 * @param {(route: object) => void | Promise<void>} callback
 */
export function onBeforeNavigate(callback) {
  _beforeCallbacks.push(callback);
}

/**
 * Register a callback that runs after the new page has fully faded in.
 * The callback receives the new route object.
 *
 * @param {(route: object) => void | Promise<void>} callback
 */
export function onAfterNavigate(callback) {
  _afterCallbacks.push(callback);
}

// Re-export for callers that import the orchestrator module.
export { transitionPlan, safetyNetMs, shouldReplaceQueue };
