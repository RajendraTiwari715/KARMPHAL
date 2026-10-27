# Google Play Store Launch & Compliance Checklist

> **App**: Karmphal (कर्मफल)  
> **Package ID**: `com.karmphal.app`  
> **Version**: 1.0.0 (`versionCode: 40`)  
> **Target SDK**: 36 (Android 15+) — Google Play requires API 34+ (Aug 2024) / API 35+ (Aug 2025).

---

## 1. Action Items for Store Listing (What YOU Must Decide / Write)

> [!IMPORTANT]
> The items below require external accounts, hosted URLs, or your explicit legal decisions. Placeholders are highlighted with `[REQUIRED: ...]`.

- [ ] **Privacy Policy Hosting**:
  - **Required URL**: `[REQUIRED: Enter public HTTPS URL, e.g., https://karmphal.app/privacy]`
  - Host a publicly accessible static webpage with your privacy policy before submitting to Google Play Console.
- [ ] **Developer Contact Email**:
  - `[REQUIRED: Enter support email, e.g., support@karmphal.app]`
- [ ] **Target Audience Age**:
  - Recommended: **13+ or Everyone (General Audience)**. Do NOT target children under 13 to avoid COPPA / Families Policy requirements.
- [ ] **Google Play Console Merchant Account** (if monetization added later; current app has no IAP).

---

## 2. In-App Privacy Policy Link & Legal Disclosure

- **In-App Location**: Settings Modal -> "गोपनीयता नीति (Privacy Policy)" link.
- **Current Behavior**: Opens external URL or in-app browser with the configured Privacy Policy page.
- **Terms of Service**: Settings Modal -> "उपयोग की शर्तें (Terms of Service)".

---

## 3. Google Play Data Safety Form Specification

Google Play requires accurate disclosure of all data collected, processed, and shared. Below is the exact matrix to fill in Google Play Console Data Safety section:

### Data Types Collected & Shared

| Data Category | Specific Data Type | Collected? | Shared? | Purpose | Ephemeral / Stored |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Location** | Approximate Location & Precise Coordinates | Yes | Yes (Backend only) | **App Functionality**: Computing Drik Ganita Vedic Panchang, Tithi, Nakshatra, and Kundali planetary ascendants based on latitude/longitude. | Stored locally in device preferences (`localforage`); sent to backend with calculation requests; NOT tracked continuously in background. |
| **Photos & Videos** | Photos / Camera (Kundali OCR) | Yes | Yes (Backend to Gemini) | **App Functionality**: User photographs their physical Kundali chart; base64 payload is forwarded via secure backend proxy to Google Gemini API for OCR parsing. | Ephemeral. Image is cached temporarily in app-private cache (`my_cache_images`) during processing and is NEVER saved to public gallery or retained on server. |
| **Messages / User Content** | In-app Chat Messages (Acharya AI) | Yes | Yes (Backend to Gemini) | **App Functionality**: User queries addressed to AI Spiritual Acharya; prompt is proxied through backend to Google Gemini API for spiritual/philosophical guidance. | Session chat history stored locally on device; anonymized query sent to Gemini for completion. |
| **User Identifiers** | User ID / Guest UUID | Yes | No | **Account Management & Fraud Prevention**: Ephemeral guest UUID or authenticated user ID to enforce rate limits and track daily spiritual sadhana quotas. | Stored in SQLite backend `Users` table; hashed in audit logs. |

### Security Practices
- **Data Encrypted in Transit**: Yes (`HTTPS / TLS 1.3` enforced on all network requests).
- **Data Deletion Mechanism**: Yes (Users can request deletion of account and all associated data).
- **Target Children Policy**: No (App is not aimed primarily at children).

---

## 4. In-App Data Deletion Path

Google Play requires apps that support account creation to provide an easy in-app and web data deletion method.

- **In-App Deletion Path**:
  1. Open app -> Tap Profile icon.
  2. Tap Settings tab.
  3. Scroll to "खाता एवं डेटा हटाएं (Delete Account & Data)".
  4. Tap confirmation modal: *"क्या आप वास्तव में अपना खाता और सभी साधना रिकॉर्ड स्थायी रूप से हटाना चाहते हैं?"*
  5. API call triggers: `DELETE /api/user/account`.
  6. Backend deletes user record from `Users`, `SadhanaHistory`, `UserTokens`, and invalidates all JWT refresh tokens.
  7. Client clears local storage (`localforage.clear()`, `localStorage.clear()`) and resets to fresh state.
- **Web Deletion Request URL**:
  - `[REQUIRED: Enter URL or email form for data deletion, e.g., https://karmphal.app/delete-account]`

---

## 5. Content Rating Questionnaire Notes (IARC)

When completing the International Age Rating Coalition (IARC) questionnaire in Play Console:

| Question / Category | Value for Karmphal | Justification |
| :--- | :--- | :--- |
| **Violence** | No | Purely devotional, spiritual, and philosophical guidance. |
| **Sexuality / Nudity** | No | Sacred scriptures and meditation mala only. |
| **Language / Profanity** | No | Sanskrit shlokas, Hindi/English spiritual commentary. |
| **Controlled Substances** | No | No reference to illegal drugs, alcohol, or tobacco. |
| **Gambling / Real Money** | No | No real-money gambling, betting, or simulated casino games. |
| **User Interaction / Forums** | No | There are no unmoderated public chat rooms or peer-to-peer messaging. Interactions are strictly between the user and the local app / AI Acharya proxy. |
| **Expected Rating** | **Everyone (PEGI 3, ESRB Everyone, USK 0)** | Safe for all general audiences. |

---

## 6. Google Play App Signing

- **Enrollment**: Enroll in Google Play App Signing.
- **Upload Key**:
  - Build signed with local keystore (`app-release.aab` generated by `scripts/build-android-release.mjs`).
  - Google Play Console verifies the upload key signature and re-signs the APK artifacts with Google's secure master app signing key before distributing to end users.
- **Keystore Security Reminder**:
  - Upload keystore is stored locally at `android/app/release.keystore` (ignored by git).
  - Keystore passwords must never be committed to repository files or version control.
