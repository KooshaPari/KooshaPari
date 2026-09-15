# DEEP AUDIT — kooshapari.com
**Date:** 2026-09-15  
**Score:** Lighthouse 99/100 (performance only — not a quality score)

---

## VERDICT: The site is architecturally over-engineered and content-under-delivered.

A 53-file JS SPA framework with 29 CSS files, 15 interaction modules, 177KB bundled JS, and 114KB bundled CSS — for a 15-project portfolio where most pages show a construction gate modal and half the project cards have no hero images. The engineering effort went into infrastructure, not into what the visitor sees.

---

## DIMENSION 1: CONSTRUCTION GATE (BLOCKER)

**Every real visitor sees "Under construction — Rebuilding this portfolio" on first load.**

- Modal dialog blocks the entire page with a "Continue to site" link
- SessionStorage bypass: once clicked, never shows again in that session
- Bot bypass: crawlers see the site normally (which is why Lighthouse gets 99)
- **The site is still marked as "under construction" to all human visitors**
- The construction gate was meant to be temporary during migration. It is now the first impression.

**Impact:** This alone makes the site feel unfinished. Every new visitor, every recruiter, every link share — first thing they see is "under construction."

---

## DIMENSION 2: CONTENT QUALITY (CRITICAL)

### 2a. Copy is written for engineers, not for humans
- "A working studio archive spanning systems software, technical product and program leadership, computational research, and complex physical products." — This sentence means nothing to a recruiter, hiring manager, or casual visitor.
- "Engineering decisions are read through architecture, runtime constraints, interfaces, and verification." — Jargon soup. No one outside of systems engineering knows what this means.
- "Technical atelier" — pretentious and obscure. "Atelier" means art studio/workshop. The portfolio is not an atelier.

### 2b. OmniRoute summary is a data dump, not a story
The OmniRoute entry text is: "Rank #5 external contributor to OmniRoute (`diegosouzapw/OmniRoute`, ~59.9k GitHub stars at audit time), with 101 merged pull requests across routing intelligence, provider integrations, reliability hardening, API/protocol compatibility, and operational tooling. Contributions named in 21 upstream releases and personally acknowledged by the maintainer."

This is a LinkedIn bullet point, not a portfolio narrative. It reads like metadata, not work.

### 2c. Contact page is nearly empty
The entire contact page is:
```
Let's build something.
For engineering, technical product, and program conversations:
  Email: inquiry@ramdesigns.xyz
  GitHub: KooshaPari
  LinkedIn: Koosha Paridehpour
```
No form. No scheduling link. No context about what kind of work is sought. The email is `inquiry@ramdesigns.xyz` — a generic business email, not personal.

### 2d. Blog has exactly 1 post
One blog post in the entire site: "Why We Forked OmniRoute." For a site that positions itself as a "technical atelier," there's no writing, no thinking, no thought leadership.

### 2e. Resume page links to PDFs
The resume page just links to downloadable PDFs. It doesn't display the resume inline. Every other portfolio site shows the resume directly.

### 2f. Footer says "Evidence-led · legacy sources preserved"
This footer text is developer documentation language. It means nothing to visitors. It signals that the site was built by someone who was thinking about data provenance, not about the person reading the page.

---

## DIMENSION 3: IMAGES & VISUAL DESIGN (CRITICAL)

### 3a. 7 out of 15 projects have NO hero image
These projects only have a card.png thumbnail:
- BytePort, Tracera, CLIProxyAPI++, AgentAPI++, Frostify, MCPForge, ForgeCode

When you click into any of these projects, there's no visual hero, no screenshots, no diagrams. Just text.

### 3b. Card images are inconsistent
- 7 cards: PNG at 250KB each (oversized for thumbnails)
- 4 cards: WebP at 3KB each (probably placeholder/low-quality)
- DSS Cipher: 1.8MB animated GIF as hero
- WITF: Original PNG source files (6.4MB + 6.5MB) still in the repo under public/

### 3c. NetWeave has 18 image variants
Three desktop shots × 3 quality versions × 2 = 18 files. Only 6 should exist (desktop × mobile, final quality).

### 3d. GMK Arch hero is 4KB
A 4KB PNG for a product hero image is either broken or a 100×100 thumbnail.

### 3e. No og:image anywhere
Zero Open Graph image tags in the entire site. When anyone shares a link on Twitter, LinkedIn, Slack, or Discord — no preview image appears. This is a basic social sharing requirement.

### 3f. Twitter card is "summary" not "summary_large_image"
Even if og:image existed, the Twitter card type would still show a small thumbnail instead of a large preview.

---

