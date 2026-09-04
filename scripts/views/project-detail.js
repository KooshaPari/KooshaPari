import { PROJECTS } from '../../data/projects.js';
import { el } from '../components/dom.js';
import { metricAnnotation, evidenceLabel } from '../components/evidence.js';

const COMPACT_SECTIONS = {
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

const OMNIROUTE_SECTIONS = [
  ['Context', 'OmniRoute is a meta-framework for managing multiple workflows and deployment pipelines across the KooshaPari organization.'],
  ['Audit source', 'This entry consumes the OmniRoute audit via §15E handoff contract (`OMNIROUTE_AUDIT.json`).'],
  ['Current boundary', 'Consumes audit data; no direct deployment claims beyond the audit evidence.'],
  ['External contributors', 'Rank #5 external contributor (101 merged PRs).'],
];

export function renderProjectDetail(root, slug) {
  const project = PROJECTS.find(p => p.slug === slug);
  if (!project) return renderNotFound(root, slug);

  // Lens binding from URL
  const url = new URL(window.location.href);
  const lens = url.searchParams.get('lens') || 'engineering';

  // Handle OmniRoute special case
  if (slug === 'omniroute') {
    const sections = OMNIROUTE_SECTIONS;
    const overview = null;
    const diagram = null;
    const disclosure = el('div', { class: 'case-section case-disclosure' },
      el('h2', {}, 'OmniRoute Integration'),
      el('p', {}, 'This case study consumes the OmniRoute audit data via the §15E handoff contract.'),
      el('p', {}, 'Audit data source: `docs/redesign/OMNIROUTE_AUDIT.json`'),
    );
    const evidence = null;
    const metrics = null;
    const gallery = null;
    const title = 'OmniRoute Audit Integration';
    const summary = 'Consumes OmniRoute audit data via §15E contract';
    const category = 'infrastructure';
    const status = 'complete';
    const repo = null;

    root.replaceChildren(
      el('section', { class: 'view active portfolio-view case-study' },
        el('a', { href: '#work', class: 'back-link' }, '\u2190 Back to work'),
        el('p', { class: 'eyebrow' }, category + ' \u00b7 ' + status),
        el('h1', {}, title),
        el('p', { class: 'lede' }, summary),
        metrics,
        gallery ? el('div', { class: 'case-gallery' },
            gallery.map((src, i) =>
              el('img', { src, alt: title + ' project image ' + (i + 1), loading: 'lazy', width: '1600', height: '900' })))
          : null,
        el('div', { class: 'case-copy' },
          overview, diagram,
          sections.map(([heading, copy]) =>
            el('div', { class: 'case-section' }, el('h2', {}, heading), el('p', {}, copy))),
          disclosure, evidence,
          project.provenance ? el('p', {}, project.provenance) : null,
        ),
        project.repo ? el('a', { href: project.repo, target: '_blank', rel: 'noreferrer', class: 'text-link' }, 'View repository') : null,
      ),
    );
    return;
  }

  const metrics = project.metrics?.length
    ? el('div', { class: 'metric-grid' },
        project.metrics.map(([value, label, source]) =>
          el('div', { class: 'metric-card' },
            el('strong', {}, value), el('span', {}, label), el('small', {}, source))))
    : null;

  const defaultSections = project.category === 'physical-product'
    ? [
        ['Context', 'A technically complex physical product shaped by constraints, suppliers, and real-world demand.'],
        ['Decisions', 'Presented as an evidence-led product narrative; historical facts retain their qualifiers.'],
        ['Outcome', 'Commercial and launch claims are labeled in the evidence ledger rather than inflated in prose.'],
      ]
    : [
        ['Problem', 'A concrete engineering problem is framed before implementation details.'],
        ['Architecture', 'The system boundary, runtime choices, and operational constraints are kept explicit.'],
        ['Verification', 'Current status and limitations follow the reconciled GitHub evidence.'],
      ];

  const sections = project.caseStudy?.sections || COMPACT_SECTIONS[project.slug] || defaultSections;

  const overview = project.caseStudy?.overview
    ? el('div', { class: 'case-section case-overview' }, el('h2', {}, 'Overview'), el('p', {}, project.caseStudy.overview))
    : null;

  const diagram = project.caseStudy?.diagram
    ? el('div', { class: 'case-section case-diagram' }, el('h2', {}, 'Architecture'), el('pre', {}, project.caseStudy.diagram))
    : null;

  const disclosure = project.caseStudy?.disclosure
    ? el('div', { class: 'case-section case-disclosure' }, el('h2', {}, 'AI-assistance disclosure'), el('p', {}, project.caseStudy.disclosure))
    : null;

  const evidence = project.caseStudy?.evidenceRefs?.length
    ? el('div', { class: 'case-section case-evidence' }, el('h2', {}, 'Evidence status'),
        project.caseStudy.evidenceRefs.map(ref => el('p', {}, ref)))
    : null;

  // Evidence Panel (per §13 - Evidence & Provenance UX)
  const evidencePanel = (project.evidence || project.provenance || project.repo)
    ? el('div', { class: 'case-section case-evidence-panel' },
        el('h2', {}, 'Provenance & Attribution'),
        el('dl', { class: 'evidence-list' },
          project.evidence ? el('div', {}, el('dt', {}, 'Evidence source'), el('dd', {}, project.evidence)) : null,
          project.provenance ? el('div', {}, el('dt', {}, 'Provenance'), el('dd', {}, project.provenance)) : null,
          project.repo ? el('div', {}, el('dt', {}, 'Repository'), el('dd', {}, el('a', { href: project.repo, target: '_blank', rel: 'noreferrer' }, project.repo))) : null,
          project.lens ? el('div', {}, el('dt', {}, 'Available in lens'), el('dd', {}, project.lens.join(', '))) : null,
        ),
      )
    : null;

  // Lens-aware annotation
  const lensAnnotation = project.presentation?.annotations?.[lens]
    ? el('div', { class: 'lens-annotation', 'data-lens': lens },
        el('h3', {}, lens === 'product' ? 'Product lens' : 'Engineering lens'),
        el('p', {}, project.presentation.annotations[lens]),
      )
    : null;

  root.replaceChildren(
    el('section', { class: 'view active portfolio-view case-study' },
      el('a', { href: '#work', class: 'back-link' }, '\u2190 Back to work'),
      el('p', { class: 'eyebrow' }, project.category + ' \u00b7 ' + project.status),
      el('h1', {}, project.title),
      el('p', { class: 'lede' }, project.summary),
      metrics,
      project.gallery?.length
        ? el('div', { class: 'case-gallery' },
            project.gallery.map((src, i) =>
              el('img', { src, alt: project.title + ' project image ' + (i + 1), loading: 'lazy', width: '1600', height: '900' })))
        : null,
      lensAnnotation,
      el('div', { class: 'case-copy' },
        overview, diagram,
        sections.map(([heading, copy]) =>
          el('div', { class: 'case-section' }, el('h2', {}, heading), el('p', {}, copy))),
        disclosure, evidence,
        project.provenance ? el('p', {}, project.provenance) : null,
        evidencePanel,
      ),
      project.repo ? el('a', { href: project.repo, target: '_blank', rel: 'noreferrer', class: 'text-link' }, 'View repository') : null,
    ),
  );
}

export function renderNotFound(root, slug) {
  root.replaceChildren(
    el('section', { class: 'view active portfolio-view not-found' },
      el('p', { class: 'eyebrow' }, '404'),
      el('h1', {}, 'Project not found'),
      el('p', { class: 'lede' }, 'No curated project record exists for \u201c' + slug + '\u201d.'),
      el('a', { href: '#work', class: 'cta cta-eng' }, 'Browse work'),
    ),
  );
}

