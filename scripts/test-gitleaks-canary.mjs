import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== Gitleaks CI Canary Test ===\n');

// Path to a temporary test file inside the repo to test active detection
const canaryFile = path.resolve(rootDir, 'tests_canary_leak_temp.txt');
// Dynamic concatenation avoids literal match inside the test script source itself
const fakeKey = ['AIza', 'SyFakeCanaryTestKeyForValidation999'].join('');

try {
  console.log('1. Creating canary file with synthetic AIzaSy key...');
  fs.writeFileSync(canaryFile, `const LEAK_KEY = "${fakeKey}";\n`, 'utf8');

  console.log('2. Running gitleaks dir scan...');
  const result = spawnSync('gitleaks', ['dir', '.', '--config', '.gitleaks.toml', '-v'], {
    cwd: rootDir,
    encoding: 'utf8'
  });

  const output = (result.stdout || '') + (result.stderr || '');

  // Gitleaks returns non-zero when leaks are found
  if (result.status === 0) {
    console.error('❌ FAIL: Gitleaks did NOT detect synthetic canary leak!');
    console.error(output);
    process.exit(1);
  }

  if (!output.includes('google-api-key') && !output.includes('AIzaSy')) {
    console.error('❌ FAIL: Gitleaks failed to report rule google-api-key for synthetic AIzaSy key.');
    console.error(output);
    process.exit(1);
  }

  console.log('✅ Gitleaks canary verified: fake AIzaSy... key was successfully detected and flagged by security policy.');
} finally {
  if (fs.existsSync(canaryFile)) {
    fs.unlinkSync(canaryFile);
    console.log('3. Canary temporary file cleaned up.\n');
  }
}
