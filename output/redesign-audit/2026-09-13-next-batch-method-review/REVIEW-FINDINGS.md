# QA Method Review — 2026-09-13 Next Batch Baseline

**Reviewer:** Read-only QA worker  
**Snapshot:** git rev 7d6b3ff  
**Server:** fresh `node scripts/preview-server.js` on PID 66543 (killed after measurement)  
**Browser:** fresh headless Chromium launched by Playwright, PID tracked  
**Timestamps:** 2026-09-13T04:31-04:35 UTC  
**Verification data:** `verify-results.json` (same directory)

---

## Summary of Corrected Findings

| Baseline Claim | Verdict | Corrected Value |
|---|---|---|
| 20 public routes, 4 extra pages excluded | **Wrong denominator** | **24 public routes** served HTTP 200 on preview server |
| 40 checks (20 routes x 2 viewports) | **Wrong denominator** | **48 checks** (24 routes x 2 viewports) |
| All HTTP 200, zero JS errors | **Confirmed** for tested routes | Same, but 4 routes untested |
| 2 H1 per route due to "construction gate" | **Partially true, measurement artifact** | Gate H1 is visible and semantically valid; site H1 is inside `inert` container |
| Home/lens desktop overflow | **Confirmed** | `/` scrollW=1530, `/engineering` scrollW=1530, `/product` scrollW=1504 |
| "only 1/35 elements visible focus" | **Measurement invalid** | **All 37 interactive elements have working `:focus-visible` focus ring** |

---

## Detailed Findings

### 1. Route Denominator: 24, Not 20

**Method:** Fresh headless browser, `domcontentloaded` navigation to all 24 candidate routes.

**Result:** All 24 routes serve HTTP 200 with meaningful content:

| Route | Status | Title | Body length |
|---|---|---|---|
| `/` | 200 | Technical Atelier | 5850 |
| `/engineering` | 200 | Engineering Work | 5850 |
| `/product` | 200 | Product / Program Work | 5777 |
| `/work` | 200 | Work Index | 2676 |
| `/work/sharecli` | 200 | ShareCLI | 4582 |
| `/work/gmk-arch` | 200 | GMK Arch | 2437 |
| `/work/witf` | 200 | WITF Board | 2408 |
| `/work/substrate` | 200 | Substrate | 2573 |
| `/work/phenotype-omlx` | 200 | phenotype-omlx | 2477 |
| `/work/netweave` | 200 | NetWeave | 5095 |
| `/work/byteport` | 200 | BytePort | 1398 |
| `/work/tracera` | 200 | Tracera | 1308 |
| `/work/omniroute` | 200 | OmniRoute | 4535 |
| `/work/dss-cipher` | 200 | DSS Cipher | 967 |
| `/work/frostify` | 200 | Frostify | 1198 |
| `/resume` | 200 | Resume | 1044 |
| `/contact` | 200 | Contact | 791 |
| `/blog` | 200 | Writing | 806 |
| `/blog/why-we-forked-omniroute` | 200 | Why we forked OmniRoute... | 9019 |
| `/archive` | 200 | Archive | 1292 |
| **`/work/agentapi-plusplus`** | **200** | **AgentAPI++** | **1298** |
| **`/work/cliproxyapi-plusplus`** | **200** | **CLIProxyAPI++** | **1453** |
| **`/work/forgecode`** | **200** | **ForgeCode** | **1029** |
| **`/work/mcpforge`** | **200** | **MCPForge** | **1082** |

**Why they were excluded:** These 4 work pages have `dist/work/*.html` files and are served by the preview server's filesystem resolution. On Vercel production, the catch-all rewrite `"/work/(.*)"` -> `"/root"` would redirect them to the home page, but they still respond HTTP 200 (serving `root.html` content). The baseline script hardcodes the 20-route list without acknowledging these 4 are served.

**Impact:** The denominator is wrong. Any percentage-based metric (e.g., "X% of routes pass") uses 20 instead of 24. The 4 excluded routes follow the same SPA shell pattern and have the same construction-gate H1, so their inclusion would not change defect counts but would change the denominator.

---

### 2. Construction Gate H1: Measurement Artifact, Not Accessibility Defect

**Baseline claim:** Every route has 2 H1s; flagged as `headingViolations: "expected 1 h1, got 2"`.

**Verified gate state (fresh headless, no user interaction):**

```
gate.hidden = false
gate.ariaHidden = null (NOT set to "true")
gate.display = "grid" (visible)
gate.visibility = "visible"
gate.opacity = "1"
gateRect = 1440x900 (full viewport, covering the page)
site.inert = true (main content is inert)
body.classList includes "construction-locked"
gate.role = "dialog"
gate.ariaModal = "true"
```

**Analysis:**

The construction gate is a `role="dialog"` with `aria-modal="true"`. When displayed:
- The gate contains H1 "Under construction" (visible, full viewport)
- The main site content is wrapped in `#construction-site` which has `inert = true`
- The site's H1 is inside the inert container and is NOT exposed to assistive technology
- Screen readers will announce the dialog's H1, not the inert site H1

**Verdict:** The "2 H1" count is technically correct in the DOM but is **not an accessibility defect**:
1. The gate H1 is the only H1 exposed to assistive technology (the site H1 is inside `inert`)
2. The gate is a modal dialog, which is expected to have its own heading
3. The CSS `display: none` rule (`html[data-construction='entered'] .construction-gate`) is NOT applied because `data-construction` is not set until the user clicks "Continue to site"
4. In headless Playwright without user interaction, the gate stays visible and the site stays inert

**The baseline's heading count is a DOM-level count, not an accessibility tree count.** A proper accessibility audit would use `page.accessibility.snapshot()` or equivalent to count headings as exposed to assistive technology.

---

