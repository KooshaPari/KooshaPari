import { el } from './dom.js';
import { initDarkMode } from '../dark-mode.js';

// Surface toggle — opt-in e-ink / paper register for the long-form case-study
// surface. Persists to localStorage; ?surface=paper sets it on load.
const SURFACE_KEY = 'koosha-phenotype:surface';
function applySurface() {
  let value = null;
  try { value = localStorage.getItem(SURFACE_KEY); } catch { /* ignore */ }
  const params = new URLSearchParams(location.search);
  if (params.get('surface') === 'paper') value = 'paper';
  document.documentElement.dataset.surface = value === 'paper' ? 'paper' : '';
  const btn = document.getElementById('surface-toggle');
  if (!btn) return;
  const on = value === 'paper';
  btn.setAttribute('aria-pressed', String(on));
  btn.textContent = on ? 'Paper on' : 'Paper';
  btn.title = on ? 'Restore the default case-study surface' : 'Switch to an e-ink / paper surface (long-form register)';
}

// Note: ['/blog', 'Writing'] removed 2026-10-11 — user wants the writing
// section hidden for now. The /blog route still works for direct-nav; only
// the top-nav entry is removed. Restore by re-adding the line below.
const ROUTES = [
  ['/work', 'Work'],
  // ['/blog', 'Writing'],
  ['/resume', 'Resume'],
  ['/contact', 'Contact'],
];

export function renderShell(
  root,
  { route, lens, reader, onLensChange = () => {}, onReaderToggle = () => {}, onIndexOpen = () => {}, states = {} },
) {
  const currentView = route?.view === 'project' ? 'work'
    : route?.view === 'post' ? 'blog'
    : route?.view;

  const navigation = el(
    'nav',
    {
      class: 'atelier-nav',
      'aria-label': 'Primary navigation',
      'data-state': states.nav || 'idle',
    },
    ROUTES.map(([href, label]) =>
      el(
        'a',
        {
          href,
          ...(currentView === label.toLowerCase() ? { 'aria-current': 'page' } : {}),
        },
        label,
      ),
    ),
  );

  const lensControl = el(
    'div',
    {
      class: 'lens-control',
      role: 'group',
      'aria-label': 'Portfolio lens',
      'data-state': states.lens || 'idle',
    },
    ['engineering', 'product'].map((value) =>
      el(
        'button',
        {
          type: 'button',
          'aria-pressed': String(lens === value),
          'data-state': states[`lens-${value}`] || 'idle',
          onclick: () => onLensChange(value),
        },
        value === 'engineering' ? 'Engineering' : 'Product',
      ),
    ),
  );

  const readerControl = el(
    'button',
    {
      id: 'reader-toggle',
      class: 'reader-toggle index-trigger',
      type: 'button',
      'aria-pressed': String(reader),
      'data-state': states.reader || (reader ? 'active' : 'pending'),
      onclick: onReaderToggle,
      title: reader ? 'Exit Reader Mode' : 'Enter Reader Mode (R)',
    },
    reader ? 'Exit Reader' : 'Reader',
  );

  const surfaceControl = el(
    'button',
    {
      id: 'surface-toggle',
      class: 'surface-toggle',
      type: 'button',
      'aria-pressed': 'false',
      title: 'Switch to an e-ink / paper surface (long-form register)',
      onclick: () => {
        const on = document.documentElement.dataset.surface !== 'paper';
        try { localStorage.setItem(SURFACE_KEY, on ? 'paper' : ''); } catch { /* ignore */ }
        applySurface();
      },
    },
    'Paper',
  );

  const header = el(
    'header',
    {
      class: 'atelier-header',
      'data-state': states.header || 'idle',
    },
    el(
      'a',
      { class: 'atelier-identity', href: '/' },
      el('strong', {}, 'Koosha Paridehpour'),
      el('span', {}, 'Systems / products / infrastructure'),
    ),
    navigation,
    el(
      'div',
      { class: 'atelier-tools' },
      lensControl,
      readerControl,
      surfaceControl,
      el(
        'button',
        { class: 'index-trigger', type: 'button', onclick: onIndexOpen },
        'Index',
      ),
    ),
  );

  const footer = el(
    'footer',
    { class: 'footer' },
    el('span', {}, 'Koosha Paridehpour · kooshapari.com'),
    el('span', {}, 'Koosha Paridehpour — Systems engineer, product builder, keyboard enthusiast.'),
  );

  const appRoot = document.getElementById('app');
  appRoot.replaceChildren(header, document.getElementById('view-root'), footer);

  // Insert dark mode toggle into .atelier-tools each time shell is rendered.
  // renderShell uses replaceChildren which destroys prior DOM, so the toggle
  // must be re-inserted on every navigation.
  initDarkMode({ toolbar: header.querySelector('.atelier-tools') });
  applySurface();

  // Glass header: add scrolled state on scroll for elevated shadow
  // Guard for Node.js prerender (stage-publication) where window is undefined
  if (typeof window !== 'undefined') {
    let scrollTicking = false;
    function onScroll() {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        header.classList.toggle('atelier-header--scrolled', window.scrollY > 10);
        scrollTicking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    // Apply initial state in case page loads scrolled
    if (window.scrollY > 10) header.classList.add('atelier-header--scrolled');
  }

  return header;
}
