# Karmphal Android Launch Readiness & Manual QA Test Checklist

> **Version**: 1.0.0 (versionCode 1)  
> **Target OS**: Android 7.0 - Android 15 (API 24 to API 36)  
> **Capacitor Engine**: Capacitor 8 (with native plugins)  
> **Build Artifacts**: Release APK (`app-release.apk`) & Release AAB (`app-release.aab`)

---

## 1. Executive Summary & Verification Matrix

This document provides complete, deterministic test procedures for verifying the production-ready Android build of **Karmphal (कर्मफल)**. Each matrix entry outlines preconditions, exact touch/hardware steps, expected system behavior, and automated vs. physical device testability.

| Test Category | Critical Validation Focus | Automated / Scripted | Physical Device Needed |
| :--- | :--- | :---: | :---: |
| **1. Hardware Back Button** | Modals -> PDF -> Previous Tab -> 2s Double-press Exit | ✅ 100% Tested in Suite | Manual Verification |
| **2. Geolocation & GPS** | Fine/Coarse permission, runtime request, graceful denial | ✅ Code + Fallback Unit | Device GPS sensor |
| **3. Camera & Kundali OCR** | Runtime camera prompt, secure photo capture, AI payload | ✅ Verified in OCR Unit | Physical Camera Sensor |
| **4. PDF Report & Share** | Scoped storage write, FileProvider content URI, Share Sheet | ✅ Verified in PDF Unit | Device Intent/App targets |
| **5. Keyboard & Input** | VisualViewport, Acharya input and send button clearance | ✅ Verified via Viewport | Touch Soft Keyboard |
| **6. Notch & Safe Areas** | `viewport-fit=cover`, `--sat`, `--sab`, top/bottom elevation | ✅ Verified in CSS/Tokens | Physical Notch/Cutout Screen |
| **7. Offline Resiliency** | Drik Ganita Panchang math, Japa Mala audio offline | ✅ Verified in Benchmark | Airplane Mode Switch |
| **8. Orientation Change** | Portrait to Landscape, state preservation | ✅ Verified in Component | Physical Rotation Sensor |
| **9. Process Death / Resume** | Background persistence, localforage restore | ✅ Storage Unit Tested | Android "Don't Keep Activities" |
| **10. Single-Flight Auth** | 401 token refresh, no stampede, seamless renewal | ✅ 100% Verified in Unit | Network Throttling |

---

## 2. Keystore Generation & Security Protocol

### Exact Production Keystore Generation Command
Execute the following command using JDK 17 `keytool` from terminal:
```bash
keytool -genkeypair -v \
  -keystore release.keystore \
  -alias karmphal \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_SECURE_STORE_PASSWORD \
  -keypass YOUR_SECURE_KEY_PASSWORD \
  -dname "CN=Karmphal, OU=Mobile, O=Karmphal, L=Varanasi, ST=Uttar Pradesh, C=IN"
```

### Critical Keystore Backup & Security Instructions
1. **Never Commit to Git**: `*.keystore`, `*.jks`, and `keystore.properties` are strictly included in `.gitignore`.
2. **Permanent Storage**: Store a backup of `release.keystore` in an offline encrypted vault (e.g., 1Password, Bitwarden, or secure cold storage). **If lost, existing Google Play Store users will be unable to update the application.**
3. **Google Play App Signing**: When enrolling in Google Play App Signing, Google securely holds the primary app signing key while this upload keystore signs the bundle sent to the console.

---

## 3. Comprehensive Manual QA Test Matrices

### 3.1 Hardware Back Button Navigation
*Objective: Guarantee deterministic hierarchy unwinding without accidental app termination.*

* **Test 3.1.1: Top-Most Modal Dismissal**
  * **Preconditions**: User is on any tab (e.g., Sadhana). Tap the Profile icon in top header or bottom bar.
  * **Action**: Press the Android physical or gesture Back button once.
  * **Expected Result**: Profile modal closes immediately. The underlying Sadhana tab remains active. The app does not exit.
  * **Device Status**: *[Can verify on emulator or physical phone]*

