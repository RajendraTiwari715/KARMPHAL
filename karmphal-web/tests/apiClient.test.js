import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, ApiError } from '../src/services/apiClient';
import { tokenStorage } from '../src/services/tokenStorage';

function signMockJwt(sub, type = 'access', expiresIn = 3600) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({ sub, type, iat: now, exp: now + expiresIn })).replace(/=/g, '');
  const sig = 'mock_signature_hash_12345';
  return `${header}.${payload}.${sig}`;
}

describe('Frontend apiClient 401 Flow & Single-Flight Refresh Test Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    await tokenStorage.clearTokens();
    vi.restoreAllMocks();
  });

  it('attaches Bearer token from tokenStorage to outgoing requests', async () => {
    const validToken = signMockJwt('user-123');
    await tokenStorage.setTokens(validToken, signMockJwt('user-123', 'refresh'));

    let capturedHeaders = null;
    vi.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
      capturedHeaders = options.headers;
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'ok' })
      };
    });

    const res = await apiClient.get('/api/health');
    expect(res.status).toBe('ok');
    expect(capturedHeaders['Authorization']).toBe(`Bearer ${validToken}`);
  });

  it('intercepts 401, refreshes tokens via single-flight refresh, and replays request', async () => {
    const oldAccessToken = signMockJwt('user-456', 'access', -10); // expired
    const oldRefreshToken = signMockJwt('user-456', 'refresh', 3600);
    const newAccessToken = signMockJwt('user-456', 'access', 3600);
    const newRefreshToken = signMockJwt('user-456', 'refresh', 7200);

    await tokenStorage.setTokens(oldAccessToken, oldRefreshToken);

    let initialCallCount = 0;
    let refreshCallCount = 0;

    vi.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/refresh')) {
        refreshCallCount++;
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            token: newAccessToken,
            refreshToken: newRefreshToken,
            user: { id: 'user-456', name: 'साधक' }
          })
        };
      }

      if (urlStr.includes('/api/user/profile')) {
        initialCallCount++;
        if (initialCallCount === 1) {
          // First attempt returns 401
          return {
            ok: false,
            status: 401,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ error: 'TOKEN_EXPIRED' })
          };
        }
        // Second attempt with new token returns 200
        expect(options.headers['Authorization']).toBe(`Bearer ${newAccessToken}`);
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ id: 'user-456', name: 'साधक' })
        };
      }

      return { ok: true, status: 200, json: async () => ({}) };
    });

    const profile = await apiClient.get('/api/user/profile');
    expect(profile.name).toBe('साधक');
    expect(refreshCallCount).toBe(1);
    expect(initialCallCount).toBe(2);
    expect(await tokenStorage.getToken()).toBe(newAccessToken);
    expect(await tokenStorage.getRefreshToken()).toBe(newRefreshToken);
  });

  it('queues concurrent 401 requests behind a single refresh promise without stampede', async () => {
    const oldAccessToken = signMockJwt('user-789', 'access', -10);
    const oldRefreshToken = signMockJwt('user-789', 'refresh', 3600);
    const newAccessToken = signMockJwt('user-789', 'access', 3600);
    const newRefreshToken = signMockJwt('user-789', 'refresh', 7200);

    await tokenStorage.setTokens(oldAccessToken, oldRefreshToken);

    let refreshCallCount = 0;
    let isRefreshed = false;

    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/refresh')) {
        refreshCallCount++;
        // Small delay to simulate network latency
        await new Promise(r => setTimeout(r, 15));
        isRefreshed = true;
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            token: newAccessToken,
            refreshToken: newRefreshToken,
            user: { id: 'user-789' }
          })
        };
      }

      // First batch returns 401 until refreshed
      if (!isRefreshed) {
        return {
          ok: false,
          status: 401,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ error: 'TOKEN_EXPIRED' })
        };
      }

      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: 'success' })
      };
    });

    // Fire 5 concurrent requests simultaneously
    const results = await Promise.all([
      apiClient.get('/api/user/profile'),
      apiClient.get('/api/user/chat-history'),
      apiClient.get('/api/user/export'),
      apiClient.post('/api/user/punya', { totalPunya: 10 }),
      apiClient.get('/api/user/profile')
    ]);

    expect(results.length).toBe(5);
    // EXACTLY ONE refresh call occurred despite 5 concurrent 401s
    expect(refreshCallCount).toBe(1);
    expect(await tokenStorage.getToken()).toBe(newAccessToken);
  });

  it('handles expired refresh token by clearing storage and notifying via toast event', async () => {
    await tokenStorage.setTokens(signMockJwt('u', 'access', -10), signMockJwt('u', 'refresh', -10));

    let toastDispatched = false;
    window.addEventListener('karmphal:toast', (e) => {
      if (e.detail?.type === 'warning') toastDispatched = true;
    });

    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/refresh')) {
        return {
          ok: false,
          status: 401,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ error: 'TOKEN_EXPIRED', message: 'Refresh token expired' })
        };
      }
      return {
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'UNAUTHORIZED' })
      };
    });

    await expect(apiClient.get('/api/user/profile')).rejects.toThrow();
    expect(toastDispatched).toBe(true);
  });

  it('revokes refresh token and clears storage on logout', async () => {
    const access = signMockJwt('logout-user');
    const refresh = signMockJwt('logout-user', 'refresh');
    await tokenStorage.setTokens(access, refresh);

    let revokeCalled = false;
    vi.spyOn(global, 'fetch').mockImplementation(async (url, opts) => {
      if (String(url).includes('/api/auth/revoke')) {
        revokeCalled = true;
        const body = JSON.parse(opts.body);
        expect(body.refreshToken).toBe(refresh);
        return { ok: true, status: 200, json: async () => ({ status: 'revoked' }) };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });

    const { logout } = await import('../src/services/apiClient');
    await logout();
    expect(revokeCalled).toBe(true);
    expect(await tokenStorage.getToken()).toBeNull();
    expect(await tokenStorage.getRefreshToken()).toBeNull();
  });

  it('migrates legacy UUID token to signed JWT on the fly', async () => {
    const legacyUuid = 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d';
    const newJwt = signMockJwt('migrated-user');
    const newRefresh = signMockJwt('migrated-user', 'refresh');
    await tokenStorage.setTokens(legacyUuid, null);

    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/migrate-legacy')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ token: newJwt, refreshToken: newRefresh })
        };
      }
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ user: 'migrated' })
      };
    });

    const res = await apiClient.get('/api/user/profile');
    expect(res.user).toBe('migrated');
    expect(await tokenStorage.getToken()).toBe(newJwt);
  });

  it('supports post, put, and delete helper methods with typed ApiError on failures', async () => {
    const token = signMockJwt('user-methods');
    await tokenStorage.setTokens(token, signMockJwt('user-methods', 'refresh'));

    vi.spyOn(global, 'fetch').mockImplementation(async (url, opts) => {
      const method = opts.method || 'GET';
      if (method === 'POST') {
        return {
          ok: true,
          status: 201,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ created: true })
        };
      }
      if (method === 'PUT') {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ updated: true })
        };
      }
      if (method === 'DELETE') {
        return {
          ok: false,
          status: 500,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ error: 'DATABASE_ERROR', message: 'Internal server error' })
        };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });

    const postRes = await apiClient.post('/api/item', { name: 'Item 1' });
    expect(postRes.created).toBe(true);

    const putRes = await apiClient.put('/api/item/1', { name: 'Item 1 Updated' });
    expect(putRes.updated).toBe(true);

    await expect(apiClient.delete('/api/item/1')).rejects.toThrow(ApiError);
  });
});
