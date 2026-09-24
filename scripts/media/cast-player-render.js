/* ================================================================
   Cast Player — terminal output renderer.

   Owns the terminal viewport text lifecycle: clearing, frame
   appending (carriage-return collapse + newline split into line
   divs), full re-render at a seek position, and incremental flush
   during playback. Extracted from cast-player.js so the transport
   controller stays focused on state, wiring, and loading.

   createCastRenderer({ output, cursor, terminal }) returns
   { clearOutput, appendEvent, renderAt, flushTo }. Timeline and
   state are passed per call, keeping the renderer itself stateless.
   ================================================================ */

import { indexAt } from './cast-timeline.js';
import {
  CLASS_LINE,
  isOutputEvent,
  splitCastFrame,
} from './cast-player-helpers.js';

/**
 * Build the render closure bound to one player's viewport elements.
 *
 * @param {{ output: HTMLElement, cursor: HTMLElement, terminal: HTMLElement }} dom
 * @returns {{
 *   clearOutput: () => void,
 *   appendEvent: (ev: {type: string, data: string}) => void,
 *   renderAt: (timeline: Array<object>, state: object, upToMs: number) => void,
 *   flushTo: (timeline: Array<object>, state: object, upToMs: number) => void,
 * }}
 */
export function createCastRenderer({ output, cursor, terminal }) {
  function clearOutput() {
    output.textContent = '';
    output.append(cursor);
    terminal.scrollTop = 0;
  }

  function appendEvent(ev) {
    if (!isOutputEvent(ev)) return;

    // Strip carriage returns so progress-bar redraws collapse cleanly.
    const lines = splitCastFrame(ev.data);

    for (let li = 0; li < lines.length; li += 1) {
      if (li > 0) {
        const lineEl = document.createElement('div');
        lineEl.className = CLASS_LINE;
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
  function renderAt(timeline, state, upToMs) {
    clearOutput();
    for (let i = 0; i < timeline.length; i += 1) {
      if (timeline[i].time * 1000 > upToMs) break;
      appendEvent(timeline[i]);
    }
    state.eventIdx = indexAt(timeline, upToMs);
    terminal.scrollTop = terminal.scrollHeight;
  }

  /** Flush only the events that became due since the last frame. */
  function flushTo(timeline, state, upToMs) {
    while (state.eventIdx < timeline.length && timeline[state.eventIdx].time * 1000 <= upToMs) {
      appendEvent(timeline[state.eventIdx]);
      state.eventIdx += 1;
    }
    terminal.scrollTop = terminal.scrollHeight;
  }

  return { clearOutput, appendEvent, renderAt, flushTo };
}
