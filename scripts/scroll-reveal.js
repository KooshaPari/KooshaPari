/* ================================================================
   Scroll-reveal — IntersectionObserver-based reveal system.

   Attributes:
     data-reveal         Direction/variant: left|right|up|down|fade|scale|rotate
     data-reveal-delay   Stagger delay in ms (set via CSS transition-delay)
     data-reveal-distance  Custom slide distance in px (default 24)

   CSS classes:
     .reveal-hidden  — initial off-screen state (set by CSS per data-reveal)
     .reveal-visible — animated final state

   Usage:
     import { initScrollReveal, refreshObserver } from './scroll-reveal.js';
     initScrollReveal();  // call once at app start
     refreshObserver();   // call after SPA route change to rescan DOM
   ================================================================ */

import {
  SELECTOR,
  DEFAULT_OPTIONS,
  parseRevealDistance,
  parseRevealDelay,
  distanceCssVar,
  delayStyle,
} from './scroll-reveal-helpers.js';

let _observer = null;
let _mutationObserver = null;
let _rafId = 0;
let _initialized = false;

/* ------------------------------------------------------------------
   Reduced-motion detection
   ------------------------------------------------------------------ */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ------------------------------------------------------------------
   Apply initial hidden state to an element based on its data-reveal
   ------------------------------------------------------------------ */
function applyHiddenState(el) {
  const distance = parseRevealDistance(el.dataset);

  // Set custom distance as CSS custom property so CSS can use it
  const cssVar = distanceCssVar(distance);
  if (cssVar !== null) {
    el.style.setProperty('--reveal-distance', cssVar);
  }
}

/* ------------------------------------------------------------------
   Apply stagger delay from data-reveal-delay
   ------------------------------------------------------------------ */
function applyDelay(el) {
  const delay = parseRevealDelay(el.dataset);
  const style = delayStyle(delay);
  if (style !== null) {
    el.style.transitionDelay = style;
  }
}

/* ------------------------------------------------------------------
   Reveal a single element
   ------------------------------------------------------------------ */
function revealElement(el) {
  if (el.classList.contains('reveal-visible')) return;

  applyDelay(el);
  el.classList.remove('reveal-hidden');
  el.classList.add('reveal-visible');
}

/* ------------------------------------------------------------------
   Scan DOM for new [data-reveal] elements and add .reveal-hidden
   ------------------------------------------------------------------ */
function scanForRevealElements(root = document) {
  const elements = root.querySelectorAll(SELECTOR);
  for (const el of elements) {
    if (prefersReducedMotion()) {
      // Show immediately, skip animation entirely
      el.classList.remove('reveal-hidden');
      el.classList.add('reveal-visible');
    } else if (!el.classList.contains('reveal-visible') && !el.classList.contains('reveal-hidden')) {
      el.classList.add('reveal-hidden');
      applyHiddenState(el);
    }
  }
}

/* ------------------------------------------------------------------
   Batch DOM scan via requestAnimationFrame
   ------------------------------------------------------------------ */
function batchScan(root = document) {
  if (_rafId) cancelAnimationFrame(_rafId);
  _rafId = requestAnimationFrame(() => {
    scanForRevealElements(root);
    attachToObserver(root);
  });
}

/* ------------------------------------------------------------------
   Observe elements for intersection (viewport entry)
   ------------------------------------------------------------------ */
function attachToObserver(root = document) {
  if (!_observer) return;
  const elements = root.querySelectorAll(
    `${SELECTOR}:not(.reveal-visible):not(.reveal-hidden)`
  );
  for (const el of elements) {
    _observer.observe(el);
  }
  // Also observe elements that are .reveal-hidden but not yet observed
  const hiddenElements = root.querySelectorAll(
    `${SELECTOR}.reveal-hidden`
  );
  for (const el of hiddenElements) {
    _observer.observe(el);
  }
}

/* ------------------------------------------------------------------
   Create the IntersectionObserver
   ------------------------------------------------------------------ */
function createObserver() {
  if (_observer) _observer.disconnect();

  _observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          revealElement(entry.target);
          _observer.unobserve(entry.target);
        }
      }
    },
    DEFAULT_OPTIONS
  );
}

/* ------------------------------------------------------------------
   Create MutationObserver for dynamically added elements
   ------------------------------------------------------------------ */
function createMutationObserver() {
  if (_mutationObserver) _mutationObserver.disconnect();

  _mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches?.(SELECTOR) || node.querySelector?.(SELECTOR)) {
          batchScan(node);
        }
      }
    }
  });

  _mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/* ------------------------------------------------------------------
   Reveal-on-scroll safety net
   ------------------------------------------------------------------
   The observer uses rootMargin '0px 0px -40px 0px' and threshold 0.1, so an
   element only reveals once it has crossed a line 40px ABOVE the bottom of the
   viewport. An element whose top lands inside that 40px band at the end of the
   document never crosses the line, so it stays .reveal-hidden forever while
   being fully on screen. Observed on /resume at 1280x720: the last row of
   .resume-skill cards settled at top=716 against a 720px viewport and stayed
   invisible until the user scrolled further.

   Reveal anything currently inside the viewport on each scroll tick. This
   cannot double-fire: revealElement() is a no-op once .reveal-visible is set.
   It is also cheap, because the query only matches elements still hidden.
   ------------------------------------------------------------------ */
function revealInViewOnScroll() {
  if (prefersReducedMotion()) return;
  const hidden = document.querySelectorAll(`${SELECTOR}.reveal-hidden`);
  if (hidden.length === 0) return;
  for (const el of hidden) {
    const rect = el.getBoundingClientRect();
    // A non-rendering element (display:none, zero-height, collapsed ancestor)
    // can never legitimately be revealed by scrolling; leave it alone.
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      revealElement(el);
    }
  }
}

/* ------------------------------------------------------------------
   Public API
   ------------------------------------------------------------------ */

let _scrollBound = false;

function bindScrollSafetyNet() {
  if (_scrollBound) return;
  _scrollBound = true;
  // Passive: this listener never calls preventDefault, so the browser can keep
  // scrolling on the compositor thread without waiting for it.
  window.addEventListener('scroll', revealInViewOnScroll, { passive: true });
}

/**
 * Initialize the scroll-reveal system.
 * Safe to call multiple times; subsequent calls act as a refresh.
 */
export function initScrollReveal() {
  if (_initialized) {
    refreshObserver();
    return;
  }
  _initialized = true;

  createObserver();
  createMutationObserver();
  batchScan();
  // The first batchScan is coalesced on a single requestAnimationFrame handle.
  // Any scan scheduled before the observer existed is cancelled by it, so the
  // DOM present at startup can end up scanned with no observer attached. Attach
  // synchronously as well, which makes init order-independent: whether the
  // host renders before or after this call, every [data-reveal] element in the
  // document ends up observed.
  scanForRevealElements();
  attachToObserver();
  bindScrollSafetyNet();
}

/**
 * Rescan the DOM for new [data-reveal] elements.
 * Call after SPA route changes or dynamic content injection.
 */
export function refreshObserver() {
  batchScan();
  // batchScan coalesces onto one requestAnimationFrame handle, so a burst of
  // route changes inside a single frame keeps only the last scan. Scan and
  // attach synchronously as well so the new view's elements are observed on the
  // frame they are rendered rather than one frame later.
  scanForRevealElements();
  attachToObserver();
}

export default initScrollReveal;
