# Karmphal-Web Resilience, Purity & Accessibility Report

This report outlines the structural enhancements made to **karmphal-web** to ensure resilience, zero linter warnings, accessibility compliance, complete offline autonomy, and fair sadhana evaluation.

---

## 1. ErrorBoundary & Crash Isolation (Section-Level Resilience)
- **Component**: [`ErrorBoundary.jsx`](./karmphal-web/src/components/ErrorBoundary.jsx)
- **Spiritual Theming**:
  - Vedic background `#140B06` with gold border `#C58B4E`/40 and ॐ emblem medallion.
  - Bilingual & Trilingual headers:
    - Hindi: *"ॐ शान्ति - कुछ त्रुटि हुई"*
    - English: *"Om Shanti - An Unexpected Issue Occurred"*
    - Sanskrit: *"ॐ शान्तिः - काचित् त्रुटिः सञ्जाता"*
  - Dual action controls: *"पुनः प्रयास करें"* (Retry / Refresh) and *"मुख्य पृष्ठ (होम)"* (Go Home).
- **Architecture**:
  - Root Wrap: [`main.jsx`](./karmphal-web/src/main.jsx) wraps `<App />` with `<ErrorBoundary isGlobal>`.
  - Section Isolation: [`App.jsx`](./karmphal-web/src/App.jsx) wraps each major section (`guru`, `gyan`, `sadhana`, `jyotish`, `karma`) in its own dedicated `<ErrorBoundary section="...">`.
  - **Result**: A crash or render throw in one section isolates the error to that specific tab, preserving the top navigation bar, bottom tabs, audio engine, and all other sections without a blank white screen.
- **Global Error & Unhandled Rejection Listeners**:
  - `window.addEventListener('error', ...)` and `window.addEventListener('unhandledrejection', ...)` dispatch custom toasts (`karmphal:toast`) to notify the user cleanly without interrupting execution.
- **Verification**:
  - Live browser testing via automated subagent verified `?forceCrash=guru` renders the isolated card and preserves the navigation bar.
  - Automated unit test suite [`error_boundary.test.jsx`](./karmphal-web/tests/error_boundary.test.jsx) verified state derivation and fallback rendering across all 5 sections.

---

## 2. Oxlint 0 Warnings (Zero Disabled Rules)
- **Repo-wide Verification**: `npx oxlint --deny-warnings` executed at the repository root across 98 files:
  ```text
  Found 0 warnings and 0 errors.
  Finished in 193ms on 98 files using 8 threads.
  ```
- **Structural Fixes Applied**:
  1. `react/purity` (`new Date()` during render):
     - Converted in [`PanchangView.jsx`](./karmphal-web/src/components/AstrologicalCore/PanchangView.jsx), [`KundaliView.jsx`](./karmphal-web/src/components/AstrologicalCore/KundaliView.jsx), and [`KundaliPrintReport.jsx`](./karmphal-web/src/components/AstrologicalCore/KundaliPrintReport.jsx) to pure lazy state initializers: `const [now] = useState(() => new Date());`.
  2. `react-hooks/rules-of-hooks`:
     - Re-ordered hook declarations in `KundaliPrintReport.jsx` to precede all early conditional returns.
  3. `react/set-state-in-effect`:
     - In [`ProfileModal.jsx`](./karmphal-web/src/components/ProfileModal.jsx), [`GyanSection.jsx`](./karmphal-web/src/sections/GyanSection.jsx), and [`App.jsx`](./karmphal-web/src/App.jsx), converted synchronous `setState` in `useEffect` into derived state or lazy initializers.
  4. `no-unused-vars`:
     - Cleaned up unused imports across components.

---

## 3. Loading, Empty, and Error States (Offline Resilience)
- **Acharya Chat ([`SanatanAIAcharya.jsx`](./karmphal-web/src/components/TheologicalChatbot/SanatanAIAcharya.jsx))**:
  - Implemented offline guard: checks `navigator.onLine`.
  - When offline or disconnected, dispatches a clean warning toast and **retains the user's typed question** in `inputQuery` without discarding it.
- **E-Library & Curated Texts ([`GyanSection.jsx`](./karmphal-web/src/sections/GyanSection.jsx))**:
  - **Loading State**: 6-card pulsing glass skeleton while loading catalog or local storage books.
  - **Empty State**: Vedic empty slate with search term feedback and a *"फ़िल्टर हटाएं / रीसेट करें"* (Reset filters) button.
  - **Error State**: Dedicated retry card (*"ग्रंथ सूची लोड करने में बाधा"* + *"पुनः प्रयास करें"* button).
- **Kundali & Panchang**:
  - **Loading Skeleton**: Shimmering astrological prediction skeleton during AI chart synthesis.
  - **100% Offline Autonomy**: Mathematical ephemeris computation runs entirely offline in pure JavaScript ([`ephemerisEngine.js`](./karmphal-web/src/services/ephemerisEngine.js)).
- **Digital Japa Mala**:
  - Operates 100% offline using Web Audio API synthesized frequencies and local offline sadhana sync queues.

---

