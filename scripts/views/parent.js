/* ================================================================
   Parent view — the consolidated cockpit landing.

   Phase 1 of the cockpit refresh (D11: single phase, single branch).
   This is a NEW consolidated view, not a replacement for anything:
   the portfolio's existing routes (Work / Resume / Contact) keep
   working as secondary navigation.

   Decisions applied (see 05_BLOCKERS.md answer sheet):
     P1 design from the constitution  - monochrome ink + per-project accent
     P4 setInterval refresh (900_000 ms = 15 min) with a visible stamp
     P6 static roster + refresh (a public page cannot hold Access
        credentials client-side, so the live path needs a server proxy)
     P7 the bundle has ~17.7 KB of headroom; this view is small and is
        wired eagerly rather than lazy-loaded

   Accessibility: the live region announces refreshes, motion is
   transform/opacity only, and the grid collapses to one column.
   ================================================================ */

import { el } from '../components/dom.js';

/* ------------------------------------------------------------------
   Agent roster

   Static by design (P6). Corroborated from two independent
   2026-10-11 artifacts, but NOT live-verified against paperclip's
   /api/agents - the local origin is down and the public endpoint sits
   behind Cloudflare Access. Treat as a starting point, not truth.
   ------------------------------------------------------------------ */
const AGENTS = [
  { id: 'jcode', label: 'jcode', role: 'session orchestrator', glyph: 'o', state: 'current' },
  { id: 'hermes', label: 'hermes', role: 'relay + routing', glyph: 'o', state: 'research' },
  { id: 'vp', label: 'vp', role: 'VP engineering', glyph: 'o', state: 'current' },
  { id: 'instinct', label: 'instinct', role: 'pilot assistant', glyph: 'o', state: 'current' },
  { id: 'codex', label: 'codex', role: 'CLI peer', glyph: 'o', state: 'historical' },
  { id: 'kcode', label: 'kcode', role: 'herdr fork', glyph: 'o', state: 'historical' },
  { id: 'winremote', label: 'winremote', role: 'windows peer', glyph: 'o', state: 'historical' },
  { id: 'engineer-general', label: 'engineer-general', role: 'general IC', glyph: 'o', state: 'research' },
  { id: 'engineer-specialist', label: 'engineer-specialist', role: 'specialist IC', glyph: 'o', state: 'research' },
];

/** 15 minutes, per directive #8 ("keep 15-min refresh"). */
const REFRESH_MS = 900_000;

const STATE_LABEL = {
  current: 'current',
  research: 'research',
  historical: 'historical',
};

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

/**
 * Format a timestamp as a short local time for the refresh stamp.
 *
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Build one agent card.
 *
 * @param {{ label: string, role: string, glyph: string, state: string }} agent
 * @returns {HTMLElement}
 */
function buildAgentCard(agent) {
  return el(
    'li',
    { class: 'parent-agent' },
    el(
      'span',
      { class: `status-pill parent-agent__pill parent-agent__pill--${agent.state}` },
      el('span', { class: 'parent-agent__glyph', 'aria-hidden': 'true' }, agent.glyph),
      STATE_LABEL[agent.state] ?? agent.state,
    ),
    el('h3', { class: 'parent-agent__name' }, agent.label),
    el('p', { class: 'parent-agent__role' }, agent.role),
  );
}

/* ------------------------------------------------------------------
   View
   ------------------------------------------------------------------ */

/**
 * Render the /parent/ cockpit view.
 *
 * Starts a 15-minute interval that refreshes the snapshot stamp. The
 * interval id is returned so the caller can clear it if the view is
 * unmounted; if it is not cleared the stamp still updates in place,
 * which is harmless because the stamp lives inside this subtree.
 *
 * @param {HTMLElement} root - container to render into
 * @returns {{ refreshMs: number }} handle for the caller
 */
export function renderParent(root) {
  let lastRefresh = new Date();

  const stamp = el('p', { class: 'parent-stamp' });

  const paintStamp = () => {
    stamp.textContent = `Snapshot ${formatTime(lastRefresh)}`;
  };
  paintStamp();

  const agents = el(
    'ul',
    { class: 'parent-agents' },
    ...AGENTS.map(buildAgentCard),
  );

  const frame = el(
    'section',
    { class: 'parent-snapshot' },
    el('h2', { class: 'parent-snapshot__title' }, 'Snapshot'),
    el(
      'pre',
      { class: 'parent-snapshot__frame', 'aria-label': 'Agent state as a text frame' },
      [
        '+----------------------+--------------+',
        '| agent                | state        |',
        '+----------------------+--------------+',
        ...AGENTS.map(
          (a) => `| ${a.label.padEnd(20)} | ${(STATE_LABEL[a.state] ?? a.state).padEnd(12)} |`,
        ),
        '+----------------------+--------------+',
        `| ${String(AGENTS.length).padStart(2)} agents${' '.repeat(14)}|`,
        '+----------------------+--------------+',
      ].join('\n'),
    ),
    stamp,
  );

  const view = el(
    'div',
    { class: 'parent-view' },
    el(
      'header',
      { class: 'parent-view__header' },
      el('h1', { class: 'parent-view__title' }, 'Parent'),
      el(
        'p',
        { class: 'parent-view__lede' },
        'One view across the agents that run this workspace — current, research, and historical.',
      ),
    ),
    el(
      'section',
      { class: 'parent-view__agents', 'aria-labelledby': 'parent-agents-heading' },
      el('h2', { class: 'parent-view__subtitle', id: 'parent-agents-heading' }, 'Agents'),
      agents,
    ),
    frame,
  );

  // Visible refresh, announced to assistive tech without stealing focus.
  const live = el('p', { class: 'parent-sr-only', role: 'status', 'aria-live': 'polite' });
  view.appendChild(live);

  const timer = setInterval(() => {
    lastRefresh = new Date();
    paintStamp();
    live.textContent = `Snapshot refreshed at ${formatTime(lastRefresh)}`;
  }, REFRESH_MS);

  root.appendChild(view);
  return { refreshMs: REFRESH_MS, timer };
}
