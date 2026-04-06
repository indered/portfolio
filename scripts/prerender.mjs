/**
 * Prerender script - generates static HTML for each route at build time.
 * Starts a local server from the built dist, visits each route with Playwright,
 * waits for SEO meta tags to update, then saves the rendered HTML.
 */

let chromium;
try {
  chromium = (await import('playwright')).chromium;
} catch {
  console.log('Playwright not available, skipping prerender.');
  process.exit(0);
}
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'client', 'dist');
const PORT = 4567;

const ROUTES = [
  { path: '/', file: 'index.html' },
  { path: '/architect', file: 'architect/index.html' },
  { path: '/runner', file: 'runner/index.html' },
  { path: '/ventures', file: 'ventures/index.html' },
  { path: '/connect', file: 'connect/index.html' },
  { path: '/thoughts', file: 'thoughts/index.html' },
  { path: '/about', file: 'about/index.html' },
  { path: '/brand', file: 'brand/index.html' },
  { path: '/stats', file: 'stats/index.html' },
  { path: '/live', file: 'live/index.html' },
];

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

// Simple static server that serves dist/ with SPA fallback
function startServer() {
  const indexHtml = readFileSync(join(DIST, 'index.html'), 'utf-8');

  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = req.url.split('?')[0];
      const filePath = join(DIST, url);

      if (existsSync(filePath) && !filePath.endsWith('/')) {
        const ext = extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(readFileSync(filePath));
      } else {
        // SPA fallback
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexHtml);
      }
    });

    server.listen(PORT, () => {
      console.log(`Static server on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function prerender() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (const route of ROUTES) {
    const page = await context.newPage();
    console.log(`Prerendering ${route.path}...`);

    await page.goto(`http://localhost:${PORT}${route.path}`, {
      waitUntil: 'load',
      timeout: 15000,
    });
    // Wait for React to hydrate and useSEO to fire
    await page.waitForTimeout(5000);

    const html = await page.content();
    const filePath = join(DIST, route.file);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, html, 'utf-8');
    console.log(`  Saved ${route.file} (${(html.length / 1024).toFixed(1)}KB)`);

    await page.close();
  }

  await browser.close();
  server.close();
  console.log('\nPrerendering complete.');
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
