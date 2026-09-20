/* ================================================================
   counter-animate.js — Animate metric numbers on scroll.

   Finds elements with data-count-to attribute, animates from 0
   to target value when element enters viewport via IntersectionObserver.
   Supports prefixes/suffixes, comma formatting, and easing.
   ================================================================ */

import {
  DEFAULT_DURATION,
  easingOut,
  parseMetricText,
  formatNumber,
  counterFrameText,
} from './counter-animate-helpers.js';

const SELECTOR = '[data-count-to]';

let _observer = null;

/**
 * Animate a single element's text from 0 to its target value.
 * @param {HTMLElement} el
 */
function animateCounter(el) {
  if (el._counterAnimated) return;
  el._counterAnimated = true;

  const targetText = el.getAttribute('data-count-to') || el.textContent;
  const parsed = parseMetricText(targetText);

  if (parsed.value === 0) return;

  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / DEFAULT_DURATION, 1);
    const easedProgress = easingOut(progress);

    el.textContent = counterFrameText(parsed, easedProgress);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      // Ensure final value is exact
      el.textContent = targetText;
    }
  }

  requestAnimationFrame(tick);
}

/**
 * Initialize counter animation. Finds all [data-count-to] elements
 * and observes them for viewport entry.
 */
export function initCounterAnimate() {
  const elements = document.querySelectorAll(SELECTOR);
  if (!elements.length) return;

  // If reduced motion, show final values immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((el) => {
      const target = el.getAttribute('data-count-to');
      if (target) el.textContent = target;
    });
    return;
  }

  if (!_observer) {
    _observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            _observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.3 }
    );
  }

  elements.forEach((el) => _observer.observe(el));
}
