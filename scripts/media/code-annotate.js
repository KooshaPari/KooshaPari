/**
 * Code Annotation System
 * ─────────────────────
 * Enhanced code display with line numbers, annotation markers,
 * callout badges, syntax highlighting, and copy-to-clipboard.
 *
 * Annotation markers (parsed from code comments):
 *   // [!highlight]           — highlight the line with teal bg
 *   // [!annotation:text]     — tooltip/popover with annotation text
 *   // [!callout:label]       — numbered callout badge in left margin
 *
 * @module code-annotate
 */

import {
  detectLanguage,
  tokeniseCode,
  parseMarkers,
  stripMarker,
} from './code-annotate-helpers.js';

/* ------------------------------------------------------------------ */
/*  Block builder                                                     */
/* ------------------------------------------------------------------ */

/**
 * Process a single <pre><code> block and return the enhanced wrapper.
 */
function processCodeBlock(pre) {
  const codeEl = pre.querySelector('code');
  if (!codeEl) return;

  const rawText = codeEl.textContent;
  const lines = rawText.split('\n');
  // Remove trailing empty line if present (common in fenced blocks)
  if (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

  const lang = detectLanguage(codeEl) || '';
  const calloutCount = { value: 0 };

  // --- Build line number cells and code line elements ---
  const lineNumbers = [];
  const codeLines = [];

  for (const line of lines) {
    const marker = parseMarkers(line);
    const clean = stripMarker(line);

    // Line number
    const numSpan = document.createElement('span');
    numSpan.textContent = lineNumbers.length + 1;
    lineNumbers.push(numSpan);

    // Code line
    const lineEl = document.createElement('span');
    lineEl.className = 'code-block__line';

    // Apply marker effects
    if (marker) {
      switch (marker.type) {
        case 'highlight':
          lineEl.classList.add('code-block__highlight-line');
          break;
        case 'annotation':
          lineEl.classList.add('code-block__annotation-line');
          const tip = document.createElement('span');
          tip.className = 'code-block__annotation';
          tip.textContent = marker.payload || 'Note';
          lineEl.appendChild(tip);
          break;
        case 'callout':
          calloutCount.value++;
          lineEl.classList.add('code-block__callout-line');
          const badge = document.createElement('span');
          badge.className = 'code-block__callout-badge';
          badge.textContent = calloutCount.value;
          lineEl.appendChild(badge);
          break;
      }
    }

    // Tokenised code content
    const codeSpan = document.createElement('span');
    codeSpan.innerHTML = tokeniseCode(clean) || ' ';
    lineEl.appendChild(codeSpan);

    codeLines.push(lineEl);
  }

  // --- Assemble wrapper ---
  const wrapper = document.createElement('div');
  wrapper.className = 'code-block';

  // Header
  const header = document.createElement('div');
  header.className = 'code-block__header';

  if (lang) {
    const langBadge = document.createElement('span');
    langBadge.className = 'code-block__lang';
    langBadge.textContent = lang;
    header.appendChild(langBadge);
  }

  const copyBtn = document.createElement('button');
  copyBtn.className = 'code-block__copy-btn';
  copyBtn.type = 'button';
  copyBtn.textContent = 'Copy';
  copyBtn.addEventListener('click', () => handleCopy(copyBtn, rawText));
  header.appendChild(copyBtn);

  wrapper.appendChild(header);

  // Scroll container
  const scroll = document.createElement('div');
  scroll.className = 'code-block__scroll';

  const table = document.createElement('div');
  table.className = 'code-block__table';

  // Line numbers gutter
  const gutter = document.createElement('div');
  gutter.className = 'code-block__line-numbers';
  gutter.setAttribute('aria-hidden', 'true');
  for (const num of lineNumbers) gutter.appendChild(num);

  // Code column
  const codeCol = document.createElement('div');
  codeCol.className = 'code-block__code';
  const codeBlock = document.createElement('code');
  for (const line of codeLines) codeBlock.appendChild(line);
  codeCol.appendChild(codeBlock);

  table.appendChild(gutter);
  table.appendChild(codeCol);
  scroll.appendChild(table);
  wrapper.appendChild(scroll);

  // Replace original
  pre.replaceWith(wrapper);
}

/* ------------------------------------------------------------------ */
/*  Copy handler                                                      */
/* ------------------------------------------------------------------ */

async function handleCopy(btn, text) {
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = 'Copied!';
    btn.classList.add('code-block__copy-btn--copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('code-block__copy-btn--copied');
    }, 2000);
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      btn.textContent = 'Copied!';
      btn.classList.add('code-block__copy-btn--copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('code-block__copy-btn--copied');
      }, 2000);
    } catch { /* silent */ }
    document.body.removeChild(ta);
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/**
 * Initialise the code annotation system.
 * Finds all `<pre><code>` blocks and enhances them.
 *
 * @param {Element} [root=document] — optional root to scope search
 */
export function initCodeAnnotation(root = document) {
  const blocks = root.querySelectorAll('pre > code');
  // Process in reverse so DOM replacement doesn't shift indices
  const pres = Array.from(blocks).map(c => c.parentElement).reverse();
  for (const pre of pres) {
    processCodeBlock(pre);
  }
}

export default initCodeAnnotation;
