import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.json':'application/json','.txt':'text/plain','.xml':'application/xml'};
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if (!extname(file)) file += '.html';
    try { await stat(file); } catch {
      if (extname(pathname)) { res.writeHead(404).end(); return; }
      res.statusCode = 404;
      file = resolve(root, 'root.html');
    }
    res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(400).end(); }
}).listen(4397, '127.0.0.1', () => console.log('listening on http://127.0.0.1:4397'));
