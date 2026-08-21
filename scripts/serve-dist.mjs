import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT ?? 8080);
const root = join(process.cwd(), 'dist', 'orbit', 'browser');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

if (!existsSync(join(root, 'index.html'))) {
  console.error('No existe el build. Ejecuta primero: pnpm build');
  process.exit(1);
}

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${request.headers.host}`).pathname);
  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  let filePath = join(root, safePath);

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, 'index.html');
  }

  response.writeHead(200, {
    'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600',
    'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`ORBIT listo en http://127.0.0.1:${port}`);
  console.log('Presiona Ctrl+C para detenerlo.');
});
