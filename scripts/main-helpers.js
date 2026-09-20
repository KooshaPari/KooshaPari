/**
 * main-helpers.js — Pure helpers for the portfolio main module.
 *
 * No DOM access. The orchestrator (`main.js`) wires these into real
 * elements. Helpers are grouped by concern: page metadata, tab routing,
 * radar geometry, and bar-chart geometry.
 */

/* ==========================================================================
   PAGE METADATA
   ========================================================================== */

/**
 * Map view names to the user-facing title prefix used in
 * `document.title`. Mirrors the inline `labels` map previously embedded
 * in `setPageMetadata`.
 */
export const PAGE_LABELS = Object.freeze({
  home: 'Home',
  engineering: 'Engineering work',
  product: 'Product / Program work',
  work: 'Selected work',
  resume: 'Resume',
  contact: 'Contact',
});

/** Default page-description copy when no project is being viewed. */
export const DEFAULT_DESCRIPTION =
  'Koosha Paridehpour — software engineer and technical product/program leader across systems, agent infrastructure, and physical products.';

/**
 * Extract the project slug from a `work/{slug}` route. Returns `null`
 * for non-work views.
 *
 * @param {string} view
 * @returns {string | null}
 */
export function extractWorkSlug(view) {
  if (typeof view !== 'string' || !view.startsWith('work/')) return null;
  return view.slice(5);
}

/**
 * Find a project record by slug. Returns `null` when `slug` is null
 * or no match is found.
 *
 * @param {string|null|undefined} slug
 * @param {Array<{slug: string}>} projects
 * @returns {object | null}
 */
export function findProjectBySlug(slug, projects) {
  if (!slug || !Array.isArray(projects)) return null;
  return projects.find((p) => p && p.slug === slug) || null;
}

/**
 * Build the `<title>` for a route.
 *
 * @param {string} view
 * @param {{title: string}|null} [project]
 * @returns {string}
 */
export function buildPageTitle(view, project) {
  if (project && project.title) return `${project.title} — Koosha Paridehpour`;
  const label = PAGE_LABELS[view];
  return `${label || 'Portfolio'} — Koosha Paridehpour`;
}

/**
 * Build the `<meta name="description">` value for a route.
 *
 * @param {{summary: string}|null} [project]
 * @returns {string}
 */
export function buildPageDescription(project) {
  if (project && project.summary) return project.summary;
  return DEFAULT_DESCRIPTION;
}

/* ==========================================================================
   TAB ROUTING
   ========================================================================== */

export const SELECTOR_TAB = '.tab';
export const SELECTOR_VIEW_ROOT = '#view-root';
export const CLASS_TAB_ACTIVE = 'active';
export const ATTR_ARIA_SELECTED = 'aria-selected';

/**
 * Decide whether the route represents a project detail page.
 *
 * @param {string} view
 * @returns {boolean}
 */
export function isProjectDetailRoute(view) {
  return typeof view === 'string' && view.startsWith('work/');
}

/**
 * Pick the active tab for a view. The project-detail route falls back to
 * the "work" tab.
 *
 * @param {string} view
 * @returns {string}
 */
export function activeTabFor(view) {
  if (isProjectDetailRoute(view)) return 'work';
  return view;
}

/* ==========================================================================
   RADAR GEOMETRY
   ========================================================================== */

/**
 * The angle (radians) for the i-th axis of an N-axis radar. The first
 * axis points straight up (`-PI/2`).
 *
 * @param {number} index zero-based
 * @param {number} total number of axes
 * @returns {number}
 */
export function radarAngleFor(index, total) {
  return -Math.PI / 2 + (index * 2 * Math.PI) / total;
}

/**
 * The [x, y] coordinates of a value at the given angle, centered at
 * (cx, cy) with the given radius. The value is normalized to [0, 1]
 * via `value / 100`.
 *
 * @param {number} cx
 * @param {number} cy
 * @param {number} value 0–100
 * @param {number} radius
 * @param {number} angle radians
 * @returns {[number, number]}
 */
export function radarPointFor(cx, cy, value, radius, angle) {
  const r = (value / 100) * radius;
  return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
}

