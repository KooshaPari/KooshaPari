/**
 * Pure helpers for the path-based route parser.
 *
 * The orchestrator (router.js) is DOM-bound (history, location,
 * dispatchEvent); this file owns the pure parsing rules:
 *
 *   - VIEW_ROUTES: set of named views with top-level paths
 *   - LENS_VIEWS: views that may carry a lens (engineering | product)
 *   - parseRoute(input): the core path -> route mapper
 *   - routeToPath(route): the inverse of parseRoute, used by navigateTo
 *   - routeToHash(route): legacy hash-route representation
 *   - applyLens(route, queryString): extract lens from ?lens=query
 *   - normalizeHash(raw): strip a leading '#' used for legacy hash routes
 *   - parseSegments(pathStr): split a path into segments, dropping a
 *     trailing '.html' from the last one
 *
 * All helpers are pure given their inputs.
 */

export const VIEW_ROUTES = new Set([
  'home',
  'parent',
  'engineering',
  'product',
  'work',
  'resume',
  'contact',
  'blog',
]);

export const LENS_VIEWS = new Set(['engineering', 'product']);

/**
 * Strip a leading '#' used for legacy hash routes.
 *
 * @param {string} raw
 */
export function normalizeHash(raw) {
  return String(raw || '').trim().replace(/^#/, '');
}

/**
 * Strip a trailing `.html` from the final segment.
 *
 * The static host serves every page as a real document (`/resume.html`,
 * `/work/sharecli.html`, ...), so those URLs are reachable directly. Without
 * this the client router resolved them to `not-found` and replaced the
 * prerendered markup with the not-found view on hydration. Stripping the
 * extension on the last segment resolves top-level views and slug routes
 * alike, which is why it lives here rather than in a per-route branch.
 *
 * @param {string[]} segments
 */
function stripHtmlExtension(segments) {
  const last = segments.length - 1;
  if (last < 0) return segments;
  const segment = segments[last].replace(/\.html$/i, '');
  // A bare '.html' (or 'index.html' handled elsewhere) strips to '' and would
  // leave a phantom empty segment; keep the original so it falls through to
  // not-found as it always has.
  if (segment === '' || segment === segments[last]) return segments;
  return segments.map((value, index) => (index === last ? segment : value));
}

/**
 * Split a path string into non-empty segments with leading slashes stripped
 * and a trailing `.html` removed from the last segment.
 *
 * @param {string} pathStr
 */
export function parseSegments(pathStr) {
  return stripHtmlExtension(
    String(pathStr).replace(/^\/+/, '').split('/').filter(Boolean),
  );
}

/**
 * Parse a path-or-hash string into a route object. Pure.
 *
 *   '/' or '' -> { view: 'home' }
 *   '/engineering' -> { view: 'engineering', lens: 'engineering' }
 *   '/work' -> { view: 'work' }
 *   '/work/my-slug' -> { view: 'project', slug: 'my-slug' }
 *   '/blog/post-name' -> { view: 'post', slug: 'post-name' }
 *   '/resume' -> { view: 'resume' }
 *   '/resume.html' -> { view: 'resume' } (extension stripped, same as bare)
 *   unknown path -> { view: 'not-found' }
 *
 * @param {string} [input='']
 */
export function parseRoute(input = '') {
  const pathStr = normalizeHash(input);

  if (!pathStr) return { view: 'home' };

  const segments = parseSegments(pathStr);
  if (segments.length === 0) return { view: 'home' };

  if (segments[0] === 'engineering') {
    return { view: 'engineering', lens: 'engineering' };
  }
  if (segments[0] === 'product') {
    return { view: 'product', lens: 'product' };
  }
  if (segments[0] === 'work' && segments.length === 2) {
    try {
      return { view: 'project', slug: decodeURIComponent(segments[1]) };
    } catch {
      return { view: 'home' };
    }
  }
  if (segments[0] === 'work' && segments.length === 1) {
    return { view: 'work' };
  }
  if (segments[0] === 'blog' && segments.length === 2) {
    try {
      return { view: 'post', slug: decodeURIComponent(segments[1]) };
    } catch {
      return { view: 'home' };
    }
  }
  if (segments[0] === 'blog' && segments.length === 1) {
    return { view: 'blog' };
  }
  if (segments[0] === 'resume' || segments[0] === 'contact') {
    return { view: segments[0] };
  }
  if (VIEW_ROUTES.has(segments[0])) {
    return { view: segments[0] };
  }
  return { view: 'not-found' };
}

/**
 * Lift a `lens` off a query string if it matches a known lens view.
 *
 * @param {{ view: string, lens?: string, slug?: string }} route
 * @param {string} [queryString=''] - the bare query string, e.g. 'lens=engineering&foo=bar'
 */
export function applyLens(route, queryString = '') {
  const urlLens = new URLSearchParams(queryString).get('lens');
  if (LENS_VIEWS.has(urlLens)) {
    return { ...route, lens: urlLens };
  }
  return route;
}

/**
 * Build the path (no origin) for a route. Pure.
 *
 *   { view: 'project', slug: 'x' } -> '/work/x'
 *   { view: 'post', slug: 'y' } -> '/blog/y'
 *   { view: 'engineering' } -> '/engineering'
 *   { view: 'home' } -> '/'
 *
 * Lens is encoded via a separate caller (path + '?lens=...') — this helper
 * returns the path only.
 *
 * @param {{ view: string, slug?: string }} route
 */
export function routeToPath(route) {
  switch (route?.view) {
    case 'project':
      return `/work/${encodeURIComponent(route.slug)}`;
    case 'post':
      return `/blog/${encodeURIComponent(route.slug)}`;
    case 'engineering':
      return '/engineering';
    case 'product':
      return '/product';
    case 'work':
      return '/work';
    case 'blog':
      return '/blog';
    default:
      return route?.view ? `/${route.view}` : '/';
  }
}

/**
 * Legacy hash-route representation. `#/foo` style is the historical
 * fall-back used when pushState was unsupported.
 *
 * @param {{ view: string, slug?: string }} route
 */
export function routeToHash(route) {
  if (route?.view === 'project' && route.slug) {
    return `#work/${encodeURIComponent(route.slug)}`;
  }
  if (route?.view === 'post' && route.slug) {
    return `#blog/${encodeURIComponent(route.slug)}`;
  }
  return `#${VIEW_ROUTES.has(route?.view) ? route.view : 'home'}`;
}
