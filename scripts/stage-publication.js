import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prerenderPosts, prerenderProjects, prerenderTopLevel } from './prerender.js';
import { injectConstructionGate } from './construction-shell.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const publication = join(root, 'dist');
const topLevelFiles = [
  'index.html', 'engineering.html', 'product.html', 'work.html', 'resume.html',
  'contact.html', 'blog.html', 'archive.html', 'favicon.svg', 'robots.txt', 'sitemap.xml',
];
const directories = ['styles', 'scripts', 'data', 'public', 'work', 'blog'];

await rm(publication, { recursive: true, force: true });
await mkdir(publication, { recursive: true });

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
      ? new Set(['phenotype.js'])
      : new Set();
  const allowed = entries.filter((entry) => !blocked.has(entry));
  await mkdir(join(publication, directory), { recursive: true });
  await Promise.all(allowed.map((entry) => cp(
    join(root, directory, entry),
    join(publication, directory, entry),
    { recursive: true, filter: (source) => basename(source) !== '.DS_Store' },
  )));
}

await prerenderTopLevel(publication);
await prerenderProjects(publication);
await prerenderPosts(publication);

async function injectIntoHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await injectIntoHtml(path);
    else if (entry.name.endsWith('.html')) await writeFile(path, injectConstructionGate(await readFile(path, 'utf8')));
  }
}

await injectIntoHtml(publication);
