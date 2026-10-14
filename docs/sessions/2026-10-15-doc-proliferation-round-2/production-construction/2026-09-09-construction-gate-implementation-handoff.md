# Construction Gate Implementation Handoff

**Date:** 2026-09-09
**Status:** FREEZE

## Root cause

The no-JavaScript fallback used a fixed gate overlay plus a `#construction-entered` target, but the stylesheet had no selector connecting the target to gate visibility. Clicking the native Continue link changed the URL hash only; without JavaScript, the gate stayed `display: grid` and intercepted the download link beneath it. The prior `aria-hidden` test assertion was also not a valid no-JavaScript behavioral check because JavaScript cannot add that attribute in the disabled browser.

## Implementation

- `styles/construction-gate.css` now hides the gate when its native target is the active URL target via `.construction-gate:has(.construction-gate__target:target)`.
- Existing first-paint and JavaScript dismissal paths remain intact:
  - `html[data-construction='entered'] .construction-gate`
  - `.construction-gate[aria-hidden='true']`
- The visual gate artwork and layout were preserved, including the glass chrome, centered content, bottom-centered Continue control, mobile treatment, focus outline, reduced-motion behavior, and forced-colors rules.
- `scripts/construction-gate.js` now resolves the default `globalThis.sessionStorage` through a guarded getter. A browser that throws while reading the storage property no longer crashes initialization before the existing safe read/write handling.
- `tests/browser/acceptance.spec.js` asserts actual hidden behavior with `toBeHidden()` and then verifies the real `download` event and filename.
- `tests/construction-gate.test.js` covers a throwing `sessionStorage` getter as well as the existing explicit-storage persistence and entry behavior.

## Contract

- Gate selector: `#construction-gate`
- Native Continue selector: `#construction-continue`
- Native target selector: `#construction-entered`
- Background selector: `#construction-site`
- Session storage key: `portfolio-construction-entered`
- Entered value: `yes`
- Native fallback URL: `#construction-entered`

## Verification

- Focused unit command: `node --test --test-name-pattern='construction|storage' tests/construction-gate.test.js`
- Focused browser regression: `npm run stage:publication && npx playwright test tests/browser/acceptance.spec.js --grep 'native no-JS|all project pages'`
- Full gate and project unit/e2e verification: `npm run verify`
- Full verification result: 58 unit tests passed, 9 browser tests passed, build and syntax checks passed.
- No-JavaScript project regression verified the native Continue path exposes the page and allows `sharecli-help-real.cast` to download.
- Fresh-session route coverage verified the gate appears for every public route; separate reload persistence coverage verified session dismissal.

## Screenshots

- Desktop gate review: `output/construction-gate-desktop.png` — 1440px viewport, glass panel, centered content, bottom-centered Continue.
- Mobile gate review: `output/construction-gate-mobile.png` — 390px viewport, responsive glass panel, readable copy, bottom-centered Continue.

## Freeze

**FREEZE — construction-gate runtime, CSS, shell, acceptance tests, and gate unit tests are complete for this repair.**
