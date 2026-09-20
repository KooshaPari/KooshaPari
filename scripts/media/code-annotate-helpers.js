/**
 * Pure helpers for the code-annotate system — no DOM, no side effects.
 * The orchestrator in code-annotate.js owns element construction; this file
 * owns the tokenisation, marker parsing, and HTML-escape primitives.
 */

/* ------------------------------------------------------------------ */
/*  Language detection                                                 */
/* ------------------------------------------------------------------ */

export const LANG_ALIASES = {
  js: 'javascript', ts: 'typescript', tsx: 'typescript',
  jsx: 'javascript', py: 'python', rb: 'ruby',
  sh: 'bash', shell: 'bash', zsh: 'bash',
  yml: 'yaml', md: 'markdown', rs: 'rust',
  cs: 'csharp', kt: 'kotlin', go: 'go',
  dockerfile: 'dockerfile',
};

/**
 * Resolve the language identifier from a code element. Accepts either a
 * class list (looks for `language-XXX`) or a `data-lang` attribute.
 * Returns the canonical name from LANG_ALIASES when an alias is supplied,
 * or the raw value otherwise.
 *
 * @param {{ className?: string, dataset?: { lang?: string } }} codeEl
 * @returns {string | null}
 */
export function detectLanguage(codeEl) {
  const cls = codeEl?.className || '';
  const m = cls.match(/language-(\w+)/);
  if (m) return LANG_ALIASES[m[1]] || m[1];
  if (codeEl?.dataset?.lang) return codeEl.dataset.lang;
  return null;
}

/* ------------------------------------------------------------------ */
/*  Syntax tokeniser                                                   */
/* ------------------------------------------------------------------ */

export const TOKEN_RULES = [
  // Order matters: comments and strings first to prevent inner matches
  { re: /(\/\/.*$|\/\*[\s\S]*?\*\/|#(?!{).*$)/gm, cls: 'tok-cmt' },
  { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, cls: 'tok-str' },
  { re: /\b(\d+(?:\.\d+)?(?:_\d+)?)\b/g, cls: 'tok-num' },
  { re: /(@\w+)/g, cls: 'tok-deco' },
  { re: /\b(function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|super|import|from|export|default|const|let|var|async|await|try|catch|finally|throw|typeof|instanceof|in|of|yield|void|delete|static|get|set)\b/g, cls: 'tok-kw' },
  { re: /\b(def|self|None|True|False|and|or|not|is|with|as|elif|lambda|pass|raise|from|import|class|yield|async|await|global|nonlocal|assert|del|print)\b/g, cls: 'tok-kw' },
  { re: /\b(fn|pub|struct|impl|trait|enum|mod|use|crate|self|mut|ref|match|move|loop|where|type|const|static|unsafe|extern|async|await|dyn|as|super)\b/g, cls: 'tok-kw' },
  { re: /\b(func|package|import|return|if|else|for|range|switch|case|default|defer|go|chan|select|map|struct|interface|var|const|type|break|continue|fallthrough|go|goroutine)\b/g, cls: 'tok-kw' },
  { re: /\b(public|private|protected|abstract|final|sealed|override|virtual|async|await|using|namespace|class|struct|enum|interface|void|bool|int|long|string|double|float|decimal|var|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw)\b/g, cls: 'tok-kw' },
  { re: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|AS|SET|VALUES|INTO|FROM|GROUP|BY|ORDER|ASC|DESC|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|EXISTS|BETWEEN|LIKE|IS|NULL|TRUE|FALSE|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|CASCADE|RESTRICT)\b/gi, cls: 'tok-kw' },
  { re: /\b(function|=>)\s*(?=\w)/g, cls: 'tok-fn' },
  { re: /\b([A-Z]\w*)\b/g, cls: 'tok-type' },
  { re: /([=<>!+\-*/%&|^~?:]+)/g, cls: 'tok-op' },
];

/**
 * Tokenise raw code text into HTML with syntax classes. Uses a
 * priority-based overlay: each rule is applied in sequence, and ranges
 * already applied by earlier rules are kept. Returns a string of HTML
 * suitable for use as innerHTML.
 *
 * @param {string} raw
 * @returns {string}
 */
export function tokeniseCode(raw) {
  const ranges = [];

  for (const { re, cls } of TOKEN_RULES) {
    const rx = new RegExp(re.source, re.flags);
    let match;
    while ((match = rx.exec(raw)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      // Skip if overlaps an existing (higher-priority) range
      if (ranges.some((r) => start < r.end && end > r.start)) continue;
      ranges.push({ start, end, cls, text: match[0] });
    }
  }

  ranges.sort((a, b) => a.start - b.start);

  const parts = [];
  let pos = 0;
  for (const r of ranges) {
    if (r.start > pos) {
      parts.push(escapeHtml(raw.slice(pos, r.start)));
    }
    parts.push(`<span class="${r.cls}">${escapeHtml(r.text)}</span>`);
    pos = r.end;
  }
  if (pos < raw.length) {
    parts.push(escapeHtml(raw.slice(pos)));
  }
  return parts.join('');
}

/**
 * Escape a string for safe inclusion as HTML text content.
 *
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ------------------------------------------------------------------ */
/*  Annotation marker parsing                                         */
/* ------------------------------------------------------------------ */

export const MARKER_RE = /\/\*\s*\[!(\w+)(?::([^\]]*))?\]\s*\*\/|\/\/\s*\[!(\w+)(?::([^\]]*))?\]/;

/**
 * Parse a `// [!type:payload]` or `/* [!type:payload] *\/` marker from a
 * code line. Returns `{ type, payload }` or null when the line has no marker.
 *
 * @param {string} line
 * @returns {{ type: string, payload: string } | null}
 */
export function parseMarkers(line) {
  const m = line.match(MARKER_RE);
  if (!m) return null;
  const type = m[1] || m[3];
  const payload = m[2] || m[4] || '';
  return { type, payload };
}

/**
 * Remove a marker comment from a code line and trim trailing whitespace.
 *
 * @param {string} line
 * @returns {string}
 */
export function stripMarker(line) {
  return line.replace(MARKER_RE, '').trimEnd();
}
