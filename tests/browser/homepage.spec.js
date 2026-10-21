import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage', () => {
  test('homepage loads with title, navigation, and hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    for (const href of ['/work', '/resume', '/contact']) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test('hero WITF board renders beside the copy on every lens page', async ({ page }) => {
    for (const path of ['/', '/engineering', '/product']) {
      await page.goto(path);
      const row = page.locator('.home-opening__artifact-row');
      const board = row.locator('.home-witf-board');
      await expect(board).toBeVisible();
      // All three hero routes share the desktop two-column grid; only the
      // <=760px breakpoint stacks them.
      await expect(row).toHaveCSS('grid-column-start', '2');

      // The board is the artifact, not a framed material card: the full
      // material chrome stays in the rail below and never returns to the hero.
      await expect(row.locator('.artifact')).toHaveCount(0);
      await expect(board.locator('figcaption')).toHaveText('WITF Board / historical');

      const boxes = await page.evaluate(() => {
        const boardRect = document.querySelector('.home-witf-board').getBoundingClientRect();
        const identityRect = document.querySelector('.home-identity').getBoundingClientRect();
        return {
          boardLeft: boardRect.left,
          identityRight: identityRect.right,
          boardWidth: boardRect.width,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });
      expect(boxes.boardLeft, `${path}: board must sit right of the hero copy`).toBeGreaterThan(boxes.identityRight);
      expect(boxes.boardWidth, `${path}: board must be visible in the right column`).toBeGreaterThan(0);
      expect(boxes.overflow, `${path}: hero must not overflow horizontally`).toBe(false);

      // The viewer gate opens once the board approaches the viewport. The
      // board must resolve to a live canvas or the static poster, never an
      // empty container. (The headless gate can be slow, so allow for the
      // import + GLB load rather than asserting synchronously.)
      await board.scrollIntoViewIfNeeded();
      await expect(board.locator('#witf-viewer canvas, #witf-viewer img')).toBeVisible({ timeout: 20000 });

      // A canvas alone is not enough: the board carries data-reveal="up", and
      // a stuck .reveal-hidden board would still report a visible box because
      // opacity:0 is laid out. Assert the revealed outcome directly.
      await expect(board).toHaveCSS('opacity', '1', { timeout: 5000 });
    }
  });

  test('homepage has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const critical = result.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(critical.map(v => ({ id: v.id, nodes: v.nodes.length }))).toEqual([]);
  });

  // A gate that cannot fail is not a gate. The design system resolves nearly
  // every translucent colour through color-mix(); when those mixed in oklch
  // they serialised with a `none` component and axe threw on every node, so
  // the colour-contrast rule reported 0 passes and 0 violations on a site
  // whose headings measured 1.14:1. Asserting "no violations" alone would have
  // passed in that state.
  //
  // Two separate invariants, because they fail for different reasons:
  //   - violations must be zero: a real readability regression
  //   - the rule must actually evaluate, and the number of nodes it cannot
  //     decide must not grow past the recorded ceiling: a coverage regression
  //
  // The residual "incomplete" nodes are axe limitations, not defects. Its own
  // reasons, measured 2026-09-19, are only three: the element is overlapped by
  // a decorative element, the element contains an image node (an inline icon
  // next to text), or a pseudo-element sits over it. None of those can be
  // decided from computed colour, and none of them mean the text is unreadable.
  // Ceilings are counts of axe's "incomplete" (undecidable) contrast nodes, not
  // allowances. Each was measured from real runs at 1440x900; raising one should
  // be a deliberate, justified edit.
  const INCOMPLETE_CEILING = {
    // Each value is the observed incomplete count plus two, measured over three
    // consecutive runs once syspolicyd had stopped consuming the host. All
    // three runs returned identical counts per route, so the measurements are
    // stable and the slack is a deliberate two-node margin rather than a
    // guess. A regression above one of these means more elements stopped being
    // decidable, which is how a colour silently regressed before.
    '/': 9,
    '/work': 2,
    '/blog': 17,
    // Previously unswept: a contrast regression on these four routes would not
    // have been caught at all.
    '/resume': 7,
    '/contact': 3,
    '/engineering': 9,
    '/product': 9,
  };

  test('colour contrast is evaluated, and reported violations are zero', async ({ page }) => {
    for (const [path, ceiling] of Object.entries(INCOMPLETE_CEILING)) {
      await page.goto(path);
      // axe reads computed style, and the reveal animation drives .lede from
      // opacity 0 to 1 over 0.5s with a 0.1s delay. Measured mid-transition, axe
      // blends the semi-transparent text against the page background and reports
      // a false contrast failure: /resume showed 6 "violations" at 2 frames
      // and 0 at 10, all on .lede. Waiting out the transition is the fix.
      //
      // Bounded rather than waitForLoadState('networkidle'): under host load
      // that wait can hang past the test timeout, which it did at load 137.
      await page
        .waitForTimeout(700)
        .catch(() => {});
      // The 700ms settle covers CSS reveal, but the WITF viewer lazy-loads
      // three.js from CDN and appends its WebGL canvas + interaction hint on a
      // network timeline, and the ambient canvas paints in its own frame.
      // axe's overlap/imgNode verdicts flip depending on whether that has
      // landed when it samples: '/' incompletes moved 7 -> 10 with no product
      // change, which is this gate's failure mode. Wait for whichever of those
      // exist on this route to be laid out, bounded at 3s so a CDN/WebGL
      // fallback cannot hang the run (empty match on routes without them).
      await page
        .waitForFunction(
          () => {
            const witf = document.getElementById('witf-viewer');
            const witfSettled = !witf || witf.childElementCount > 0;
            const media = [
              ...document.querySelectorAll(
                '.ambient-field-canvas, #witf-viewer canvas, #witf-viewer img',
              ),
            ];
            return (
              witfSettled &&
              media.every((el) => el.getBoundingClientRect().width > 0)
            );
          },
          null,
          { timeout: 3000 },
        )
        .catch(() => {});
      const result = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
      const contrast = result.violations.find(v => v.id === 'color-contrast');
      const passed = result.passes.find(v => v.id === 'color-contrast');
      const incomplete = result.incomplete.find(v => v.id === 'color-contrast');

      expect(
        contrast?.nodes.map(n => n.target.join(' ')) ?? [],
        `${path}: contrast violations`,
      ).toEqual([]);

      expect(
        passed?.nodes.length ?? 0,
        `${path}: axe evaluated no element for colour contrast — the rule is blind`,
      ).toBeGreaterThan(0);

      expect(
        incomplete?.nodes.length ?? 0,
        `${path}: contrast coverage regressed; more nodes are undecidable than the recorded ceiling. `
        + 'A colour may have started serialising with a "none" component again.',
      ).toBeLessThanOrEqual(ceiling);
    }
  });
});
