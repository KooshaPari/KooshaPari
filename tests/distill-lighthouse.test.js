import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const SCRIPT = new URL('../scripts/distill-lighthouse.js', import.meta.url).pathname;

/**
 * Minimal but structurally faithful Lighthouse report shape. The distiller
 * reads: lighthouseVersion, fetchTime, finalUrl, configSettings,
 * categories, audits (with score / weight / numericValue /
 * numericUnit / displayValue / title / explanation / details),
 * and runWarnings.
 */
function makeReport(overrides = {}) {
  return {
    lighthouseVersion: '13.4.1',
    fetchTime: '2026-10-19T20:41:06.012Z',
    finalUrl: 'https://kooshapari.com/',
    userAgent: 'Chrome 152',
    configSettings: {
      formFactor: 'desktop',
      throttlingMethod: 'simulate',
      throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
      screenEmulation: { mobile: false },
      locale: 'en-US',
    },
    categories: {
      performance: { title: 'Performance', score: 1 },
      seo: { title: 'SEO', score: 0.82 },
    },
    audits: {
      'first-contentful-paint': {
        title: 'First Contentful Paint',
        score: 1,
        numericValue: 307.4875,
        numericUnit: 'millisecond',
        displayValue: '0.3 s',
      },
      'total-blocking-time': {
        title: 'Total Blocking Time',
        score: 1,
        numericValue: 0,
        numericUnit: 'millisecond',
      },
      'cumulative-layout-shift': {
        title: 'Cumulative Layout Shift',
        score: 1,
        numericValue: 0,
        numericUnit: 'unitless',
      },
      'server-response-time': {
        title: 'Initial server response time',
        score: 1,
        numericValue: 28,
        numericUnit: 'millisecond',
      },
      'unused-javascript': {
        title: 'Reduce unused JavaScript',
        score: 0.5,
        weight: 0,
        displayValue: 'Potential savings of 12 KiB',
        explanation: 'Consider reducing unused JavaScript.',
        details: { items: [{ url: 'https://kooshapari.com/bundled/app.js' }] },
      },
      'network-dependency-tree-insight': {
        title: 'Network dependency tree',
        score: 0,
        weight: 0,
        explanation: 'Advisory insight.',
        details: { items: [] },
      },
      'not-applicable-audit': {
        title: 'Something not applicable',
        score: null,
        explanation: 'Not applicable to this page.',
      },
    },
    ...overrides,
  };
}

function runDistiller(report, outDir) {
  const input = join(outDir, 'input.json');
  writeFileSync(input, JSON.stringify(report));
  const output = join(outDir, 'input.summary.json');
  execFileSync('node', [SCRIPT, outDir, input], { stdio: 'pipe' });
  return JSON.parse(readFileSync(output, 'utf8'));
}

function withTempDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'distill-lh-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('distill preserves every scored audit and drops unscored ones', () => {
  withTempDir((dir) => {
    const out = runDistiller(makeReport(), dir);
    const ids = out.scoredAudits.map((a) => a.id).sort();
    assert.deepEqual(ids, [
      'cumulative-layout-shift',
      'first-contentful-paint',
      'network-dependency-tree-insight',
      'server-response-time',
      'total-blocking-time',
      'unused-javascript',
    ]);
    assert.equal(
      ids.includes('not-applicable-audit'),
      false,
      'null-score audits must not be counted as scored',
    );
  });
});

test('distill records category scores including sub-1.0 categories', () => {
  withTempDir((dir) => {
    const out = runDistiller(makeReport(), dir);
    assert.equal(out.categoryScores.performance.score, 1);
    assert.equal(out.categoryScores.seo.score, 0.82);
    assert.equal(out.categoryScores.performance.title, 'Performance');
  });
});

test('distill round-trips metric numeric values exactly', () => {
  withTempDir((dir) => {
    const out = runDistiller(makeReport(), dir);
    assert.equal(out.metrics['first-contentful-paint'].numericValue, 307.4875);
    assert.equal(out.metrics['first-contentful-paint'].numericUnit, 'millisecond');
    assert.equal(out.metrics['total-blocking-time'].numericValue, 0);
    assert.equal(out.metrics['cumulative-layout-shift'].numericValue, 0);
    assert.equal(out.metrics['server-response-time'].numericValue, 28);
  });
});

test('distill captures failures with explanation and detail items', () => {
  withTempDir((dir) => {
    const out = runDistiller(makeReport(), dir);
    const failureIds = out.failures.map((f) => f.id).sort();
    assert.deepEqual(failureIds, ['network-dependency-tree-insight', 'unused-javascript']);

    const unused = out.failures.find((f) => f.id === 'unused-javascript');
    assert.equal(unused.score, 0.5);
    assert.equal(unused.explanation, 'Consider reducing unused JavaScript.');
    assert.equal(unused.detailsItems.length, 1);
    assert.equal(
      unused.detailsItems[0].url,
      'https://kooshapari.com/bundled/app.js',
    );
  });
});

test('distill keeps the run config so a result is re-verifiable', () => {
  withTempDir((dir) => {
    const out = runDistiller(makeReport(), dir);
    assert.equal(out.lighthouseVersion, '13.4.1');
    assert.equal(out.finalUrl, 'https://kooshapari.com/');
    assert.equal(out.fetchTime, '2026-10-19T20:41:06.012Z');
    assert.equal(out.formFactor, 'desktop');
    assert.equal(out.throttlingMethod, 'simulate');
    assert.equal(out.throttling.rttMs, 40);
    assert.equal(out.throttling.cpuSlowdownMultiplier, 1);
    assert.equal(out.screenEmulation.mobile, false);
  });
});

test('distill reports the audit count and the source file name', () => {
  withTempDir((dir) => {
    const out = runDistiller(makeReport(), dir);
    assert.equal(out.scoredAuditCount, 6);
    assert.equal(out.distilledFrom, 'input.json');
  });
});

test('distill preserves harness-side run warnings', () => {
  withTempDir((dir) => {
    const warned = makeReport({
      runWarnings: [
        'Clearing the browser cache timed out. Try auditing this page again and file a bug if the issue persists.',
      ],
    });
    const out = runDistiller(warned, dir);
    assert.equal(out.runWarnings.length, 1);
    assert.match(out.runWarnings[0], /Clearing the browser cache timed out/);
  });
});

test('distill emits an empty run warnings array when the report has none', () => {
  withTempDir((dir) => {
    const out = runDistiller(makeReport(), dir);
    assert.deepEqual(out.runWarnings, []);
  });
});

test('distill exits non-zero with usage when given no report', () => {
  withTempDir((dir) => {
    let code = 0;
    try {
      execFileSync('node', [SCRIPT, dir], { stdio: 'pipe' });
    } catch (err) {
      code = err.status;
    }
    assert.equal(code, 2);
  });
});
