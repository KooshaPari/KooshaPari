import { el, $$ } from './dom.js';

const GROUPS = [
  ['Featured', (project) => project.featured],
  ['Systems', (project) => project.category === 'systems'],
  ['AI / ML', (project) => ['ai-ml', 'ai-infrastructure'].includes(project.category)],
  ['Physical Products', (project) => project.category === 'physical-product'],
  ['Research', (project) => project.status === 'research' || project.category === 'simulation'],
  ['Archive', (project) => project.status === 'historical'],
  ['Compact', () => true],
];

function partitionProjects(projects) {
  const claimed = new Set();

  return GROUPS.map(([label, matches]) => {
    const entries = projects.filter((project) => {
      if (claimed.has(project.slug) || !matches(project)) return false;
      claimed.add(project.slug);
      return true;
    });
    return [label, entries];
  }).filter(([, entries]) => entries.length > 0);
}

export function createProjectIndex({ projects, onNavigate = () => {} }) {
  let returnFocus = null;
  let searchEl = null;
  let renderResults = () => {};
  const titleId = 'project-index-title';
  const dialog = el('dialog', {
    class: 'project-index',
    'aria-labelledby': titleId,
  });

  function close() {
    if (!dialog.open) return;
    dialog.close();
  }

  function handleKeydown(event) {
    if (!dialog.open) return;
    const items = $$('.project-index-groups a', dialog);
    const current = document.activeElement;
    const index = items.indexOf(current);

    switch (event.key) {
      case 'ArrowDown':
        if (index < items.length - 1) {
          event.preventDefault();
          items[index + 1]?.focus();
        }
        break;
      case 'ArrowUp':
        if (index > 0) {
          event.preventDefault();
          items[index - 1]?.focus();
        } else if (index === 0) {
          event.preventDefault();
          searchEl?.focus();
        }
        break;
      case 'Home':
        if (event.target === searchEl) {
          event.preventDefault();
          items[0]?.focus();
        }
        break;
      case 'Escape':
        if (event.target === searchEl && searchEl.value) {
          event.preventDefault();
          event.stopPropagation();
          searchEl.value = '';
          renderResults();
        }
        break;
    }
  }

  function render() {
    const search = el('input', {
      type: 'search',
      placeholder: 'Find a project or technology',
      'aria-label': 'Search project index',
      class: 'project-index-search',
    });
    searchEl = search;
    const results = el('div', { class: 'project-index-groups' });
    const count = el('p', { role: 'status', 'aria-live': 'polite' });
    const closeButton = el(
      'button',
      { class: 'project-index-close', type: 'button', onclick: close },
      'Close',
    );

    dialog.replaceChildren(
      el(
        'div',
        { class: 'project-index-head' },
        el('div', {}, el('p', { class: 'atelier-label' }, 'Complete catalog'), el('h2', { id: titleId }, 'Project Index')),
        closeButton,
      ),
      search, count, results,
    );

    renderResults = () => {
      const query = search.value.trim().toLowerCase();
      const filtered = projects.filter(project => [project.title, project.category, project.summary, ...(project.technologies ?? [])].join(' ').toLowerCase().includes(query));
      count.textContent = `${filtered.length} ${filtered.length === 1 ? 'project' : 'projects'}`;
      const groups = partitionProjects(filtered);
      const items = groups.map(([label, entries], groupIndex) =>
          el(
            'section',
            { class: 'project-index-group', 'aria-labelledby': `index-group-${groupIndex}` },
            el('h3', { id: `index-group-${groupIndex}` }, label),
            el(
              'ol',
              {},
              entries.map((project, index) =>
                el(
                  'li',
                  { role: 'option' },
                  el(
                    'a',
                    {
                      href: `/work/${project.slug}`,
                      onclick: () => {
                        onNavigate(project);
                        close();
                      },
                    },
                    el('span', { class: 'project-index-number' }, String(index + 1).padStart(2, '0')),
                    el('strong', {}, project.title),
                    el('span', {}, project.summary),
                    el('small', {}, `${project.category} / ${project.status}`),
                  ),
                ),
              ),
            ),
          ),
        );
      if (!filtered.length) {
        items.push(
          el('div', { class: 'project-index-empty', role: 'status' },
            el('p', {}, 'No projects match your search.'),
            el('p', {}, 'Try a different project name, category, or technology \u2014 or browse the full catalog below.'),
          ),
        );
      }
      results.replaceChildren(...items);
    };
    search.addEventListener('input', renderResults);
    renderResults();
  }

  function open(trigger = document.activeElement) {
    returnFocus = trigger instanceof HTMLElement ? trigger : null;
    render();
    if (!dialog.open) dialog.showModal();
    setTimeout(() => dialog.querySelector('.project-index-search')?.focus(), 0);
  }

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('close', () => {
    returnFocus?.focus();
    returnFocus = null;
  });
  dialog.addEventListener('keydown', handleKeydown);

  render();
  return { element: dialog, open, close, render };
}
