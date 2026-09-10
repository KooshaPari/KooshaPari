import { el } from '../components/dom.js';

const SHARECLI_REVISION = '81c4dfaa208749adfa56ec6bbe07e01b5f80397e';

export const SHARECLI_RECORDINGS = Object.freeze([
  {
    id: 'help',
    label: 'CLI help session',
    href: '/public/projects/sharecli/recordings/sharecli-help-real.cast',
    command: 'cargo run --quiet -- --help',
    revision: SHARECLI_REVISION,
    capturedAt: '2026-09-06',
    kind: 'Recorded replay',
    boundary: 'Recorded CLI output; separate from the illustrative Runtime Workbench.',
  },
  {
    id: 'health',
    label: 'Runtime health session',
    href: '/public/projects/sharecli/recordings/sharecli-health-real.cast',
    command: 'version + health + status',
    revision: SHARECLI_REVISION,
    capturedAt: '2026-09-06',
    kind: 'Recorded replay',
    boundary: 'Recorded CLI output; separate from the illustrative Runtime Workbench.',
  },
]);

export function renderShareCliRecordings(documentRef = document) {
  const root = documentRef.createElement('section');
  root.className = 'sharecli-recordings';
  root.setAttribute('aria-labelledby', 'sharecli-recordings-title');
  root.append(
    el('h3', { id: 'sharecli-recordings-title' }, 'Recorded CLI sessions'),
    el('p', { class: 'sharecli-recordings__intro' }, 'Replayable terminal captures from the real ShareCLI CLI. These recordings are evidence of the commands shown, not a recording of the illustrative state model above.'),
    el('div', { class: 'sharecli-recordings__grid' }, SHARECLI_RECORDINGS.map((recording) => el('article', { class: 'sharecli-recording' },
      el('h4', {}, recording.label),
      el('p', { class: 'sharecli-recording__kind' }, recording.kind),
      el('dl', {},
        el('div', {}, el('dt', {}, 'Command'), el('dd', {}, recording.command)),
        el('div', {}, el('dt', {}, 'Revision'), el('dd', {}, recording.revision)),
        el('div', {}, el('dt', {}, 'Captured'), el('dd', {}, recording.capturedAt)),
      ),
      el('p', { class: 'sharecli-recording__boundary' }, recording.boundary),
      el('a', { class: 'text-link', href: recording.href, download: `sharecli-${recording.id}-real.cast` }, 'Download terminal recording (.cast)'),
    ))),
  );
  return root;
}