* **Test 3.1.2: Nested Modals (LocationPicker over Profile)**
  * **Preconditions**: Open Profile modal -> Navigate to Settings tab -> Tap "स्थान परिवर्तित करें" (Location Picker modal opens on top of Profile modal).
  * **Action**: Press Back button once.
  * **Expected Result**: The top-most Location Picker modal closes. The Profile modal remains open beneath it. Pressing Back a second time closes the Profile modal.
  * **Device Status**: *[Can verify on emulator or physical phone]*

* **Test 3.1.3: Scripture PDF Reader Dismissal**
  * **Preconditions**: Navigate to "ज्ञान" (Gyan) tab -> Tap any sacred scripture (e.g., Bhagavad Gita) to open the full-screen canvas PDF Reader.
  * **Action**: Press Back button once.
  * **Expected Result**: The PDF Reader closes cleanly and releases memory. The user is returned to the Gyan library grid. The app does not exit.
  * **Device Status**: *[Can verify on emulator or physical phone]*

* **Test 3.1.4: Sub-Module Back to Hub (Jyotish Section)**
  * **Preconditions**: Navigate to "ज्योतिष" (Jyotish) -> Tap on "जन्म कुण्डली" (Kundali) or "३६ गुण विवाह मिलन".
  * **Action**: Press Back button once.
  * **Expected Result**: Returns to the main Jyotish modules selection hub.
  * **Device Status**: *[Can verify on emulator or physical phone]*

* **Test 3.1.5: Inter-Tab Navigation History**
  * **Preconditions**: Start on Home ("गुरु"), tap "ज्ञान", then tap "साधना".
  * **Action**: Press Back button once.
  * **Expected Result**: Navigates back to "ज्ञान". Press Back again -> Navigates back to "गुरु" (Home).
  * **Device Status**: *[Can verify on emulator or physical phone]*

* **Test 3.1.6: Home Screen "Press Again to Exit" (Single Press)**
  * **Preconditions**: User is on Home ("गुरु") tab with all modals and sub-views closed.
  * **Action**: Press Back button once.
  * **Expected Result**: App does **NOT** exit. A spiritual toast appears: *"बाहर निकलने के लिए पुनः दबाएं (Press again to exit)"*.
  * **Device Status**: *[Can verify on emulator or physical phone]*

* **Test 3.1.7: Home Screen Double-Press Exit**
  * **Preconditions**: User is on Home ("गुरु") tab.
  * **Action**: Press Back button twice in rapid succession (within 2.0 seconds).
  * **Expected Result**: App executes `App.exitApp()` and minimizes/terminates cleanly.
  * **Device Status**: *[Can verify on emulator or physical phone]*

* **Test 3.1.8: Home Screen Timeout Reset**
  * **Preconditions**: User is on Home tab. Press Back once (toast appears). Wait 2.5 seconds.
  * **Action**: Press Back button again once.
  * **Expected Result**: App does **NOT** exit. The 2-second window had expired, so the toast reappears and the timer resets.
  * **Device Status**: *[Can verify on emulator or physical phone]*

---

### 3.2 Geolocation & GPS Runtime Permissions
*Objective: Verify Android 10-15 runtime permission dialogues and graceful denied fallback.*

* **Test 3.2.1: First-Time Permission Prompt**
  * **Preconditions**: Fresh installation of app. Open Location Picker modal. Tap "वर्तमान जीपीएस स्थान से स्वतः पहचानें".
  * **Action**: Android native runtime dialogue asks: *"Allow Karmphal to access this device's location?"*
  * **Expected Result**: Prompt displays *Precise* (`ACCESS_FINE_LOCATION`) and *Approximate* (`ACCESS_COARSE_LOCATION`) choices. Tap "While using the app". GPS resolves and nearest holy city/coordinates display.
  * **Device Status**: *[Requires physical device or emulator with mock location]*

