import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runI18nScan } from './scan-i18n.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const baselineFile = path.resolve(rootDir, 'tests/i18n-baseline.json');

const { totalCount, findingsByFile } = runI18nScan();

const counts = {};
for (const [file, items] of Object.entries(findingsByFile)) {
  counts[file] = items.length;
}

const baseline = {
  version: 1,
  totalCount,
  filesCount: Object.keys(counts).length,
  perFileCounts: counts
};

fs.mkdirSync(path.dirname(baselineFile), { recursive: true });
fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2) + '\n', 'utf8');

console.log(`Generated ${baselineFile} with totalCount: ${totalCount} across ${baseline.filesCount} files.`);
