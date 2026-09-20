/**
 * Pure helpers for the project-index component.
 *
 * The orchestrator (project-index.js) is DOM-bound; this file is what the
 * orchestrator imports and what the unit tests exercise.
 *
 *   - GROUPS: ordered [label, predicate] pairs used to partition projects
 *   - partitionProjects(projects): claims each project by slug in order so
 *     it appears in at most one group, then drops empty groups
 */

export const GROUPS = [
  ['Featured', (project) => project.featured],
  ['Systems', (project) => project.category === 'systems'],
  ['AI / ML', (project) => ['ai-ml', 'ai-infrastructure'].includes(project.category)],
  ['Physical Products', (project) => project.category === 'physical-product'],
  ['Research', (project) => project.status === 'research' || project.category === 'simulation'],
  ['Archive', (project) => project.status === 'historical'],
  ['Compact', () => true],
];

export function partitionProjects(projects) {
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
