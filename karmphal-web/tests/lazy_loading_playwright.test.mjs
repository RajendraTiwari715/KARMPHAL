import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('ERROR: dist directory not found. Please run npm run build first.');
  process.exit(1);
}

// Simple static HTTP server for dist
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  const filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback
    const indexPath = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Preview server running at ${baseUrl}`);

  let browser;
  try {
    // Launch system chromium (Edge on Windows)
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const jsRequests = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.endsWith('.js') || url.endsWith('.mjs') || url.includes('.js?') || url.includes('.mjs?')) {
        jsRequests.push(url);
      }
    });

    console.log('\n--- Navigating to Home Page ---');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log(`\nLogged ${jsRequests.length} JavaScript network requests on first load of Home:`);
    jsRequests.forEach((url, i) => {
      console.log(`  [${i + 1}] ${url.replace(baseUrl, '')}`);
    });

    // Check prohibited chunks
    const prohibitedKeywords = [
      { name: 'pdfjs', match: /pdf\.worker|pdfjs|vendor-pdfjs/i },
      { name: 'jspdf', match: /jspdf/i },
      { name: 'html2canvas', match: /html2canvas/i },
      { name: 'vendor-pdf', match: /vendor-pdf-/i },
      { name: 'react-markdown', match: /react-markdown|vendor-markdown|AcharyaMarkdown/i }
    ];

    const violations = [];
    for (const req of jsRequests) {
      for (const p of prohibitedKeywords) {
        if (p.match.test(req)) {
          violations.push(`Violation: ${p.name} was loaded on initial Home page load! URL: ${req}`);
        }
      }
    }

    if (violations.length > 0) {
      console.error('\n❌ LAZY LOADING PROOF FAILED:');
      violations.forEach(v => console.error(v));
      process.exitCode = 1;
    } else {
      console.log('\n✅ LAZY LOADING PROOF PASSED:');
      console.log('  ✓ pdfjs / pdf.worker NOT loaded on initial Home load');
      console.log('  ✓ react-markdown / AcharyaMarkdown NOT loaded on initial Home load');
      console.log('  ✓ jspdf NOT loaded on initial Home load');
      console.log('  ✓ html2canvas / vendor-pdf NOT loaded on initial Home load');
    }

  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
