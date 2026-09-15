# OVER-ENGINEERED REMEDIATION PLAN
**Date:** 2026-09-15  
**Goal:** Transform kooshapari.com from an engineering demo into a world-class technical portfolio

---

## PHASE 0: EMERGENCY SURGERY (Day 1) — Remove everything that makes the site look broken

### 0.1 Kill the construction gate permanently
**Priority:** CRITICAL  
**Why:** Every human visitor sees "Under construction" as their first impression. This is worse than having no site at all.

Actions:
- Remove `construction-gate.js` from the bundle
- Remove `construction-shell.js` injection from `stage-publication.js`
- Remove `construction-gate.css` from `pages.css`
- Remove the `construction-gate` div from all HTML templates
- Remove the sessionStorage bypass script from all HTML `<head>` blocks
- Remove `construction-site` wrapper div
- Verify: first visit shows the actual site, not a modal

**Estimate:** 30 min  
**Blocks:** Everything else. Nothing else matters while this gate exists.

### 0.2 Remove oversized source files from public/
**Priority:** HIGH  
**Why:** 6.4MB + 6.5MB PNG originals are being shipped in the build output.

Actions:
- Move `public/projects/witf/hero-01.png` (6.4MB) to `asset-sources/`
- Move `public/projects/witf/hero-02.png` (6.5MB) to `asset-sources/`
- Delete `.DS_Store` files from `public/` and `public/projects/`
- Delete unused NetWeave variants: keep only `desktop-01-v3.webp`, `desktop-02-v3.webp`, `desktop-03-v3.webp`, `mobile-01-v3.webp`, `mobile-02-v3.webp`, `mobile-03-v3.webp` (delete 12 unused v1/v2 variants)
- Update `dist/` build output to exclude source originals

**Estimate:** 15 min  
**Impact:** ~13MB removed from deployment

### 0.3 Add security headers to vercel.json
**Priority:** HIGH  
**Why:** Only HSTS exists. Site is vulnerable to clickjacking, MIME sniffing, and has no CSP.

Actions:
```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      {"key": "X-Frame-Options", "value": "DENY"},
      {"key": "X-Content-Type-Options", "value": "nosniff"},
      {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
      {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()"}
    ]
  }
]
```

**Estimate:** 10 min

### 0.4 Add og:image and fix Twitter card
**Priority:** HIGH  
**Why:** Zero social preview images. Every link share shows a blank card.

Actions:
- Generate a proper `og-image.png` (1200x630) with name, tagline, and visual
- Add `<meta property="og:image" content="https://kooshapari.com/og-image.png">` to all HTML pages
- Add `<meta property="og:image:width" content="1200">` and `og:image:height` 
- Change `<meta name="twitter:card" content="summary">` to `summary_large_image`
- Add `<meta name="twitter:image" content="https://kooshapari.com/og-image.png">`

**Estimate:** 1 hour (including design of the image)

---

## PHASE 1: CONTENT OVERHAUL (Days 1-2) — Make the site say something worth reading

### 1.1 Rewrite the homepage opening
**Priority:** CRITICAL  
**Why:** Current copy is impenetrable jargon.

**Before:**
> "A working studio archive spanning systems software, technical product and program leadership, computational research, and complex physical products."

**After (draft):**
> "I build software systems and technical products — from distributed routing infrastructure to physical hardware launches. This is where I show the work."

Or even simpler:
> "Software engineer and technical product leader. I build things that route traffic, ship hardware, and run AI workloads."

### 1.2 Rewrite every project summary for humans
**Priority:** HIGH  
**Why:** Current summaries read like commit messages.

**GMK Arch before:** "An Arch Linux-inspired mechanical keyboard keyset carried from concept through manufacturing, distribution, and community launch."

**GMK Arch after:** "I designed and shipped an Arch Linux keyboard keycap set that sold 4,900 units across 10 countries in 30 days, generating ~$432K in revenue."

**WITF Board before:** "A Southpaw XT full-size Alice-style keyboard shaped by changing demand, production volume, fulfillment, and pricing decisions."

