---
name: node-test-coverage-cache-bust-pitfall
description: Node's --experimental-test-coverage counts cache-busted module imports as separate uncovered files, silently lowering coverage percentages
metadata:
  type: reference
---

In Node's built-in test runner with `--experimental-test-coverage`, importing a module with a
query-string suffix (e.g. `import('../scripts/foo.js?instance=1')`) makes V8 treat it as a
**different file path**. Coverage then counts it as an additional, mostly-uncovered copy
alongside the canonical path, which **lowers** the reported totals instead of raising them.

Observed 2026-10-21 in `koosha-phenotype`: a test file that cache-busted
`scripts/scroll-reveal.js` per-test drove overall function coverage from 84.48% down to
81.10%, even though `scroll-reveal.js` itself rose from 0.00% to 68.75% functions.

**How to apply:**
- To get a fresh module instance per test, do **not** re-import by path. Node's test runner
  gives **each test file** its own module registry, so one test file = one module instance.
- Share a single instance across tests in a file, and structure the tests around the
  module's real lifecycle (e.g. a singleton `init()` that a second call refreshes).
- When coverage moves the *wrong* direction after adding tests, diff the per-file coverage
  table before and after. If the per-file rows are unchanged but `all files` moved, suspect
  duplicate coverage entries from cache-busted imports.
