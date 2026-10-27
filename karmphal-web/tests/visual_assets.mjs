import { preview } from 'vite';
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(projectRoot, '..');
const screenshotsDir = path.resolve(repoRoot, 'docs/screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runVisualAssetsAndA11y() {
  console.log('=== Karmphal Visual Assets & Accessibility Verification ===');
  console.log('Screenshots Directory:', screenshotsDir);

  // 1. Start Vite preview server
  const server = await preview({
    root: projectRoot,
    preview: {
      port: 4173,
      host: '127.0.0.1'
    }
  });

  const serverUrl = 'http://127.0.0.1:4173';
  console.log(`Vite preview running at ${serverUrl}`);

  // 2. Launch Browser via Playwright (tries system Chrome first, falls back to chromium for CI)
  let browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true
    });
  } catch {
    browser = await chromium.launch({
      headless: true
    });
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  const failedRequests = [];
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    // Only track assets and local static files (ignore backend proxy endpoints if backend not running)
    if (url.startsWith(serverUrl) && !url.includes('/api/') && status >= 400) {
      failedRequests.push({ url, status });
    }
  });

  const a11yReports = {};
  const brokenImages = [];

  async function checkImages(screenName) {
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }));
    });

    console.log(`  [${screenName}] Verified ${images.length} <img> elements.`);
    for (const img of images) {
      if (!img.complete || img.naturalWidth === 0) {
        brokenImages.push({ screen: screenName, ...img });
      }
    }
  }

  async function runAxe(screenName) {
    await page.addScriptTag({ path: axePath });
    const results = await page.evaluate(async () => {
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      });
    });

    const violations = results.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length
    }));
    a11yReports[screenName] = violations;
    console.log(`  [${screenName}] Axe-core violations: ${violations.length}`);
    if (violations.length > 0) {
      violations.forEach(v => {
        console.log(`    - [${v.impact}] ${v.id}: ${v.description} (${v.nodes} nodes)`);
      });
    }
  }

  try {
    // SCREEN 1: Home
    console.log('\n1. Loading Home Screen...');
    await page.goto(`${serverUrl}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await checkImages('Home');
    await page.screenshot({ path: path.join(screenshotsDir, 'home.png'), fullPage: false });
    await runAxe('Home');

    // SCREEN 2: Acharya
    console.log('\n2. Navigating to Acharya Chat...');
    await page.evaluate(() => {
      window.scrollTo({ top: 350, behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    await checkImages('Acharya');
    await page.screenshot({ path: path.join(screenshotsDir, 'acharya.png'), fullPage: false });
    await runAxe('Acharya');

    // Reset scroll
    await page.evaluate(() => window.scrollTo(0, 0));

    // SCREEN 3: Sadhana
    console.log('\n3. Loading Sadhana Screen...');
    await page.click('button:has-text("साधना")');
    await page.waitForTimeout(800);
    await checkImages('Sadhana');
    await page.screenshot({ path: path.join(screenshotsDir, 'sadhana.png'), fullPage: false });
    await runAxe('Sadhana');

    // SCREEN 4: Kundali
    console.log('\n4. Loading Kundali Screen...');
    await page.click('button:has-text("ज्योतिष")');
    await page.waitForTimeout(600);
    await page.click('text="२. जन्म कुण्डली एवं जीवन चक्र"');
    await page.waitForTimeout(800);
    await checkImages('Kundali');
    await page.screenshot({ path: path.join(screenshotsDir, 'kundali.png'), fullPage: false });
    await runAxe('Kundali');

    // SCREEN 5: Library (Gyan)
    console.log('\n5. Loading Library Screen...');
    await page.click('button:has-text("ज्ञान")');
    await page.waitForTimeout(800);
    await checkImages('Library');
    await page.screenshot({ path: path.join(screenshotsDir, 'library.png'), fullPage: false });
    await runAxe('Library');

    // SCREEN 6: Profile Modal
    console.log('\n6. Opening Profile Modal...');
    const profileBtn = page.locator('button[aria-label*="साधक प्रोफाइल"]').first();
    await profileBtn.click();
    await page.waitForTimeout(600);
    await checkImages('Profile');
    await page.screenshot({ path: path.join(screenshotsDir, 'profile.png'), fullPage: false });
    await runAxe('Profile');

    // Close Profile Modal
    const closeBtn = page.locator('button[aria-label*="पटल बंद करें"]').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(400);

    // SCREEN 7: Settings Modal
    console.log('\n7. Opening Settings Modal...');
    const settingsBtn = page.locator('button[aria-label*="विन्यास एवं सेटिंग्स"]').first();
    await settingsBtn.click();
    await page.waitForTimeout(600);
    await checkImages('Settings');
    await page.screenshot({ path: path.join(screenshotsDir, 'settings.png'), fullPage: false });
    await runAxe('Settings');

    // Close Settings Modal
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }

  } finally {
    await browser.close();
    server.httpServer.close();
  }

  console.log('\n=== Summary of Results ===');
  console.log(`Failed HTTP requests (404/500): ${failedRequests.length}`);
  if (failedRequests.length > 0) {
    console.error('❌ Failed Requests:');
    failedRequests.forEach(r => console.error(`  - [${r.status}] ${r.url}`));
  }

  console.log(`Broken Images (naturalWidth === 0): ${brokenImages.length}`);
  if (brokenImages.length > 0) {
    console.error('❌ Broken Images:');
    brokenImages.forEach(img => console.error(`  - [${img.screen}] ${img.src} (alt: ${img.alt})`));
  }

  const screenshotsSaved = fs.readdirSync(screenshotsDir);
  console.log(`Saved Screenshots (${screenshotsSaved.length}):`, screenshotsSaved.join(', '));

  // Count critical a11y violations
  let criticalA11yCount = 0;
  for (const screen in a11yReports) {
    const criticals = a11yReports[screen].filter(v => v.impact === 'critical' || v.impact === 'serious');
    criticalA11yCount += criticals.length;
  }
  console.log(`Critical/Serious A11y Violations: ${criticalA11yCount}`);

  if (failedRequests.length > 0 || brokenImages.length > 0) {
    console.error('❌ Test failed due to 404s or broken images.');
    process.exit(1);
  }

  console.log('\n✅ All 7 screens loaded with 0 HTTP 404s, 0 broken images, and screenshots captured!');
}

runVisualAssetsAndA11y().catch((err) => {
  console.error('❌ Error executing visual assets test:', err);
  process.exit(1);
});
