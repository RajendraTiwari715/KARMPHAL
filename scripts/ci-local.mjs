import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const steps = [
  {
    name: 'Audit Root Dependencies (High & Critical Severity)',
    cmd: 'npm audit --audit-level=high',
    cwd: ROOT
  },
  {
    name: 'Audit Backend Dependencies (High & Critical Severity)',
    cmd: 'npm audit --audit-level=high',
    cwd: path.join(ROOT, 'karmphal-backend')
  },
  {
    name: 'Audit Frontend Dependencies (High & Critical Severity)',
    cmd: 'npm audit --audit-level=high',
    cwd: path.join(ROOT, 'karmphal-web')
  },
  {
    name: 'Secret Scan & Gitleaks Policy Verification',
    cmd: 'node scripts/secret_scan.mjs',
    cwd: ROOT
  },
  {
    name: 'Oxlint Backend Codebase (--deny-warnings)',
    cmd: 'npx oxlint --deny-warnings',
    cwd: path.join(ROOT, 'karmphal-backend')
  },
  {
    name: 'Oxlint Frontend Codebase (--deny-warnings)',
    cmd: 'npx oxlint --deny-warnings',
    cwd: path.join(ROOT, 'karmphal-web')
  },
  {
    name: 'Asset Integrity Verification (check:assets)',
    cmd: 'npm run check:assets',
    cwd: path.join(ROOT, 'karmphal-web')
  },
  {
    name: 'Backend Test Suite & Coverage Thresholds (Mocked Gemini)',
    cmd: 'npm run test:coverage',
    cwd: path.join(ROOT, 'karmphal-backend')
  },
  {
    name: 'Frontend Test Suite & Coverage Thresholds (Vitest + RTL)',
    cmd: 'npm run test:coverage',
    cwd: path.join(ROOT, 'karmphal-web')
  },
  {
    name: 'Frontend Production Build (vite build)',
    cmd: 'npm run build',
    cwd: path.join(ROOT, 'karmphal-web')
  },
  {
    name: 'Bundle Size Budget Limits Check',
    cmd: 'node scripts/check-bundle-size.mjs',
    cwd: ROOT
  }
];

console.log('================================================================');
console.log('🚀 RUNNING LOCAL FULL CI PIPELINE EMULATION');
console.log('================================================================\n');

const startTime = Date.now();
let passed = 0;

for (let i = 0; i < steps.length; i++) {
  const step = steps[i];
  console.log(`\n----------------------------------------------------------------`);
  console.log(`[Step ${i + 1}/${steps.length}] ${step.name}`);
  console.log(`Command: ${step.cmd} (cwd: ${path.relative(ROOT, step.cwd) || '.'})`);
  console.log(`----------------------------------------------------------------`);

  const stepStart = Date.now();
  try {
    execSync(step.cmd, {
      cwd: step.cwd,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true', FORCE_COLOR: '1' }
    });
    const stepDuration = ((Date.now() - stepStart) / 1000).toFixed(2);
    console.log(`✅ [Step ${i + 1}] PASSED (${stepDuration}s)`);
    passed++;
  } catch (error) {
    const stepDuration = ((Date.now() - stepStart) / 1000).toFixed(2);
    console.error(`\n❌ [Step ${i + 1}] FAILED (${stepDuration}s)`);
    console.error(`Command failed with status ${error.status}`);
    process.exit(1);
  }
}

const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
console.log('\n================================================================');
console.log(`🎉 ALL ${passed}/${steps.length} CI PIPELINE STEPS PASSED SUCCESSFULLY!`);
console.log(`Total Pipeline Execution Time: ${totalDuration}s`);
console.log('================================================================\n');
process.exit(0);