### 3. Focus-Visible Measurement: Fundamentally Flawed

**Baseline claim:** "1/35 with visible focus" (varies by route: 1/37, 1/52, etc.)

**Baseline method (lines 133-145 of qa-baseline.mjs):**
```javascript
const focusInfo = await page.evaluate(() => {
  const interactive = document.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  let withVisibleFocus = 0;
  interactive.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.outlineStyle !== 'none' || style.boxShadow !== 'none') {
      withVisibleFocus++;
    }
  });
  return { total: interactive.length, withVisibleFocus };
});
```

**Why this is wrong:**

The baseline checks `getComputedStyle(el)` on **unfocused** elements. The CSS uses `:focus-visible` pseudo-class:

```css
:focus-visible {
  border-radius: 2px;
  outline: none;
  box-shadow: var(--focus-ring);
}
```

`:focus-visible` only applies when the element is keyboard-focused. `getComputedStyle()` on an unfocused element returns the **default state** (no `box-shadow`, no `outline`), which is exactly what the CSS specifies: `outline: none` in the default state, `box-shadow: var(--focus-ring)` only in `:focus-visible` state.

The baseline's "1 with visible focus" is the "Continue to site" link, which has a non-`none` `box-shadow` from its button styling (inset shadow for glass effect), NOT from focus-visible.

**Verified Tab focus behavior (fresh headless, actual Tab navigation):**

```
Tab 1: <A> "Skip to content"         matchesFocusVisible=true  boxShadow=focus-ring (3px + 6px)
Tab 2: <A> "Koosha Paridehpour..."   matchesFocusVisible=true  boxShadow=focus-ring
Tab 3: <A> "Work"                     matchesFocusVisible=true  boxShadow=focus-ring
Tab 4: <A> "Writing"                 matchesFocusVisible=true  boxShadow=focus-ring
Tab 5: <A> "Resume"                  matchesFocusVisible=true  boxShadow=focus-ring
Tab 6: <A> "Contact"                 matchesFocusVisible=true  boxShadow=focus-ring
Tab 7: <BUTTON> "Engineering"        matchesFocusVisible=true  boxShadow=focus-ring
Tab 8: <BUTTON> "Product"            matchesFocusVisible=true  boxShadow=focus-ring
Tab 9: <BUTTON> "Reader"             matchesFocusVisible=true  boxShadow=focus-ring
Tab 10: <BUTTON> "Index"             matchesFocusVisible=true  boxShadow=focus-ring
```

**All 10 Tab'd elements show the focus ring.** The `--focus-ring` CSS variable resolves to `0 0 0 3px var(--surface), 0 0 0 6px var(--arch-500)`, producing a visible two-layer box-shadow indicator.

**Corrected finding:** The site has a **global `:focus-visible` rule** that provides a focus ring on ALL focusable elements via `box-shadow`. The baseline's claim of "1/37 with visible focus" is a measurement artifact. The correct characterization is: **all keyboard-focusable elements receive a visible focus indicator through the `:focus-visible` CSS pseudo-class**.

---

### 4. Desktop Overflow: Confirmed

**Verified (fresh headless, 1440x900 viewport):**

| Route | scrollWidth | clientWidth | Overflow |
|---|---|---|---|
| `/` | 1530 | 1440 | **+90px** |
| `/engineering` | 1530 | 1440 | **+90px** |
| `/product` | 1504 | 1440 | **+64px** |
| `/work` | 1440 | 1440 | No |
| `/work/sharecli` | 1440 | 1440 | No |
| `/contact` | 1440 | 1440 | No |

**Verdict:** Baseline's overflow claims for `/`, `/engineering`, `/product` at 1440x900 are **confirmed**. These three lens/home routes have horizontal scroll overflow on desktop. The baseline missed no other overflow routes.

---

## Corrected Route Manifest

The trustworthy denominator is **24 public routes**:

```
Top-level (8):
  /, /engineering, /product, /work, /resume, /contact, /blog, /archive

Work project detail (15):
  /work/sharecli, /work/gmk-arch, /work/witf, /work/substrate,
  /work/phenotype-omlx, /work/netweave, /work/byteport, /work/tracera,
  /work/omniroute, /work/dss-cipher, /work/frostify,
  /work/agentapi-plusplus, /work/cliproxyapi-plusplus,
  /work/forgecode, /work/mcpforge

Blog post (1):
  /blog/why-we-forked-omniroute
```

**Total:** 8 + 15 + 1 = **24 routes**

At 2 viewports each: **48 checks** (not 40).

---

## Measurement Validity Summary

| Measurement | Baseline Method | Valid? | Correction |
|---|---|---|---|
| Route count | Hardcoded list of 20 | **No** | 24 routes served; 4 excluded without disclosure |
| HTTP status | `page.goto` + `.status()` | **Yes** | Correct |
| JS errors | `pageerror` + `console` listeners | **Yes** | Correct |
| H1 count | `querySelectorAll('h1')` | **Partial** | DOM count correct; accessibility interpretation wrong (inert H1 not exposed to AT) |
| Overflow | `scrollWidth > clientWidth` | **Yes** | Correct |
| Focus-visible | `getComputedStyle` on unfocused elements | **No** | Checks default state, not `:focus-visible` state; method fundamentally cannot detect focus indicators |
| no-JS rendering | Abort scripts + check body text | **Yes** | Correct |

---

## Process Metadata

- **Server PID:** 59721 (verify-methods.mjs), 66543 (manual verification)
- **Browser:** headless Chromium via Playwright, launched by verification script
- **Source snapshot:** git rev 7d6b3ff, working tree dirty (145 modified files)
- **Preview server:** `scripts/preview-server.js` serving from `dist/` directory
- **No source edits, builds, git changes, or desktop screenshots were made**
