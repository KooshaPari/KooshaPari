/**
 * Pure helpers for the project-detail view.
 *
 * Currently holds:
 *   - COMPACT_SECTIONS: hand-curated fallback copy for projects without a
 *     full case-study block. Each entry is a [heading, paragraph] tuple.
 *   - defaultSectionsFor(project): picks the right fallback list for a
 *     given project (physical-product gets a product narrative; everything
 *     else gets a generic problem/architecture/verification trio).
 *
 * sectionLookupFor(project): resolves which section list to render,
 * honouring the case-study override before any fallback. Used by
 * project-detail.js once for the main copy block.
 */

export const COMPACT_SECTIONS = {
  byteport: [
    ['Context', 'Declarative Go/AWS deployment tooling with a deliberately explicit boundary between current behavior and planned delivery.'],
    ['Current boundary', 'The record does not claim Firecracker, microVM, or live public deployment delivery without repository evidence.'],
    ['Why it matters', 'The useful contribution is making deployment intent reviewable before infrastructure is provisioned.'],
  ],
  tracera: [
    ['Context', 'Traceability and audit infrastructure for software and agent workflows.'],
    ['Focus', 'The project organizes provenance and operational evidence without claiming unsupported adoption or deployment scale.'],
    ['Current boundary', 'Repository status is the source of truth; production rollout claims are intentionally omitted.'],
  ],
  'dss-cipher': [
    ['Context', 'Historical keyset concept preserved as a compact visual/product entry.'],
    ['Evidence', 'Renders, kitting, collaborations, and community-interest links are retained where captured.'],
    ['Current boundary', 'Unavailable external destinations and limited outcome evidence keep this out of the full case-study tier.'],
  ],
  'cliproxyapi-plusplus': [
    ['Context', 'A forked multi-provider AI proxy focused on routing, auth, quotas, diagnostics, and operational controls.'],
    ['Upstream boundary', 'Attributed to router-for-me/CLIProxyAPI; only KooshaPari\u2019s extension scope is presented here.'],
    ['Current boundary', 'Upstream popularity is not imported as local adoption evidence.'],
  ],
  'agentapi-plusplus': [
    ['Context', 'Agent API extension work built on an upstream agent interface.'],
    ['Upstream boundary', 'Attributed to coder/agentapi; this entry describes extension scope only.'],
    ['Current boundary', 'No unsupported deployment or adoption claim is made.'],
  ],
  mcpforge: [
    ['Context', 'Historical MCP tooling entry preserved for provenance and archive discoverability.'],
    ['Upstream boundary', 'Attribution to isaacphi/mcp-language-server remains visible.'],
  ],
  forgecode: [
    ['Context', 'Historical agent-tooling entry retained as an archive record.'],
    ['Upstream boundary', 'Attribution to tailcallhq/forgecode remains visible.'],
  ],
  frostify: [
    ['Context', 'Historical, unmaintained Spicetify theme fork with transparent/frosted styling.'],
    ['Evidence', 'GitHub records 3,350+ release-asset downloads; this is not a user count.'],
    ['Upstream boundary', 'Fork attribution to gwennlbh/Frostify remains explicit.'],
  ],
};

/** Physical-product fallback narrative. */
const PHYSICAL_PRODUCT_FALLBACK = [
  ['Context', 'A technically complex physical product shaped by constraints, suppliers, and real-world demand.'],
  ['Decisions', 'Presented as an evidence-led product narrative; historical facts retain their qualifiers.'],
  ['Outcome', 'Commercial and launch claims are labeled in the evidence ledger rather than inflated in prose.'],
];

/** Default problem / architecture / verification trio. */
const ENGINEERING_FALLBACK = [
  ['Problem', 'A concrete engineering problem is framed before implementation details.'],
  ['Architecture', 'The system boundary, runtime choices, and operational constraints are kept explicit.'],
  ['Verification', 'Current status and limitations follow the reconciled GitHub evidence.'],
];

/** Pick the fallback list based on the project's category. */
export function defaultSectionsFor(project = {}) {
  return project.category === 'physical-product'
    ? PHYSICAL_PRODUCT_FALLBACK
    : ENGINEERING_FALLBACK;
}

/**
 * Resolve which section list to render: caseStudy override first, then the
 * project-specific compact entry, then the category-driven fallback.
 */
export function sectionLookupFor(project = {}) {
  if (project.caseStudy?.sections) return project.caseStudy.sections;
  if (COMPACT_SECTIONS[project.slug]) return COMPACT_SECTIONS[project.slug];
  return defaultSectionsFor(project);
}
