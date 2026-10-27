import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runI18nScan } from './scan-i18n.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const baselineFile = path.resolve(rootDir, 'tests/i18n-baseline.json');

if (!fs.existsSync(baselineFile)) {
  console.error(`ERROR: i18n baseline file not found at ${baselineFile}`);
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
const { totalCount, findingsByFile } = runI18nScan();

let regressions = [];

for (const [file, items] of Object.entries(findingsByFile)) {
  const allowed = baseline.perFileCounts[file] || 0;
  if (items.length > allowed) {
    regressions.push(`- ${file}: current ${items.length} exceeds baseline allowance of ${allowed} (+${items.length - allowed} new strings)`);
  }
}

if (totalCount > baseline.totalCount) {
  regressions.push(`- Total untranslated strings: ${totalCount} exceeds baseline ${baseline.totalCount} (+${totalCount - baseline.totalCount})`);
}

if (regressions.length > 0) {
  console.error('\n❌ i18n CI CHECK FAILED: Untranslated string regression detected!');
  console.error(regressions.join('\n'));
  console.error('\nNew UI strings must be added to src/services/languageService.js (hi, sa, en).');
  process.exit(1);
}

console.log(`✅ i18n CI Check Passed: ${totalCount} strings (baseline limit: ${baseline.totalCount}) across ${Object.keys(findingsByFile).length} files.`);
process.exit(0);
