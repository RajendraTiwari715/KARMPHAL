import { tokenStorage, isValidJwtFormat } from './tokenStorage';

/**
 * Custom typed error for API failures
 */
export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code || 'API_ERROR';
    this.details = details || null;
  }
}

/**
 * Normalizes the backend base URL from environment
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL || '';
  return envUrl.replace(/\/+$/, '');
}

// Single-flight promises to eliminate race conditions and stampedes
let refreshPromise = null;
let guestInitPromise = null;
let lastResetToastTime = 0;

/**
 * Shows a toast notifying user that their session was reset.
 * Throttled to avoid toast storms during multiple concurrent requests.
 */
export function notifySessionReset(message = 'आपका सत्र समाप्त हो चुका था। नया सुरक्षित सत्र आरम्भ किया गया है।') {
  const now = Date.now();
  if (now - lastResetToastTime < 4000) return;
  lastResetToastTime = now;

  if (typeof window !== 'undefined' && window.dispatchEvent) {
    try {
      window.dispatchEvent(
        new CustomEvent('karmphal:toast', {
          detail: {
            type: 'warning',
            title: 'सत्र नवीनीकरण (Session Reset)',
            message,
            duration: 5000
          }
        })
      );
    } catch {
      // Ignore if event dispatch fails in non-browser env
    }
  }
}

/**
 * Single-flight Guest Session Creator
 * Ensures concurrent callers wait on the same creation promise.
 */
