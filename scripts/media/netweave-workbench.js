import { el } from '../components/dom.js';
import { renderNetWeaveField } from './netweave-field.js';

export const NETWEAVE_STATES = Object.freeze([
  { id: 'state-1', label: 'Open gaps', image: '/public/projects/netweave/desktop-01.webp', mobileImage: '/public/projects/netweave/mobile-01.webp', caption: 'State 1 / open gaps', description: 'Three following vehicles have open gaps before the stationary lead vehicle.' },
  { id: 'state-2', label: 'Gaps narrow', image: '/public/projects/netweave/desktop-02.webp', mobileImage: '/public/projects/netweave/mobile-02.webp', caption: 'State 2 / gaps narrow', description: 'The following vehicles advance one cell; the lead vehicle stays fixed.' },
  { id: 'state-3', label: 'Approach', image: '/public/projects/netweave/desktop-03.webp', mobileImage: '/public/projects/netweave/mobile-03.webp', caption: 'State 3 / approach', description: 'The amber vehicle approaches the lead vehicle. No vehicle changes lane or route.' },
]);

export const NETWEAVE_VIEWS = Object.freeze([
  { id: 'overview', label: 'Overview', title: 'A bounded traffic field', body: 'An original explanatory study of local vehicle spacing. It describes the relationship without presenting a recorded simulator trace.' },
  { id: 'route', label: 'Route', title: 'Directed graph', body: 'The historical prototype combined directed-graph routing with local vehicle behavior. These drawings hold route and lane identity constant.' },
  { id: 'traffic', label: 'Traffic', title: 'Three discrete states', body: 'Select a state to inspect the same four vehicles as the available gap shrinks. The sequence has no automatic playback.' },
  { id: 'evidence', label: 'Evidence', title: 'Evidence boundary', body: 'The artwork is original explanatory material. It is not recorded NetWeave output, calibrated simulation data, or proof of implemented rerouting.' },
  { id: 'notes', label: 'Notes', title: 'What remains open', body: 'Congestion-aware rerouting was future work in the historical prototype. The portfolio keeps that limitation visible.' },
]);

export function createNetWeaveWorkbench(initial = {}) {
  let view = NETWEAVE_VIEWS.some((entry) => entry.id === initial.view) ? initial.view : 'overview';
  let state = Number.isInteger(initial.state) && initial.state >= 0 && initial.state < NETWEAVE_STATES.length ? initial.state : 0;
  const notify = new Set();
  const emit = () => { for (const listener of notify) listener({ view, state }); };
  return {
    get: () => ({ view, state }),
    subscribe(listener) { notify.add(listener); return () => notify.delete(listener); },
    selectView(id) { if (!NETWEAVE_VIEWS.some((entry) => entry.id === id)) return false; view = id; emit(); return true; },
    selectState(index) { if (!Number.isInteger(index) || index < 0 || index >= NETWEAVE_STATES.length) return false; state = index; emit(); return true; },
    nextView() { return this.selectView(NETWEAVE_VIEWS[(NETWEAVE_VIEWS.findIndex((entry) => entry.id === view) + 1) % NETWEAVE_VIEWS.length].id); },
    previousView() { return this.selectView(NETWEAVE_VIEWS[(NETWEAVE_VIEWS.findIndex((entry) => entry.id === view) - 1 + NETWEAVE_VIEWS.length) % NETWEAVE_VIEWS.length].id); },
    reset() { view = 'overview'; state = 0; emit(); return true; },
    fallbackText: () => 'Static poster and transcript are available without JavaScript, WebGL, or automatic playback. Reduced motion uses the same still artwork.',
  };
}

export function renderNetWeaveWorkbench(documentRef = document) {
  const workbench = createNetWeaveWorkbench();
  const root = documentRef.createElement('section');
  root.className = 'netweave-workbench';
  root.setAttribute('aria-labelledby', 'netweave-workbench-title');
  const heading = el('h3', { id: 'netweave-workbench-title' }, 'Reader / Explore Workbench');
  const intro = el('p', { class: 'netweave-workbench__intro' }, workbench.fallbackText());
  const viewTabs = el('div', { class: 'netweave-workbench__tabs', role: 'tablist', 'aria-label': 'NetWeave inspection views' });
  const panel = el('div', { id: 'netweave-view-panel', class: 'netweave-workbench__panel', role: 'tabpanel', tabindex: '0' });
  const tabs = NETWEAVE_VIEWS.map((entry) => el('button', { id: `netweave-tab-${entry.id}`, type: 'button', role: 'tab', 'aria-controls': 'netweave-view-panel', onclick: () => workbench.selectView(entry.id) }, entry.label));
  viewTabs.append(...tabs);
  const field = renderNetWeaveField(documentRef, { controller: workbench, states: NETWEAVE_STATES });
  const back = el('button', { type: 'button', class: 'text-link' }, 'Back');
  const reset = el('button', { type: 'button', class: 'text-link' }, 'Reset');
  const footer = el('div', { class: 'netweave-workbench__actions' }, back, reset);
  viewTabs.addEventListener('keydown', (event) => {
    if (event.target.getAttribute('role') !== 'tab') return;
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Escape'].includes(event.key)) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); workbench.nextView(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); workbench.previousView(); }
    if (event.key === 'Escape') { event.preventDefault(); workbench.reset(); }
    tabs[NETWEAVE_VIEWS.findIndex((entry) => entry.id === workbench.get().view)].focus();
  });
  const render = ({ view, state }) => {
    const selectedView = NETWEAVE_VIEWS.find((entry) => entry.id === view);
    panel.replaceChildren(el('h4', {}, selectedView.title), el('p', {}, selectedView.body));
    panel.setAttribute('aria-labelledby', `netweave-tab-${view}`);
    tabs.forEach((tab, index) => {
      const active = NETWEAVE_VIEWS[index].id === view;
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('tabindex', active ? '0' : '-1');
      tab.className = active ? 'is-active' : '';
    });
  };
  workbench.subscribe(render);
  back.addEventListener('click', () => workbench.previousView());
  reset.addEventListener('click', () => workbench.reset());
  root.append(heading, intro, viewTabs, panel, field, footer);
  render(workbench.get());
  return root;
}
