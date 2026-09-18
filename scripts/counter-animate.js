/* ================================================================
   counter-animate.js — Animate metric numbers on scroll.

   Finds elements with data-count-to attribute, animates from 0
   to target value when element enters viewport via IntersectionObserver.
   Supports prefixes/suffixes, comma formatting, and easing.
   ================================================================ */

const SELECTOR = '[data-count-to]';
const DURATION = 1200; // ms
const EASING_OUT = (t) => 1 - Math.pow(1 - t, 3); // ease-out cubic

let _observer = null;

/**
 * Parse a display string to extract numeric value and formatting.
 * Handles: "~4,900", "101", "~$432K", "28 days"
 * @param {string} text
 * @returns {{ value: number, prefix: string, suffix: string, format: string }}
 */
function parseMetricText(text) {
  const cleaned = text.trim();
  // Match optional prefix (~, $), number (with commas), optional suffix (K, %, etc.)
  const match = cleaned.match(/^([^0-9]*?)([0-9,]+\.?[0-9]*)(.*)$/);
  if (!match) return { value: 0, prefix: '', suffix: '', format: 'none' };

  const prefix = match[1];
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3];
  const value = parseFloat(numStr);

  // Detect format: integer, decimal, with commas
  const hasCommas = match[2].includes(',');
  const hasDecimals = match[2].includes('.');

  return {
    value,
    prefix,
    suffix,
    format: hasCommas ? 'comma' : hasDecimals ? 'decimal' : 'integer',
  };
}

/**
 * Format a number with commas and/or decimals.
 * @param {number} num
 * @param {string} format
 * @returns {string}
 */
function formatNumber(num, format) {
  if (format === 'decimal') {
    return num.toFixed(1);
  }
  const rounded = Math.round(num);
  if (format === 'comma') {
    return rounded.toLocaleString('en-US');
  }
  return String(rounded);
}

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
    const progress = Math.min(elapsed / DURATION, 1);
    const easedProgress = EASING_OUT(progress);
    const current = parsed.value * easedProgress;

    const formatted = formatNumber(current, parsed.format);
    el.textContent = `${parsed.prefix}${formatted}${parsed.suffix}`;

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
