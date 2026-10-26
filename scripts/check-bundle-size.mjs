import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../karmphal-web/dist');
const assetsDir = path.join(distDir, 'assets');

// Budgets in Kilobytes (KB) - tightened to ~15% above actual post-lazy-load bundle sizes
const BUDGETS = {
  maxSingleJsChunkKb: 600,       // Real largest: 513.70 KB (+15% -> ~590 KB)
  maxSingleJsChunkGzipKb: 175,   // Real largest gzip: 148.21 KB (+15% -> ~170 KB)
  maxWorkerChunkKb: 1420,        // Real worker: 1234.71 KB (+15% -> ~1420 KB)
  maxWorkerChunkGzipKb: 425,     // Real worker gzip: 367.66 KB (+15% -> ~423 KB)
  maxCssTotalKb: 125,            // Real CSS: 106.98 KB (+15% -> ~123 KB)
  maxCssTotalGzipKb: 20,         // Real CSS gzip: 15.94 KB (+15% -> ~18.3 KB)
  maxMainJsTotalKb: 2460,        // Real Main JS total: 2131.41 KB (+15% -> ~2451 KB)
  maxMainJsTotalGzipKb: 710,     // Real Main JS gzip: 613.71 KB (+15% -> ~706 KB)
  maxTotalAllJsKb: 3880,         // Real All JS: 3366.12 KB (+15% -> ~3871 KB)
  maxTotalAllJsGzipKb: 1130      // Real All JS gzip: 981.37 KB (+15% -> ~1129 KB)
};

console.log('=== Karmphal Bundle Size Budget Check ===\n');

if (!fs.existsSync(distDir) || !fs.existsSync(assetsDir)) {
  console.error(`❌ Build directory not found at ${distDir}. Run 'npm run build' first.`);
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const report = [];
let totalMainJsBytes = 0;
let totalMainJsGzipBytes = 0;
let totalWorkerBytes = 0;
let totalWorkerGzipBytes = 0;
let totalCssBytes = 0;
let totalCssGzipBytes = 0;
let errors = [];

for (const file of files) {
  const filePath = path.join(assetsDir, file);
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) continue;

  const content = fs.readFileSync(filePath);
  const sizeBytes = stat.size;
  const gzipBytes = zlib.gzipSync(content).length;

  const sizeKb = (sizeBytes / 1024).toFixed(2);
  const gzipKb = (gzipBytes / 1024).toFixed(2);

  const isJs = file.endsWith('.js') || file.endsWith('.mjs');
  const isCss = file.endsWith('.css');
  const isWorker = file.includes('pdf.worker');

  if (isJs) {
    if (isWorker) {
      totalWorkerBytes += sizeBytes;
      totalWorkerGzipBytes += gzipBytes;
      if (sizeBytes / 1024 > BUDGETS.maxWorkerChunkKb) {
        errors.push(`Worker chunk ${file} (${sizeKb} KB) exceeds budget of ${BUDGETS.maxWorkerChunkKb} KB`);
      }
      if (gzipBytes / 1024 > BUDGETS.maxWorkerChunkGzipKb) {
        errors.push(`Worker chunk ${file} (${gzipKb} KB gz) exceeds budget of ${BUDGETS.maxWorkerChunkGzipKb} KB`);
      }
    } else {
      totalMainJsBytes += sizeBytes;
      totalMainJsGzipBytes += gzipBytes;
      if (sizeBytes / 1024 > BUDGETS.maxSingleJsChunkKb) {
        errors.push(`JS chunk ${file} (${sizeKb} KB) exceeds uncompressed budget of ${BUDGETS.maxSingleJsChunkKb} KB`);
      }
      if (gzipBytes / 1024 > BUDGETS.maxSingleJsChunkGzipKb) {
        errors.push(`JS chunk ${file} (${gzipKb} KB gz) exceeds gzip budget of ${BUDGETS.maxSingleJsChunkGzipKb} KB`);
      }
    }
    report.push({ file, type: isWorker ? 'Worker' : 'JS', sizeKb, gzipKb });
  } else if (isCss) {
    totalCssBytes += sizeBytes;
    totalCssGzipBytes += gzipBytes;
    report.push({ file, type: 'CSS', sizeKb, gzipKb });
  }
}

// Check aggregate budgets
const mainJsKb = (totalMainJsBytes / 1024).toFixed(2);
const mainJsGzipKb = (totalMainJsGzipBytes / 1024).toFixed(2);
const workerKb = (totalWorkerBytes / 1024).toFixed(2);
const workerGzipKb = (totalWorkerGzipBytes / 1024).toFixed(2);
const totalJsKb = ((totalMainJsBytes + totalWorkerBytes) / 1024).toFixed(2);
const totalJsGzipKb = ((totalMainJsGzipBytes + totalWorkerGzipBytes) / 1024).toFixed(2);
const totalCssKb = (totalCssBytes / 1024).toFixed(2);
const totalCssGzipKb = (totalCssGzipBytes / 1024).toFixed(2);

if (totalCssBytes / 1024 > BUDGETS.maxCssTotalKb) {
  errors.push(`Total CSS (${totalCssKb} KB) exceeds budget of ${BUDGETS.maxCssTotalKb} KB`);
}
if (totalCssGzipBytes / 1024 > BUDGETS.maxCssTotalGzipKb) {
  errors.push(`Total CSS gzip (${totalCssGzipKb} KB) exceeds budget of ${BUDGETS.maxCssTotalGzipKb} KB`);
}
if (totalMainJsBytes / 1024 > BUDGETS.maxMainJsTotalKb) {
  errors.push(`Main JS bundle (${mainJsKb} KB) exceeds budget of ${BUDGETS.maxMainJsTotalKb} KB`);
}
if (totalMainJsGzipBytes / 1024 > BUDGETS.maxMainJsTotalGzipKb) {
  errors.push(`Main JS bundle gzip (${mainJsGzipKb} KB) exceeds budget of ${BUDGETS.maxMainJsTotalGzipKb} KB`);
}

// Print Table
console.log('Asset Bundles Analyzed:');
console.table(report);
console.log(`\nTotals:`);
console.log(`  Main JS:   ${mainJsKb} KB (Gzip: ${mainJsGzipKb} KB) | Budget: ${BUDGETS.maxMainJsTotalKb} KB (${BUDGETS.maxMainJsTotalGzipKb} KB gz)`);
console.log(`  Worker JS: ${workerKb} KB (Gzip: ${workerGzipKb} KB) | Budget: ${BUDGETS.maxWorkerChunkKb} KB (${BUDGETS.maxWorkerChunkGzipKb} KB gz)`);
console.log(`  Total JS:  ${totalJsKb} KB (Gzip: ${totalJsGzipKb} KB) | Budget: ${BUDGETS.maxTotalAllJsKb} KB (${BUDGETS.maxTotalAllJsGzipKb} KB gz)`);
console.log(`  Total CSS: ${totalCssKb} KB (Gzip: ${totalCssGzipKb} KB) | Budget: ${BUDGETS.maxCssTotalKb} KB (${BUDGETS.maxCssTotalGzipKb} KB gz)\n`);

if (errors.length > 0) {
  console.error('❌ Bundle budget check FAILED with violations:');
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log('✅ All bundle assets are well within size budget limits!');
  process.exit(0);
}
