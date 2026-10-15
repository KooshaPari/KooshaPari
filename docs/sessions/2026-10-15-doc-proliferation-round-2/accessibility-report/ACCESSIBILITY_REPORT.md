# Accessibility report

## Completed checks

- Semantic `header`, `nav`, `main`, and `footer` landmarks.
- Tab navigation exposes `aria-selected`; filters expose `aria-pressed` and live result counts.
- Visible keyboard focus styles and skip-to-content link.
- Authored fallback alt text for rendered project images; retained image dimensions reduce layout shift.
- Reduced-motion media query disables nonessential animation and smooth scrolling.
- Unknown project route renders an explicit 404 state with a usable Work link.
- axe-core 4.10.2 full sweep (local HTTP, Chromium, 10 routes: home, engineering, product, work, resume, contact, sharecli, gmk-arch, witf, netweave): 10/10 CLEAN (0 violations).
- Work Index card titles changed h3 -> h2 to resolve the last axe heading-order (moderate) violation; card CSS selector updated in styles/main.css.
- Nested-complementary-landmark fix retained: metric annotation uses div role="note".

## Remaining human check

Run axe/Lighthouse against the deployed preview once SSO access is available. Contrast and mobile touch-target review should be confirmed during approval.
