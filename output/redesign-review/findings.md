# QA Findings — Hybrid Redesign
**Sweep time:** 2026-09-12T11:29:07.991Z
**Server:** http://127.0.0.1:4397
**Viewports:** mobile (390×844), desktop (1440×900)

## Summary
| Severity | Count |
|----------|-------|
| 🔴 Error | 6 |
| 🟡 Warning | 10 |
| 🔵 Info | 32 |

## 🔴 Errors

- **[navigation]** `mcpforge` @ mobile: Failed to load: c.type is not a function
- **[navigation]** `forgecode` @ mobile: Failed to load: c.type is not a function
- **[navigation]** `frostify` @ mobile: Failed to load: c.type is not a function
- **[navigation]** `mcpforge` @ desktop: Failed to load: c.type is not a function
- **[navigation]** `forgecode` @ desktop: Failed to load: c.type is not a function
- **[navigation]** `frostify` @ desktop: Failed to load: c.type is not a function

## 🟡 Warnings

- **[h1-mismatch]** `resume` @ mobile: h1 "Two ways to read the work" does not match expected project "Resume"
- **[h1-mismatch]** `contact` @ mobile: h1 "Let’s build something consequential." does not match expected project "Contact"
- **[h1-mismatch]** `blog` @ mobile: h1 "Writing" does not match expected project "Blog"
- **[h1-mismatch]** `engineering` @ mobile: h1 "Software systems, technical products, and the infrastructure between them." does not match expected project "Engineering"
- **[h1-mismatch]** `blog-omniroute` @ mobile: h1 "Why we forked OmniRoute — and how to avoid it" does not match expected project "Blog-omniroute"
- **[h1-mismatch]** `resume` @ desktop: h1 "Two ways to read the work" does not match expected project "Resume"
- **[h1-mismatch]** `contact` @ desktop: h1 "Let’s build something consequential." does not match expected project "Contact"
- **[h1-mismatch]** `blog` @ desktop: h1 "Writing" does not match expected project "Blog"
- **[h1-mismatch]** `engineering` @ desktop: h1 "Software systems, technical products, and the infrastructure between them." does not match expected project "Engineering"
- **[h1-mismatch]** `blog-omniroute` @ desktop: h1 "Why we forked OmniRoute — and how to avoid it" does not match expected project "Blog-omniroute"

## 🔵 Info Highlights

### lens-state
- `home-engineering` @ mobile: {"classes":"","dataLens":null,"url":"#construction-entered"}
- `home-product` @ mobile: {"classes":"","dataLens":null,"url":"#construction-entered"}
- `home-engineering` @ desktop: {"classes":"","dataLens":null,"url":"#construction-entered"}
- `home-product` @ desktop: {"classes":"","dataLens":null,"url":"#construction-entered"}

### index-dialog
- `work` @ mobile: Index dialog open: true
- `work` @ desktop: Index dialog open: true

### index-items
- `work` @ mobile: 15 projects in Index dialog
- `work` @ desktop: 15 projects in Index dialog

### filter-buttons
- `work` @ mobile: 9 filter buttons found
- `work` @ desktop: 9 filter buttons found

### focusable-count
- `home-engineering` @ desktop: 37 focusable elements
- `home-product` @ desktop: 37 focusable elements
- `work` @ desktop: 52 focusable elements
- `resume` @ desktop: 32 focusable elements
- `contact` @ desktop: 32 focusable elements
- ...and 17 more

