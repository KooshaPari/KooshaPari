import { el } from './dom.js';
import {
  publicEvidenceSummary,
  preferredMetric,
  createMetricAnnotation,
  createEvidenceLabel,
} from './evidence-helpers.js';

// Re-exports so callers can pull the pure helpers from this module too.
export { publicEvidenceSummary, preferredMetric };

// DOM-bound wrappers around the factory-injected helpers.
export function metricAnnotation(record, lens) {
  return createMetricAnnotation(record, lens, el);
}

export function evidenceLabel(record, lens) {
  return createEvidenceLabel(record, lens, el);
}

export { createMetricAnnotation, createEvidenceLabel };
