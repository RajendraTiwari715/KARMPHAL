# Karmphal Production Deployment Guide

This guide details the final production-ready architecture for deploying the **Karmphal** full-stack application. It ensures maximum privacy, performance, and stability.

## 1. Backend Deployment (Render / GCP Cloud Run / VPS)

The Node.js (Express) backend is fully configured for production environments. It includes rate-limiting, Helmet for security headers, CORS origin management, and SQLite with WAL mode.

**Prerequisites:**
- Node.js >= 18
- Environment variables:
  - `PORT`: (Default: `5000`)
  - `FRONTEND_URL`: Important for CORS (e.g., `https://karmphal.example.com`)
  - `GEMINI_API_KEY`: Required for AI Chat & Kundali reading.
  - `DB_PATH`: Set to a persistent mounted volume path (e.g., `/data/karmphal.db`) to ensure the SQLite database survives container restarts.

**Deployment Steps:**
1. Clone the repository and navigate to `karmphal-backend`.
2. Run `npm install --production`.
3. Set your environment variables (in `.env` or via hosting dashboard).
4. **Important for Docker/Containers**: Make sure your hosting provider mounts a persistent disk to the path you defined in `DB_PATH`.
5. Run `npm start`.

---

## 2. Frontend Web Deployment (Vercel / Netlify / Firebase Hosting)

The Vite+React application has been optimized with explicit Rollup chunking to prevent huge JS payloads, improving initial load time significantly.

**Prerequisites:**
- Set `VITE_API_BASE_URL` if not proxying via the same domain. (Currently proxy is configured for local dev).

**Deployment Steps:**
1. Navigate to `karmphal-web`.
2. Run `npm install`.
3. Build the static assets: `npm run build`.
   *(Notice how chunks are now cleanly split: `vendor-react.js`, `vendor-capacitor.js`, etc.)*
4. Upload the `/dist` folder to your CDN or static hosting provider.

---

## 3. Mobile Deployment (Capacitor for Android)

The app utilizes native hardware APIs for enhanced user experience:
- `@capacitor/camera`: Offline secure Kundali scanning.
- `@capacitor/haptics`: Bead click vibrations.
- `@capacitor/filesystem`: Saving PDFs locally to user's device.

**To build the Android App:**
1. Make sure the web project is built: `npm run build`.
2. Sync plugins and assets to Android: `npx cap sync android`.
3. Open Android Studio: `npx cap open android`.
4. Ensure `minSdkVersion` in `android/variables.gradle` is set to `22` or higher (Capacitor default).
5. Build the signed APK / App Bundle via Android Studio for the Play Store.

## Privacy & Security Checklist (Verified)
- [x] Ephemeral `guest` Auth token system to avoid collecting unnecessary PII.
- [x] Theological Prompts Hardened against jailbreak, maintaining Vedic determinism.
- [x] Camera access explicitly requests permission; images are read directly into memory (`base64`) without polluting the public gallery.
- [x] No unauthorized tracker/analytics installed; pure local processing where possible.
- [x] SQLite is running in WAL mode with Foreign Keys enabled for database reliability.
