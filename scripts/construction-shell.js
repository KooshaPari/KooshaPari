const GATE_STYLE = '/styles/construction-gate.css';
const STORAGE_KEY = 'portfolio-construction-entered';

const GATE_MARKUP = `
  <div id="construction-gate" class="construction-gate" role="dialog" aria-modal="true" aria-labelledby="construction-title" aria-describedby="construction-copy">
    <div class="construction-gate__chrome" aria-hidden="true"></div>
    <div class="construction-gate__content">
      <svg class="construction-gate__icon" viewBox="0 0 96 96" role="img" aria-label="Construction icon" focusable="false">
        <path d="M25 65 61 29l10 10-36 36H25V65Z" />
        <path d="m55 35 8-8 10 10-8 8M31 75l-9-9M27 61l8 9M43 45l9 9M51 37l9 9" />
        <path d="M17 80h62" />
      </svg>
      <p class="construction-gate__eyebrow">Technical atelier</p>
      <h1 id="construction-title">Under construction</h1>
      <p id="construction-copy">Rebuilding this portfolio; some pages and project visuals are still being refined.</p>
    </div>
    <a id="construction-continue" class="construction-gate__continue" href="#construction-entered">Continue to site</a>
    <span id="construction-entered" class="construction-gate__target" aria-hidden="true"></span>
  </div>
`;

const EARLY_SCRIPT = `<script>(function(){try{if(sessionStorage.getItem('${STORAGE_KEY}')==='yes')document.documentElement.dataset.construction='entered';}catch(_){}}());</script>`;

export function injectConstructionGate(html) {
  if (html.includes('id="construction-gate"')) return html;
  const withStyle = html.replace('</head>', `  <link rel="stylesheet" href="${GATE_STYLE}">\n${EARLY_SCRIPT}\n</head>`);
  return withStyle.replace(/(<body[^>]*>)/, `$1${GATE_MARKUP}\n  <div id="construction-site">`).replace('</body>', '  </div>\n</body>');
}
