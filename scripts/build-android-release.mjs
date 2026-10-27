import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const webDir = path.resolve(rootDir, 'karmphal-web');
const androidDir = path.resolve(webDir, 'android');
const assetsPublicDir = path.resolve(androidDir, 'app/src/main/assets/public');

console.log('=== Karmphal Production Android Release Build Pipeline ===\n');

// 1. Validate VITE_API_BASE_URL
const apiBaseUrl = process.env.VITE_API_BASE_URL;
if (!apiBaseUrl || !apiBaseUrl.startsWith('https://')) {
  console.error('❌ FATAL: VITE_API_BASE_URL must be non-empty and must start with https:// for production release.');
  console.error(`   Received: "${apiBaseUrl || ''}"`);
  console.error('   Usage: VITE_API_BASE_URL=https://api.karmphal.app node scripts/build-android-release.mjs');
  process.exit(1);
}
console.log(`✅ [1/7] VITE_API_BASE_URL validated: ${apiBaseUrl}`);

// 2. Derive versionCode and versionName
let versionCode = process.env.VERSION_CODE;
if (!versionCode) {
  try {
    const gitCount = execSync('git rev-list --count HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    versionCode = gitCount || '1';
  } catch (err) {
    console.warn('⚠️ Unable to query git rev-list, defaulting versionCode to 1:', err.message);
    versionCode = '1';
  }
}
const versionName = '1.0.0';
console.log(`✅ [2/7] Release version configured: versionCode=${versionCode}, versionName=${versionName}`);

// 3. Build web assets with VITE_API_BASE_URL
console.log('\n--- Building Web Production Assets ---');
execSync('npm run build', {
  cwd: webDir,
  env: { ...process.env, VITE_API_BASE_URL: apiBaseUrl },
  stdio: 'inherit'
});
console.log('✅ [3/7] Web bundle built cleanly.');

// 4. Sync web assets into Android project
console.log('\n--- Syncing Capacitor Android Assets ---');
execSync('npx cap sync android', {
  cwd: webDir,
  stdio: 'inherit'
});
console.log('✅ [4/7] Capacitor android sync complete.');

// 5. Grep API base URL inside release assets
console.log('\n--- Verifying API Base URL in Native Public Assets ---');
if (!fs.existsSync(assetsPublicDir)) {
  console.error(`❌ FATAL: Assets public directory not found at ${assetsPublicDir}`);
  process.exit(1);
}

let foundApiBaseUrl = false;
const scanAssets = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanAssets(fullPath);
    } else if (entry.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(apiBaseUrl)) {
        foundApiBaseUrl = true;
        console.log(`   Found API Base URL inside: ${path.relative(assetsPublicDir, fullPath)}`);
      }
    }
  }
};
scanAssets(assetsPublicDir);

if (!foundApiBaseUrl) {
  console.error(`❌ FATAL: API Base URL "${apiBaseUrl}" was not found embedded inside android/app/src/main/assets/public.`);
  process.exit(1);
}
console.log(`✅ [5/7] API Base URL confirmed inside native bundle assets: ${apiBaseUrl}`);

// 6. Verify Keystore security (zero keystores tracked in git)
console.log('\n--- Verifying Git Keystore Security ---');
const trackedKeystores = execSync('git ls-files "*keystore*"', { cwd: rootDir, encoding: 'utf8' }).trim();
if (trackedKeystores.length > 0) {
  console.error('❌ FATAL SECURITY VIOLATION: Keystore files are tracked in git:');
  console.error(trackedKeystores);
  process.exit(1);
}
console.log('✅ [6/7] Zero keystores or keystore.properties tracked in git repository.');

// 7. Execute Gradle Release Build
console.log('\n--- Invoking Gradle Release Build ---');
const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew';
execSync(`${gradlewCmd} assembleRelease bundleRelease -PVERSION_CODE=${versionCode} -PVERSION_NAME=${versionName}`, {
  cwd: androidDir,
  env: {
    ...process.env,
    VERSION_CODE: versionCode,
    VERSION_NAME: versionName,
    VITE_API_BASE_URL: apiBaseUrl
  },
  stdio: 'inherit'
});
console.log('✅ [7/7] Signed Release APK and AAB built successfully.');

console.log('\n======================================================');
console.log('🎉 Production Android Release Build Completed Successfully!');
console.log(`   versionCode: ${versionCode}`);
console.log(`   versionName: ${versionName}`);
console.log(`   API Base URL: ${apiBaseUrl}`);
console.log('======================================================\n');
