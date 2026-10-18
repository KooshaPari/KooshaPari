#!/usr/bin/env node
// scripts/check-asset-sources.js
//
// Build-time guard: every file under public/ must be documented in
// data/asset-sources.json. Fails with non-zero exit if any file is
// undocumented, or if a documented file is missing on disk.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const publicDir = join(root, 'public');
const manifestPath = join(root, 'data', 'asset-sources.json');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const documented = new Map();
for (const asset of manifest.assets) {
  if (asset.path.startsWith('/public/')) {
    documented.set(asset.path, asset);
  }
}

const onDisk = new Set();
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      // The manifest records served URLs (e.g. /public/favicon.svg),
      // so prefix the on-disk-relative path with /public/ for parity.
      const rel = '/public/' + relative(publicDir, full).split(sep).join('/');
      onDisk.add(rel);
    }
  }
}

try {
  statSync(publicDir);
} catch (err) {
  console.error(`[asset-sources] cannot read public/ directory: ${err.message}`);
  process.exit(1);
}

walk(publicDir);

const missing = [...onDisk].filter((p) => !documented.has(p)).sort();
const stale = [...documented.keys()].filter((p) => !onDisk.has(p)).sort();

let failed = false;

if (missing.length > 0) {
  console.error(`[asset-sources] FAIL: ${missing.length} undocumented asset(s) in public/:`);
  for (const p of missing) console.error(`  - ${p}`);
  failed = true;
}

if (stale.length > 0) {
  console.error(`[asset-sources] FAIL: ${stale.length} documented asset(s) missing on disk:`);
  for (const p of stale) console.error(`  - ${p}`);
  failed = true;
}

if (failed) {
  console.error('[asset-sources] update data/asset-sources.json to resolve the gap(s) above.');
  process.exit(1);
}

console.log(`[asset-sources] OK: all ${onDisk.size} assets in public/ are documented in data/asset-sources.json (${manifest.assets.length} entries total, ${manifest.assets.length - onDisk.size} external)`);