/**
 * The [x, y] coordinates of the radar axis endpoint on the outer ring.
 *
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {number} angle radians
 * @returns {[number, number]}
 */
export function radarAxisEnd(cx, cy, radius, angle) {
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

/**
 * Compute the four ring radii as fractions of the radar radius.
 *
 * @param {number} radius
 * @param {number[]} [fractions=[0.25, 0.5, 0.75, 1]]
 * @returns {number[]}
 */
export function radarRingRadii(radius, fractions = [0.25, 0.5, 0.75, 1]) {
  return fractions.map((f) => f * radius);
}

/**
 * Build the `points` string for a single ring polygon.
 *
 * @param {number} total number of axes
 * @param {number} radius outer radius
 * @param {number} ringRadius this ring's radius
 * @param {number} cx
 * @param {number} cy
 * @returns {string} "x1,y1 x2,y2 ..."
 */
export function radarRingPoints(total, radius, ringRadius, cx, cy) {
  const pts = [];
  for (let i = 0; i < total; i++) {
    const a = radarAngleFor(i, total);
    pts.push(`${cx + Math.cos(a) * ringRadius},${cy + Math.sin(a) * ringRadius}`);
  }
  return pts.join(' ');
}

/**
 * Decide the SVG `text-anchor` for an axis label based on its x
 * position relative to the radar center.
 *
 * @param {number} x
 * @param {number} cx
 * @param {number} [epsilon=2]
 * @returns {'end'|'start'|'middle'}
 */
export function radarLabelAnchor(x, cx, epsilon = 2) {
  if (x < cx - epsilon) return 'end';
  if (x > cx + epsilon) return 'start';
  return 'middle';
}

/**
 * Decide the SVG `dominant-baseline` for an axis label.
 *
 * @param {number} y
 * @param {number} cy
 * @param {number} [epsilon=2]
 * @returns {'auto'|'hanging'|'middle'}
 */
export function radarBaselineAnchor(y, cy, epsilon = 2) {
  if (y < cy - epsilon) return 'auto';
  if (y > cy + epsilon) return 'hanging';
  return 'middle';
}

/**
 * Compute the [x, y] for an axis label, offset outside the outer ring.
 *
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {number} angle radians
 * @param {number} offset pixels outside the ring (default 22)
 * @returns {[number, number]}
 */
export function radarLabelPoint(cx, cy, radius, angle, offset = 22) {
  return [cx + Math.cos(angle) * (radius + offset), cy + Math.sin(angle) * (radius + offset)];
}

/**
 * Compute the [x, y] for a score text, offset further out than the label.
 *
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {number} angle radians
 * @param {number} offset pixels outside the ring (default 38)
 * @returns {[number, number]}
 */
export function radarScorePoint(cx, cy, radius, angle, offset = 38) {
  return [cx + Math.cos(angle) * (radius + offset), cy + Math.sin(angle) * (radius + offset)];
}

/**
 * Compute the ring-tier label Y coordinate. Labels are anchored to the
 * top axis (angle = -PI/2) at varying radii.
 *
 * @param {number} cy
 * @param {number} ringRadius
 * @returns {number}
 */
export function radarRingLabelY(cy, ringRadius) {
  return cy - ringRadius;
}

/**
 * Compute the ring tier radius from the label index and label count.
 *
 * @param {number} index
 * @param {number} count
 * @param {number} radius
 * @returns {number}
 */
export function radarRingTierRadius(index, count, radius) {
  return (index / Math.max(1, count - 1)) * radius;
}

/* ==========================================================================
   BAR CHART GEOMETRY
   ========================================================================== */

/**
 * Decide the [x, y, width, height] for a horizontal bar item.
 *
 * @param {number} index bar index
 * @param {number} value 0–max
 * @param {number} max
 * @param {{x: number, y: number, width: number, height: number, rowGap: number}} layout
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function barRect(index, value, max, layout) {
  const { x, y, width, height, rowGap } = layout;
  const pct = Math.max(0, Math.min(1, value / max));
  return {
    x,
    y: y + index * (height + rowGap),
    width: width * pct,
    height,
  };
}