## 4. Internationalization (i18n) Dynamic Switching
- **Unlocked Core Service ([`languageService.js`](./karmphal-web/src/services/languageService.js))**:
  - Lifted the static lock: `setLang` now saves to `localStorage` (`karmphal_lang`), notifies registered subscribers, and dispatches a window event (`karmphal_language_changed`).
  - Added React hook `useTranslation()` for components to automatically re-render upon language changes.
- **Universal Localizations Supported**:
  - Hindi (`hi`), English (`en`), Sanskrit (`sa`).
- **Comprehensive Coverage**:
  - Navigation labels, headers, and tooltips.
  - Profile & Settings dialogs.
  - System toast notifications and error messages.
  - [`KundaliPrintReport.jsx`](./karmphal-web/src/components/AstrologicalCore/KundaliPrintReport.jsx) prints translated titles, sections, and tables based on active language.
  - [`ErrorBoundary.jsx`](./karmphal-web/src/components/ErrorBoundary.jsx) fallbacks dynamically adapt to the active language.

---

## 5. Fair Anti-Cheat Japa Evaluation
- **Service**: [`japaAntiCheat.js`](./karmphal-web/src/services/japaAntiCheat.js)
- **Multi-Signal Conjunction Algorithm**:
  - **Steady Human Rhythms**: Real sadhaks chanting with a very consistent rhythm (e.g. stdDev between 4ms and 15ms) are **never blocked or flagged as bots**.
  - **Conjunction Signals for Bot Detection**:
    1. *Impossible Speed*: Inter-tap intervals < 150ms.
    2. *Inhuman Constant Intervals*: Inter-tap interval variance <= 2ms across 15+ consecutive taps.
    3. *Zero Pointer Movement Variance*: Auto-clickers firing on the exact same pixel $(X, Y)$ with 0 jitter.
  - **Soft Guidance (Non-Blocking)**: Chanters who tap briskly (300ms–380ms) receive a gentle notification (*"साधना में एकाग्रता बनाए रखें: गति मन्द करें"* / *"Slow down gently"*) while their bead count is still fully counted.
- **Unit Test Suite ([`japa_anti_cheat.test.js`](./karmphal-web/tests/japa_anti_cheat.test.js))**:
  - Verified 4 scenarios: Steady human chanter, auto-clicker bot pattern, impossible speed (<150ms), and brisk human chanter. All 4 tests passed.

---

## 6. Accessibility & WCAG Compliance
- **Aria-Labels**:
  - All icon buttons in [`DigitalJapaMala.jsx`](./karmphal-web/src/components/SadhanaGamification/DigitalJapaMala.jsx), [`ProfileModal.jsx`](./karmphal-web/src/components/ProfileModal.jsx), [`LocationPickerModal.jsx`](./karmphal-web/src/components/LocationPickerModal.jsx), and [`Navbar.jsx`](./karmphal-web/src/components/Navbar.jsx) have explicit, descriptive labels.
- **Modal Focus Management & Keyboard Navigation**:
  - Added global `Escape` key listeners to dismiss modals.
  - Modals feature proper `role="dialog"` and `aria-modal="true"` tags.
- **Contrast Ratios**:
  - Body text `#FEF3E2` on `#0C0603` background achieves a contrast ratio of **18.2:1**, well exceeding the WCAG AA minimum of **4.5:1**.
- **Reduced Motion Support**:
  - Configured `@media (prefers-reduced-motion: reduce)` in [`index.css`](./karmphal-web/src/index.css) to disable non-essential animations for users with vestibular sensitivities.

---

## 7. aiEngine Purge & Documentation Alignment
- **Codebase Cleanliness**:
  - Renamed `theologicalAIEngine.js` to [`theologicalEngine.js`](./karmphal-web/src/services/theologicalEngine.js) and purged all residual references.
  - Confirmed via `git grep -i "aiEngine"` and ripgrep search that `aiEngine` does not exist anywhere in the repository.
- **Updated Documentation**:
  - [`README.md`](./README.md) and [`DEPLOYMENT.md`](./DEPLOYMENT.md) accurately describe the production architecture:
    - Backend Express + better-sqlite3 with WAL mode, single-flight JWT refresh token rotation, Zod validation, and AI rate limiting.
    - Frontend Vite + React 19 SPA with Capacitor 8 Android deployment.
    - Documented automated backup (`npm run backup`) and restore procedures.

---

## 8. Device-Bound Storage Notice & Export/Import Data
- **Device Storage Transparency**:
  - In Settings/About ([`ProfileModal.jsx`](./karmphal-web/src/components/ProfileModal.jsx)), added an explicit note:
    > *"यह ऐप आपके साधक डेटा को सुरक्षित रूप से इसी डिवाइस में संग्रहीत करता है। अन्य डिवाइस में स्थानांतरण हेतु डेटा का निर्यात करें।"*
- **Data Export & Import Utility ([`storageService.js`](./karmphal-web/src/services/storageService.js))**:
  - **Export**: `exportAllData()` generates and downloads a structured `karmphal-data-backup-YYYY-MM-DD.json` file including user profile, sadhana logs, e-library preferences, and karma entries.
  - **Import**: `importAllData(jsonStr)` validates, parses, and restores user records to local storage with immediate reload.
  - Added accessible action buttons in the Settings dialog: *"डेटा निर्यात (Export JSON)"* and *"डेटा आयात (Import JSON)"*.
