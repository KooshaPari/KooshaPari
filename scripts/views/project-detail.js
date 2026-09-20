import { PROJECTS } from '../../data/projects.js';
import { el } from '../components/dom.js';
import { metricAnnotation, evidenceLabel, publicEvidenceSummary } from '../components/evidence.js';
import { diagramFromCaseStudy, renderDiagram } from '../media/diagrams.js';
import { renderNetWeaveWorkbench } from '../media/netweave-workbench.js';
import { renderShareCliWorkbench } from '../media/sharecli-workbench.js';
import { renderShareCliRecordings } from '../media/sharecli-recording.js';
import { renderSubstratePlate } from '../media/systems-plate.js';
import { renderNotFound } from './not-found.js';
import { sectionLookupFor } from './project-detail-helpers.js';

export function renderProjectDetail(root, slug, lens = 'engineering') {
  const project = PROJECTS.find(p => p.slug === slug);
  if (!project) return renderNotFound(root, slug);

  const metrics = project.metrics?.length
    ? el('div', { class: 'metric-grid' },
        project.metrics.map(([value, label, source]) =>
          el('div', { class: 'metric-card' },
            el('strong', { 'data-count-to': value }, value), el('span', {}, label), el('small', {}, source))))
    : null;

  const sections = sectionLookupFor(project);

  const overview = project.caseStudy?.overview
    ? el('div', { class: 'case-section case-overview' }, el('h2', {}, 'Overview'), el('p', {}, project.caseStudy.overview))
    : null;

  const diagram = project.caseStudy?.diagram
    ? el('div', { class: 'case-section case-diagram' }, el('h2', {}, 'Architecture'), renderDiagram(diagramFromCaseStudy(project), { title: `${project.title} architecture` }))
    : null;
  const netweaveField = project.slug === 'netweave'
    ? el('div', { class: 'case-section case-netweave-field' }, el('h2', {}, 'Traffic field'), renderNetWeaveWorkbench())
    : null;
  const shareCliWorkbench = project.slug === 'sharecli'
    ? el('div', { class: 'case-section case-sharecli-workbench' }, el('h2', {}, 'Runtime boundary'), renderShareCliWorkbench(), renderShareCliRecordings())
    : null;
  const substratePlate = project.slug === 'substrate'
    ? el('div', { class: 'case-section case-substrate-plate' }, el('h2', {}, 'Execution boundary'), renderSubstratePlate())
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
          project.evidence ? el('div', {}, el('dt', {}, 'Evidence source'), el('dd', {}, publicEvidenceSummary(project))) : null,
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

  const techPills = project.technologies?.length
    ? el('div', { class: 'case-tech' },
        project.technologies.map((t) => el('span', {}, t)))
    : null;

  const FAMILY_MAP = {
    netweave: 'netweave', sharecli: 'sharecli', omniroute: 'omniroute',
    'gmk-arch': 'physical', witf: 'physical', 'dss-cipher': 'physical',
    substrate: 'substrate', 'phenotype-omlx': 'omlx',
  };
  const family = FAMILY_MAP[project.slug];

  const familyAccentBar = family
    ? el('div', { class: 'hero-accent-bar', 'aria-hidden': 'true' })
    : null;

  const heroEyebrow = el('p', { class: 'eyebrow' }, project.category + ' \u00b7 ' + project.status);
  const heroTitle = el('h1', {}, project.title);
  const heroLede = el('p', { class: 'lede' }, project.summary);
  const heroMeta = el('div', { class: 'hero-meta' }, heroEyebrow, heroTitle, heroLede, techPills, metrics);

  const isWitf = project.slug === 'witf';

  const heroImage = project.gallery?.[0]
    ? (() => {
        const asset = project.presentation?.assets?.find((entry) => entry.src === project.gallery[0]);
        if (isWitf) {
          return el('figure', { class: 'case-hero case-hero--witf' },
            el('div', { class: 'witf-viewer-container', id: 'witf-detail-viewer' }),
          );
        }
        return el('figure', { class: 'case-hero', 'data-tilt': '', 'data-tilt-max': '6', 'data-tilt-glare': 'true', 'data-tilt-scale': '1.01' },
          el('img', {
            src: project.gallery[0],
            alt: asset?.alt ?? project.presentation?.alt ?? `${project.title} project visual`,
            loading: 'eager',
            decoding: 'async',
            width: asset?.width ?? project.presentation?.media?.width ?? 1600,
            height: asset?.height ?? project.presentation?.media?.height ?? 900,
          }),
          asset?.alt ? el('figcaption', {}, asset.alt) : null,
        );
      })()
    : null;

  const heroPlate = el('div', { class: 'hero-plate' },
    familyAccentBar,
    heroMeta,
    heroImage || el('div', { class: 'hero-plate__placeholder' }),
  );

  const caseStudyAttrs = { class: 'view active portfolio-view case-study' };
  if (family) {
    caseStudyAttrs['data-family'] = family;
    caseStudyAttrs.style = `--family-accent: var(--family-${family}-active, var(--family-${family})); --family-accent-ink: var(--family-${family}-ink-active, var(--family-${family}-ink, var(--family-${family}-active, var(--family-${family}))));`;
  }

  root.replaceChildren(
    el('section', caseStudyAttrs,
      el('a', { href: '/work', class: 'back-link' }, '\u2190 Back to work'),
      heroPlate,
      project.gallery?.length > 1
        ? el('div', { class: 'case-gallery' },
            project.gallery.map((src) => {
              const asset = project.presentation?.assets?.find((entry) => entry.src === src);
              return el('figure', { class: 'case-gallery-item', 'data-tilt': '', 'data-tilt-max': '5', 'data-tilt-scale': '1.01' },
                el('img', {
                  src,
                  alt: asset?.alt ?? project.presentation?.alt ?? `${project.title} project visual`,
                  loading: 'lazy',
                  width: asset?.width ?? project.presentation?.media?.width ?? 1600,
                  height: asset?.height ?? project.presentation?.media?.height ?? 900,
                }),
                asset?.alt ? el('figcaption', {}, asset.alt) : null,
              );
            }))
        : null,
      lensAnnotation,
      el('div', { class: 'case-copy' },
        overview, diagram, netweaveField, shareCliWorkbench, substratePlate,
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


