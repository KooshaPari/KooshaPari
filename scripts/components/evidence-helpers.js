/**
 * Pure helpers for the evidence component.
 *
 * The orchestrator (evidence.js) is DOM-bound; this file is what the
 * orchestrator imports and what the unit tests exercise.
 *
 *   - publicEvidenceSummary(record): human-readable summary for a record's
 *     evidence source, with internal ledger names hidden
 *   - preferredMetric(record, lens): returns the metric that best matches
 *     the current lens (product lens prefers the second metric when present)
 *   - EVIDENCE_LABELS: the lens → evidence-label mapping
 *   - createMetricAnnotation(record, lens, el): factory-injected DOM tree
 *   - createEvidenceLabel(record, lens, el): factory-injected DOM tree
 */

export const EVIDENCE_LABELS = {
  product: 'Product evidence',
  engineering: 'Engineering evidence',
};

// Public summaries describe source types without exposing internal ledger names.
export function publicEvidenceSummary(record) {
  switch (record.evidence) {
    case 'github-pass1-after.md': return 'Repository documentation and project history';
    case 'EVIDENCE_LEDGER.md': return 'Retained project records';
    case 'omniroute-evidence-ledger.md': return 'Upstream contribution records';
    default: return 'Supporting project evidence is being assembled';
  }
}

export function preferredMetric(record, lens) {
  if (!record.metrics?.length) return null;
  const index = lens === 'product' && record.metrics.length > 1 ? 1 : 0;
  return record.metrics[index];
}

export function createMetricAnnotation(record, lens, el) {
  const metric = preferredMetric(record, lens);
  if (!metric) return null;

  const [value, label, qualification] = metric;
  return el(
    'div',
    { class: 'metric-annotation', role: 'note', 'aria-label': `${label}: ${value}` },
    el('strong', {}, value),
    el('span', {}, label),
    el('small', {}, qualification),
  );
}

export function createEvidenceLabel(record, lens, el) {
  const label = EVIDENCE_LABELS[lens] ?? EVIDENCE_LABELS.engineering;
  const assets = record.presentation?.assets ?? [];
  return el(
    'p',
    { class: 'evidence-label' },
    el('span', {}, label),
    el('strong', {}, publicEvidenceSummary(record)),
    assets.length
      ? el(
          'small',
          {},
          `Selected media: ${assets.length} manifest-traced ${assets.length === 1 ? 'file' : 'files'}; ownership and licensing review pending.`,
        )
      : null,
  );
}
