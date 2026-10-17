import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('site-dist');
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
createServer(async (request, response) => {
    try {
        const url = new URL(request.url, 'http://localhost');
        const path = resolve(root, `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`);
        if (!path.startsWith(root + sep)) {
            response.writeHead(403).end();
            return;
        }
        const content = await readFile(path);
        response.writeHead(200, { 'Content-Type': mimeTypes[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
        response.end(content);
    } catch {
        response.writeHead(404).end('Not found');
    }
}).listen(4173, '127.0.0.1', () => console.log('http://127.0.0.1:4173'));
