// Contrast audit for B3 — samples bg+fg pairs across key pages,
// computes WCAG contrast ratios, and reports any pair < 4.5.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4197';
const ROUTES = [
  '/', '/work', '/engineering', '/product', '/resume', '/contact',
  '/work/byteport', '/work/tracera', '/work/dss-cipher', '/work/frostify',
];

// --- WCAG luminance + ratio ---
const srgb = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const lum = (rgb) =>
  0.2126 * srgb(rgb[0]) + 0.7152 * srgb(rgb[1]) + 0.0722 * srgb(rgb[2]);
const ratio = (a, b) => {
  const la = lum(a), lb = lum(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};
const parseRgb = (s) => {
  // "rgb(140, 152, 168)" or "rgba(140, 152, 168, 0.5)"
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
};
// Convert oklch(L C H) to sRGB [r,g,b]. Used to recover the effective
// color when browsers report color-mix/oklch computed values.
const oklchToRgb = (L, C, H) => {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  // OKLab -> linear sRGB (Björn Ottosson)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l3 = l_ ** 3, m3 = m_ ** 3, s3 = s_ ** 3;
  const rLin =  4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  const toSrgb = (v) => {
    const c = Math.max(0, Math.min(1, v));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055;
  };
  return [Math.round(toSrgb(rLin) * 255), Math.round(toSrgb(gLin) * 255), Math.round(toSrgb(bLin) * 255)];
};
const parseAnyColor = (s) => {
  if (!s) return null;
  const rgb = parseRgb(s);
  if (rgb) return rgb;
  // "oklch(L C H)" or "oklch(L C H / A)" - color-mix result uses this form
  const m = s.match(/oklch\(([^/)]+)(?:\s*\/\s*([0-9.%]+))?\)/);
  if (m) {
    const parts = m[1].trim().split(/\s+/).map(parseFloat);
    if (parts.length >= 3) {
      const [L, C, H] = parts;
      const [r, g, b] = oklchToRgb(L, C, H);
      const alpha = m[2] != null ? (m[2].endsWith('%') ? parseFloat(m[2])/100 : parseFloat(m[2])) : 1;
      return [r, g, b, alpha];
    }
  }
  return null;
};
// Composite rgba over its parent bg to get the effective opaque color.
const composite = (top, bottom) => {
  const a = top[3];
  return [
    Math.round(top[0] * a + bottom[0] * (1 - a)),
    Math.round(top[1] * a + bottom[1] * (1 - a)),
    Math.round(top[2] * a + bottom[2] * (1 - a)),
  ];
};
const effectiveBgFg = async (el, handle) => {
  const styles = await handle.evaluate((node) => {
    let n = node;
    const chain = [];
    while (n && chain.length < 8) {
      const cs = getComputedStyle(n);
      chain.push({ bg: cs.backgroundColor, fg: cs.color, img: cs.backgroundImage });
      n = n.parentElement;
    }
    return chain;
  });
  // Walk up building the composite background.
  let bg = [255, 255, 255]; // start with white; will be replaced as soon as we find any non-transparent
  for (let i = styles.length - 1; i >= 0; i--) {
    const c = parseAnyColor(styles[i].bg);
    if (c && c[3] > 0) bg = composite(c, bg);
  }
  // Foreground: take the deepest (most-specific) non-transparent text color.
  let fg = [255, 255, 255];
  for (let i = 0; i < styles.length; i++) {
    const c = parseAnyColor(styles[i].fg);
    if (c && c[3] > 0) { fg = c; break; }
  }
  return { bg, fg };
};

const FLAT_THRESHOLD = 4.5;
const failing = [];
const allSamples = [];

for (const route of ROUTES) {
  const url = BASE + route;
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.log(`NAV FAIL ${route}: ${e.message.split('\n')[0]}`);
    await browser.close();
    continue;
  }
  // Pick a representative set of text-bearing elements.
  const sel = [
    'h1', 'h2', 'h3', 'h4',
    'p', 'li', 'a',
    '.metric-card', '.case-section p', '.eyebrow', '.lede',
    '.pill', '.tag', '.tech-pill', '.badge', '.eyebrow-tag',
    'footer a', 'footer p', 'header a', '.card',
  ];
  const elements = await page.$$(sel.join(','));
  for (const handle of elements) {
    try {
      const { bg, fg } = await effectiveBgFg(null, handle);
      const r = ratio(bg, fg);
      const sample = await handle.evaluate((n) => ({
        text: (n.innerText || n.textContent || '').trim().slice(0, 60),
        tag: n.tagName.toLowerCase(),
        cls: n.className || '',
      }));
      allSamples.push({ route, ...sample, r: +r.toFixed(2), bg: `rgb(${bg.join(',')})`, fg: `rgb(${fg.join(',')})` });
      if (r < FLAT_THRESHOLD) {
        failing.push({ route, ...sample, r: +r.toFixed(2), bg: `rgb(${bg.join(',')})`, fg: `rgb(${fg.join(',')})` });
      }
    } catch {}
  }
  await browser.close();
}

console.log(`\n=== samples: ${allSamples.length} ===`);
console.log(`=== failing (< 4.5): ${failing.length} ===\n`);

if (failing.length) {
  // Group by route + class prefix to spot patterns
  const byRouteClass = {};
  for (const f of failing) {
    const clsHead = (f.cls.split(/\s+/).slice(0, 2).join(' ')) || f.tag;
    const k = `${f.route} :: ${clsHead}`;
    (byRouteClass[k] ??= []).push(f);
  }
  for (const [k, arr] of Object.entries(byRouteClass)) {
    const worst = arr.sort((a, b) => a.r - b.r)[0];
    console.log(`${k}`);
    console.log(`  worst ratio ${worst.r}  bg=${worst.bg}  fg=${worst.fg}  text="${worst.text}"  tag=${worst.tag}`);
    console.log(`  count ${arr.length}/${arr.length}`);
  }
} else {
  // Print the 10 lowest ratios even if all pass.
  console.log('--- lowest ratios (informational) ---');
  for (const s of allSamples.sort((a, b) => a.r - b.r).slice(0, 12)) {
    console.log(`  ${s.route}  r=${s.r}  bg=${s.bg}  fg=${s.fg}  .${(s.cls || s.tag).slice(0, 30)}  "${s.text}"`);
  }
}