**WITF Board after:** "A limited-run mechanical keyboard where I managed the full lifecycle: supplier negotiation, demand forecasting across volume swings (15→100→50 units), pricing at $650-$825, and fulfillment logistics."

**ShareCLI before:** "Rust process and resource runtime for high-concurrency coding-agent workloads."

**ShareCLI after:** "A Rust runtime that observes and coordinates hundreds of concurrent AI coding agents — managing process bursts, resource contention, and filesystem behavior without hiding the hard parts."

**Substrate before:** "AI execution and provider-routing substrate spanning HTTP, CLI, MCP, and A2A interfaces."

**Substrate after:** "Multi-provider AI routing layer that handles provider failures, budget constraints, and rate limits across four different interfaces — so callers don't have to."

### 1.3 Rewrite the OmniRoute entry as a story, not a data dump
**Priority:** HIGH  
**Why:** Current text is a 3-line metadata dump.

**New structure:**
```
Title: OmniRoute Contributor
One-liner: "Built routing intelligence, provider integrations, and reliability hardening for a 60K-star AI routing platform — 101 merged PRs in 28 days."

Story (3 paragraphs):
1. What OmniRoute is and why it matters
2. What I specifically built (routing intelligence, fallback chains, provider health)
3. Impact: 101 PRs, 21 releases named, #5 contributor, maintainer acknowledgment
```

### 1.4 Fix the contact page
**Priority:** HIGH  
**Why:** Currently 3 links and nothing else.

Add:
- A brief "What I'm looking for" statement (2-3 sentences)
- A calendar scheduling link (Calendly or similar)
- A contact form (even a simple Formspree/Netlify Forms integration)
- Response time expectation ("I typically respond within 24 hours")
- Change email from `inquiry@ramdesigns.xyz` to `koosha@kooshapari.com` (personal brand domain)

### 1.5 Fix the resume page
**Priority:** HIGH  
**Why:** Currently just links to PDFs. Nobody downloads PDFs from portfolio sites.

