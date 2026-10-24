# Karmphal Production Deployment Guide

This guide details the final production-ready architecture for deploying the **Karmphal** full-stack application across Web, Backend, and native Android (Capacitor).

---

## 1. Backend Deployment (Render / GCP Cloud Run / VPS)

The Node.js (Express) backend provides secure authentication, rate limiting, and proxied Gemini AI integration.

**Prerequisites & Environment Variables:**
- Node.js >= 18
- Environment variables (in `.env` or cloud dashboard):
  - `PORT`: (Default: `5000`)
  - `JWT_SECRET`: **Required** (Minimum 16 characters). Used for signing HS256 tokens. The server will fail fast on startup if this is missing.
  - `GEMINI_API_KEY`: **Required**. Loaded strictly server-side (never exposed to clients/APKs).
  - `DB_PATH`: Persistent volume path for SQLite with WAL mode (e.g., `/data/karmphal.db`).
  - `FRONTEND_URL`: Allowed CORS origin for production web frontend (e.g., `https://karmphal.app`).
  - `BACKEND_URL`: Optional custom backend domain for CORS allowlist.

**Deployment Steps:**
1. Navigate to `karmphal-backend`.
2. Run `npm install --production`.
3. Configure environment variables.
4. Mount persistent storage for `DB_PATH` if using containers.
5. Run `npm start` (or `npm test` to verify smoke test suite).

---

## 2. Frontend Web Deployment (Vercel / Netlify / Cloudflare Pages)

The Vite+React web application communicates with the backend via `apiClient.js` (`apiFetch`).

**Prerequisites:**
- Set `VITE_API_BASE_URL` in `.env` or deployment settings:
  - For same-domain / proxy deployment: leave blank (`""`), and Vite or Nginx will route `/api` to the backend.
  - For cross-origin deployment: set to full backend URL (e.g. `https://api.karmphal.app`).

**Build & Deploy:**
```bash
cd karmphal-web
npm install
npm run build
```
Upload the generated `dist/` directory to your static hosting provider or CDN.

---

## 3. Mobile Deployment (Capacitor Android Build)

Because Capacitor runs the app locally from `https://localhost` inside an Android WebView, relative `/api` paths do not resolve to a server. **You MUST set `VITE_API_BASE_URL` during the Android build.**

**Build Steps:**
1. Set the production backend URL and build the web assets:
   ```bash
   cd karmphal-web
   # Windows PowerShell:
   $env:VITE_API_BASE_URL="https://api.karmphal.app"; npm run build
   # Linux / macOS:
   VITE_API_BASE_URL="https://api.karmphal.app" npm run build
   ```
2. Sync the built assets into the native Android project:
   ```bash
   npx cap sync android
   ```
3. Open in Android Studio:
   ```bash
   npx cap open android
   ```
4. Build the signed Release APK or AAB:
   In Android Studio: **Build > Generate Signed Bundle / APK**.

---

## 4. How to Verify 200 OK from the Android Build

To verify that the Android app is communicating with the backend and receiving `200 OK`:

### Method A: Chrome Developer Tools (Recommended)
1. Connect your Android device via USB with **USB Debugging** enabled (or start an Android Emulator in Android Studio).
2. Install and launch the Karmphal app on the device/emulator.
3. Open Google Chrome on your desktop computer and navigate to:
   ```text
   chrome://inspect/#devices
   ```
4. Under **Remote Target**, find your device and click **inspect** under `com.karmphal.app`.
5. Open the **Network** tab in DevTools.
6. Interact with the app (e.g., send a message to Sanatan AI Acharya, or open the Profile modal).
7. You will observe live HTTP requests:
   - `POST https://api.karmphal.app/api/auth/guest` -> `201 Created`
   - `GET https://api.karmphal.app/api/user/profile` -> `200 OK` (with `Authorization: Bearer <jwt>`)
   - `POST https://api.karmphal.app/api/ai/acharya` -> `200 OK`

### Method B: ADB Logcat Filtering
Run the following terminal command while the device is connected:
```bash
# Windows PowerShell:
adb logcat -v time | Select-String "Capacitor|chromium|ApiClient"

# macOS / Linux:
adb logcat -v time | grep -E "Capacitor|chromium|ApiClient"
```
You will see network lifecycle events and console messages confirming successful `200 OK` exchanges.

---

## Security & Architectural Checklist
- [x] Zero API keys in frontend bundles or APKs (verified via bundle grep).
- [x] Cryptographically signed JWTs (HS256) with 30-day expiry.
- [x] Fail-fast backend startup when `JWT_SECRET` is missing.
- [x] Per-user rate limiting on AI endpoints (`keyGenerator` bound to `req.user.id`).
- [x] Helmet security headers and strict CORS allowlists.
- [x] `capacitor.config.json` configured with `androidScheme: "https"`.
