// scripts/inject-themes.js (ESM)
// One-shot: add `theme:` field to each project in data/projects.js.
// Idempotent: skips projects that already have a `theme:` field.
// Run with: node scripts/inject-themes.js

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data', 'projects.js');

const THEMES = {
  'gmk-arch':              { accent: '#A16207', fontPair: 'Cormorant + Montserrat',                   industry: 'E-commerce Luxury' },
  'witf':                  { accent: '#A16207', fontPair: 'Cinzel + Josefin Sans',                   industry: 'Luxury / Hardware Ops' },
  'sharecli':              { accent: '#22C55E', fontPair: 'JetBrains Mono + IBM Plex Sans',          industry: 'Developer Tool / IDE' },
  'substrate':             { accent: '#A16207', fontPair: 'Cormorant Garamond + Libre Baskerville',  industry: 'Academic Journal' },
  'phenotype-omlx':        { accent: '#0891B2', fontPair: 'Syne + Manrope',                           industry: 'Quantum Computing (sparingly)' },
  'omniroute':             { accent: '#F59E0B', fontPair: 'Playfair + Inter',                         industry: 'Fintech/Crypto (restraint)' },
  'netweave':              { accent: '#22C55E', fontPair: 'JetBrains Mono + IBM Plex Sans',          industry: 'Developer Tool / IDE' },
  'byteport':              { accent: '#0891B2', fontPair: 'IBM Plex Sans + IBM Plex Mono',           industry: 'Developer Tool / IDE' },
  'tracera':               { accent: '#7C3AED', fontPair: 'JetBrains Mono + IBM Plex Sans',          industry: 'Developer Tool / IDE' },
  'dss-cipher':            { accent: '#A16207', fontPair: 'Cormorant + Montserrat',                   industry: 'E-commerce Luxury' },
  'cliproxyapi-plusplus':  { accent: '#7C3AED', fontPair: 'IBM Plex Sans + IBM Plex Mono',           industry: 'Developer Tool / IDE' },
  'agentapi-plusplus':     { accent: '#7C3AED', fontPair: 'IBM Plex Sans + IBM Plex Mono',           industry: 'Developer Tool / IDE' },
  'mcpforge':              { accent: '#7C3AED', fontPair: 'IBM Plex Sans + IBM Plex Mono',           industry: 'Developer Tool / IDE' },
  'forgecode':             { accent: '#7C3AED', fontPair: 'IBM Plex Sans + IBM Plex Mono',           industry: 'Developer Tool / IDE' },
  'frostify':              { accent: '#06B6D4', fontPair: 'Manrope + JetBrains Mono',                industry: 'Developer Tool / IDE' },
};

const text = fs.readFileSync(DATA, 'utf8');

let updated = text;
let count = 0;
const missing = [];

for (const [slug, theme] of Object.entries(THEMES)) {
  const slugMarker = `slug:'${slug}'`;
  const slugIdx = updated.indexOf(slugMarker);
  if (slugIdx === -1) {
    missing.push(slug);
    continue;
  }

  // Find next "caseStudy:" after this slug marker.
  const caseIdx = updated.indexOf('caseStudy:', slugIdx);
  if (caseIdx === -1) {
    missing.push(`${slug} (no caseStudy)`);
    continue;
  }

  // If a theme: already exists between this slug and its caseStudy, skip.
  const themeIdx = updated.indexOf('theme:', slugIdx);
  if (themeIdx !== -1 && themeIdx < caseIdx) {
    continue;
  }

  const themeStr = `theme:${JSON.stringify(theme)},`;
  updated = updated.slice(0, caseIdx) + themeStr + updated.slice(caseIdx);
  count += 1;
}

fs.writeFileSync(DATA, updated);

console.log(`[inject-themes] themed ${count} project(s)`);
if (missing.length) {
  console.log(`[inject-themes] missing slugs: ${missing.join(', ')}`);
}