Add:
- Inline resume content (education, experience timeline, skills)
- Keep PDF download as secondary option
- Use the existing `resume-timeline.css` (it exists but apparently isn't rendering inline content)

### 1.6 Add 2-3 blog posts
**Priority:** MEDIUM  
**Why:** 1 post makes the blog look abandoned.

Suggested topics (based on actual work):
1. "What I Learned Building a 60K-Star OSS Contribution" (OmniRoute)
2. "Hardware vs Software: What Keyboard Manufacturing Taught Me About Shipping" (GMK Arch + WITF)
3. "Building AI Routing Infrastructure That Doesn't Break" (Substrate)

### 1.7 Fix the footer
**Priority:** LOW  
**Why:** "Evidence-led · legacy sources preserved" is developer language.

Replace with:
> "Koosha Paridehpour — Systems engineer, product builder, keyboard enthusiast."

---

## PHASE 2: IMAGE & VISUAL OVERHAUL (Days 2-3)

### 2.1 Create hero images for all 7 projects missing them
**Priority:** CRITICAL  
**Why:** 7 of 15 projects show no visual when you click into them.

Projects needing heroes:
- BytePort: screenshot or architecture diagram
- Tracera: screenshot or workflow diagram
- CLIProxyAPI++: terminal recording or architecture diagram
- AgentAPI++: terminal recording or architecture diagram
- Frostify: UI screenshot or before/after
- MCPForge: terminal screenshot or architecture diagram
- ForgeCode: terminal screenshot or architecture diagram

For developer tools: terminal recordings (asciinema) converted to WebP thumbnails work well.  
For infrastructure: architecture diagrams using the existing `tech-illustrations.js` module.

### 2.2 Convert all card.png to WebP
**Priority:** HIGH  
**Why:** 7 PNG cards at 250KB each vs WebP at 3KB. That's 1.75MB → 21KB.

Projects to convert:
- agentapi-plusplus/card.png → card.webp
- byteport/card.png → card.webp
- cliproxyapi-plusplus/card.png → card.webp
- forgecode/card.png → card.webp
- frostify/card.png → card.webp
- mcpforge/card.png → card.webp
- tracera/card.png → card.webp

### 2.3 Fix GMK Arch hero
**Priority:** HIGH  
**Why:** 4KB PNG is either broken or a thumbnail. Needs a real hero image.

### 2.4 Convert DSS Cipher GIF to WebP video
**Priority:** MEDIUM  
**Why:** 1.8MB animated GIF. A WebP animation or short MP4 would be 100-200KB.

### 2.5 Create a real og-image.png
**Priority:** HIGH  
**Why:** `og-image.html` is an HTML file, not an image. Social platforms can't use it.

Design spec:
- 1200x630px
- Name: "Koosha Paridehpour"
- Tagline: "Systems engineer · Product builder"
- Visual: subtle abstract pattern or code-inspired background in brand colors (teal/obsidian)

---

## PHASE 3: ARCHITECTURE SIMPLIFICATION (Days 3-5)

### 3.1 Decide: SPA or Multi-Page?
**Priority:** HIGH  
**Why:** The current hybrid approach is the worst of both worlds.

**Option A: Keep SPA (current approach)**
- Pros: Smooth page transitions, shared state, existing code
- Cons: Empty HTML shells, JS-dependent rendering, 177KB bundle for a portfolio
- Fix: Lazy-load everything. Only load modules needed for current page.

**Option B: Convert to Multi-Page Application (MPA)**
- Pros: Each page loads instantly with HTML content, better SEO, smaller payloads, no JS dependency
- Cons: Full page reloads between pages (acceptable for a portfolio)
- Fix: Generate 15 static HTML files with inline content. Use tiny JS only for interactions.

**Recommendation: Option B.** A portfolio doesn't need SPA routing. The current architecture exists because the developer built what was interesting to build, not what served the visitor.

### 3.2 If keeping SPA: implement route-based code splitting
**Priority:** HIGH (if SPA stays)

Current: 177KB bundle loads on every page, including modules for pages you're not on.

Split into:
- `core.js` (~30KB): Router, shell, dark mode, navigation
- `home.js` (~20KB): Home page rendering, ambient field, parallax
- `work.js` (~15KB): Work catalog, card composer
- `project.js` (~40KB): Project detail, tech illustrations, diagrams
- `contact.js` (~5KB): Contact page
- `blog.js` (~10KB): Blog rendering

Load only what's needed per route. This alone cuts initial load by 60-70%.

### 3.3 Consolidate CSS
**Priority:** HIGH  

Current: 29 source CSS files → 3 bundled files (114KB total)

Reduce to:
- `critical.css` (~12KB): Tokens, base, shell — loaded in `<head>` inline
- `pages.css` (~15KB): Page-specific styles — loaded async
- `components.css` (~10KB): Reusable components — loaded async
- Delete: `cursor.css`, `cast-player.css`, `radar.css`, `skeleton.css`, `transitions.css` (merge into relevant files)

Target: <40KB total CSS (from 114KB).

### 3.4 Fix work detail pages to use bundled CSS
**Priority:** HIGH  
**Why:** Work pages load 6 separate CSS files instead of the bundle. Inconsistent styling + 6 extra HTTP requests.

Action: Update `work/*.html` templates to use `styles/bundled/core.css` + async `components.css` + `pages.css` like other pages.

### 3.5 Stop shipping unbundled JS in dist/
**Priority:** MEDIUM  
**Why:** `dist/scripts/` contains all 53 source files alongside the 177KB bundle. Double payload.

Action: Update `stage-publication.js` to only copy `bundled/` to dist, not individual source files.

### 3.6 Lazy-initialize interaction modules
**Priority:** MEDIUM  
**Why:** `initCastPlayers()`, `initCodeAnnotation()`, `initTechIllustrations()` run on every page even when unused.

Fix:
```js
// Current (runs everything on every page):
initScrollReveal();
initMagnetic();
initParallax();
initImageReveal();
initCardComposer(PROJECTS);
initTechIllustrations();
initImageSliders();
initCastPlayers();
initCodeAnnotation();

// Fixed (conditional initialization):
if (route.view === 'home') {
  initAmbientField(viewRoot.querySelector('.home-opening'));
  initParallax();
}
if (route.view === 'project') {
  initImageSliders();
  initCastPlayers();
  initCodeAnnotation();
  initTechIllustrations();
}
initScrollReveal(); // only needed for reveal animations
initMagnetic();     // only needed if magnetic buttons exist
```

---

## PHASE 4: UX POLISH (Days 5-7)

### 4.1 Add page transition animations
**Priority:** MEDIUM  
**Why:** Current SPA navigation re-renders the full page with no transition. Feels jarring.

The `transitions.js` and `transitions.css` modules exist but appear underutilized.

### 4.2 Add a proper navigation indicator
**Priority:** MEDIUM  
**Why:** Current nav shows `aria-current="page"` underline but no smooth active state.

Add: animated underline that slides between nav items on navigation.

### 4.3 Improve mobile navigation
**Priority:** MEDIUM  
**Why:** Nav links overflow on mobile (`overflow-x: auto` is a band-aid).

Fix: hamburger menu or collapsible nav for mobile.

### 4.4 Add scroll-to-top button
**Priority:** LOW  
**Why:** Long pages (engineering, home) have no way to quickly return to nav.

### 4.5 Add loading states for JS-rendered content
**Priority:** MEDIUM  
**Why:** Pages show blank while JS loads. A skeleton screen or loading indicator would feel better.

The `skeleton.css` file exists but may not be actively used.

### 4.6 Fix the engineering ↔ homepage duplication
**Priority:** HIGH  
**Why:** `/engineering` and `/` render identical content. This confuses visitors and wastes a page.

Options:
- Make `/engineering` filter to engineering-lens projects only
- Make `/` a true landing page with a different layout (hero + featured 3 + CTA)
- Remove `/engineering` entirely and keep only the lens toggle on home

### 4.7 Add breadcrumbs for project detail pages
**Priority:** LOW  
**Why:** Deep pages like `/work/omniroute` have no back-navigation context.

Add: `← Work / OmniRoute` breadcrumb at top of project detail pages.

---

## PHASE 5: PERFORMANCE (Days 7-8)

### 5.1 Implement proper image loading strategy
**Priority:** HIGH  

Current: No `loading="lazy"` on any images. All images load eagerly.

Fix:
- Hero images: `loading="eager"` + `fetchpriority="high"` (already done for witf hero)
- Card images: `loading="lazy"` + proper `width`/`height` attributes
- Gallery images: `loading="lazy"` + intersection observer for reveal

### 5.2 Add proper cache headers via vercel.json
**Priority:** HIGH  

Current: No cache headers for static assets.

Add:
```json
"headers": [
  {
    "source": "/(.*\\.(js|css|webp|png|jpg|svg|woff2))",
    "headers": [
      {"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}
    ]
  }
]
```

### 5.3 Inline critical CSS
**Priority:** MEDIUM  
**Why:** Current setup loads `core.css` as external file. Inlining the above-fold CSS eliminates a render-blocking request.

### 5.4 Preload key resources
**Priority:** MEDIUM  

Current: Only hero-01.webp is preloaded.

Add preloads for:
- `app.bundle.js` (or the critical JS chunk)
- `core.css`
- OG image for social crawlers

---

## PHASE 6: SEO & METADATA (Days 8-9)

### 6.1 Add structured data for each project
**Priority:** MEDIUM  

Current: Only `Person` schema exists. Add:
- `CreativeWork` schema for each project
- `BreadcrumbList` for navigation
- `WebSite` schema with `potentialAction: SearchAction`

### 6.2 Create proper sitemap.xml
**Priority:** MEDIUM  

Current: `sitemap.xml` exists but may be stale. Regenerate with all 15 project pages, blog, and static pages.

### 6.3 Add robots.txt improvements
**Priority:** LOW  

Ensure crawlers can index all public pages but not `/docs/`, `/asset-sources/`, `/tests/`.

### 6.4 Fix all canonical URLs
**Priority:** MEDIUM  

Verify every page has correct canonical URL matching its actual path.

---

## PHASE 7: TESTING & QA (Days 9-10)

### 7.1 Cross-browser testing
- Chrome, Firefox, Safari, Edge (desktop + mobile)
- iOS Safari (construction gate, dark mode, navigation)
- Android Chrome

### 7.2 Accessibility audit
- Screen reader testing (VoiceOver + NVDA)
- Keyboard-only navigation through all pages
- Color contrast verification (WCAG AA minimum)
- Focus visible states on all interactive elements

### 7.3 Performance audit on throttled connection
- Test on simulated 3G
- Test on simulated 4G
- Verify FCP < 2s, LCP < 3s on mobile

### 7.4 Link audit
- Verify all external links work
- Verify all internal routes work
- Verify PDF links download correctly
- Verify email link opens mailto:

---

## EXECUTION ORDER (WBS)

```
0.0 EMERGENCY SURGERY
  0.1 Kill construction gate                              30m
  0.2 Remove oversized files                              15m
  0.3 Add security headers                                10m
  0.4 Add og:image + fix Twitter card                     1h
1.0 CONTENT OVERHAUL
  1.1 Rewrite homepage opening                            30m
  1.2 Rewrite all project summaries                       1h
  1.3 Rewrite OmniRoute entry                             30m
  1.4 Fix contact page                                    1h
  1.5 Fix resume page (inline content)                    1h
  1.6 Add 2-3 blog posts                                  2h
  1.7 Fix footer text                                     10m
2.0 IMAGES & VISUAL
  2.1 Create 7 missing hero images                        3h
  2.2 Convert 7 card.png to WebP                          30m
  2.3 Fix GMK Arch hero                                   15m
  2.4 Convert DSS Cipher GIF                              15m
  2.5 Create real og-image.png                            1h
3.0 ARCHITECTURE
  3.1 Decision: SPA vs MPA                                1h
  3.2 Route-based code splitting (if SPA)                 3h
  3.3 Consolidate CSS to <40KB                            2h
  3.4 Fix work page CSS                                   30m
  3.5 Stop shipping unbundled JS                          15m
  3.6 Lazy-init interaction modules                       30m
4.0 UX POLISH
  4.1 Page transitions                                    2h
  4.2 Navigation indicator                                1h
  4.3 Mobile hamburger nav                                1h
  4.4 Scroll-to-top                                       15m
  4.5 Loading states                                      1h
  4.6 Fix engineering/homepage duplication                 1h
  4.7 Breadcrumbs                                         30m
5.0 PERFORMANCE
  5.1 Image loading strategy                              1h
  5.2 Cache headers                                       15m
  5.3 Inline critical CSS                                 1h
  5.4 Preload key resources                               15m
6.0 SEO & METADATA
  6.1 Structured data                                     1h
  6.2 Sitemap regeneration                                30m
  6.3 Robots.txt                                          15m
  6.4 Canonical URLs                                      30m
7.0 TESTING & QA
  7.1 Cross-browser testing                               2h
  7.2 Accessibility audit                                 2h
  7.3 Performance on throttled connection                 1h
  7.4 Link audit                                          30m
```

**Total estimated effort:** ~40 hours  
**Critical path:** Phase 0 (surgery) → Phase 1 (content) → Phase 2 (images) → Deploy  
**All phases can overlap where dependencies allow.**

---

## SUCCESS CRITERIA

| Metric | Current | Target |
|--------|---------|--------|
| Construction gate | Shows to all humans | Removed |
| Projects with hero images | 8/15 | 15/15 |
| Card image format | Mixed PNG/WebP | All WebP <10KB |
| Total JS bundle | 177KB | <60KB (split) or <30KB (MPA) |
| Total CSS | 114KB | <40KB |
| Security headers | HSTS only | Full set |
| og:image | Missing | Present on all pages |
| Contact page links | 3 | 6+ (form, calendar, email, social) |
| Blog posts | 1 | 3+ |
| Lighthouse perf | 99 | 95+ (with construction gate removed) |
| Lighthouse accessibility | Unknown | 90+ |
| Lighthouse SEO | Unknown | 95+ |
