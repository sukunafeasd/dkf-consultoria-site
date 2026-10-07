import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };
const port = Number(process.argv[2] || 5196);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Porta local invalida.');
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'POST' && path === '/api/event') { req.resume(); res.writeHead(204).end(); return; }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const name = path === '/' ? 'index.html' : decodeURIComponent(path.slice(1));
    const file = resolve(root, extname(name) ? name : `${name}.html`);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || !types[extname(file)] || name.split('/').some(part => part.startsWith('.'))) {
      res.writeHead(404).end(); return;
    }
    for (const { key, value } of config.headers[0].headers) {
      if (key === 'Content-Security-Policy') res.setHeader(key, value.replace("form-action 'self' https://formspree.io", "form-action 'none'"));
      else res.setHeader(key, value);
    }
    res.setHeader('Content-Type', types[extname(file)]);
    res.setHeader('Cache-Control', 'no-store');
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Previa somente local: http://127.0.0.1:${port}/ (formularios externos bloqueados)`));