export async function createGuestSession() {
  if (guestInitPromise) {
    return guestInitPromise;
  }

  guestInitPromise = (async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/api/auth/guest`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new ApiError(`Guest session initialization failed with HTTP ${response.status}`, response.status, 'GUEST_INIT_FAILED');
      }

      const data = await response.json();
      if (data?.token) {
        await tokenStorage.setTokens(data.token, data.refreshToken);
        return data.token;
      }
      throw new ApiError('Missing token in guest authentication response', 500, 'TOKEN_MISSING');
    } finally {
      guestInitPromise = null;
    }
  })();

  return guestInitPromise;
}

/**
 * Single-flight Refresh Token Handler
 * - Calls POST /api/auth/refresh ONCE with the stored refresh token
 * - All concurrent requests await the exact same promise (no refresh stampede)
 * - Persists rotated access and refresh tokens
 */
export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken || !isValidJwtFormat(refreshToken)) {
        throw new ApiError('No valid refresh token stored', 401, 'NO_REFRESH_TOKEN');
      }

      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const status = response.status;
        const errCode = (typeof errData === 'object' && errData?.error) ? errData.error : 'REFRESH_FAILED';
        const errMsg = (typeof errData === 'object' && errData?.message) ? errData.message : `Refresh failed with status ${status}`;
        throw new ApiError(errMsg, status, errCode, errData);
      }

      const data = await response.json();
      if (!data?.token) {
        throw new ApiError('Missing access token in refresh response', 500, 'TOKEN_MISSING');
      }

      await tokenStorage.setTokens(data.token, data.refreshToken);
      return data.token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Logs out and revokes the current refresh token on the backend.
 */
export async function logout() {
  try {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/auth/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ refreshToken })
      }).catch(() => {});
    }
  } finally {
    await tokenStorage.clearTokens();
  }
}

/**
 * Core apiFetch function
 * - Checks and migrates/cleans legacy non-JWT tokens (pre-JWT UUIDs)
 * - Attaches Bearer JWT token from tokenStorage
 * - On 401 with expired access token: invokes single-flight refreshAccessToken()
 * - Only calls createGuestSession() if no refresh token or refresh returned 401/403
 * - Displays a session reset toast on fallback session recreations
 * - Retries the original request exactly once
 */
export async function apiFetch(path, options = {}, isRetry = false) {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const isFullUrl = path.startsWith('http://') || path.startsWith('https://');
  const url = isFullUrl ? path : `${baseUrl}${cleanPath}`;
  const isAuthRoute = cleanPath.startsWith('/api/auth/');

  // 1. Manage Auth Token & Legacy Non-JWT Handling
  let token = await tokenStorage.getToken();

  // If token exists but is not a valid JWT (e.g. legacy UUID from pre-JWT era or corrupt string)
  if (token && !isValidJwtFormat(token) && !isAuthRoute) {
    console.warn('[apiClient] Legacy non-JWT token detected. Migrating to signed JWT or resetting...');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let migrated = false;

    if (uuidRegex.test(token.trim())) {
      try {
        const migRes = await fetch(`${baseUrl}/api/auth/migrate-legacy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ legacyToken: token.trim() })
        });
        if (migRes.ok) {
          const migData = await migRes.json();
          if (migData?.token) {
            await tokenStorage.setTokens(migData.token, migData.refreshToken);
            token = migData.token;
            migrated = true;
          }
        }
      } catch {
        // Migration call failed; proceed to clean reset
      }
    }

    if (!migrated) {
      await tokenStorage.clearTokens();
      try {
        token = await createGuestSession();
      } catch (err) {
        console.warn('[apiClient] Clean guest reset after legacy token failed:', err.message);
      }
    }
  }

  // If still no token and not an auth endpoint, initialize guest session
  if (!token && !isAuthRoute) {
    try {
      token = await createGuestSession();
    } catch (err) {
      console.warn('[apiFetch] Could not create guest session pre-flight:', err.message);
    }
  }

  const headers = {
    'Accept': 'application/json',
    ...(token && !isAuthRoute ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  // Auto-serialize JSON body and set Content-Type if not FormData
  let body = options.body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isFormData && typeof body === 'object') {
    body = JSON.stringify(body);
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  } else if (!isFormData && !headers['Content-Type'] && options.method && options.method !== 'GET' && options.method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body
    });

    // 2. Handle 401 Unauthorized via Single-Flight Refresh
    if (response.status === 401 && !isRetry && !isAuthRoute) {
      console.warn('[apiFetch] 401 Unauthorized encountered. Attempting single-flight refresh...');

      try {
        // Attempt single-flight refresh
        await refreshAccessToken();
        // Retry original request exactly once
        return apiFetch(path, options, true);
      } catch (refreshErr) {
        console.warn('[apiFetch] Refresh attempt rejected:', refreshErr.status, refreshErr.message);

        // Only call createGuestSession() if no refresh token or refresh returned 401/403
        if (
          refreshErr.status === 401 ||
          refreshErr.status === 403 ||
          refreshErr.code === 'NO_REFRESH_TOKEN' ||
          refreshErr.code === 'TOKEN_EXPIRED' ||
          refreshErr.code === 'INVALID_TOKEN' ||
          refreshErr.code === 'TOKEN_REVOKED'
        ) {
          notifySessionReset();
          await tokenStorage.clearTokens();
          await createGuestSession();
          return apiFetch(path, options, true);
        }

        // For other network/server errors during refresh, rethrow the error
        throw refreshErr;
      }
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json().catch(() => ({})) : await response.text();

    if (!response.ok) {
      const errorMessage = (typeof data === 'object' && data?.message) ? data.message : `Request failed with status ${response.status}`;
      const errorCode = (typeof data === 'object' && data?.error) ? data.error : 'API_ERROR';
      throw new ApiError(errorMessage, response.status, errorCode, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new ApiError(
        'सर्वर से सम्पर्क नहीं हो सका। कृपया इंटरनेट या बैकएंड सर्वर की जाँच करें। (Network connection failed)',
        0,
        'NETWORK_ERROR',
        null
      );
    }
    throw new ApiError(err.message, 0, 'UNKNOWN_ERROR', null);
  }
}

/**
 * Convenient REST helper wrapper
 */
export const apiClient = {
  get: (path, options = {}) => apiFetch(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => apiFetch(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => apiFetch(path, { ...options, method: 'PUT', body }),
  delete: (path, options = {}) => apiFetch(path, { ...options, method: 'DELETE' }),
  createGuestSession,
  refreshAccessToken,
  logout
};

export default apiFetch;
