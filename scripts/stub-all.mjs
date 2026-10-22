// Replaces the whole staged site with an "Under construction" page.
import { readdirSync, rmSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const out = 'dist';
if (!existsSync(out)) mkdirSync(out);
for (const name of readdirSync(out)) rmSync(join(out, name), { recursive: true, force: true });
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><meta name="color-scheme" content="light dark">
<title>Under construction</title>
<style>:root{color-scheme:light dark}body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;background:#fafafa;color:#161616}
@media (prefers-color-scheme:dark){body{background:#111;color:#eee}}main{padding:2rem;text-align:center}h1{font-size:1.5rem;font-weight:600;margin:0 0 .5rem}p{margin:0;opacity:.7}</style>
</head><body><main><h1>Under construction</h1><p>This site is being rebuilt. Back soon.</p></main></body></html>
`;
writeFileSync(join(out, 'index.html'), html);
