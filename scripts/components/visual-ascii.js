// scripts/components/visual-ascii.js
// Koosha-phenotype.com ASCII widget components.
// Drop-in patterns from the Phenotype Design Constitution (Section 8).
// All widgets ship as <pre> with monospace CSS; never raster.
// Each export returns a string of fixed-width ASCII art.
// Widget width is fixed at 42 chars total (40 chars of content between borders).

const WIDTH = 42; // outer width including borders
const PAD = 40;   // inner content width

function pad(s) {
  // Right-pad string to PAD chars total, then surround with '|'.
  const trimmed = String(s).slice(0, PAD);
  return '|' + trimmed.padEnd(PAD, ' ') + '|';
}

function bar(char) {
  // Top/bottom bar: '+' + char * PAD + '+'.
  return '+' + char.repeat(PAD) + '+';
}

const STATUS_WIDGET_LINES = [
  bar('-'),
  pad('  ###  SYSTEM ONLINE   o  READY         '),
  pad('  ...  ------------------------         '),
  pad('  :::  radar ........... nominal         '),
  pad('  ###  routing ......... nominal         '),
  pad('  ...  compile ........ nominal          '),
  pad('  :::  tests .......... 626 / 626 v     '),
  pad('  ###  deploy ......... kooshapari.com   '),
  bar('-'),
];

const EVIDENCE_CHIPS = {
  canonical: [
    bar('-').replace(bar('-'), ('+-canonical fact' + '-'.repeat(22))).slice(0, WIDTH),
    '|  . user-stated                       |',
    '|  : source-attached                   |',
    '+-------------------------------------+',
  ],
  external: [
    '+-external link-----------------------+',
    '|  ^ <host>                           |',
    '+-------------------------------------+',
  ],
  upstream: [
    '+-upstream contribution---------------+',
    '|  o <PR count> - <days>d             |',
    '+-------------------------------------+',
  ],
  fork: [
    '+-fork / extension--------------------+',
    '|  . upstream retained                |',
    '+-------------------------------------+',
  ],
};

// Normalize evidence chips so every line is exactly WIDTH chars.
function normalize(lines) {
  return lines.map((line) => {
    if (line.length === WIDTH) return line;
    if (line.length < WIDTH) return line.padEnd(WIDTH, ' ');
    return line.slice(0, WIDTH);
  });
}

const STATUS_GLYPHS = {
  historical: 'o',
  current: 'D',
  research: 'O',
  'upstream-contribution': 'd',
  'historical prototype': 'p',
};

export function statusWidget() {
  return STATUS_WIDGET_LINES.join('\n');
}

export function evidenceChip(kind, opts = {}) {
  const template = EVIDENCE_CHIPS[kind];
  if (!template) {
    throw new Error(`Unknown evidence chip kind: ${kind}`);
  }
  const lines = template
    .map((line) => {
      if (kind === 'external') {
        return line.replace('<host>', String(opts.host || '<host>'));
      }
      if (kind === 'upstream') {
        return line
          .replace('<PR count>', String(opts.prCount || '0'))
          .replace('<days>', String(opts.days || '0'));
      }
      return line;
    });
  return normalize(lines).join('\n');
}

export function projectSpine(slug, role, metrics = []) {
  const slugPad = String(slug).padEnd(8, '-').slice(0, 10);
  const lines = [
    '       .        *         .',
    '   .        *         .',
    `        .-${slugPad}-.`,
    '   +----------------------+',
    `   |  ^ ${String(role).padEnd(19, ' ').slice(0, 19)} |`,
    '   |  -                   |',
  ];
  const density = ['.', ':', '#'];
  const trimmedMetrics = metrics.slice(0, 3);
  trimmedMetrics.forEach((m, i) => {
    const value = String(m).padEnd(19, ' ').slice(0, 19);
    lines.push(`   |  ${density[i]} ${value} |`);
  });
  lines.push('   +----------------------+');
  lines.push("   `----------------------'");
  return lines.join('\n');
}

export function statusGlyph(status) {
  return STATUS_GLYPHS[status] || '?';
}

export function allEvidenceChipKinds() {
  return Object.keys(EVIDENCE_CHIPS);
}

export const WIDGETS = {
  status: statusWidget,
  evidence: evidenceChip,
  spine: projectSpine,
  glyph: statusGlyph,
};
