import {
  parseRoute,
  routeToPath,
  routeToHash,
  applyLens,
} from './router-helpers.js';

// Re-export for backward compatibility with existing imports
// (tests/router.test.js and main.js both consume these).
export { parseRoute, routeToHash, applyLens, routeToPath };

export function routeFromLocation() {
  const path = location.pathname.replace(/\/+$/, '').replace(/^\//, '');
  let route = parseRoute(path || '');

  // Legacy hash fallback: if pathname resolved to home or bare work index,
  // but a hash route exists, use it.
  if ((route.view === 'home' || route.view === 'work') && location.hash && location.hash.length > 1) {
    const hashRoute = parseRoute(location.hash.slice(1));
    if (hashRoute.view !== 'home') route = hashRoute;
  }

  return applyLens(route, location.search);
}

/**
 * Navigate to a route using clean paths (pushState).
 * Lens is encoded as ?lens= query param.
 */
export function navigateTo(route) {
  const path = routeToPath(route);
  const lens = route?.lens;
  const fullPath = lens ? `${path}?lens=${lens}` : path;

  history.pushState(route, '', fullPath);
  window.dispatchEvent(new CustomEvent('routechange', { detail: route }));
}
