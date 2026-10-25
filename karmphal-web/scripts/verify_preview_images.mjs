import fs from 'fs';

const PREVIEW_BASE = 'http://localhost:4173';

console.log('=== Karmphal Live Preview & Image Verification ===\n');

async function testUrl(urlPath, description) {
  const fullUrl = urlPath.startsWith('http') ? urlPath : `${PREVIEW_BASE}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
  try {
    const res = await fetch(fullUrl);
    const contentType = res.headers.get('content-type') || 'unknown';
    const contentLength = res.headers.get('content-length') || res.headers.get('content-range') || 'unknown';
    if (res.status === 200) {
      console.log(`[PASS] ${res.status} ${description} -> ${urlPath} (${contentType}, ${contentLength} bytes)`);
      return { ok: true, status: res.status, url: fullUrl };
    } else {
      console.error(`[FAIL] ${res.status} ${description} -> ${urlPath}`);
      return { ok: false, status: res.status, url: fullUrl };
    }
  } catch (err) {
    console.error(`[ERROR] ${description} -> ${urlPath}: ${err.message}`);
    return { ok: false, error: err.message, url: fullUrl };
  }
}

async function run() {
  const results = [];

  // 1. Check index.html
  console.log('--- Checking HTML and Head Assets ---');
  results.push(await testUrl('/', 'Root index.html'));
  results.push(await testUrl('/favicon.svg', 'Favicon SVG'));
  results.push(await testUrl('/app_logo.webp', 'Direct Root App Logo (OpenGraph / Apple touch)'));
  results.push(await testUrl('/guru_avatar.webp', 'Direct Root Guru Avatar'));
  results.push(await testUrl('/temple_hero.webp', 'Direct Root Temple Hero'));
  results.push(await testUrl('/vedic_ashram_bg.webp', 'Direct Root Vedic Ashram Background'));

  // 2. Read dist/index.html to extract built scripts and styles
  const distHtml = fs.readFileSync('dist/index.html', 'utf8');
  console.log('\n--- Checking Built Bundles from dist/index.html ---');
  const bundleMatches = distHtml.matchAll(/(?:src|href)="\.\/assets\/([^"]+)"/g);
  for (const match of bundleMatches) {
    const assetFile = match[1];
    results.push(await testUrl(`/assets/${assetFile}`, `Bundle asset: ${assetFile}`));
  }

  // 3. Scan dist/assets for all compiled WebP/AVIF images
  console.log('\n--- Checking Hashed Images in dist/assets ---');
  const assetFiles = fs.readdirSync('dist/assets');
  for (const file of assetFiles) {
    if (file.endsWith('.webp') || file.endsWith('.avif')) {
      results.push(await testUrl(`/assets/${file}`, `Hashed Asset: ${file}`));
    }
  }

  // 4. Verification by Screen/View
  console.log('\n--- Screen-by-Screen Image Verification Matrix ---');
  const screens = [
    {
      screen: 'Home (मुख्य पृष्ठ / GuruSection)',
      assets: [
        { path: '/assets/app_logo-W1pwBw_k.webp', desc: 'Navbar Karmphal 3D OM Logo' },
        { path: '/assets/temple_hero-DZ4dGFmS.webp', desc: 'Temple Hero Banner' },
        { path: '/assets/vedic_ashram_bg-CcT_WRO-.webp', desc: 'Vedic Ashram Page Background' }
      ]
    },
    {
      screen: 'Acharya (AI आचार्य पीठ / SanatanAIAcharya)',
      assets: [
        { path: '/assets/guru_avatar-Do15s2PZ.webp', desc: 'Guru Avatar in Chat Header' },
        { path: '/assets/guru_avatar-Do15s2PZ.webp', desc: 'Guru Avatar in Message Bubbles' }
      ]
    },
    {
      screen: 'Sadhana (दैनिक साधना, पञ्चाङ्ग व जप)',
      assets: [
        { path: '/assets/app_logo-W1pwBw_k.webp', desc: 'Navbar persistent logo' },
        { path: '/assets/vedic_ashram_bg-CcT_WRO-.webp', desc: 'Vedic Ashram Background' }
      ]
    },
    {
      screen: 'Kundali (ज्योतिष, कुण्डली, विवाह व वास्तु)',
      assets: [
        { path: '/assets/app_logo-W1pwBw_k.webp', desc: 'Navbar persistent logo' },
        { path: '/assets/vedic_ashram_bg-CcT_WRO-.webp', desc: 'Vedic Ashram Background' }
      ]
    },
    {
      screen: 'Library (ज्ञान निधि / Canonical Scriptures & Sacred Books)',
      assets: [
        { path: '/assets/app_logo-W1pwBw_k.webp', desc: 'Navbar persistent logo' },
        { path: '/assets/vedic_ashram_bg-CcT_WRO-.webp', desc: 'Vedic Ashram Background' }
      ]
    },
    {
      screen: 'Profile Modal (साधक प्रोफाइल व पुण्य लेजर)',
      assets: [
        { path: '/assets/app_logo-W1pwBw_k.webp', desc: 'Navbar persistent logo' }
      ]
    },
    {
      screen: 'Settings Modal (सेटिंग्स व प्राथमिकताएं)',
      assets: [
        { path: '/assets/app_logo-W1pwBw_k.webp', desc: 'Navbar persistent logo' }
      ]
    }
  ];

  for (const s of screens) {
    console.log(`\nScreen: ${s.screen}`);
    for (const a of s.assets) {
      const res = await testUrl(a.path, a.desc);
      results.push(res);
    }
  }

  // Summary
  const failed = results.filter(r => !r.ok);
  console.log('\n==============================================');
  console.log(`TOTAL REQUESTS TESTED: ${results.length}`);
  console.log(`FAILED / 404 REQUESTS: ${failed.length}`);
  console.log('==============================================\n');

  if (failed.length > 0) {
    console.error('❌ FAILED REQUESTS DETECTED:');
    failed.forEach(f => console.error(`  - ${f.url} (Status: ${f.status || f.error})`));
    process.exit(1);
  } else {
    console.log('🎉 100% SUCCESS: ZERO 404s, ALL IMAGES LOAD CLEANLY ACROSS ALL SCREENS!');
    process.exit(0);
  }
}

run();
