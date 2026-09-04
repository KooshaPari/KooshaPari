const VIEW_ROUTES = new Set([
  'home',
  'engineering',
  'product',
  'work',
  'resume',
  'contact',
  'blog',
]);

export function parseRoute(input = '') {
  const pathStr = String(input).trim();

  if (!pathStr) return { view: 'home' };

  // Normalize: strip leading slash, split segments
  const segments = pathStr.replace(/^\/+/, '').split('/').filter(Boolean);

  if (segments.length === 0) return { view: 'home' };

  // /engineering and /product are lens routes (also accept via ?lens=)
  if (segments[0] === 'engineering') {
    return { view: 'engineering', lens: 'engineering' };
  }
  if (segments[0] === 'product') {
    return { view: 'product', lens: 'product' };
  }

  // /work/:slug — project detail
  if (segments[0] === 'work' && segments.length === 2) {
    try {
      return { view: 'project', slug: decodeURIComponent(segments[1]) };
    } catch {
      return { view: 'home' };
    }
  }

  // /work — work index
  if (segments[0] === 'work' && segments.length === 1) {
    return { view: 'work' };
  }

  // /blog/:slug — blog post
  if (segments[0] === 'blog' && segments.length === 2) {
    try {
      return { view: 'post', slug: decodeURIComponent(segments[1]) };
    } catch {
      return { view: 'home' };
    }
  }

  // /blog — blog index
  if (segments[0] === 'blog' && segments.length === 1) {
    return { view: 'blog' };
  }

  // /resume, /contact — static top-level views
  if (['resume', 'contact'].includes(segments[0])) {
    return { view: segments[0] };
  }

  // Anything else → home
  if (VIEW_ROUTES.has(segments[0])) {
    return { view: segments[0] };
  }

  return { view: 'home' };
}

/**
 * Read route from the current browser location.
 * Priority: hash → pathname
 * Lens is read from ?lens= query param if present.
 */
export function routeFromLocation() {
  // Prefer pathname (new path-based format) — hash is legacy fallback
  const path = location.pathname.replace(/\/+$/, '').replace(/^\//, '');
  const route = parseRoute(path || '');

  // Lift lens from ?lens= query param (URL‑bound lens per spec)
  const urlLens = new URLSearchParams(location.search).get('lens');
  if (urlLens === 'engineering' || urlLens === 'product') {
    return { ...route, lens: urlLens };
  }

  return route;
}

/**
 * Navigate to a route using clean paths (pushState).
 * Lens is encoded as ?lens= query param.
 */
export function navigateTo(route) {
  let path;
  switch (route.view) {
    case 'project':
      path = `/work/${encodeURIComponent(route.slug)}`;
      break;
    case 'post':
      path = `/blog/${encodeURIComponent(route.slug)}`;
      break;
    case 'engineering':
      path = '/engineering';
      break;
    case 'product':
      path = '/product';
      break;
    case 'work':
      path = '/work';
      break;
    case 'blog':
      path = '/blog';
      break;
    default:
      path = route.view ? `/${route.view}` : '/';
  }

  const lens = route.lens;
  if (lens) {
    path += `?lens=${lens}`;
  }

  history.pushState(route, '', path);
  window.dispatchEvent(new CustomEvent('routechange', { detail: route }));
}

export function routeToHash(route) {
  if (route?.view === 'project' && route.slug) {
    return `#work/${encodeURIComponent(route.slug)}`;
  }
  if (route?.view === 'post' && route.slug) {
    return `#blog/${encodeURIComponent(route.slug)}`;
  }

  return `#${VIEW_ROUTES.has(route?.view) ? route.view : 'home'}`;
}
