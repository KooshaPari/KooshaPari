/* ================================================================
   Cast timeline — pure parsing and formatting for asciinema .cast.

   Split out of cast-player.js so the playback engine stays a
   presentation concern and the .cast math stays unit-testable.

   .cast format
     Line 1  JSON header { version, term:{cols,rows}, title, command }
     Line N  JSON array [relative_seconds, event_type, data]
   ================================================================ */

/**
 * Parse a .cast file string into a header plus ordered events.
 *
 * @param {string} raw  Raw .cast file contents
 * @returns {{ header: object, events: Array<{ dt: number, type: string, data: string }> }}
 */
export function parseCast(raw) {
  const lines = String(raw).split('\n').filter((line) => line.trim());
  if (!lines.length) throw new Error('empty cast file');

  const header = JSON.parse(lines[0]);
  const events = [];

  for (let i = 1; i < lines.length; i += 1) {
    const arr = JSON.parse(lines[i]);
    // Skip malformed rows rather than aborting the whole recording.
    if (!Array.isArray(arr) || arr.length < 2) continue;
    events.push({
      dt: Number(arr[0]) || 0,
      type: String(arr[1]),
      data: arr[2] == null ? '' : String(arr[2]),
    });
  }

  return { header, events };
}

/**
 * Flatten relative event offsets into absolute timestamps.
 *
 * @param {Array<{ dt: number, type: string, data: string }>} events
 * @returns {Array<{ time: number, type: string, data: string }>}  time in seconds
 */
export function buildCastTimeline(events) {
  const timeline = [];
  let t = 0;

  for (const ev of events) {
    t += ev.dt;
    timeline.push({ time: t, type: ev.type, data: ev.data });
  }

  return timeline;
}

/** Total duration of a timeline, in milliseconds. */
export function timelineDuration(timeline) {
  if (!timeline.length) return 0;
  return Math.max(0, Math.round(timeline[timeline.length - 1].time * 1000));
}

/**
 * Index of the first event strictly after `ms`.
 *
 * Because the timeline is sorted, this is the count of events that
 * should already be rendered at time `ms`. Used for both forward
 * flush and for locating the restart point after a backwards seek.
 *
 * @param {Array<{ time: number }>} timeline
 * @param {number} ms
 * @returns {number}
 */
export function indexAt(timeline, ms) {
  let lo = 0;
  let hi = timeline.length;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (timeline[mid].time * 1000 <= ms) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

/**
 * Format milliseconds as `m:ss` (or `h:mm:ss` past an hour).
 *
 * Truncates rather than rounds: a media clock should never show time
 * the playhead has not reached, so 61.5s reads `1:01`, not `1:02`.
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const seconds = total % 60;
  const minutes = Math.floor(total / 60) % 60;
  const hours = Math.floor(total / 3600);

  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

/**
 * Human-readable seek announcement for aria-valuetext.
 *
 * @param {number} ms
 * @param {number} totalMs
 * @returns {string}
 */
export function formatPosition(ms, totalMs) {
  return `${formatClock(ms)} of ${formatClock(totalMs)}`;
}

/** Playback rate ladder offered by the transport. */
export const SPEED_LADDER = [0.25, 0.5, 1, 2, 4];

/** Seek step for coarse keyboard nudges, in milliseconds. */
export const SEEK_STEP_MS = 5000;

/** Seek step for PageUp / PageDown, in milliseconds. */
export const SEEK_PAGE_MS = 15000;
