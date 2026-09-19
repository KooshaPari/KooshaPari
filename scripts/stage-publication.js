import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prerenderPosts, prerenderProjects, prerenderTopLevel } from './prerender.js';


const root = fileURLToPath(new URL('..', import.meta.url));
const publication = join(root, 'dist');
const topLevelFiles = [
  'index.html', 'engineering.html', 'product.html', 'work.html', 'resume.html',
  'contact.html', 'blog.html', 'archive.html', 'favicon.svg', 'og-image.png', 'robots.txt', 'sitemap.xml',
];
const directories = ['styles', 'scripts', 'data', 'public', 'work', 'blog'];

await rm(publication, { recursive: true, force: true });
await mkdir(publication, { recursive: true });

// Bundle CSS into 3 hashed files before staging.
const { execFile } = await import('node:child_process');
const { promisify } = await import('node:util');
const execFileAsync = promisify(execFile);
await execFileAsync('node', [join(root, 'scripts', 'bundle-css.js')]);

// Bundle JS into a single hashed file.
await execFileAsync('node', [join(root, 'scripts', 'bundle-js.js')]);

// Read manifests written by the bundle scripts. Each maps logical name
// (e.g. "core.css", "app.bundle.js") to the on-disk hashed filename.
const cssManifest = JSON.parse(
  await readFile(join(root, 'styles/bundled/manifest.json'), 'utf8'),
);
const jsManifest = JSON.parse(
  await readFile(join(root, 'bundled/manifest.json'), 'utf8'),
);

for (const file of topLevelFiles) {
  await cp(join(root, file), join(publication, file));
}

// Vercel's clean-URL transform reserves index.html in a staged static output.
// Keep the canonical source unchanged, but give root and SPA fallbacks a stable
// deploy-only target that is not transformed into /index.
await cp(join(root, 'index.html'), join(publication, 'root.html'));

for (const directory of directories) {
  const entries = await readdir(join(root, directory));
  const blocked = directory === 'scripts'
    ? new Set(['main.js', 'stage-publication.js', 'prerender.js', 'preview-server.js'])
    : directory === 'data'
      ? new Set()
      : new Set();
  const allowed = entries.filter((entry) => {
    if (blocked.has(entry)) return false;
    return true;
  });
  await mkdir(join(publication, directory), { recursive: true });
  await Promise.all(allowed.map((entry) => cp(
    join(root, directory, entry),
    join(publication, directory, entry),
    { recursive: true, filter: (source) => basename(source) !== '.DS_Store' },
  )));
}

// Copy the hashed JS bundle + its manifest. The source `bundled/` directory
// is not in `directories` (it lives at the repo root, not under one of the
// staged top-level dirs), so we copy it explicitly here.
await mkdir(join(publication, 'bundled'), { recursive: true });
for (const entry of await readdir(join(root, 'bundled'))) {
  await cp(join(root, 'bundled', entry), join(publication, 'bundled', entry));
}

await prerenderTopLevel(publication);
await prerenderProjects(publication);
await prerenderPosts(publication);

// Minify JS in dist/ — strip comments from scripts and data files.
// Runs after prerender so it doesn't affect Node-side parsing.
await execFileAsync('node', [join(root, 'scripts', 'minify-js.js')]);

// Every page must load the hashed bundle, not the module graph.
// Source HTML references the unhashed logical names
// (/scripts/app.js, /bundled/app.bundle.js, /styles/bundled/core.css, etc.).
// We rewrite them through the manifest so callers never hard-code hashed
// filenames. /scripts/app.js and /bundled/app.bundle.js both resolve to the
// same hashed output — index.html points at /bundled/, the other top-level
// pages point at /scripts/app.js, and prerender output reuses one of those
// templates.
const JS_ENTRY_LOGICAL = '/scripts/app.js';
const JS_BUNDLE_LOGICAL = '/bundled/app.bundle.js';
const JS_ENTRY_HASHED = `/bundled/${jsManifest['app.bundle.js']}`;
const cssRewrites = Object.entries(cssManifest).map(([logical, hashed]) => ({
  from: `/styles/bundled/${logical}`,
  to: `/styles/bundled/${hashed}`,
}));
const jsRewrites = [JS_ENTRY_LOGICAL, JS_BUNDLE_LOGICAL];
let rewrittenHtml = 0;
let rewrittenCss = 0;
let rewrittenJs = 0;

async function walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walkHtml(full));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

for (const file of await walkHtml(publication)) {
  let html = await readFile(file, 'utf8');
  let changed = false;
  for (const from of jsRewrites) {
    if (html.includes(from)) {
      html = html.replaceAll(from, JS_ENTRY_HASHED);
      rewrittenJs++;
      changed = true;
    }
  }
  for (const { from, to } of cssRewrites) {
    if (html.includes(from)) {
      html = html.replaceAll(from, to);
      rewrittenCss++;
      changed = true;
    }
  }
  if (changed) {
    await writeFile(file, html);
    rewrittenHtml++;
  }
}
console.log(
  `Hashed bundle references applied to ${rewrittenHtml} page(s) ` +
  `(${rewrittenCss} CSS, ${rewrittenJs} JS reference rewrites)`,
);



// Sync to Vercel static output directory for build-output test parity.
const vercelStatic = join(root, '.vercel', 'output', 'static');
await rm(vercelStatic, { recursive: true, force: true });
await cp(publication, vercelStatic, { recursive: true });
