import test from 'node:test';
import assert from 'node:assert/strict';

/* ------------------------------------------------------------------ *
 *  Minimal DOM stubs for project-index keyboard and reader-state      *
 *  Escape-guard tests. No real browser.                               *
 * ------------------------------------------------------------------ */

class HTMLElement {
  constructor() { this.nodeType = 1; }
}

class FakeNode extends HTMLElement {
  constructor(tagName = '#text', textContent = '') {
    super();
    this.nodeType = tagName === '#text' ? 3 : 1;
    this.tagName = tagName;
    this.textContent = textContent;
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.open = false;
    this.value = '';
    this.dataset = {};
    this.style = { cssText: '' };
    this._stopped = false;
  }

  set className(v) { this.setAttribute('class', v); }
  get className() { return this.getAttribute('class') ?? ''; }
  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  getAttribute(k) { return this.attributes.get(k) ?? null; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  addEventListener(name, fn) {
    if (!this.listeners.has(name)) this.listeners.set(name, []);
    this.listeners.get(name).push(fn);
  }
  removeEventListener() {}
  focus() { document.activeElement = this; }

  showModal() { this.open = true; }
  close() { this.open = false; }

  querySelector(sel) {
    if (sel === '.project-index-search') return this._findByClass('project-index-search');
    return null;
  }

  querySelectorAll(sel) {
    if (sel === '.project-index-groups a') return this._allLinks;
    return [];
  }

  _findByClass(cls) {
    for (const c of this.children) {
      if (c.getAttribute?.('class') === cls) return c;
      const found = c._findByClass?.(cls);
      if (found) return found;
    }
    return null;
  }

  get _allLinks() {
    const out = [];
    const walk = (n) => {
      if (n.tagName === 'a') out.push(n);
      for (const c of (n.children || [])) walk(c);
    };
    for (const c of this.children) walk(c);
    return out;
  }

  /* Fire a keydown event directly on this element (for dialog listeners). */
  _fireKeydown(e) {
    const handlers = this.listeners.get('keydown') || [];
    handlers.forEach(fn => fn(e));
  }
}

globalThis.HTMLElement = HTMLElement;

/* ------------------------------------------------------------------ *
 *  Intercept createElement('dialog') to track the component's own    *
 *  dialog element.                                                    *
 * ------------------------------------------------------------------ */
let dialogRef = null;
let docListeners = [];
let doc = null;

function makeDom() {
  dialogRef = null;
  docListeners = [];

  doc = {
    documentElement: { dataset: {} },
    body: { appendChild() {} },
    activeElement: null,
    getElementById(id) {
      if (id === 'announcements') return { textContent: '' };
      return null;
    },
    createElement(tag) {
      const node = new FakeNode(tag);
      if (tag === 'dialog') dialogRef = node;
      return node;
    },
    createTextNode(t) { return new FakeNode('#text', t); },
    querySelector(sel) {
      if (sel === 'dialog[open]') return dialogRef?.open ? dialogRef : null;
      return null;
    },
    addEventListener(_name, fn) { docListeners.push(fn); },
    _fire(e) { docListeners.forEach(fn => fn(e)); },
  };
  globalThis.document = doc;
  globalThis.window = { matchMedia: () => ({ matches: false }) };
  globalThis.localStorage = {
    _s: new Map(),
    getItem(k) { return this._s.get(k) ?? null; },
    setItem(k, v) { this._s.set(k, v); },
  };
}

function makeEvent(overrides = {}) {
  return {
    key: 'Escape',
    target: dialogRef ?? new FakeNode('dialog'),
    defaultPrevented: false,
    _stopped: false,
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() { this._stopped = true; },
    ...overrides,
  };
}

/*
 * In a real browser, keydown events fire on the target, bubble up
 * through ancestors (dialog → document). The project-index registers
 * handleKeydown on dialog, reader-state on document.
 *
 * This helper fires the event on the dialog first (capturing project-index
 * handleKeydown), then on the document (capturing reader-state handler).
 */
function fireKeyEvent(opts = {}) {
  const e = makeEvent(opts);
  dialogRef?._fireKeydown(e);     // project-index handleKeydown
  doc._fire(e);                    // reader-state handler
  return e;
}

/*
 * Simulate Escape inside a showModal() dialog:
 *  1. Fire keydown on dialog and document.
 *  2. If dialog is still open (search was empty → no preventDefault),
 *     fire 'cancel' on dialog to close it (browser native behavior).
 */
function simulateBrowserEscape(searchEl) {
  const e = fireKeyEvent({ target: searchEl });
  if (dialogRef?.open && !e.defaultPrevented && !e._stopped) {
    dialogRef.listeners.get('cancel')?.forEach(fn => fn(e));
  }
  return e;
}

let seq = 0;
async function loadPI(projects = []) {
  seq++;
  const { createProjectIndex } = await import(
    `../scripts/components/project-index.js?t=${seq}`
  );
  return createProjectIndex({ projects });
}

async function loadReader(saved = null) {
  seq++;
  globalThis.localStorage._s.clear();
  if (saved != null) globalThis.localStorage._s.set('koosha-atelier-reader', saved);
  const { createReaderState } = await import(
    `../scripts/reader-state.js?r=${seq}`
  );
  return createReaderState();
}

/* ================================================================== *
 *  1. Escape with empty search closes dialog, reader stays           *
 * ================================================================== */
test('Escape with empty search closes dialog, does not exit reader', async () => {
  makeDom();
  const reader = await loadReader('true');
  assert.equal(reader.get(), true);

  const idx = await loadPI([]);
  idx.open();
  assert.equal(dialogRef.open, true);

  const search = dialogRef.querySelector('.project-index-search');
  assert.ok(search);
  assert.equal(search.value, '');

  simulateBrowserEscape(search);
  assert.equal(dialogRef.open, false, 'dialog closes on Escape');
  assert.equal(reader.get(), true, 'reader must stay active');
});

/* ================================================================== *
 *  2. Escape with nonempty search clears, dialog stays open          *
 * ================================================================== */
test('Escape with nonempty search clears value, dialog stays open', async () => {
  makeDom();
  const reader = await loadReader('true');
  const idx = await loadPI([
    { slug: 'a', title: 'Alpha', summary: 'test', status: 'current',
      category: 'systems', featured: false, technologies: ['js'] },
  ]);
  idx.open();

  const search = dialogRef.querySelector('.project-index-search');
  search.value = 'alpha';
  search.listeners.get('input')?.forEach(fn => fn());

  const e = simulateBrowserEscape(search);
  assert.equal(search.value, '', 'search cleared');
  assert.equal(dialogRef.open, true, 'dialog stays open');
  assert.equal(reader.get(), true, 'reader stays active');
  assert.equal(e.defaultPrevented, true, 'preventDefault called');
});

/* ================================================================== *
 *  3. ArrowDown / ArrowUp navigation                                  *
 * ================================================================== */
test('ArrowDown/ArrowUp navigate links; ArrowUp from first goes to search', async () => {
  makeDom();
  const idx = await loadPI([
    { slug: 'a', title: 'A', summary: 'a', status: 'current',
      category: 'systems', featured: false },
    { slug: 'b', title: 'B', summary: 'b', status: 'current',
      category: 'ai-ml', featured: false },
  ]);
  idx.open();

  const links = dialogRef.querySelectorAll('.project-index-groups a');
  assert.ok(links.length >= 2, `expected >=2 links, got ${links.length}`);

  links[0].focus();
  assert.equal(doc.activeElement, links[0], 'focus on first link');

  // ArrowDown → second link
  fireKeyEvent({ key: 'ArrowDown', target: links[0] });
  assert.equal(doc.activeElement, links[1], 'ArrowDown → next link');

  // ArrowUp → back to first
  fireKeyEvent({ key: 'ArrowUp', target: links[1] });
  assert.equal(doc.activeElement, links[0], 'ArrowUp → prev link');

  // ArrowUp from first → search
  const search = dialogRef.querySelector('.project-index-search');
  fireKeyEvent({ key: 'ArrowUp', target: links[0] });
  assert.equal(doc.activeElement, search, 'ArrowUp from first → search');
});

/* ================================================================== *
 *  4. Home key from search focuses first link                        *
 * ================================================================== */
test('Home key from search input focuses first link', async () => {
  makeDom();
  const idx = await loadPI([
    { slug: 'a', title: 'A', summary: 'a', status: 'current',
      category: 'systems', featured: false },
  ]);
  idx.open();

  const links = dialogRef.querySelectorAll('.project-index-groups a');
  assert.ok(links.length >= 1);
  const search = dialogRef.querySelector('.project-index-search');
  search.focus();

  fireKeyEvent({ key: 'Home', target: search });
  assert.equal(doc.activeElement, links[0], 'Home → first link');
});

/* ================================================================== *
 *  5 – REGRESSION: reader stays when dialog open + Escape            *
 * ================================================================== */
test('REGRESSION: reader stays active when dialog open and Escape fires', async () => {
  makeDom();
  const reader = await loadReader('true');
  assert.equal(reader.get(), true);

  const idx = await loadPI([]);
  idx.open();
  assert.equal(dialogRef.open, true);

  const search = dialogRef.querySelector('.project-index-search');
  simulateBrowserEscape(search);
  assert.equal(dialogRef.open, false, 'dialog closes');
  assert.equal(reader.get(), true, 'reader must NOT exit');
});

/* ================================================================== *
 *  6. reader DOES exit when no dialog is open                        *
 * ================================================================== */
test('Reader exits on Escape when no dialog is open', async () => {
  makeDom();
  const reader = await loadReader('true');
  assert.equal(reader.get(), true);

  fireKeyEvent();
  assert.equal(reader.get(), false, 'reader exits when no dialog');
});

/* ================================================================== *
 *  7. Focus returns to trigger after dialog close                    *
 * ================================================================== */
test('Focus returns to trigger element after dialog close', async () => {
  makeDom();
  const trigger = new FakeNode('button');
  doc.activeElement = trigger;

  const idx = await loadPI([]);
  idx.open(trigger);
  assert.equal(dialogRef.open, true);

  dialogRef.listeners.get('close')?.forEach(fn => fn());
  assert.equal(doc.activeElement, trigger, 'focus returns to trigger');
});

/* ================================================================== *
 *  8. handleKeydown no-op when dialog not open                       *
 * ================================================================== */
test('Escape no-op in handleKeydown when dialog not open', async () => {
  makeDom();
  const idx = await loadPI([]);
  assert.equal(dialogRef?.open ?? false, false);

  const dummy = new FakeNode('input');
  fireKeyEvent({ key: 'Escape', target: dummy });
  assert.equal(dialogRef?.open ?? false, false);
});

/* ================================================================== *
 *  9. Escape with reader off does not throw                           *
 * ================================================================== */
test('Escape with reader off and no dialog does not throw', async () => {
  makeDom();
  const reader = await loadReader('false');
  assert.equal(reader.get(), false);
  fireKeyEvent();
  assert.equal(reader.get(), false);
});
