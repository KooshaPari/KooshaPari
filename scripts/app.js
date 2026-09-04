import { PROJECTS } from '../data/projects.js';
import { POSTS } from '../data/posts.js';
import { el, $ } from './components/dom.js';
import { createProjectIndex } from './components/project-index.js';
import { renderShell } from './components/shell.js';
import { createLensState } from './lens-state.js';
import { createReaderState } from './reader-state.js';
import { parseRoute, routeFromLocation } from './router.js';
import { renderHome } from './views/home.js';
import { renderWorkIndex } from './views/work-index.js';
import { renderProjectDetail } from './views/project-detail.js';
import { renderResume } from './views/resume.js';
import { renderContact } from './views/contact.js';
import { renderBlogIndex } from './views/blog-index.js';
import { renderBlogPost } from './views/blog-post.js';

const shellRoot = $('#shell-root');
const viewRoot = $('#view-root');

// Read lens from URL ?lens= first (persisted via lens-state/localStorage)
const initialLens = routeFromLocation().lens || 'engineering';
const lensState = createLensState(initialLens);

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
    product: 'Product / Program Work',
    work: 'Work Index',
    resume: 'Resume',
    contact: 'Contact',
    blog: 'Writing',
  };
  const title = project?.title ?? post?.title ?? labels[route.view] ?? 'Technical Atelier';
  const description = project?.summary ?? post?.excerpt
    ?? 'Software systems, technical products, and the infrastructure between them.';

  document.title = `${title} — Koosha Paridehpour`;
  const canonicalPath = project
    ? `/work/${route.slug}`
    : post
      ? `/blog/${route.slug}`
      : route.view === 'home' || !labels[route.view] ? '/' : `/${route.view}`;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://kooshapari.com${canonicalPath}`);
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
}

function render() {
  const route = routeFromLocation();
  if (route.view === 'engineering' || route.view === 'product') {
    lensState.set(route.view);
  }

  const lens = lensState.get();
  const reader = readerState.get();
  renderShell(shellRoot, {
    route,
    lens,
    reader,
    onLensChange(next) {
      lensState.set(next);
      render();
    },
    onReaderToggle() {
      readerState.toggle();
      render();
    },
    onIndexOpen(event) {
      projectIndex.open(event?.currentTarget ?? document.activeElement);
    },
  });
  if (['home', 'engineering', 'product'].includes(route.view)) {
    renderHome(viewRoot, { projects: PROJECTS, lens });
  } else if (route.view === 'work') {
    renderWorkIndex(viewRoot, { projects: PROJECTS });
  } else if (route.view === 'project') {
    renderProjectDetail(viewRoot, route.slug);
  } else if (route.view === 'resume') {
    renderResume(viewRoot);
  } else if (route.view === 'contact') {
    renderContact(viewRoot);
  } else if (route.view === 'blog') {
    renderBlogIndex(viewRoot, { posts: POSTS });
  } else if (route.view === 'post') {
    renderBlogPost(viewRoot, route.slug);
  } else {
    renderHome(viewRoot, { projects: PROJECTS, lens });
  }
  setPageMetadata(route);
}

window.addEventListener('hashchange', render);
window.addEventListener('routechange', render);
lensState.subscribe(() => {
  document.documentElement.dataset.lens = lensState.get();
});
readerState.subscribe(() => {
  document.documentElement.dataset.reader = readerState.get() ? 'true' : 'false';
});

if (!location.hash && location.pathname.replace(/\/+$/, '') === '') {
  history.replaceState(null, '', '/');
}
document.documentElement.dataset.lens = lensState.get();
document.documentElement.dataset.reader = readerState.get() ? 'true' : 'false';
render();
