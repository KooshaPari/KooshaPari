import { el } from '../components/dom.js';

// ShareCLI Workbench — precision-object presentation.
//
// Each illustrative runtime state is described object-first: it names a
// precision material and an object primitive (e.g. a "graphite-anodized
// aluminum capsule" or a "sintered-ceramic stand") instead of falling back
// to raw frame or pixel language. Object roles enumerate the highlighted
// artifact, the surrounding pushers, and the stationary base, so the
// renderer, alt text, and parity copy can all agree about which object is
// which without resorting to motion-only vocabulary.
//
// This Workbench is illustrative only. Every state carries an explicit
// `provenance` note that names the boundary between these explanatory
// states and the real-cast `.cast` recordings that ship under
// `sharecli-recording.js`. The two surfaces are deliberately separate:
// visitors must be able to tell, on every state, whether they are looking
// at a Workbench illustration or a captured terminal replay.
export const SHARECLI_STATES = Object.freeze([
  Object.freeze({
    id: 'burst',
    label: 'Burst',
    title: 'Concurrent work arrives',
    description: 'Four graphite-anodized aluminum capsules sit on a brushed-titanium rail; the highlighted lead capsule has just arrived while three follower capsules wait in the queue.',
    readerSequence: 'Capsules slide onto the rail; the highlighted lead capsule is the newest arrival and the stationary base rail is fixed.',
    lanes: ['agent requests', 'shared queue', 'host resources'],
    material: 'graphite-anodized aluminum',
    objectPrimitive: 'capsule',
    materialLabel: 'Graphite-anodized aluminum capsule on a brushed-titanium rail',
    objectLabel: 'Four graphite-anodized aluminum capsules stack on a brushed-titanium rail; the lead capsule is highlighted.',
    altText: 'Four graphite-anodized aluminum capsules stacked on a brushed-titanium rail; the highlighted lead capsule has just arrived while three follower capsules wait behind it on a stationary base.',
    objectRoles: Object.freeze(['pusher', 'pusher', 'pusher', 'stationary-base']),
    highlightedRole: 'pusher',
    leadRole: 'pusher',
    provenance: 'Illustrative runtime explanation; not a recorded ShareCLI .cast replay and not a measured workload trace.',
  }),
  Object.freeze({
    id: 'coalesce',
    label: 'Coalesce',
    title: 'Duplicate work is joined',
    description: 'Three graphite-anodized aluminum capsules compress into one sintered-ceramic stand; the coalesced stand is the highlighted artifact on the stationary base rail.',
    readerSequence: 'Compatible capsules are joined into a sintered-ceramic stand before repeated work is scheduled; the highlighted stand replaces the duplicate pushers.',
    lanes: ['agent requests', 'coalesced work', 'host resources'],
    material: 'sintered ceramic',
    objectPrimitive: 'stand',
    materialLabel: 'Sintered-ceramic stand on a brushed-titanium rail',
    objectLabel: 'Three graphite-anodized aluminum capsules have compressed into a single sintered-ceramic stand; the highlighted stand sits on the stationary base rail.',
    altText: 'A single sintered-ceramic stand on a brushed-titanium rail; the highlighted stand has replaced three duplicate graphite-anodized aluminum capsules while the stationary base rail remains fixed.',
    objectRoles: Object.freeze(['coalesced-stand', 'pusher', 'pusher', 'stationary-base']),
    highlightedRole: 'coalesced-stand',
    leadRole: 'coalesced-stand',
    provenance: 'Illustrative runtime explanation; not a recorded ShareCLI .cast replay and not a benchmarked coalescing measurement.',
  }),
  Object.freeze({
    id: 'observe',
    label: 'Observe',
    title: 'Runtime pressure is inspectable',
    description: 'A brushed-titanium column with measurement insets is mounted on the stationary base rail; the highlighted observer column inspects the surrounding graphite-anodized aluminum capsules.',
    readerSequence: 'A brushed-titanium observer column is fitted to the rail; the highlighted observer inspects the surrounding capsules without changing their position on the stationary base.',
    lanes: ['process observation', 'queue state', 'host resources'],
    material: 'brushed titanium',
    objectPrimitive: 'column',
    materialLabel: 'Brushed-titanium observer column with measurement insets',
    objectLabel: 'A brushed-titanium observer column stands on the stationary base rail between two graphite-anodized aluminum capsules; the highlighted observer column reads the queue.',
    altText: 'A brushed-titanium observer column with measurement insets on a stationary base rail; the highlighted observer column reads the surrounding graphite-anodized aluminum capsules without moving them.',
    objectRoles: Object.freeze(['pusher', 'observer-column', 'pusher', 'stationary-base']),
    highlightedRole: 'observer-column',
    leadRole: 'observer-column',
    provenance: 'Illustrative runtime explanation; not a recorded ShareCLI .cast replay and not a live process or telemetry inspection.',
  }),
  Object.freeze({
    id: 'recover',
    label: 'Recover',
    title: 'The bounded state settles',
    description: 'A cast-aluminum recover frame holds three graphite-anodized aluminum capsules on the stationary base rail; the highlighted recover frame is the bounded rest position.',
    readerSequence: 'The capsules settle into a cast-aluminum recover frame; the highlighted frame marks the bounded rest position on the stationary base rail.',
    lanes: ['supervision', 'controlled queue', 'host resources'],
    material: 'cast aluminum',
    objectPrimitive: 'frame',
    materialLabel: 'Cast-aluminum recover frame on a brushed-titanium rail',
    objectLabel: 'A cast-aluminum recover frame holds three graphite-anodized aluminum capsules on the stationary base rail; the highlighted frame is the bounded rest position.',
    altText: 'A cast-aluminum recover frame holding three graphite-anodized aluminum capsules on a brushed-titanium rail; the highlighted frame marks the bounded rest position on the stationary base.',
    objectRoles: Object.freeze(['pusher', 'pusher', 'recover-stand', 'stationary-base']),
    highlightedRole: 'recover-stand',
    leadRole: 'recover-stand',
    provenance: 'Illustrative runtime explanation; not a recorded ShareCLI .cast replay and not a simulated live host or terminal session.',
  }),
]);

