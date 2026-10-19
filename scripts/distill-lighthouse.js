#!/usr/bin/env node
/**
 * Distill raw Lighthouse JSON reports into a compact, human-readable evidence
 * record. Raw reports are ~700 KB each; the distilled record keeps every
 * scored audit, every metric, and the full config so the result is
 * re-verifiable without checking 8 MB of JSON into the repo.
 *
 * Usage:
 *   node scripts/distill-lighthouse.js <output-dir> <raw-report.json> [...]
 *
 * Writes <output-dir>/<report-basename>.summary.json for each input.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";

const [, , outputDir, ...reportPaths] = process.argv;

if (!outputDir || reportPaths.length === 0) {
  console.error("usage: node scripts/distill-lighthouse.js <output-dir> <report.json> [...]");
  process.exit(2);
}

mkdirSync(outputDir, { recursive: true });

/** Audits whose score is null are not scored; null means "not applicable". */
function scoreOf(audit) {
  const s = audit?.score;
  return s === null || s === undefined ? null : s;
}

function distill(reportPath) {
  const raw = JSON.parse(readFileSync(reportPath, "utf8"));
  const audits = raw.audits ?? {};
  const categories = raw.categories ?? {};

  const categoryScores = {};
  for (const [key, category] of Object.entries(categories)) {
    categoryScores[key] = {
      title: category.title,
      score: scoreOf(category),
    };
  }

  // Every audit that was actually scored (0 or 1 or fractional), with its
  // weight inside the category it belongs to.
  const scoredAudits = [];
  for (const [id, audit] of Object.entries(audits)) {
    const score = scoreOf(audit);
    if (score === null) continue;
    scoredAudits.push({
      id,
      title: audit.title,
      score,
      weight: audit.weight ?? null,
      numericValue: audit.numericValue ?? null,
      numericUnit: audit.numericUnit ?? null,
      displayValue: audit.displayValue ?? null,
    });
  }
  scoredAudits.sort((a, b) => a.score - b.score || String(a.id).localeCompare(String(b.id)));

  // Metrics worth reading at a glance.
  const METRIC_IDS = [
    "first-contentful-paint",
    "largest-contentful-paint",
    "speed-index",
    "interactive",
    "total-blocking-time",
    "cumulative-layout-shift",
    "max-potential-fid",
    "server-response-time",
  ];
  const metrics = {};
  for (const id of METRIC_IDS) {
    const audit = audits[id];
    if (!audit) continue;
    metrics[id] = {
      title: audit.title,
      numericValue: audit.numericValue ?? null,
      numericUnit: audit.numericUnit ?? null,
      score: scoreOf(audit),
    };
  }

  // Full audit ids that failed, with the reason, so nothing is silently lost.
  const failures = [];
  for (const audit of scoredAudits) {
    if (audit.score >= 1) continue;
    const full = audits[audit.id];
    failures.push({
      id: audit.id,
      title: full.title,
      score: audit.score,
      explanation: full.explanation ?? full.displayValue ?? null,
      detailsItems: (full.details?.items ?? []).slice(0, 5),
    });
  }

  const config = raw.configSettings ?? {};

  return {
    distilledFrom: basename(reportPath),
    distilledAt: new Date().toISOString(),
    lighthouseVersion: raw.lighthouseVersion ?? null,
    fetchTime: raw.fetchTime ?? null,
    finalUrl: raw.finalUrl ?? null,
    finalDisplayedUrl: raw.finalDisplayedUrl ?? null,
    userAgent: raw.userAgent ?? null,
    environment: {
      networkUserAgent: raw.environment?.networkUserAgent ?? null,
      hostUserAgent: raw.environment?.hostUserAgent ?? null,
      network: raw.environment?.networkUserAgent ?? null,
    },
    formFactor: config.formFactor ?? null,
    throttlingMethod: config.throttlingMethod ?? null,
    throttling: config.throttling ?? null,
    screenEmulation: config.screenEmulation ?? null,
    locale: config.locale ?? null,
    categoryScores,
    metrics,
    scoredAuditCount: scoredAudits.length,
    failures,
    scoredAudits,
  };
}

const written = [];
for (const reportPath of reportPaths) {
  const summary = distill(reportPath);
  const outPath = join(outputDir, `${basename(reportPath).replace(/\.json$/, "")}.summary.json`);
  writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);
  written.push({ reportPath, outPath, summary });
}

for (const { reportPath, outPath, summary } of written) {
  const scores = Object.entries(summary.categoryScores)
    .map(([k, v]) => `${k}=${v.score === null ? "n/a" : Math.round(v.score * 100)}`)
    .join(" ");
  const bytes = readFileSync(outPath).length;
  console.log(`${basename(reportPath)} -> ${outPath} (${Math.round(bytes / 1024)} KB)  ${scores}`);
}
