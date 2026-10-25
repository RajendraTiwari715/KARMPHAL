import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve('.');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const INDEX_HTML = path.join(PROJECT_ROOT, 'index.html');

console.log('=== Karmphal Asset Integrity Check ===\n');

function walkDir(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === 'node_modules' || item === '.git' || item === 'dist') continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const filesToCheck = [
  ...walkDir(SRC_DIR),
  ...(fs.existsSync(INDEX_HTML) ? [INDEX_HTML] : [])
].filter(f => {
  const ext = path.extname(f).toLowerCase();
  return ['.js', '.jsx', '.ts', '.tsx', '.html', '.css'].includes(ext);
});

const imgPattern = /(?:from\s+['"]([^'"]+\.(?:webp|avif|png|jpg|jpeg|svg))['"]|import\s+['"]([^'"]+\.(?:webp|avif|png|jpg|jpeg|svg))['"]|src\s*=\s*['"]([^'"]+\.(?:webp|avif|png|jpg|jpeg|svg))['"]|href\s*=\s*['"]([^'"]+\.(?:webp|avif|png|jpg|jpeg|svg))['"]|content\s*=\s*['"]([^'"]+\.(?:webp|avif|png|jpg|jpeg|svg))['"]|url\(\s*['"]?([^'")]+?\.(?:webp|avif|png|jpg|jpeg|svg))['"]?\s*\)|['"](\.{1,2}\/[^'"]+\.(?:webp|avif|png|jpg|jpeg|svg))['"])/gi;

let totalChecked = 0;
let errors = [];
const verifiedAssets = new Set();

for (const filePath of filesToCheck) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relSource = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');

  let match;
  while ((match = imgPattern.exec(content)) !== null) {
    const rawRef = match[1] || match[2] || match[3] || match[4] || match[5] || match[6] || match[7];
    if (!rawRef) continue;

    // Skip data URIs or HTTP/HTTPS external links
    if (rawRef.startsWith('data:') || rawRef.startsWith('http://') || rawRef.startsWith('https://')) {
      continue;
    }

    totalChecked++;
    let resolvedPath = null;
    let exists = false;

    if (rawRef.startsWith('/')) {
      // Root relative - check public/ first, then PROJECT_ROOT
      const pubPath = path.join(PUBLIC_DIR, rawRef.slice(1));
      const rootPath = path.join(PROJECT_ROOT, rawRef.slice(1));
      if (fs.existsSync(pubPath)) {
        resolvedPath = pubPath;
        exists = true;
      } else if (fs.existsSync(rootPath)) {
        resolvedPath = rootPath;
        exists = true;
      } else {
        resolvedPath = pubPath;
        exists = false;
      }
    } else {
      // Relative to containing file
      const dirOfFile = path.dirname(filePath);
      const testPath = path.resolve(dirOfFile, rawRef);
      if (fs.existsSync(testPath)) {
        resolvedPath = testPath;
        exists = true;
      } else {
        // Fallback: check if it's meant to be in public/ (e.g. from index.html "./favicon.svg")
        const testPub = path.resolve(PUBLIC_DIR, rawRef.replace(/^\.\//, ''));
        if (fs.existsSync(testPub)) {
          resolvedPath = testPub;
          exists = true;
        } else {
          resolvedPath = testPath;
          exists = false;
        }
      }
    }

    const relResolved = resolvedPath ? path.relative(PROJECT_ROOT, resolvedPath).replace(/\\/g, '/') : 'unresolved';

    if (!exists) {
      errors.push({
        source: relSource,
        reference: rawRef,
        resolvedPath: relResolved
      });
    } else {
      verifiedAssets.add(relResolved);
    }
  }
}

console.log(`Scanned ${filesToCheck.length} source files.`);
console.log(`Verified ${verifiedAssets.size} unique existing assets across ${totalChecked} references.`);

if (verifiedAssets.size > 0) {
  console.log('\nVerified assets on disk:');
  for (const asset of verifiedAssets) {
    const stat = fs.statSync(path.join(PROJECT_ROOT, asset));
    const sizeKB = (stat.size / 1024).toFixed(1);
    console.log(`  ✓ ${asset} (${sizeKB} KB)`);
  }
}

if (errors.length > 0) {
  console.error('\n❌ ASSET INTEGRITY FAILURE! Missing image assets referenced in code:');
  for (const err of errors) {
    console.error(`  - In [${err.source}]: "${err.reference}" -> target missing at [${err.resolvedPath}]`);
  }
  process.exit(1);
} else {
  console.log('\n✅ All referenced assets exist and verified successfully!\n');
  process.exit(0);
}
