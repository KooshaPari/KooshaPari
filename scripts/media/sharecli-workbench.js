import { el } from '../components/dom.js';

export const SHARECLI_STATES = Object.freeze([
  {
    id: 'burst',
    label: 'Burst',
    title: 'Concurrent work arrives',
    description: 'Several coding-agent requests reach one shared runtime boundary. This is an illustrative queue state, not a measured workload trace.',
    readerSequence: 'Requests enter the shared runtime boundary and wait for coordination.',
    lanes: ['agent requests', 'shared queue', 'host resources'],
  },
  {
    id: 'coalesce',
    label: 'Coalesce',
    title: 'Duplicate work is joined',
    description: 'Compatible pending work is represented as one coordinated queue path so the runtime can make contention visible. The state explains a design boundary; it does not report a benchmark.',
    readerSequence: 'Compatible requests are joined before repeated work is scheduled.',
    lanes: ['agent requests', 'coalesced work', 'host resources'],
  },
  {
    id: 'observe',
    label: 'Observe',
    title: 'Runtime pressure is inspectable',
    description: 'Process, queue, and host-resource concerns remain visible to the operator rather than being hidden behind a single command result.',
    readerSequence: 'The operator can inspect coordination and resource-pressure boundaries.',
    lanes: ['process observation', 'queue state', 'host resources'],
  },
  {
    id: 'recover',
    label: 'Recover',
    title: 'The bounded state settles',
    description: 'The illustration returns to a controlled queue state after a contention condition. It does not simulate a live host, terminal session, or telemetry stream.',
    readerSequence: 'The queue settles and the runtime returns to an observable controlled state.',
    lanes: ['supervision', 'controlled queue', 'host resources'],
  },
]);

export function createShareCliWorkbench(initial = {}) {
  let state = Number.isInteger(initial.state) && initial.state >= 0 && initial.state < SHARECLI_STATES.length ? initial.state : 0;
  const listeners = new Set();
  const emit = () => { for (const listener of listeners) listener({ state }); };
  return {
    get: () => ({ state }),
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    selectState(index) {
      if (!Number.isInteger(index) || index < 0 || index >= SHARECLI_STATES.length) return false;
      state = index;
      emit();
      return true;
    },
    next() { return this.selectState((state + 1) % SHARECLI_STATES.length); },
    previous() { return this.selectState((state - 1 + SHARECLI_STATES.length) % SHARECLI_STATES.length); },
    reset() { state = 0; emit(); return true; },
    fallbackText: () => 'Static architecture and the complete state sequence remain available without JavaScript and in reduced motion.',
    evidenceBoundary: () => 'Illustrative runtime explanation. Available ShareCLI help and thermal golden fixtures are labelled test fixtures, not an interactive terminal capture or live telemetry.',
  };
}

function renderReaderSequence() {
  return el('ol', { class: 'sharecli-workbench__reader-sequence' },
    SHARECLI_STATES.map((state) => el('li', {},
      el('strong', {}, `${state.label}: `), state.readerSequence)),
  );
}

export function renderShareCliWorkbench(documentRef = document) {
  const workbench = createShareCliWorkbench();
  const root = documentRef.createElement('section');
  root.className = 'sharecli-workbench';
  root.setAttribute('aria-labelledby', 'sharecli-workbench-title');
  const title = el('h3', { id: 'sharecli-workbench-title' }, 'Reader / Explore Runtime Workbench');
  const summary = el('p', { class: 'sharecli-workbench__intro' }, workbench.fallbackText());
  const controls = el('div', { class: 'sharecli-workbench__controls', role: 'group', 'aria-label': 'Illustrative ShareCLI runtime states' });
  const panel = el('section', { class: 'sharecli-workbench__panel', 'aria-live': 'polite', tabindex: '0' });
  const reader = el('section', { class: 'sharecli-workbench__reader', 'aria-labelledby': 'sharecli-reader-title' },
    el('h4', { id: 'sharecli-reader-title' }, 'Reader sequence'), renderReaderSequence());
  const evidence = el('p', { class: 'sharecli-workbench__evidence' }, workbench.evidenceBoundary());
  const back = el('button', { type: 'button', class: 'text-link' }, 'Back');
  const reset = el('button', { type: 'button', class: 'text-link' }, 'Reset');
  const actions = el('div', { class: 'sharecli-workbench__actions' }, back, reset);

  const render = ({ state }) => {
    const selected = SHARECLI_STATES[state];
    controls.replaceChildren(...SHARECLI_STATES.map((entry, index) => el('button', {
      type: 'button', 'aria-pressed': String(index === state), class: index === state ? 'is-active' : '',
      onclick: () => workbench.selectState(index),
    }, entry.label)));
    panel.replaceChildren(
      el('p', { class: 'sharecli-workbench__eyebrow' }, `State ${String(state + 1).padStart(2, '0')} / ${selected.label}`),
      el('h4', {}, selected.title),
      el('p', {}, selected.description),
      el('div', { class: 'sharecli-workbench__lanes', 'aria-label': 'Illustrative runtime boundary' },
        selected.lanes.map((lane, index) => el('span', { class: `sharecli-workbench__lane sharecli-workbench__lane--${index + 1}` }, lane))),
    );
  };

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); workbench.next(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); workbench.previous(); }
    if (event.key === 'Escape') { event.preventDefault(); workbench.reset(); }
  });
  back.addEventListener('click', () => workbench.previous());
  reset.addEventListener('click', () => workbench.reset());
  workbench.subscribe(render);
  root.append(title, summary, controls, panel, reader, evidence, actions);
  render(workbench.get());
  return root;
}