export function createShareCliWorkbench(initial = {}) {
  let state = Number.isInteger(initial.state) && initial.state >= 0 && initial.state < SHARECLI_STATES.length ? initial.state : 0;
  // Motion is a discrete visitor choice, never an autoplay. The default of
  // false preserves parity for static, no-JavaScript, and reduced-motion
  // contexts; a renderer that ever reads `motion` is responsible for
  // checking it before doing anything time-based.
  let motion = initial.motion === true;
  const listeners = new Set();
  const emit = () => { for (const listener of listeners) listener({ state, motion }); };
  return {
    get: () => ({ state, motion }),
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    selectState(index) {
      if (!Number.isInteger(index) || index < 0 || index >= SHARECLI_STATES.length) return false;
      state = index;
      emit();
      return true;
    },
    next() { return this.selectState((state + 1) % SHARECLI_STATES.length); },
    previous() { return this.selectState((state - 1 + SHARECLI_STATES.length) % SHARECLI_STATES.length); },
    reset() { state = 0; motion = false; emit(); return true; },
    // Visitor-stepped motion-by-choice. The Workbench never autoplays; a
    // renderer that wants to advance frames between states must check
    // isMotionEnabled() before doing so and must remain identical when the
    // visitor has chosen off.
    setMotionEnabled(value) {
      const next = value === true;
      if (next === motion) return false;
      motion = next;
      emit();
      return true;
    },
    isMotionEnabled() { return motion; },
    getStateRoles(index) {
      if (!Number.isInteger(index) || index < 0 || index >= SHARECLI_STATES.length) {
        throw new RangeError(`ShareCLI: state index ${index} is out of range`);
      }
      const entry = SHARECLI_STATES[index];
      return {
        highlighted: entry.highlightedRole,
        lead: entry.leadRole,
        pushers: entry.objectRoles.filter((role) => role === 'pusher'),
        stationaryBase: entry.objectRoles.filter((role) => role === 'stationary-base'),
        material: entry.material,
        primitive: entry.objectPrimitive,
      };
    },
    // Explicit state graph: each state names its `next` and `previous` successors so a renderer
    // can build a transition table, surface it in the parity block, and verify reachability.
    // Mirrors how TUI state machines (ratatui, charm) expose transitions as a first-class
    // observable rather than inferring them from controller methods.
    getStateGraph() {
      const n = SHARECLI_STATES.length;
      return SHARECLI_STATES.map((entry, index) => ({
        index,
        id: entry.id,
        label: entry.label,
        next: (index + 1) % n,
        previous: (index - 1 + n) % n,
      }));
    },
    // Parity text covers the four contexts a precision artifact must
    // respect: static rendering, no-JavaScript fallback, reduced-motion
    // fallback, and the provenance boundary between this Workbench and the
    // real `.cast` recordings. Renderers surface this verbatim wherever the
    // Workbench appears so the boundary is visible on every state.
    parityText: () => 'Static architecture, the complete state sequence, and the same precision-object render are available without JavaScript, animation, or network activity. Reduced motion and no-JavaScript contexts present the same still object vocabulary. The Workbench is illustrative and stays separate from the recorded ShareCLI .cast replays.',
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

// APG listbox-style option label: "State N of M — Label, M highlighted roles, L pushers, R stationary bases".
// Announced by screen readers on selection. Mirrors how MUBI and YouTube expose their option
// labels without animation.
function listboxOptionLabel(stateIndex) {
  const state = SHARECLI_STATES[stateIndex];
  const pushers = state.objectRoles.filter((role) => role === 'pusher').length;
  const stationary = state.objectRoles.filter((role) => role === 'stationary-base').length;
  const roleTotal = state.objectRoles.length;
  const highlightedCount = Math.max(0, roleTotal - pushers - stationary);
  const ordinal = stateIndex + 1;
  return `State ${ordinal} of ${SHARECLI_STATES.length}: ${state.label}. ${state.materialLabel}. ${highlightedCount} highlighted ${highlightedCount === 1 ? 'artifact' : 'artifacts'}, ${pushers} ${pushers === 1 ? 'pusher' : 'pushers'}, ${stationary} stationary base.`;
}

function objectIllustrationDataUrl(selected, state) {
  const accent = state === 1 ? '#D9C6A0' : state === 2 ? '#7EBAB5' : '#B6D448';
  const object = selected.objectPrimitive === 'column'
    ? `<rect x="148" y="20" width="24" height="92" rx="6" fill="#87949A"/><rect x="154" y="30" width="12" height="52" rx="3" fill="${accent}"/>`
    : selected.objectPrimitive === 'stand'
      ? `<rect x="118" y="54" width="84" height="46" rx="10" fill="#D8D3C8"/><rect x="132" y="34" width="56" height="28" rx="8" fill="${accent}"/>`
      : selected.objectPrimitive === 'frame'
        ? `<rect x="92" y="28" width="136" height="84" rx="12" fill="none" stroke="#87949A" stroke-width="10"/><rect x="116" y="48" width="88" height="44" rx="8" fill="${accent}"/>`
        : [0, 1, 2, 3].map((index) => {
          const x = 70 + index * 12;
          const y = 14 + index * 24;
          return `<g data-object="capsule" data-highlighted="${index === 0}" transform="translate(${x} ${y})"><rect x="0" y="3" width="144" height="20" rx="10" fill="#25282D"/><rect width="144" height="18" rx="9" fill="url(#capsule-metal)" stroke="${index === 0 ? accent : '#87949A'}" stroke-width="1.5"/><path d="M12 4h120" stroke="#AFB8BC" stroke-opacity=".65"/><rect x="12" y="6" width="20" height="6" rx="3" fill="${index === 0 ? accent : '#414A50'}"/></g>`;
        }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140" role="img"><defs><linearGradient id="capsule-metal" x2="0" y2="1"><stop stop-color="#68747C"/><stop offset=".45" stop-color="#46515A"/><stop offset="1" stop-color="#303840"/></linearGradient></defs><rect width="320" height="140" rx="12" fill="#16181B"/><g data-object="stationary-base"><path d="M34 112h252" stroke="#7EBAB5" stroke-width="4"/><path d="M56 120h208" stroke="#353A40" stroke-width="8" stroke-linecap="round"/></g>${object}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function renderShareCliWorkbench(documentRef = document) {
  const workbench = createShareCliWorkbench();
  const root = documentRef.createElement('section');
  root.className = 'sharecli-workbench';
  root.setAttribute('aria-labelledby', 'sharecli-workbench-title');
  const title = el('h3', { id: 'sharecli-workbench-title' }, 'Reader / Explore Runtime Workbench');
  const summary = el('p', { class: 'sharecli-workbench__intro' }, workbench.parityText());
  // APG listbox pattern: a single tab stop with roving tabindex drives a list of options.
  // Arrow keys move selection (without changing the active descendant visually yet), Home/End
  // jump, Space/Enter activates, Tab moves focus to the next tab stop. The listbox is a single
  // tab stop so screen readers and keyboard users only enter the picker once per visit.
  const controls = el('div', {
    class: 'sharecli-workbench__controls',
    role: 'listbox',
    'aria-label': 'Illustrative ShareCLI runtime states',
    'aria-activedescendant': 'sharecli-workbench-option-0',
    tabindex: '0',
  });
  const panel = el('section', { class: 'sharecli-workbench__panel', 'aria-live': 'polite', tabindex: '0' });
  const reader = el('section', { class: 'sharecli-workbench__reader', 'aria-labelledby': 'sharecli-reader-title' },
    el('h4', { id: 'sharecli-reader-title' }, 'Reader sequence'), renderReaderSequence());
  const evidence = el('p', { class: 'sharecli-workbench__evidence' }, workbench.evidenceBoundary());
  // Motion is a discrete visitor choice, never an autoplay. The button
  // label reflects the current state so visitors can read the choice back
  // out of the rendered field without inspecting the controller.
  const motionButton = el('button', {
    type: 'button', class: 'sharecli-workbench__motion', 'aria-pressed': 'false',
    'aria-label': 'Visitor motion choice (off by default)', onclick: () => workbench.setMotionEnabled(!workbench.isMotionEnabled()),
  }, 'Motion: off');
  const back = el('button', { type: 'button', class: 'text-link' }, 'Back');
  const reset = el('button', { type: 'button', class: 'text-link' }, 'Reset');
  const actions = el('div', { class: 'sharecli-workbench__actions' }, back, reset);

  const render = ({ state, motion }) => {
    const selected = SHARECLI_STATES[state];
    // Roving tabindex: only the currently-selected option has tabindex=0; the rest have
    // tabindex=-1. The listbox itself has tabindex=0 so focus lands on the picker as a whole
    // (one tab stop), and arrow keys move focus between options without leaving the listbox.
    controls.replaceChildren(...SHARECLI_STATES.map((entry, index) => el('div', {
      id: `sharecli-workbench-option-${index}`,
      role: 'option',
      class: index === state ? 'is-active sharecli-workbench__option' : 'sharecli-workbench__option',
      'aria-selected': String(index === state),
      tabindex: index === state ? '0' : '-1',
      'aria-label': listboxOptionLabel(index),
      onclick: () => workbench.selectState(index),
    }, entry.label)));
    controls.setAttribute('aria-activedescendant', `sharecli-workbench-option-${state}`);
    // Precision-object presentation: surface the material label, the
    // object-first description, the role vocabulary, and the alt text so
    // every state names the artifact as an object, never as a frame or
    // pixel grid.
    panel.replaceChildren(
      el('p', { class: 'sharecli-workbench__eyebrow' }, `State ${String(state + 1).padStart(2, '0')} / ${selected.label}`),
      el('p', { class: 'sharecli-workbench__material' }, selected.materialLabel),
      el('h4', {}, selected.title),
      el('p', { class: 'sharecli-workbench__object' }, selected.objectLabel),
      el('img', { class: 'sharecli-workbench__object-illustration', src: objectIllustrationDataUrl(selected, state), alt: selected.altText, role: 'img', 'aria-label': selected.materialLabel }),
      el('p', { class: 'sharecli-workbench__provenance' }, selected.provenance),
      el('div', { class: 'sharecli-workbench__lanes', 'aria-label': 'Illustrative runtime boundary' },
        selected.lanes.map((lane, index) => el('span', { class: `sharecli-workbench__lane sharecli-workbench__lane--${index + 1}` }, lane))),
      el('dl', { class: 'sharecli-workbench__roles' },
        el('dt', {}, 'Highlighted object'), el('dd', {}, selected.highlightedRole),
        el('dt', {}, 'Lead object'), el('dd', {}, selected.leadRole),
        el('dt', {}, 'Material'), el('dd', {}, selected.material),
        el('dt', {}, 'Object primitive'), el('dd', {}, selected.objectPrimitive),
      ),
    );
    motionButton.textContent = `Motion: ${motion ? 'on' : 'off'}`;
    motionButton.setAttribute('aria-pressed', String(motion));
  };

  // True when the event originated inside the listbox (the listbox container itself, or any
  // of its options). Used to scope arrow-key handling so visitors cycling through options do
  // not double-step via the document-level handlers at the bottom of this listener.
  const eventIsInsideListbox = (event) => controls.contains(event.target);

  root.addEventListener('keydown', (event) => {
    if (eventIsInsideListbox(event) && (event.key === 'ArrowRight' || event.key === 'ArrowDown')) {
      // Arrow keys within the listbox move focus between options (APG listbox contract).
      event.preventDefault();
      workbench.next();
      // Move focus to the now-selected option without leaving the listbox.
      const active = controls.querySelector(`#sharecli-workbench-option-${workbench.get().state}`);
      if (active) active.focus();
      return;
    }
    if (eventIsInsideListbox(event) && (event.key === 'ArrowLeft' || event.key === 'ArrowUp')) {
      event.preventDefault();
      workbench.previous();
      const active = controls.querySelector(`#sharecli-workbench-option-${workbench.get().state}`);
      if (active) active.focus();
      return;
    }
    if (eventIsInsideListbox(event) && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault();
      workbench.selectState(event.key === 'Home' ? 0 : SHARECLI_STATES.length - 1);
      const active = controls.querySelector(`#sharecli-workbench-option-${workbench.get().state}`);
      if (active) active.focus();
      return;
    }
    if (eventIsInsideListbox(event)) {
      // Any other key (Tab, Space, Enter, PageUp, PageDown, etc.) is left alone while focus is
      // inside the listbox. Tab is the natural way to leave the picker.
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); workbench.next(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); workbench.previous(); }
    if (event.key === 'Escape') { event.preventDefault(); workbench.reset(); }
  });
  back.addEventListener('click', () => workbench.previous());
  reset.addEventListener('click', () => workbench.reset());
  workbench.subscribe(render);
  root.append(title, summary, controls, panel, motionButton, reader, evidence, actions);
  render(workbench.get());
  return root;
}
