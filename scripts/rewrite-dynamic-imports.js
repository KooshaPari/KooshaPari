/**
 * rewrite-dynamic-imports.js
 *
 * One build-step concern for bundle-js.js: make the emitted bundle's dynamic
 * `import('...')` specifiers resolvable in the browser.
 *
 * Dynamic import specifiers are the one thing the bundler cannot resolve: it
 * only walks static `import ... from '...'` declarations, so a dynamic
 * specifier is copied into the IIFE verbatim and evaluated by the browser
 * relative to wherever the bundle is served from.
 *
 * That breaks any specifier written file-relative to the *source* module.
 * `scripts/views/project-detail.js` correctly imports its workbenches as
 * `../media/netweave-workbench.js` (which is what Node's prerender needs, since
 * Node resolves it against the module's real path on disk), but the bundle is
 * emitted at /bundled/app.bundle.<hash>.js, so the browser resolves that same
 * specifier to /media/netweave-workbench.js and every request 404s. The
 * prerendered HTML still shows the section heading, and the rejection is
 * swallowed by a .catch that only logs — so both workbenches were permanently
 * dead on every netweave and sharecli page with nothing but a console line.
 *
 * The staged site keeps the whole `scripts/` tree at `/scripts/`, so rewriting
 * the specifier to the absolute `/scripts/media/<name>.js` URL makes it
 * resolve identically from the bundle and from the dev server. Only this exact
 * dynamic-import form is rewritten; static imports are resolved and inlined by
 * the bundler's walker and never reach this pattern, and bare specifiers
 * (`import('three')`) are handled by the page importmap and left untouched.
 */

const DYNAMIC_IMPORT_RE = /\bimport\(\s*(['"])\.\.\/media\/(netweave|sharecli)-workbench\.js\1\s*\)/g;

// One rewrite is required per workbench. Requiring the full set (rather than
// "at least one") is what makes this a real guard: a rename of a single
// specifier used to leave the other match intact, so a count-only check passed
// the build and shipped one 404-ing workbench.
const REQUIRED_WORKBENCH_IMPORTS = ['netweave', 'sharecli'];

/**
 * Rewrite every file-relative workbench specifier in the raw bundle to its
 * absolute /scripts/media/ URL.
 *
 * Aborts the process (exit 1) when a required specifier is missing or when the
 * rewrite fails to cover every match, so a renamed or statically-imported
 * workbench can never reach the browser as a 404.
 *
 * @param {string} rawBundle Assembled, unminified IIFE bundle.
 * @returns {string} The bundle with dynamic workbench specifiers rewritten.
 */
export function rewriteDynamicImports(rawBundle) {
  const missingWorkbenchImports = REQUIRED_WORKBENCH_IMPORTS.filter((name) => (
    !new RegExp(`\\bimport\\(\\s*(['"])\\.\\./media/${name}-workbench\\.js\\1\\s*\\)`).test(rawBundle)
  ));
  if (missingWorkbenchImports.length > 0) {
    console.error('\nBundle aborted: dynamic workbench import not found to rewrite.');
    console.error('project-detail.js lazily imports the netweave and sharecli');
    console.error('workbenches so their bodies stay out of this bundle. Each import');
    console.error('is a file-relative specifier that this script must rewrite to an');
    console.error('absolute /scripts/media/ URL, or it 404s in the browser. If an');
    console.error('import below is missing, it was renamed, moved, or converted to a');
    console.error('static import, and this rewrite no longer covers it:\n');
    for (const name of missingWorkbenchImports) {
      console.error(`  ../media/${name}-workbench.js`);
    }
    console.error('');
    process.exit(1);
  }

  const rewrittenBundle = rawBundle.replace(
    DYNAMIC_IMPORT_RE,
    (_match, quote, name) => `import(${quote}/scripts/media/${name}-workbench.js${quote})`,
  );

  // Sanity-check the rewrite actually landed, rather than trusting the regex to
  // have matched at all: a stale `../media/` specifier left in the output is the
  // exact bug this step exists to prevent.
  const rewrittenDynamicImports = [...rewrittenBundle.matchAll(DYNAMIC_IMPORT_RE)].length;
  if (rewrittenDynamicImports > 0) {
    console.error('\nBundle aborted: a workbench import still points at a relative path.');
    console.error('The rewrite did not cover every dynamic workbench specifier.\n');
    process.exit(1);
  }

  return rewrittenBundle;
}

/**
 * Number of workbench imports this step rewrites, for the build log line.
 *
 * @returns {number} Count of required workbench specifiers.
 */
export function requiredDynamicImportCount() {
  return REQUIRED_WORKBENCH_IMPORTS.length;
}
