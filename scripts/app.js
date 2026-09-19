import { PROJECTS } from '../data/projects.js';
import { POSTS } from '../data/posts.js';
import { el, $ } from './components/dom.js';
import { createProjectIndex } from './components/project-index.js';
import { renderShell } from './components/shell.js';
import { createLensState } from './lens-state.js';
import { createReaderState } from './reader-state.js';
import { parseRoute, routeFromLocation } from './router.js';
import { renderHome } from './views/home.js';
import { renderWorkCatalog } from './views/work.js';
import { renderProjectDetail } from './views/project-detail.js';
import { renderResume } from './views/resume.js';
import { renderContact } from './views/contact.js';
import { renderNotFound, initCanvas } from './views/not-found.js';
import { renderBlogIndex } from './views/blog-index.js';
import { renderBlogPost } from './views/blog-post.js';

import { initScrollReveal, refreshObserver } from './scroll-reveal.js';
import { initTransitions } from './transitions.js';
import { initMagnetic } from './magnetic.js';
import { initParallax, refreshParallax } from './parallax.js';
import { initImageReveal } from './image-reveal.js';
import { initLightbox } from './lightbox.js';
import { initCounterAnimate } from './counter-animate.js';
import { initPerspectiveTilt } from './perspective-tilt.js';
import { initScrollChoreography } from './scroll-choreography.js';
import { initCardComposer } from './media/card-composer.js';
import { initAmbientField, destroyAmbientField } from './media/ambient-field.js';
import { initCastPlayers } from './media/cast-player.js';
import { initImageSliders } from './media/image-slider.js';
import { initCodeAnnotation } from './media/code-annotate.js';
import { initTechIllustrations } from './media/tech-illustrations.js';
import { initWitfViewer, destroyWitfViewer } from './media/witf-viewer.js';

const shellRoot = $('#shell-root');
const viewRoot = $('#view-root');

// Read lens from URL ?lens= first (persisted via lens-state/localStorage)
const startLens = routeFromLocation().lens;
const lensState = createLensState(startLens);

// Initialize reader state
const readerState = createReaderState();
const projectIndex = createProjectIndex({ projects: PROJECTS });
document.body.append(projectIndex.element);

function setPageMetadata(route) {
  const project = route.view === 'project'
    ? PROJECTS.find((entry) => entry.slug === route.slug)
    : null;
  const post = route.view === 'post'
    ? POSTS.find((entry) => entry.slug === route.slug)
    : null;
  const labels = {
    home: 'Technical Atelier',
    engineering: 'Engineering Work',
    product: 'Product Work',
    work: 'Work Index',
    resume: 'Resume',
    contact: 'Contact',
    blog: 'Writing',
  };
  const title = project?.title ?? post?.title ?? labels[route.view] ?? 'Page not found';
  const description = project?.summary ?? post?.excerpt
    ?? 'Software engineer and technical product leader building systems, shipping hardware, and running AI workloads.';

  document.title = `${title} — Koosha Paridehpour`;
  const canonicalPath = project
    ? `/work/${route.slug}`
    : post
      ? `/blog/${route.slug}`
      : route.view === 'home' ? '/' : `/${route.view}`;
  const canonicalUrl = `https://kooshapari.com${canonicalPath}`;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://kooshapari.com${canonicalPath}`);
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
  const ogImageUrl = project?.hero?.startsWith('/')
    ? `https://kooshapari.com${project.hero}`
    : 'https://kooshapari.com/og-image.png';
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', ogImageUrl);
  document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', ogImageUrl);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
}

function render() {
  const route = routeFromLocation();
  if (route.lens) lensState.set(route.lens);
  destroyWitfViewer();
  destroyAmbientField();

  const lens = lensState.get();
  const reader = readerState.get();
  renderShell(shellRoot, {
    route,
    lens,
    reader,
    onLensChange(next) {
      lensState.set(next);
      const url = new URL(location.href);
      if (route.view === 'engineering' || route.view === 'product') url.pathname = `/${next}`;
      url.searchParams.set('lens', next);
      history.replaceState(null, '', url);
      render();
      document.querySelector(`[aria-label="Portfolio lens"] button[aria-pressed="true"]`)?.focus();
    },
    onReaderToggle() {
      readerState.toggle();
    },
    onIndexOpen(event) {
      projectIndex.open(event?.currentTarget ?? document.activeElement);
    },
  });
  if (['home', 'engineering', 'product'].includes(route.view)) {
    renderHome(viewRoot, { projects: PROJECTS, lens });
  } else if (route.view === 'work') {
    renderWorkCatalog(viewRoot, { projects: PROJECTS });
  } else if (route.view === 'project') {
    renderProjectDetail(viewRoot, route.slug, lens);
  } else if (route.view === 'resume') {
    renderResume(viewRoot);
  } else if (route.view === 'contact') {
    renderContact(viewRoot);
  } else if (route.view === 'blog') {
    renderBlogIndex(viewRoot, { posts: POSTS });
  } else if (route.view === 'post') {
    renderBlogPost(viewRoot, route.slug);
  } else if (route.view === 'not-found') {
    viewRoot.innerHTML = renderNotFound();
    initCanvas();
  } else {
    renderHome(viewRoot, { projects: PROJECTS, lens });
  }
  setPageMetadata(route);
  refreshObserver();
  refreshParallax();

  // Defer heavy render-time inits to reduce TBT
  rIC(() => {
    initImageSliders();
    initCastPlayers();
    initCodeAnnotation();
    initLightbox(viewRoot);
    initCounterAnimate();
    initPerspectiveTilt(viewRoot);
    initScrollChoreography();
    if (route.view === 'home') {
      const heroEl = viewRoot.querySelector('.home-opening');
      if (heroEl) initAmbientField(heroEl);
      initWitfViewer();
    } else if (route.view === 'project' && route.slug === 'witf') {
      initWitfViewer('witf-detail-viewer');
    }
  });
}

window.addEventListener('hashchange', render);
window.addEventListener('popstate', render);
window.addEventListener('routechange', render);
lensState.subscribe(() => {
  document.documentElement.dataset.lens = lensState.get();
});
readerState.subscribe(() => {
  document.documentElement.dataset.reader = readerState.get() ? 'true' : 'false';
  const toggle = document.getElementById('reader-toggle');
  if (toggle) {
    const active = readerState.get();
    toggle.setAttribute('aria-pressed', String(active));
    toggle.dataset.state = active ? 'active' : 'pending';
    toggle.title = active ? 'Exit Reader Mode' : 'Enter Reader Mode (R)';
    toggle.textContent = active ? 'Exit Reader' : 'Reader';
  }
});


initScrollReveal();

// Defer non-critical UI initializers to avoid blocking main thread
const rIC = typeof requestIdleCallback === 'function'
  ? requestIdleCallback
  : (fn) => setTimeout(fn, 0);

function initNonCritical() {
  initMagnetic();
  initParallax();
  initImageReveal();
  initCardComposer(PROJECTS);
  initTechIllustrations();
}
rIC(initNonCritical);

if (!location.hash && location.pathname.replace(/\/+$/, '') === '') {
  history.replaceState(null, '', '/');
}
document.documentElement.dataset.lens = lensState.get();
document.documentElement.dataset.reader = readerState.get() ? 'true' : 'false';
render();

// Dark mode toggle is initialized inside renderShell (shell.js)
// so it survives navigation (replaceChildren destroys prior DOM).