* **Test 3.2.2: Graceful Denied-State UI**
  * **Preconditions**: Location Picker modal open. Tap "वर्तमान जीपीएस स्थान से स्वतः पहचानें".
  * **Action**: Tap "Don't allow" on native Android dialogue.
  * **Expected Result**: App handles refusal gracefully without crashing. A clear gold/amber alert states: *"स्थान (GPS) अनुमति अस्वीकृत कर दी गई। कृपया उपकरण सेटिंग्स में अनुमति दें अथवा नीचे दी गई सूची में से अपना नगर चुनें।"* All Indian major cities and search bar remain instantly selectable.
  * **Device Status**: *[Requires physical device or emulator]*

---

### 3.3 Camera Kundali Scan & OCR Processing
*Objective: Test privacy-by-design native camera capture for astrological chart reading.*

* **Test 3.3.1: Camera Permission Request**
  * **Preconditions**: Navigate to Jyotish -> Kundali -> Tap "कुण्डली चित्र स्कैन (OCR Camera)".
  * **Action**: Native permission prompt appears requesting camera access.
  * **Expected Result**: After granting, native camera viewfinder opens directly.
  * **Device Status**: *[Requires physical device with camera sensor]*

* **Test 3.3.2: Photo Capture & Storage Isolation**
  * **Preconditions**: Snap a picture of a handwritten or printed Kundali chart. Confirm crop/checkmark.
  * **Expected Result**: Image is saved temporarily inside app private cache (`my_cache_images`), converted to base64, and strictly NOT leaked to public user gallery. Pre-population of birth details (Date, Time, Place) executes via schema validator.
  * **Device Status**: *[Requires physical device with camera]*

---

### 3.4 Kundali PDF Generation & Native FileProvider Sharing
*Objective: Verify multi-page A4 PDF rendering and Android 10-14 Scoped Storage FileProvider.*

* **Test 3.4.1: High-Precision PDF Generation**
  * **Preconditions**: Compute any Kundali in Jyotish section. Tap "PDF प्रतिवेदन डाउनलोड / शेयर करें".
  * **Expected Result**: Offscreen 2x scaled canvas captures Page 1 (Kundali chart + Doshas) and Page 2 (Planetary degrees + Vimshottari Dasha) with crisp Noto Sans Devanagari fonts.
  * **Device Status**: *[Tested in headless unit test; verify UI smoothness on device]*

* **Test 3.4.2: Scoped Storage & Share Sheet (Android 10-14+)**
  * **Preconditions**: Trigger PDF export on Android 11, 12, 13, or 14 device.
  * **Action**: Observe system response.
  * **Expected Result**: PDF writes to `Directory.Documents` without needing deprecated `WRITE_EXTERNAL_STORAGE` permission. Android system Share Sheet appears with targets (WhatsApp, Gmail, Drive). Tap WhatsApp: the recipient opens the file without permission errors via `${applicationId}.fileprovider`.
  * **Device Status**: *[Requires physical device with sharing apps installed]*

---

### 3.5 Keyboard Overlap & VisualViewport Input Clearance
*Objective: Ensure soft keyboard never occludes the Acharya chat input or Send button.*

* **Test 3.5.1: Small Phone Display (e.g. 5.0" - 5.5", 360x640 dp)**
  * **Preconditions**: Open Home tab ("गुरु") on a small screen device.
  * **Action**: Tap inside "आचार्य जी से कोई भी प्रश्न पूछें..." input box.
  * **Expected Result**: Android soft keyboard opens. With `windowSoftInputMode="adjustResize"` and Capacitor `Keyboard.setResizeMode({ mode: "body" })`, the webview resizes above the keyboard. The input box and the gold Send button remain completely visible and clickable above the keyboard.
  * **Device Status**: *[Requires physical device or small-screen emulator]*

* **Test 3.5.2: Send Message with Keyboard Open**
  * **Preconditions**: Type *"कर्म फल क्या है?"* with keyboard visible.
  * **Action**: Tap Send button directly while keyboard remains on screen.
  * **Expected Result**: Message is submitted immediately. AI Acharya streaming response starts. Chat scrolls smoothly to bottom.
  * **Device Status**: *[Requires physical device or emulator]*

---

