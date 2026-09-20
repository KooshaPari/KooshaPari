/**
 * Pure helpers for the resume view.
 *
 * Currently exposes `formatYear` (YYYY-MM / 'present' -> display year)
 * — small but heavily re-used across role dates, education, and any
 * timeline badges that want a "Present" indicator.
 *
 * The remaining resume.js content is DOM-bound construction; it imports
 * this helper for the year formatting.
 */

/** Format a YYYY-MM date string to a display year (or 'Present'). */
export function formatYear(dateStr) {
  if (!dateStr || dateStr === 'present') return 'Present';
  return dateStr.split('-')[0];
}

/**
 * Compose a "YYYY – YYYY" or "YYYY – Present" string from start / end ISO
 * dates. Mirrors the `dates` field shape resume.js builds for each role.
 */
export function formatYearRange(start, end) {
  return `${formatYear(start)} \u2013 ${formatYear(end)}`;
}
