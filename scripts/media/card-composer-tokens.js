/**
 * Pure helpers for card-composer — no DOM, no canvas. Tested in isolation so
 * the rendering pipeline can lean on deterministic inputs (PRNG seeded from
 * project slug, accent palette resolved from tech stack).
 */

/* ─── Projects that have real card images — skip these ─── */

export const PROJECTS_WITH_IMAGES = new Set([
  'netweave', 'witf', 'gmk-arch', 'dss-cipher',
  'substrate', 'phenotype-omlx', 'omniroute', 'sharecli',
]);

/* ─── Seeded PRNG (mulberry32) ─── */

export function mulberry32(seed) {
  let s = seed | 0;
  return function random() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── FNV-1a 32-bit hash (deterministic seed source) ─── */

export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/* ─── Pick from array using a seeded RNG ─── */

export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

/* ─── Resolve accent colors from tech list ─── */

const ACCENT_FALLBACK = ['#7EBAB5', '#737c4c', '#3f8795'];

export const TECH_COLORS = {
  Rust:          '#e8734a',
  Go:            '#00add8',
  TypeScript:    '#3178c6',
  JavaScript:    '#f7df1e',
  Python:        '#3776ab',
  Swift:         '#f05138',
  Kotlin:        '#7f52ff',
  MLX:           '#5c6bc0',
  'Apple Silicon':'#a2aaad',
  Routing:       '#7EBAB5',
  Observability: '#9c7cdb',
  FUSE:          '#e6a817',
  Linux:         '#3d8c40',
  'OpenAPI':     '#6ba539',
  MCP:           '#e07c4f',
  'Provider integration': '#00add8',
  Reliability:   '#d94f4f',
  Algorithms:    '#00bcd4',
  WebSockets:    '#ff9800',
  'Cellular automata': '#7c4dff',
  AWS:           '#ff9900',
  Deployment:    '#4caf50',
  Traceability:  '#e8734a',
  Audit:         '#d94f4f',
  'Product design':'#9c7cdb',
  Manufacturing: '#78909c',
  GTM:           '#4caf50',
  'Product operations':'#9c7cdb',
  'Supplier coordination':'#78909c',
  Fulfillment:   '#78909c',
  Design:        '#e91e63',
};

export function resolveAccentColors(technologies) {
  if (!technologies?.length) return ACCENT_FALLBACK;
  const mapped = technologies.map((t) => TECH_COLORS[t]).filter(Boolean);
  return mapped.length >= 2 ? mapped : [...mapped, ...ACCENT_FALLBACK].slice(0, 3);
}
