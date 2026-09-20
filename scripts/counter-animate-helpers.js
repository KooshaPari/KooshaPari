/**
 * Pure helpers for the metric-counter scroll-into-view animation.
 *
 * The orchestrator (counter-animate.js) is DOM-bound; this file owns:
 *
 *   - DEFAULT_DURATION: animation duration in ms
 *   - easingOut(t): cubic ease-out curve, t in [0, 1] -> [0, 1]
 *   - parseMetricText(text): split "~$432K" into
 *       { value, prefix, suffix, format }
 *     Format is one of 'integer' | 'comma' | 'decimal' | 'none'
 *   - formatNumber(num, format): apply the format back during animation
 *   - counterFrameText(parsed, progress): the formatted text for a given
 *     eased progress value
 *
 * All helpers are pure given their inputs.
 */

export const DEFAULT_DURATION = 1200;

export function easingOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

const METRIC_RE = /^([^0-9]*?)([0-9,]+\.?[0-9]*)(.*)$/;

/**
 * Parse a display string to extract numeric value and formatting.
 * Handles: "~4,900", "101", "~$432K", "28 days"
 *
 * @param {string} text
 * @returns {{ value: number, prefix: string, suffix: string, format: 'integer' | 'comma' | 'decimal' | 'none' }}
 */
export function parseMetricText(text) {
  const cleaned = text.trim();
  const match = cleaned.match(METRIC_RE);
  if (!match) return { value: 0, prefix: '', suffix: '', format: 'none' };

  const prefix = match[1];
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3];
  const value = parseFloat(numStr);

  const hasCommas = match[2].includes(',');
  const hasDecimals = match[2].includes('.');

  return {
    value: Number.isFinite(value) ? value : 0,
    prefix,
    suffix,
    format: hasCommas ? 'comma' : hasDecimals ? 'decimal' : 'integer',
  };
}

/**
 * Format a number with commas and/or decimals.
 *
 * @param {number} num
 * @param {'integer' | 'comma' | 'decimal' | 'none'} format
 * @returns {string}
 */
export function formatNumber(num, format) {
  if (format === 'decimal') {
    return num.toFixed(1);
  }
  const rounded = Math.round(num);
  if (format === 'comma') {
    return rounded.toLocaleString('en-US');
  }
  // 'integer' and 'none' both yield the plain integer string
  return String(rounded);
}

/**
 * Given the parsed metadata and the eased progress (0..1), return the
 * text that should be displayed in this frame.
 *
 * @param {{ value: number, prefix: string, suffix: string, format: 'integer' | 'comma' | 'decimal' | 'none' }} parsed
 * @param {number} easedProgress - easingOut applied value in [0, 1]
 */
export function counterFrameText(parsed, easedProgress) {
  const current = parsed.value * easedProgress;
  const formatted = formatNumber(current, parsed.format);
  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}
