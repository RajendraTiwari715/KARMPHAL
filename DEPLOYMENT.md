# Karmphal Production Deployment Guide

This guide details the final production-ready architecture for deploying the **Karmphal** full-stack application across Web, Backend, and native Android (Capacitor).

---

## 1. Backend Deployment (Render / GCP Cloud Run / VPS)

The Node.js (Express) backend provides secure authentication, rate limiting, and proxied Gemini AI integration.

### Environment Variables Validated by `config/env.js`
The backend fails fast on startup with exit code 1 if required variables are missing. Secret values are never printed to logs.

| Variable Name | Status | Default | Description & Placeholder Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Optional | `development` | Deployment environment (`development`, `production`, `test`). Example: `NODE_ENV=production` |
| `PORT` | Optional | `5000` | Port on which Express listens. Example: `PORT=5000` |
| `DB_PATH` | Optional | `./karmphal.db` | Persistent volume path for SQLite with WAL mode. Example: `DB_PATH=/data/karmphal.db` |
| `JWT_SECRET` | **REQUIRED** | _None_ | Cryptographic signing secret (min 16 chars) for HS256 JWTs. Example: `JWT_SECRET=your_jwt_secret_min_32_chars_long_here` |
| `GEMINI_API_KEY` | **REQUIRED** | _None_ | Google Cloud Gemini API key (strictly server-side, never exposed to clients). Example: `GEMINI_API_KEY=AIzaSy...` |
| `CORS_ORIGINS` | **REQUIRED** | _None_ | Comma-separated allowed web origins. Example: `CORS_ORIGINS=https://REPLACE_ME_FRONTEND_DOMAIN,https://localhost,capacitor://localhost` |
| `CHAT_RETENTION_LIMIT` | Optional | `100` | Number of chat messages stored per user. Example: `CHAT_RETENTION_LIMIT=100` |
| `AI_CHAT_RATE_LIMIT_HOUR` | Optional | `20` | Max Acharya AI chat requests per user and per IP per hour. Example: `AI_CHAT_RATE_LIMIT_HOUR=20` |
| `AI_OCR_RATE_LIMIT_HOUR` | Optional | `5` | Max Kundali OCR requests per user and per IP per hour. Example: `AI_OCR_RATE_LIMIT_HOUR=5` |
| `AI_DAILY_QUOTA_PER_USER` | Optional | `50` | Max total AI requests per user per calendar day. Example: `AI_DAILY_QUOTA_PER_USER=50` |
| `AI_MAX_OUTPUT_TOKENS` | Optional | `1500` | Token limit for AI response generation. Example: `AI_MAX_OUTPUT_TOKENS=1500` |
| `GLOBAL_DAILY_AI_LIMIT` | Optional | `1000` | Global daily Gemini request cap across all users. When reached, returns friendly 503 (`SERVICE_UNAVAILABLE`). Example: `GLOBAL_DAILY_AI_LIMIT=1000` |
| `GUEST_RATE_LIMIT_HOUR` | Optional | `5` | Max guest registration attempts per IP per hour to prevent quota-bypass churning. Example: `GUEST_RATE_LIMIT_HOUR=5` |
| `TRUST_PROXY` | Optional | `false` | Env-driven proxy configuration (`false`, integer hop count, or comma-separated IP/CIDR list). Default is `false`. Example: `TRUST_PROXY=false` |

### Proxy Topology & IP Spoofing Protection
Express evaluates `req.ip` for rate limiting via `app.set('trust proxy', resolveTrustProxy(env.TRUST_PROXY))`. Configure `TRUST_PROXY` according to your infrastructure topology:
1. **Direct (No Reverse Proxy / Bare Node / Internal Network)**:
   - Setting: `TRUST_PROXY=false` (or leave unset).
   - Behavior: Express takes client IP strictly from TCP socket (`remoteAddress`). Any `X-Forwarded-For` header sent by clients is completely ignored, preventing IP spoofing.
2. **Behind One Reverse Proxy (Nginx, Cloud Run, Render, AWS ALB, Caddy)**:
   - Setting: `TRUST_PROXY=1`
   - Behavior: Express trusts the single immediate reverse proxy, reading the client IP as the last hop appended by that proxy. Forged `X-Forwarded-For` headers prepended by clients are discarded.
3. **Behind Cloudflare plus a Host Proxy (Cloudflare -> Nginx/ALB -> Node)**:
   - Setting: `TRUST_PROXY=2` (or explicit list of Cloudflare IP CIDRs + local proxy subnet).
   - Behavior: Express counts 2 trusted proxy hops from the right to reach the real edge client IP.