### 3.6 Notch, Camera Cutout & Safe-Area Insets
*Objective: Guarantee zero visual clipping under punch-holes, waterdrop notches, and pill cutouts.*

* **Test 3.6.1: Top Status Bar & Notch**
  * **Preconditions**: Run on device with prominent top notch or Dynamic Island.
  * **Expected Result**: App uses `viewport-fit=cover`. Top Navbar applies `.pt-safe` (`env(safe-area-inset-top)`). The OM logo, brand title "कर्मफल", and sound/profile icons render cleanly below the status bar icons and camera cutout.
  * **Device Status**: *[Requires notch device or Android Studio Notch Emulator]*

* **Test 3.6.2: Bottom Gesture Navigation Bar**
  * **Preconditions**: Run on Android device with modern gesture navigation (thin line at bottom).
  * **Expected Result**: Mobile bottom navigation bar applies `.pb-safe` (`calc(0.375rem + env(safe-area-inset-bottom))`). Nav icons ("गुरु", "ज्ञान", "साधना", "ज्योतिष", "कर्म", "प्रोफाइल") sit elevated above the gesture bar and are never blocked by swipe gestures.
  * **Device Status**: *[Requires gesture-navigation enabled device]*

---

### 3.7 Offline Resiliency & Airplane Mode
*Objective: Core spiritual practices must function 100% reliably in remote ashrams or offline temples.*

* **Test 3.7.1: Airplane Mode Panchang Calculation**
  * **Preconditions**: Switch device to Airplane Mode (Wi-Fi and Mobile Data disabled). Launch app.
  * **Action**: View daily Panchang, Tithi, Nakshatra, Rahu Kaal, Abhijit Muhurta.
  * **Expected Result**: Complete astronomical calculations render instantly from the local Drik Ganita ephemeris engine. Zero spinners, zero error popups.
  * **Device Status**: *[Can verify on emulator or physical phone in Airplane mode]*

* **Test 3.7.2: Offline Japa Mala Counter & Web Audio Bell**
  * **Preconditions**: Device in Airplane Mode. Navigate to Sadhana -> 108 Japa Mala.
  * **Action**: Tap Mala beads sequentially.
  * **Expected Result**: Synthesizer audio (`playTempleBell` harmonic synthesis) plays on every click. Anti-cheat checks evaluate locally:
    - **Minimum Tap Interval**: Rapid taps under **250 ms** (and impossible speed < 150 ms) are rejected/throttled.
    - **Natural Human Cadence**: Intervals > 250 ms with normal human variance are accepted as pure.
    - **Robotic Cadence**: Uniform intervals (variance < 2 ms across 15+ taps) or zero pointer jitter are flagged as mechanical macros and rejected.
    - Beads count from 1 to 108. On 108th bead, celebratory sound triggers and mala count increments in IndexedDB.
  * **Device Status**: *[Can verify on device speaker in Airplane mode]*

* **Test 3.7.3: Cached Scripture Reading in Airplane Mode (Two-Tier Offline Cache)**
  * **Architecture**: Two-tier caching:
    - **Tier 1 (Persistent Storage)**: Binary PDF blobs are persisted in IndexedDB via `localforage` (`books_cache` store), surviving app restarts and OS sleep.
    - **Tier 2 (In-Memory DOM Cache)**: An in-memory LRU cache (capped at 3 entries) manages active `blob:` Object URLs and automatically revokes old URLs via `URL.revokeObjectURL` to eliminate memory leaks.
  * **Note on Tier Synchronicity**: The two tiers have distinct execution semantics: Tier 1 (IndexedDB via `localforage`) is inherently **asynchronous** (Promise-based I/O), while Tier 2 (the in-memory LRU Map) is **synchronous**. Any prior claim that "both tiers work synchronously" was incorrect.
  * **Preconditions**: While online, download any scripture (e.g., Hanuman Chalisa). Turn on Airplane mode. Open Gyan -> Hanuman Chalisa.
  * **Expected Result**: PDF loads locally from IndexedDB persistent cache via local bundled PDF.js worker without network access.
  * **Device Status**: *[Requires physical device or emulator]*

---

