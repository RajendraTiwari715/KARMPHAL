import assert from 'node:assert';
import crypto from 'node:crypto';

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

function signJwt(payload, secret, expiresInSeconds = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };
  const h = base64UrlEncode(JSON.stringify(header));
  const p = base64UrlEncode(JSON.stringify(fullPayload));
  const sig = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${sig}`;
}

function verifyJwt(token, secret) {
  const parts = String(token).split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [h, p, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');
  if (sig !== expectedSig) throw new Error('Invalid token signature');
  const payload = JSON.parse(base64UrlDecode(p));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    const err = new Error('TokenExpiredError');
    err.name = 'TokenExpiredError';
    throw err;
  }
  return payload;
}

console.log('====================================================');
console.log('🧪 RUNNING FRONTEND AUTH & SINGLE-FLIGHT REFRESH TEST SUITE');
console.log('====================================================\n');

// Mock localStorage and window in node environment
const storageStore = new Map();
globalThis.localStorage = {
  getItem: (key) => storageStore.get(key) || null,
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear()
};

const toastEvents = [];
globalThis.window = {
  dispatchEvent: (event) => {
    if (event?.type === 'karmphal:toast') {
      toastEvents.push(event.detail);
    }
    return true;
  }
};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail;
  }
};

const TEST_SECRET = 'test-mock-jwt-secret-min-32-chars-long-for-smoke-tests';
process.env.JWT_SECRET = TEST_SECRET;

// Dynamically import apiClient and tokenStorage
const { apiClient } = await import('../src/services/apiClient.js');
const { tokenStorage, isValidJwtFormat } = await import('../src/services/tokenStorage.js');

async function runAuthTests() {
  try {
    // ------------------------------------------------------------------------
    // TEST 1: isValidJwtFormat Detection
    // ------------------------------------------------------------------------
    console.log('[Test 1/5] Testing isValidJwtFormat helper...');
    const validJwt = signJwt({ sub: 'user-123' }, TEST_SECRET, 3600);
    assert.strictEqual(isValidJwtFormat(validJwt), true, 'Valid JWT must be accepted');
    assert.strictEqual(isValidJwtFormat('367e6db5-74e1-4d51-aed7-3bb1c7e566b8'), false, 'Raw UUID must not be accepted as JWT');
    assert.strictEqual(isValidJwtFormat('header.payload'), false, '2-part token must not be accepted');
    assert.strictEqual(isValidJwtFormat(''), false, 'Empty string must not be accepted');
    assert.strictEqual(isValidJwtFormat(null), false, 'Null must not be accepted');
    console.log('✔ isValidJwtFormat correctly distinguishes JWTs from legacy UUIDs');

    // ------------------------------------------------------------------------
    // TEST 2: Expired Access Token Refreshes Without Changing User ID
    // ------------------------------------------------------------------------
    console.log('\n[Test 2/5] Testing expired access token refreshes while keeping same user ID...');
    const originalUserId = 'user-fixed-sadhak-uuid-999';
    let refreshCallsCount = 0;

    // Create an already-expired access token (-10 seconds)
    const expiredAccessToken = signJwt({ sub: originalUserId, role: 'guest' }, TEST_SECRET, -10);
    const validRefreshToken = signJwt({ sub: originalUserId, type: 'refresh' }, TEST_SECRET, 90 * 86400);

    await tokenStorage.setTokens(expiredAccessToken, validRefreshToken);

    // Mock global fetch for this test
    globalThis.fetch = async (url, options = {}) => {
      const urlStr = String(url);

      if (urlStr.includes('/api/auth/refresh')) {
        refreshCallsCount++;
        const body = JSON.parse(options.body);
        const payload = verifyJwt(body.refreshToken, TEST_SECRET);
        // Issue new access and rotated refresh token for SAME user
        const newAccess = signJwt({ sub: payload.sub, role: 'guest' }, TEST_SECRET, 30 * 86400);
        const newRefresh = signJwt({ sub: payload.sub, type: 'refresh' }, TEST_SECRET, 90 * 86400);
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ token: newAccess, refreshToken: newRefresh, user: { id: payload.sub, name: 'साधक' } })
        };
      }

      if (urlStr.includes('/api/user/profile')) {
        const authHeader = options.headers?.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        try {
          const payload = verifyJwt(token, TEST_SECRET);
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ id: payload.sub, name: 'साधक', rank: 'आरम्भिक' })
          };
        } catch {
          // Token expired or invalid -> return 401
          return {
            ok: false,
            status: 401,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ error: 'TOKEN_EXPIRED', message: 'Token has expired' })
          };
        }
      }

      throw new Error(`Unhandled mock fetch URL: ${urlStr}`);
    };

    const profileData = await apiClient.get('/api/user/profile');
    assert.strictEqual(profileData.id, originalUserId, 'User ID must stay the same across token refresh!');
    assert.strictEqual(refreshCallsCount, 1, 'Exactly one refresh call must occur');

    const storedNewToken = await tokenStorage.getToken();
    const verifiedPayload = verifyJwt(storedNewToken, TEST_SECRET);
    assert.strictEqual(verifiedPayload.sub, originalUserId, 'Stored token user ID must match original');

    console.log(`    [LOG PROOF] Initial User ID: ${originalUserId} | Resolved User ID: ${profileData.id} (MATCH ✅)`);
    console.log('✔ Expired access token refreshed transparently without changing user ID');

    // ------------------------------------------------------------------------
    // TEST 3: 5 Concurrent Parallel Requests Trigger EXACTLY ONE Refresh Call
    // ------------------------------------------------------------------------
    console.log('\n[Test 3/5] Testing 5 concurrent requests with expired token (single-flight / no stampede)...');
    let concurrentRefreshCount = 0;

    // Set expired token again
    const expiredToken2 = signJwt({ sub: originalUserId, role: 'guest' }, TEST_SECRET, -5);
    const refreshToken2 = signJwt({ sub: originalUserId, type: 'refresh' }, TEST_SECRET, 90 * 86400);
    await tokenStorage.setTokens(expiredToken2, refreshToken2);

    globalThis.fetch = async (url, options = {}) => {
      const urlStr = String(url);

      if (urlStr.includes('/api/auth/refresh')) {
        concurrentRefreshCount++;
        // Add a slight latency to test concurrency / single-flight locking
        await new Promise(r => setTimeout(r, 60));
        const body = JSON.parse(options.body);
        const payload = verifyJwt(body.refreshToken, TEST_SECRET);
        const newAccess = signJwt({ sub: payload.sub, role: 'guest' }, TEST_SECRET, 30 * 86400);
        const newRefresh = signJwt({ sub: payload.sub, type: 'refresh' }, TEST_SECRET, 90 * 86400);
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ token: newAccess, refreshToken: newRefresh, user: { id: payload.sub } })
        };
      }

      if (urlStr.includes('/api/user/profile') || urlStr.includes('/api/user/data-')) {
        const authHeader = options.headers?.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        try {
          const payload = verifyJwt(token, TEST_SECRET);
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ success: true, sub: payload.sub })
          };
        } catch {
          return {
            ok: false,
            status: 401,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ error: 'TOKEN_EXPIRED' })
          };
        }
      }

      throw new Error(`Unhandled URL: ${urlStr}`);
    };

    // Fire 5 concurrent requests simultaneously
    const parallelResults = await Promise.all([
      apiClient.get('/api/user/data-1'),
      apiClient.get('/api/user/data-2'),
      apiClient.get('/api/user/data-3'),
      apiClient.get('/api/user/data-4'),
      apiClient.get('/api/user/data-5')
    ]);

    assert.strictEqual(parallelResults.length, 5, 'All 5 requests must resolve successfully');
    parallelResults.forEach((res, idx) => {
      assert.strictEqual(res.success, true, `Request ${idx + 1} must succeed`);
      assert.strictEqual(res.sub, originalUserId);
    });

    assert.strictEqual(concurrentRefreshCount, 1, 'EXACTLY ONE refresh call must occur across 5 parallel requests!');
    console.log(`    [LOG PROOF] Concurrent Requests: 5 | Refresh Endpoint Invocations: ${concurrentRefreshCount} (SINGLE-FLIGHT ✅)`);
    console.log('✔ 5 parallel requests with expired access token triggered exactly one refresh call without stampede');

    // ------------------------------------------------------------------------
    // TEST 4: Expired or Tampered Refresh Token -> Fallback to Guest Session + Toast
    // ------------------------------------------------------------------------
    console.log('\n[Test 4/5] Testing expired refresh token fallback to new guest session & toast notification...');
    toastEvents.length = 0; // reset toast events
    let guestSessionsCreated = 0;

    const brandNewGuestUserId = 'user-brand-new-guest-777';
    const expiredRefreshToken = signJwt({ sub: originalUserId, type: 'refresh' }, TEST_SECRET, -100);
    await tokenStorage.setTokens(expiredAccessToken, expiredRefreshToken);

    globalThis.fetch = async (url, options = {}) => {
      const urlStr = String(url);

      if (urlStr.includes('/api/auth/refresh')) {
        // Refresh token is expired
        return {
          ok: false,
          status: 401,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ error: 'TOKEN_EXPIRED', message: 'Refresh token expired' })
        };
      }

      if (urlStr.includes('/api/auth/guest')) {
        guestSessionsCreated++;
        const newGuestToken = signJwt({ sub: brandNewGuestUserId, role: 'guest' }, TEST_SECRET, 30 * 86400);
        const newGuestRefresh = signJwt({ sub: brandNewGuestUserId, type: 'refresh' }, TEST_SECRET, 90 * 86400);
        return {
          ok: true,
          status: 201,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ token: newGuestToken, refreshToken: newGuestRefresh, user: { id: brandNewGuestUserId } })
        };
      }

      if (urlStr.includes('/api/user/profile')) {
        const authHeader = options.headers?.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        try {
          const payload = verifyJwt(token, TEST_SECRET);
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ id: payload.sub, name: 'साधक' })
          };
        } catch {
          return {
            ok: false,
            status: 401,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ error: 'TOKEN_EXPIRED' })
          };
        }
      }

      throw new Error(`Unhandled mock fetch URL: ${urlStr}`);
    };

    const fallbackProfileData = await apiClient.get('/api/user/profile');
    assert.strictEqual(fallbackProfileData.id, brandNewGuestUserId, 'New guest user ID must be assigned on refresh expiration');
    assert.strictEqual(guestSessionsCreated, 1, 'Exactly one guest session created');
    assert.strictEqual(toastEvents.length >= 1, true, 'A session reset toast must have been dispatched');
    assert.ok(toastEvents[0].message.includes('सत्र'), 'Toast message must explain session reset');

    console.log(`    [LOG PROOF] New Guest Created ID: ${fallbackProfileData.id} | Toast Dispatched: "${toastEvents[0].message}" ✅`);
    console.log('✔ Expired refresh token successfully created a fresh guest session and notified via toast');

    // ------------------------------------------------------------------------
    // TEST 5: Legacy Non-JWT Token in Storage Handled Cleanly (No Error Loops)
    // ------------------------------------------------------------------------
    console.log('\n[Test 5/5] Testing legacy non-JWT token (pre-JWT raw UUID) handling...');
    const legacyRawUuid = '12345678-abcd-ef01-2345-6789abcdef01';
    await tokenStorage.clearTokens();
    // Intentionally inject raw UUID into storage like pre-JWT version
    globalThis.localStorage.setItem('karmphal_jwt_token', legacyRawUuid);

    let migrationCalled = false;
    globalThis.fetch = async (url, options = {}) => {
      const urlStr = String(url);

      if (urlStr.includes('/api/auth/migrate-legacy')) {
        migrationCalled = true;
        const body = JSON.parse(options.body);
        assert.strictEqual(body.legacyToken, legacyRawUuid);
        const migratedAccess = signJwt({ sub: legacyRawUuid, role: 'guest' }, TEST_SECRET, 30 * 86400);
        const migratedRefresh = signJwt({ sub: legacyRawUuid, type: 'refresh' }, TEST_SECRET, 90 * 86400);
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ token: migratedAccess, refreshToken: migratedRefresh, user: { id: legacyRawUuid } })
        };
      }

      if (urlStr.includes('/api/user/profile')) {
        const authHeader = options.headers?.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const payload = verifyJwt(token, TEST_SECRET);
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ id: payload.sub, name: 'माइग्रेटेड साधक' })
        };
      }

      throw new Error(`Unhandled mock fetch URL: ${urlStr}`);
    };

    const migratedResult = await apiClient.get('/api/user/profile');
    assert.strictEqual(migrationCalled, true, 'Legacy migration must be attempted on non-JWT token');
    assert.strictEqual(migratedResult.id, legacyRawUuid, 'User ID preserved after legacy migration');
    const migratedTokenInStore = await tokenStorage.getToken();
    assert.strictEqual(isValidJwtFormat(migratedTokenInStore), true, 'Store now holds valid JWT');

    console.log(`    [LOG PROOF] Legacy UUID: ${legacyRawUuid} -> Migrated to Valid Signed JWT: ${migratedTokenInStore.slice(0, 30)}... ✅`);
    console.log('✔ Legacy non-JWT token cleanly migrated with zero error loops');

    console.log('\n====================================================');
    console.log('🎉 ALL 5 FRONTEND SINGLE-FLIGHT AUTH TESTS PASSED 100%!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ FRONTEND AUTH TESTS FAILED:', err);
    process.exit(1);
  }
}

runAuthTests();
