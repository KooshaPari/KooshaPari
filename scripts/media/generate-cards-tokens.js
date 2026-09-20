/**
 * Card-generator target list and dimensions for generate-cards.js.
 *
 * Pure data only — the Playwright orchestration lives in the CLI driver.
 * Sourced from `card-composer.js` CARD_WIDTH/CARD_HEIGHT and the project
 * catalogue used by the static card fall-back path on /work.
 */

export const CARD_WIDTH = 800;
export const CARD_HEIGHT = 450;

/** Projects that already have real product imagery on the site. */
export const SKIP = new Set([
  'netweave', 'witf', 'gmk-arch', 'dss-cipher',
  'substrate', 'phenotype-omlx', 'omniroute', 'sharecli',
]);

/** Projects that need a generated static card. */
export const PROJECTS = [
  { slug: 'agentapi-plusplus', title: 'AgentAPI++', technologies: ['TypeScript'], category: 'developer-tools' },
  { slug: 'byteport', title: 'BytePort', technologies: ['Go', 'AWS', 'Deployment'], category: 'cloud' },
  { slug: 'cliproxyapi-plusplus', title: 'CLIProxyAPI++', technologies: ['TypeScript'], category: 'developer-tools' },
  { slug: 'forgecode', title: 'ForgeCode', technologies: ['TypeScript'], category: 'developer-tools' },
  { slug: 'frostify', title: 'Frostify', technologies: ['TypeScript', 'Design'], category: 'design' },
  { slug: 'mcpforge', title: 'MCPForge', technologies: ['TypeScript'], category: 'developer-tools' },
  { slug: 'tracera', title: 'Tracera', technologies: ['Rust', 'Traceability', 'Audit'], category: 'developer-tools' },
];

/** Convenience helper: filter the project list against the SKIP set. */
export function projectsNeedingCards() {
  return PROJECTS.filter((project) => !SKIP.has(project.slug));
}