### 3.8 Screen Rotation & Dynamic Resizing
*Objective: Verify responsive layout stability across portrait and landscape.*

* **Test 3.8.1: Rotate Device in Kundali View**
  * **Preconditions**: Open Jyotish -> Kundali -> Generate Kundali chart in portrait.
  * **Action**: Rotate device 90 degrees to landscape.
  * **Expected Result**: Chart SVG dynamically adjusts to available height. No overflowing elements. Rotating back to portrait restores layout without page reload.
  * **Device Status**: *[Requires physical device or emulator with auto-rotate]*

---

### 3.9 Low-End Device Performance & R8 Shrinking
*Objective: Verify smooth 60fps performance on budget Android devices (2GB-3GB RAM).*

* **Test 3.9.1: App Launch Latency (Cold Start)**
  * **Action**: Measure time from tapping app launcher icon to interactive home screen.
  * **Expected Result**: Splash screen displays immediately. App reaches interactive state in under 1.8 seconds.
  * **Device Status**: *[Requires physical device, preferably budget entry-level]*

* **Test 3.9.2: Memory Footprint & Minification Integrity**
  * **Action**: Monitor app memory via Android Studio Profiler during 10 minutes of active use.
  * **Expected Result**: Heap memory remains stable under 80 MB. R8 code shrinking (`minifyEnabled true`, `shrinkResources true`) preserves all Capacitor plugin reflections with zero runtime `NoSuchMethodError` or `ClassNotFoundException`.
  * **Device Status**: *[Requires Android Studio Profiler with connected device]*

---

### 3.10 App Resume After Long Background & Token Refresh
*Objective: Verify session persistence after Android OS puts process to sleep.*

* **Test 3.10.1: Background Process Resume**
  * **Preconditions**: Open app, chant 42 beads in Japa Mala. Press device Home button.
  * **Action**: Launch several other memory-heavy apps (e.g. YouTube, Camera) for 15 minutes, or enable "Don't keep activities" in Developer Options. Return to Karmphal.
  * **Expected Result**: App resumes immediately with bead count 42 preserved from local state.
  * **Device Status**: *[Requires physical device with Developer Options]*

* **Test 3.10.2: Transparent Single-Flight Token Refresh**
  * **Preconditions**: Access token expires (e.g., after 15 minutes).
  * **Action**: Send query to AI Acharya.
  * **Expected Result**: Frontend API client intercepts 401, issues single-flight refresh to `/api/auth/refresh`, obtains new signed JWT, and retries the original request transparently without prompting the user to re-login.
  * **Device Status**: *[Verified in unit test suite; verify on device with real backend]*

---

## 4. Summary of Verification Status

| Checklist Item | Codebase Status | Device Verification Status |
| :--- | :---: | :--- |
| **Back button on every screen** | ✅ Implemented & 100% Tested | Fully verified in Node test suite (`tests/back_button.test.js`) |
| **Camera OCR setup** | ✅ Permissions & hardwareService verified | Ready for hardware lens testing on device |
| **PDF share & Scoped Storage** | ✅ file_paths.xml & pdfReportService verified | Ready for hardware Share Sheet testing on device |
| **Keyboard overlap & visualViewport** | ✅ adjustResize + body resize configured | Ready for touch soft keyboard testing |
| **Notch & safe-area insets** | ✅ viewport-fit=cover + .pt-safe/.pb-safe | Ready for physical cutout screen inspection |
| **Offline Panchang & Mala** | ✅ Pure local mathematics & offline synthesis | Fully verified in unit test benchmarks |
| **R8 & Keystore Release Build** | ✅ ProGuard rules & signingConfig configured | Successfully built via Gradle release pipeline |

> **Items requiring a physical Android device or active emulator**:
> 1. Physical camera lens autofocus and capture of physical printed Kundali paper.
> 2. Native Android Intent Share Sheet integration with third-party apps (WhatsApp, Telegram).
> 3. Visual notch inspection across diverse hardware vendors (Samsung OneUI hole-punch, Xiaomi pill notch).
> 4. Physical haptic vibration motor response during Japa bead click.
