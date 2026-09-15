# OG Image Generation Spec

**Created:** 2026-09-13
**Source template:** `public/og-image.html`
**Output target:** `public/og-image.png` (1200x630, <300KB)

---

## Purpose

Generate a static PNG Open Graph image for social media previews (Twitter/X, LinkedIn, Slack, Discord). The template is a standalone HTML file designed to be screenshotted at exact dimensions.

---

## Generation Methods

### Option A: Playwright (Recommended)

```bash
cd /Users/kooshapari/CodeProjects/Phenotype/repos/koosha-phenotype

npx playwright screenshot \
  --viewport-size="1200,630" \
  --full-page \
  --wait-for-timeout=3000 \
  public/og-image.html \
  public/og-image.png
```

The `--wait-for-timeout=3000` ensures Google Fonts load before capture.

### Option B: Browser Screenshot

1. Open `public/og-image.html` in Chrome
2. Open DevTools > toggle device toolbar (Cmd+Shift+M)
3. Set dimensions to 1200x630
4. Set device pixel ratio to 1x
5. Screenshot the viewport
6. Save as `public/og-image.png`

### Option C: Node Script

```js
// scripts/generate-og-image.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('file:///path/to/public/og-image.html');
  await page.waitForTimeout(3000); // font load
  await page.screenshot({ path: 'public/og-image.png', type: 'png' });
  await browser.close();
})();
```

---

## Design Specifications

| Property | Value |
|----------|-------|
| Dimensions | 1200 x 630 px |
| Format | PNG-24 (lossless) |
| Max file size | 300KB (optimize with pngquant if needed) |
| Background | `#171a18` (graphite-950) |
| Primary accent | `#7EBAB5` (teal / seed-teal) |
| Text color | `#F6F5F5` (ceramic / seed-ceramic) |
| Name font | Space Grotesk 600, 62px |
| Subtitle font | JetBrains Mono 400, 24px, uppercase, 0.06em tracking |
| Grid lines | teal at 5% opacity, 48px spacing |
| Bottom bar | 4px solid teal |

### KP Monogram

The monogram uses stroke-only paths (no filled background rect) for clean scaling:
- Vertical stem: x=18, y=12 to y=52
- P bowl: polyline (18,12) to (40,12) to (40,32) to (18,32)
- K upper diagonal: (18,32) to (40,12)
- K lower diagonal: (18,32) to (40,52)
- Stroke: 5px, square caps, miter joins

---

## Deployment

After generating the PNG:

1. Upload `public/og-image.png` to the repo
2. Add OG meta tags to all HTML pages (if not already present):

```html
<meta property="og:image" content="https://kooshapari.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://kooshapari.com/og-image.png" />
```

3. Validate with:
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

---

## Maintenance

To update the OG image:
1. Edit `public/og-image.html`
2. Re-run the generation command from Option A
3. Commit both the HTML source and the PNG output
