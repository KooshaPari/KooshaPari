/* ================================================================
   Cast Player chrome — markup construction only.

   Builds the terminal frame, transport bar, and the scrubber
   element that cast-scrubber.js then wires behaviour onto. Kept
   free of playback logic so the structure can be inspected and
   changed without touching the scheduler.
   ================================================================ */

import { el } from '../components/dom.js';
import { SPEED_LADDER } from './cast-timeline.js';

/**
 * @param {string} title  Label shown in the title bar
 * @returns {object}  Root element plus the handles the player and
 *                    scrubber controllers need.
 */
export function buildChrome(title) {
  const root = el('div', { class: 'cast-player' });

  const header = el('div', { class: 'cast-player__header' },
    el('div', { class: 'cast-player__dots', 'aria-hidden': 'true' },
      el('span', { class: 'cast-player__dot cast-player__dot--close' }),
      el('span', { class: 'cast-player__dot cast-player__dot--min' }),
      el('span', { class: 'cast-player__dot cast-player__dot--max' }),
    ),
    el('span', { class: 'cast-player__title' }, title || 'Terminal'),
  );

  const terminal = el('div', { class: 'cast-player__terminal' });
  const output = el('span', { class: 'cast-player__output' });
  const cursor = el('span', {
    class: 'cast-player__cursor',
    'aria-hidden': 'true',
  });
  output.append(cursor);
  terminal.append(output);

  // Scrubber follows the WAI-ARIA APG media seek-slider pattern.
  const track = el('div', { class: 'cast-player__scrubber-track' },
    el('div', { class: 'cast-player__scrubber-fill' }),
    el('div', { class: 'cast-player__scrubber-thumb' }),
  );
  const scrubber = el('div', {
    class: 'cast-player__scrubber',
    role: 'slider',
    tabindex: '0',
    'aria-label': 'Seek through recording',
    'aria-valuemin': '0',
    'aria-valuemax': '0',
    'aria-valuenow': '0',
    'aria-valuetext': '0:00 of 0:00',
    'aria-disabled': 'true',
  }, track);

  const playBtn = el('button', {
    class: 'cast-player__btn cast-player__btn--play',
    type: 'button',
    'aria-label': 'Play',
  }, '\u25b6');

  const restartBtn = el('button', {
    class: 'cast-player__btn',
    type: 'button',
    'aria-label': 'Restart from beginning',
  }, '\u21ba');

  const clockNow = el('span', { class: 'cast-player__clock-now' }, '0:00');
  const clockTotal = el('span', { class: 'cast-player__clock-total' }, '0:00');
  const clock = el('span', { class: 'cast-player__clock' },
    clockNow,
    el('span', { class: 'cast-player__clock-sep', 'aria-hidden': 'true' }, '/'),
    clockTotal,
  );

  const speedBtns = SPEED_LADDER.map((s) => el('button', {
    class: `cast-player__speed-btn${s === 1 ? ' cast-player__speed-btn--active' : ''}`,
    type: 'button',
    'data-speed': String(s),
    'aria-label': `${s}x speed`,
    'aria-pressed': s === 1 ? 'true' : 'false',
  }, `${s}x`));

  const controls = el('div', { class: 'cast-player__controls' },
    playBtn,
    restartBtn,
    clock,
    el('div', {
      class: 'cast-player__speed-group',
      role: 'group',
      'aria-label': 'Playback speed',
    }, ...speedBtns),
  );

  // Transport state is announced through the site-wide live region
  // (scripts/reader-state.js). No local status node is created here.

  root.append(header, terminal, scrubber, controls);

  return {
    root,
    terminal,
    output,
    cursor,
    scrubber,
    fill: track.firstChild,
    thumb: track.lastChild,
    clockNow,
    clockTotal,
    playBtn,
    restartBtn,
    speedBtns,
  };
}
