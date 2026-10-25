import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve('.');

const PATTERNS = [
  { name: 'AIzaSy (Google API Key)', regex: /AIzaSy[A-Za-z0-9_-]{33}/g },
  { name: 'AQ. (Gemini/Vertex Token)', regex: /AQ\.[A-Za-z0-9_-]{20,}/g },
  { name: 'VITE_GEMINI (Frontend Key Exposure)', regex: /VITE_GEMINI[A-Za-z0-9_]*\s*=\s*['"]?[A-Za-z0-9_.-]+['"]?/g },
  { name: 'sk- (OpenAI/Third-party Secret)', regex: /sk-[A-Za-z0-9_-]{20,}/g },
  { name: 'BEGIN PRIVATE KEY (Private Key Block)', regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g },
  { name: 'Hardcoded Real JWT_SECRET', regex: /JWT_SECRET\s*[:=]\s*['"](?!your_jwt_secret|placeholder|min_32|test-mock)[^'"\r\n]{16,}['"]/g }
];

function scanFiles(fileList, label) {
  console.log(`\n======================================================`);
  console.log(`SCANNING: ${label} (${fileList.length} files)`);
  console.log(`======================================================`);

  const hits = [];

  for (const file of fileList) {
    if (file.endsWith('.db') || file.endsWith('.db-shm') || file.endsWith('.db-wal') || 
        file.endsWith('.png') || file.endsWith('.webp') || file.endsWith('.avif') || 
        file.endsWith('.jpg') || file.includes('package-lock.json')) {
      continue;
    }
    // Skip scanner script itself
    if (file.includes('secret_scan.mjs')) continue;

    const fullPath = path.resolve(ROOT, file);
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) continue;

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, lineIdx) => {
        for (const p of PATTERNS) {
          if (p.regex.test(line)) {
            hits.push({
              file: path.relative(ROOT, fullPath).replace(/\\/g, '/'),
              line: lineIdx + 1,
              pattern: p.name,
              snippet: line.trim().replace(/AQ\.[A-Za-z0-9_-]{20,}/g, 'AQ.****REDACTED')
                                  .replace(/AIzaSy[A-Za-z0-9_-]{33}/g, 'AIzaSy****REDACTED')
                                  .replace(/(JWT_SECRET\s*[:=]\s*['"])[^'"]+(['"])/g, '$1****REDACTED$2')
            });
          }
          p.regex.lastIndex = 0;
        }
      });
    } catch {}
  }

  console.log(`Hits found in ${label}: ${hits.length}`);
  hits.forEach(h => {
    console.log(`  [HIT] ${h.file}:${h.line} [${h.pattern}] -> ${h.snippet}`);
  });
  return hits;
}

// 1. Scan Tracked Working Tree (git ls-files)
const trackedFiles = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .map(f => f.trim())
  .filter(Boolean);

const trackedHits = scanFiles(trackedFiles, 'Git Tracked Working Tree');

// 2. Scan Built Distribution & Android Assets
function walk(dir) {
  let res = [];
  try {
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
      else res.push(p);
    });
  } catch {}
  return res;
}

const buildFiles = [
  ...walk('karmphal-web/dist'),
  ...walk('karmphal-web/android/app/src/main/assets')
];
const buildHits = scanFiles(buildFiles, 'Built Artifacts (dist/ & android assets)');

// 3. Scan Local Environment Files (.env)
const envFiles = ['karmphal-backend/.env', 'karmphal-web/.env', 'karmphal-backend/.env.example', 'karmphal-web/.env.example'];
const envHits = scanFiles(envFiles, 'Local Environment Files (.env on disk)');

console.log('\n======================================================');
console.log(`FINAL SUMMARY:`);
console.log(`- Tracked Working Tree Secrets: ${trackedHits.length} (Target: 0)`);
console.log(`- Built Artifacts Secrets: ${buildHits.length} (Target: 0)`);
console.log(`- Local .env Files on Disk: ${envHits.length} (Only server-side karmphal-backend/.env)`);
console.log('======================================================\n');

if (trackedHits.length > 0 || buildHits.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
