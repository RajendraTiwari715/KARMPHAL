import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const babelParser = require(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../karmphal-web/node_modules/@babel/parser'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'karmphal-web/src');

const TARGET_EXTENSIONS = ['.jsx', '.js'];
const IGNORE_FILES = [
  'languageService.js', // Translation catalog itself
  'tokenStorage.js',
  'database.js',
  'apiClient.js'
];

const UI_ATTRIBUTES = new Set(['placeholder', 'title', 'alt', 'aria-label', 'ariaLabel']);
const UI_CALLS = new Set(['alert', 'confirm', 'prompt', 'toast', 'showToast', 'setError']);

// Ignore technical, CSS, URL, internal tokens
function isUserVisibleText(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  // Ignore pure symbols, punctuation, or numbers
  if (/^[\d\s.,:;!?()[\]{}|/\\#*+=<>@&_%$-]+$/.test(trimmed)) return false;
  // Ignore URLs or file extensions
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.endsWith('.png') || trimmed.endsWith('.svg')) return false;
  // Ignore Tailwind/CSS classes
  if (/^(flex|grid|hidden|block|inline|text-|bg-|p-|m-|w-|h-|border-|rounded-|transition-|duration-|animate-)/.test(trimmed)) return false;
  // Ignore internal keys, event names, HTML tags, storage keys
  if (['karmphal', 'production', 'development', 'Bearer', 'Authorization', 'Content-Type', 'application/json', 'utf8', 'guest', 'user', 'model', 'acharya'].includes(trimmed)) return false;
  // Ignore hex colors
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return false;

  // Contains Latin words or Devanagari characters
  return /[\u0900-\u097F]|[A-Za-z]{2,}/.test(trimmed);
}

function scanFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  let ast;
  try {
    ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch {
    return [];
  }

  const findings = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    // 1. JSXText
    if (node.type === 'JSXText') {
      const val = node.value.trim();
      if (isUserVisibleText(val)) {
        findings.push({
          type: 'JSXText',
          value: val,
          line: node.loc?.start?.line || 0
        });
      }
    }

    // 2. JSXAttribute (placeholder, title, alt, aria-label)
    if (node.type === 'JSXAttribute') {
      const attrName = node.name?.name;
      if (UI_ATTRIBUTES.has(attrName)) {
        if (node.value?.type === 'StringLiteral' && isUserVisibleText(node.value.value)) {
          findings.push({
            type: `Attribute:${attrName}`,
            value: node.value.value,
            line: node.loc?.start?.line || 0
          });
        }
      }
    }

    // 3. UI Calls (toast, confirm, alert)
    if (node.type === 'CallExpression') {
      const calleeName = node.callee?.name || node.callee?.property?.name;
      if (UI_CALLS.has(calleeName)) {
        const firstArg = node.arguments?.[0];
        if (firstArg?.type === 'StringLiteral' && isUserVisibleText(firstArg.value)) {
          findings.push({
            type: `Call:${calleeName}`,
            value: firstArg.value,
            line: node.loc?.start?.line || 0
          });
        } else if (firstArg?.type === 'TemplateLiteral') {
          const raw = firstArg.quasis.map(q => q.value.raw).join(' ');
          if (isUserVisibleText(raw)) {
            findings.push({
              type: `Call:${calleeName}:TemplateLiteral`,
              value: raw,
              line: node.loc?.start?.line || 0
            });
          }
        }
      }
    }

    // Recurse into children
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'comments') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) walk(item);
      } else if (child && typeof child === 'object') {
        walk(child);
      }
    }
  }

  walk(ast);
  return findings;
}

function scanDir(dir) {
  let allFindings = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = scanDir(fullPath);
      allFindings = { ...allFindings, ...sub };
    } else if (TARGET_EXTENSIONS.includes(path.extname(entry.name))) {
      if (IGNORE_FILES.includes(entry.name)) continue;
      const findings = scanFile(fullPath);
      if (findings.length > 0) {
        const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        allFindings[relPath] = findings;
      }
    }
  }

  return allFindings;
}

export function runI18nScan() {
  const findingsByFile = scanDir(srcDir);
  let totalCount = 0;
  for (const file in findingsByFile) {
    totalCount += findingsByFile[file].length;
  }
  return { totalCount, findingsByFile };
}

// CLI Execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('=== Comprehensive i18n Untranslated Strings Scan ===\n');
  const { totalCount, findingsByFile } = runI18nScan();
  console.log(`Total Untranslated Strings Found: ${totalCount}\n`);
  console.log('Breakdown by file:');
  for (const [file, items] of Object.entries(findingsByFile)) {
    console.log(`  - ${file}: ${items.length} untranslated strings`);
  }
}
