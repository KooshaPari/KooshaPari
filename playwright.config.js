import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  // The axe sweeps analyse a full page, then the contrast test repeats that for
  // three routes in one test. On a loaded host these measured 43s and 49s, so
  // Playwright's 30s default aborted them mid-analysis. The failures were
  // timeouts, not assertions: the same two tests pass in ~12s and ~18s when
  // the host is not saturated. 120s leaves headroom without hiding a real
  // hang, which still fails on its own.
  timeout: 120_000,
  expect: { timeout: 10_000 },
  use: { baseURL: 'http://127.0.0.1:4197', channel: 'chrome', trace: 'retain-on-failure' },
  outputDir: 'output/playwright/acceptance',
  webServer: { command: 'node scripts/preview-server.js', url: 'http://127.0.0.1:4197', reuseExistingServer: false, timeout: 120_000 },
});
