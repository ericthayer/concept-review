/** Minimal static server for dist/ (dev and Playwright). No dev-only code paths. */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { ROOT } from './load-content.ts';

const DIST = join(ROOT, 'dist');
const PORT = Number(process.env['PORT'] ?? 4321);

const TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

function resolve(urlPath: string): string | null {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0] ?? '/')).replace(/^(\.\.[/\\])+/, '');
  let file = join(DIST, clean);
  if (!file.startsWith(DIST)) return null;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  return existsSync(file) ? file : null;
}

createServer((req, res) => {
  const url = req.url ?? '/';
  const pathOnly = url.split('?')[0] ?? '/';
  if (!extname(pathOnly) && !pathOnly.endsWith('/') && resolve(`${pathOnly}/`)) {
    res.writeHead(301, { Location: `${pathOnly}/` });
    res.end();
    return;
  }
  const file = resolve(url);
  if (!file) {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] ?? 'text/html' });
    createReadStream(join(DIST, '404.html')).pipe(res);
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Serving dist/ at http://localhost:${PORT}`);
});