### Version Code & Release Increments
`VERSION_CODE` must be explicitly provided for release builds (first release = `1`):
- To increment for updates: increment the integer by 1 for each new release bundle (`VERSION_CODE=1`, `VERSION_CODE=2`, `VERSION_CODE=3`, etc.).
- Google Play strictly rejects any artifact whose `versionCode` is less than or equal to an existing release.
- Build release via: `VERSION_CODE=1 VITE_API_BASE_URL="https://REPLACE_ME_API_BASE_URL" node scripts/build-android-release.mjs`.

### Critical External Cloud Configurations (Action Required Outside Code)
1. **E.6: Google Cloud Budget Alert & Billing Quota** _[Documentation only, manual action required by owner]_:
   - Go to Google Cloud Console > **Billing** > **Budgets & alerts**.
   - Create a monthly budget (e.g., $25 / month) with threshold alerts at 50%, 90%, and 100% sending email/PubSub notifications.
   - Owner must manually set up this billing alert in the GCP Console to prevent cost overruns.
2. **Gemini API Key Restrictions**:
   - In Google Cloud Console > **APIs & Services** > **Credentials**:
   - Under **API restrictions**: Restrict key strictly to **Generative Language API**.
   - Under **Application restrictions**: Restrict key by IP address to your production backend server IP / VPC egress IP (or Cloud Run egress IP).
3. **Gemini Quota Cap**:
   - Under **APIs & Services** > **Generative Language API** > **Quotas**:
   - Set an explicit cap on queries per minute (e.g., 60 QPM) and daily queries (e.g., 1000/day) matching `GLOBAL_DAILY_AI_LIMIT` to prevent unexpected billing.

**Deployment Steps:**
1. Navigate to `karmphal-backend`.
2. Run `npm install --production`.
3. Configure environment variables in `.env` or container settings.
4. Mount persistent storage for `DB_PATH` if using containers.
5. Run `npm start` (or `npm test` to verify test suite).

---

## 2. Frontend Web Deployment (Vercel / Netlify / Cloudflare Pages)

The Vite+React web application communicates with the backend via `apiClient.js` (`apiFetch`).

**Prerequisites:**
- Set `VITE_API_BASE_URL` in `.env` or deployment settings:
  - For same-domain / proxy deployment: leave blank (`""`), and Vite or Nginx will route `/api` to the backend.
  - For cross-origin deployment: set to full backend URL (e.g. `https://REPLACE_ME_API_BASE_URL`).

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
   $env:VITE_API_BASE_URL="https://REPLACE_ME_API_BASE_URL"; npm run build
   # Linux / macOS:
   VITE_API_BASE_URL="https://REPLACE_ME_API_BASE_URL" npm run build
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

### D.4: Google Play Store Release Upload & Store Listing _[Documentation only, manual action required by owner]_
- After generating `app-release.aab`, navigate to **Google Play Console** (https://play.google.com/console).
- Select Karmphal app > **Release** > **Production** (or Internal/Closed Testing track).
- Upload the signed `.aab` file generated with `VERSION_CODE`.
- Complete the Store Listing metadata (Screenshots, Privacy Policy URL, Content Rating Questionnaire, Data Safety declaration).
- Roll out to testing or production tracks. This step requires owner Google Play developer credentials and manual console submission.

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
   - `POST https://<your-backend-api-domain>/api/auth/guest` -> `201 Created`
   - `GET https://<your-backend-api-domain>/api/user/profile` -> `200 OK` (with `Authorization: Bearer <jwt>`)
   - `POST https://<your-backend-api-domain>/api/ai/acharya` -> `200 OK`

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
- [x] Graceful shutdown handling on SIGTERM/SIGINT with WAL checkpoint and database closure.
- [x] Zero table full-scans via composite indexes on ChatHistory, SadhanaLogs, PunyaTransactions.

---

## 5. Automated Backup & Disaster Recovery

### Online SQLite Backup
The backend provides a non-blocking live backup utility using SQLite's native backup API:
```bash
cd karmphal-backend
npm run backup
```
- Creates timestamped snapshots in `karmphal-backend/backups/karmphal-backup-YYYY-MM-DDTHH-mm-ss.db`.
- Retains the 7 most recent backups and purges older ones.
- Automated via cron:
  ```bash
  0 2 * * * cd /var/www/karmphal/karmphal-backend && npm run backup >> /var/log/karmphal-backup.log 2>&1
  ```

### Restoration Protocol
1. Stop the backend process: `pm2 stop karmphal-backend` or `systemctl stop karmphal`
2. Validate backup integrity:
   ```bash
   sqlite3 /path/to/backup.db "PRAGMA integrity_check;"
   ```
3. Copy the verified backup to replace the active database:
   ```bash
   cp /path/to/backup.db /var/data/karmphal.db
   rm -f /var/data/karmphal.db-wal /var/data/karmphal.db-shm
   ```
4. Restart service and verify health:
   ```bash
   pm2 start karmphal-backend
   curl -s http://localhost:5000/ready
   # Expected: {"status":"ready","database":"connected"}
   ```