## DIMENSION 4: ARCHITECTURE OVER-ENGINEERING (HIGH)

### 4a. 53 JS files for a 15-page portfolio
```
scripts/
  components/ (5 files)
  media/ (17 files)
  views/ (9 files)
  17 standalone modules
```
This is application architecture for a portfolio that could be 15 static HTML files with 1 CSS file and 1 JS file.

### 4b. 29 CSS files for a portfolio
```
artifacts.css, base.css, blog.css, cards.css, case-studies.css,
cast-player.css, code-annotate.css, construction-gate.css,
contact.css, cursor.css, hero.css, image-reveal.css,
image-slider.css, main.css, parallax.css, project-index.css,
radar.css, responsive.css, resume-timeline.css, reveal.css,
shell.css, skeleton.css, timeline.css, tokens.css,
transitions.css, work-catalog.css, bundled/{core,components,pages}.css
```
`cursor.css` and `cast-player.css` and `radar.css` — for a portfolio?

### 4c. SPA with hash routing served as static HTML
The site uses client-side JavaScript routing (hash-based) but is deployed as static files with Vercel rewrites. This means:
- Every page loads as an empty shell (`<div id="view-root"></div>`)
- JavaScript must execute to render ANY content
- If JS fails, the page is blank
- Search engines see empty HTML until JS runs (bots bypass construction gate but still need JS)

### 4d. 15 interaction modules initialized on every page
```
initScrollReveal(), initMagnetic(), initParallax(),
initImageReveal(), initCardComposer(), initTechIllustrations(),
initImageSliders(), initCastPlayers(), initCodeAnnotation()
```
These run on every navigation, even pages that don't use them. `initCastPlayers()` runs on the contact page. `initTechIllustrations()` runs on the work index.

### 4e. Work detail pages use completely different CSS
Work pages (`/work/witf`, etc.) load 6 individual CSS files instead of the bundle:
```
styles/tokens.css, styles/base.css, styles/shell.css,
styles/artifacts.css, styles/case-studies.css, styles/responsive.css
```
This means work pages have different styling from every other page, and each loads 6 separate HTTP requests.

### 4f. dist/ ships both bundled AND unbundled JS
The build output contains the 177KB bundle PLUS all 53 individual source files. That's redundant payload being shipped.

---

## DIMENSION 5: SECURITY (MEDIUM)

Only HSTS header. Missing:
- `X-Frame-Options: DENY` — site can be iframed (clickjacking risk)
- `X-Content-Type-Options: nosniff` — MIME sniffing possible
- `Content-Security-Policy` — no XSS protection
- `Referrer-Policy` — full referrer leaked
- `Permissions-Policy` — camera/mic not restricted

---

## DIMENSION 6: SEO & SOCIAL (HIGH)

- No `og:image` anywhere
- No `og:image:width` / `og:image:height`
- Twitter card is `summary` not `summary_large_image`
- No `og:locale`
- Schema.org Person markup is minimal (name + sameAs)
- No Organization, no JobPosting, no BreadcrumbList schema
- Meta descriptions are generic, not page-specific
- Footer text is developer jargon

---

## DIMENSION 7: MOBILE & RESPONSIVE (MEDIUM)

- CSS has responsive breakpoints but no testing evidence on real devices
- The construction gate is a full-screen modal — even harder to dismiss on mobile
- Contact page has only 3 links — on mobile this is especially sparse
- No touch-specific interactions documented
- Reader mode toggle exists but is buried (keyboard shortcut R)

---

## DIMENSION 8: ACCESSIBILITY (MEDIUM)

- Skip link exists (good)
- `role="dialog"` and `aria-modal="true"` on construction gate (good)
- But: `inert` attribute on main content while gate is open (good)
- Missing: aria-labels on navigation links
- Missing: focus management after SPA navigation
- Missing: announce page changes to screen readers
- No skip navigation between sections on long pages

---

## DIMENSION 9: PERFORMANCE (GOOD BUT WITH WASTE)

Lighthouse 99 is misleading because:
- Bot bypasses construction gate (real users see a modal + JS render)
- FCP measures when the construction gate appears, not when content is visible
- TTI measures when JS finishes, not when the page is interactive for humans
- The real user experience is: flash of construction modal → click "Continue" → wait for JS → content appears

---

## DIMENSION 10: DEPLOYMENT HYGIENE (LOW)

- `.DS_Store` files in public/ (2 files)
- Original 6.4MB+ PNG source files in public/ (should be in asset-sources only)
- 18 NetWeave image variants (12 are unused)
- `og-image.html` is an HTML mockup, not an actual image
- `dev-server.js` and `playwright.config.js` in production

---
