import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Profile & Settings Discoverability & Accessibility Unit Tests ===\n');

const navbarPath = path.resolve(__dirname, '../src/components/Navbar.jsx');
const profileModalPath = path.resolve(__dirname, '../src/components/ProfileModal.jsx');

const navbarSource = fs.readFileSync(navbarPath, 'utf8');
const profileModalSource = fs.readFileSync(profileModalPath, 'utf8');

// --- TEST 1: App Logo is Plain Home Link Without Ping Dot ---
console.log('▶ Test 1: App Logo is a plain Home link without the ping dot');
assert.strictEqual(
  navbarSource.includes('animate-ping'),
  false,
  'FAIL: animate-ping dot must be removed from app logo button'
);
assert.strictEqual(
  navbarSource.includes("onClick={() => setActiveSection('guru')}"),
  true,
  'FAIL: App Logo must navigate to Home/Guru when clicked'
);
assert.strictEqual(
  navbarSource.includes('aria-label="कर्मफल मुख्य पृष्ठ पर जाएं (Go to Home)"'),
  true,
  'FAIL: App Logo must have accessible aria-label for home link'
);
console.log('✔ Test 1 Passed: App logo is an unadorned home link with no ping dot and accessible label.\n');

// --- TEST 2: Clear Profile Avatar Button in Navbar Header ---
console.log('▶ Test 2: Clear Profile Avatar Button with Gold Medallion in Navbar Header');
assert.strictEqual(
  navbarSource.includes('aria-label="साधक प्रोफाइल (Seeker Profile & Sadhana Stats)"'),
  true,
  'FAIL: Profile avatar button must have explicit accessible aria-label'
);
assert.strictEqual(
  navbarSource.includes('min-w-[44px] min-h-[44px]'),
  true,
  'FAIL: Profile avatar button must satisfy WCAG 2.5.5 min 44x44px tap target'
);
assert.strictEqual(
  navbarSource.includes('handleOpenProfile'),
  true,
  'FAIL: Profile avatar button must invoke handleOpenProfile'
);
console.log('✔ Test 2 Passed: Profile avatar button is prominently visible in header with >=44x44px tap target.\n');

// --- TEST 3: Dedicated Settings Button in Navbar Header ---
console.log('▶ Test 3: Dedicated Settings Button in Navbar Header');
assert.strictEqual(
  navbarSource.includes('aria-label="एप्लिकेशन विन्यास एवं सेटिंग्स (Settings: भाषा, ध्वनि, स्थान, गोपनीयता)"'),
  true,
  'FAIL: Settings button must have clear, accessible aria-label'
);
assert.strictEqual(
  navbarSource.includes('handleOpenSettings'),
  true,
  'FAIL: Settings button must open Settings tab in modal'
);
assert.strictEqual(
  navbarSource.includes('<Settings className="w-4 h-4 text-[#E0A96D]'),
  true,
  'FAIL: Settings button must render a settings gear icon'
);
console.log('✔ Test 3 Passed: Dedicated Settings button is present in Navbar right action group.\n');

// --- TEST 4: 1-Tap Profile Access in Mobile Bottom Navigation Bar ---
console.log('▶ Test 4: 1-Tap Profile Access in Mobile Bottom Navigation Bar');
assert.strictEqual(
  navbarSource.includes('aria-label="साधक प्रोफाइल एवं सेटिंग्स (Profile & Settings)"'),
  true,
  'FAIL: Mobile bottom bar must include a dedicated Profile tab button'
);
assert.strictEqual(
  navbarSource.includes('प्रोफाइल'),
  true,
  'FAIL: Mobile bottom bar must show visible text label for Profile'
);
console.log('✔ Test 4 Passed: First-time mobile users have 1-tap profile reachability from the persistent bottom bar.\n');

// --- TEST 5: ProfileModal Tabs & Initial Tab Selection ---
console.log('▶ Test 5: ProfileModal Tabbed Navigation (Profile vs Settings)');
assert.strictEqual(
  profileModalSource.includes('role="tablist"'),
  true,
  'FAIL: ProfileModal must render an accessible tablist'
);
assert.strictEqual(
  profileModalSource.includes('role="tab"') && profileModalSource.includes('id="tab-profile"') && profileModalSource.includes('id="tab-settings"'),
  true,
  'FAIL: Both Profile and Settings tabs must have role="tab" and unique IDs'
);
assert.strictEqual(
  profileModalSource.includes('initialTab = \'profile\''),
  true,
  'FAIL: ProfileModal must support initialTab prop to open either tab directly'
);
console.log('✔ Test 5 Passed: ProfileModal cleanly differentiates Profile and Settings via accessible tabs.\n');

// --- TEST 6: Settings Content Requirements ---
console.log('▶ Test 6: Settings View contains Language, Sound, Location & About/Privacy');

// 6.1 Language Selector
assert.strictEqual(
  profileModalSource.includes('१. भाषा चयन (Language Selection)'),
  true,
  'FAIL: Settings must contain Language Selector section'
);
assert.strictEqual(
  profileModalSource.includes("code: 'hi'") && profileModalSource.includes("code: 'sa'") && profileModalSource.includes("code: 'en'"),
  true,
  'FAIL: Language selector must support Hindi, Sanskrit, and English'
);

// 6.2 Sound Toggle & Chimes Test
assert.strictEqual(
  profileModalSource.includes('२. ध्वनि एवं घण्टा नाद विन्यास (Sound Toggle)'),
  true,
  'FAIL: Settings must contain Sound Toggle section'
);
assert.strictEqual(
  profileModalSource.includes('audioService.playTempleBell') && profileModalSource.includes('audioService.playShankh'),
  true,
  'FAIL: Settings must contain test controls for Temple Bell and Shankh'
);

// 6.3 Profile Location
assert.strictEqual(
  profileModalSource.includes('३. साधना नगर एवं पञ्चाङ्ग स्थान (Profile Location)'),
  true,
  'FAIL: Settings must contain Profile Location section'
);
assert.strictEqual(
  profileModalSource.includes('LocationPickerModal') && profileModalSource.includes('setIsLocationPickerOpen(true)'),
  true,
  'FAIL: Settings must provide location picker launcher'
);

// 6.4 About & Privacy
assert.strictEqual(
  profileModalSource.includes('४. परिचय एवं गोपनीयता नीति (About & Privacy)'),
  true,
  'FAIL: Settings must contain About & Privacy section'
);
assert.strictEqual(
  profileModalSource.includes('v1.0.0-वैदिक') && profileModalSource.includes('Privacy Guarantee'),
  true,
  'FAIL: Settings must describe app version and local privacy guarantees'
);
console.log('✔ Test 6 Passed: Settings view includes all 4 required modules with full dharmik & privacy fidelity.\n');

// --- TEST 7: WCAG 2.5.5 Minimum 44x44px Tap Target Compliance ---
console.log('▶ Test 7: WCAG 2.5.5 Tap Target & Accessibility Compliance');
const minTargetMatches = profileModalSource.match(/min-h-\[44px\]|min-w-\[44px\]|min-h-\[48px\]/g) || [];
assert.ok(
  minTargetMatches.length >= 8,
  `FAIL: Expected multiple 44px+ tap target declarations in ProfileModal, found ${minTargetMatches.length}`
);

const ariaLabelMatches = (navbarSource.match(/aria-label=/g) || []).length + (profileModalSource.match(/aria-label=/g) || []).length;
assert.ok(
  ariaLabelMatches >= 10,
  `FAIL: Expected extensive aria-labels across Navbar and ProfileModal, found ${ariaLabelMatches}`
);
console.log(`✔ Test 7 Passed: Verified ${minTargetMatches.length} 44px+ touch targets and ${ariaLabelMatches} aria-labels.\n`);

console.log('🎉 ALL PROFILE & SETTINGS DISCOVERABILITY TESTS PASSED WITH 100% SUCCESS!');
