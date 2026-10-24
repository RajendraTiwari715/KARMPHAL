import { tokenStorage } from './tokenStorage';

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

/**
 * Creates a guest session on the backend and persists the signed JWT
 */
export async function createGuestSession() {
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
}

/**
 * Core apiFetch function
 * - Prefixes VITE_API_BASE_URL (fallback '' for Vite proxy)
 * - Automatically attaches Bearer token from tokenStorage
 * - Sets application/json headers
 * - Auto-retries on 401 with a fresh guest session
 * - Throws a typed ApiError on non-2xx responses
 */
export async function apiFetch(path, options = {}, isRetry = false) {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const isFullUrl = path.startsWith('http://') || path.startsWith('https://');
  const url = isFullUrl ? path : `${baseUrl}${cleanPath}`;

  // Manage Auth Header
  let token = await tokenStorage.getToken();
  if (!token && cleanPath !== '/api/auth/guest') {
    try {
      token = await createGuestSession();
    } catch (err) {
      console.warn('[apiFetch] Could not create guest session pre-flight:', err.message);
    }
  }

  const headers = {
    'Accept': 'application/json',
    ...(token && cleanPath !== '/api/auth/guest' ? { 'Authorization': `Bearer ${token}` } : {}),
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

    // Auto-recover from 401: clear expired/invalid token, re-create guest session, retry once
    if (response.status === 401 && !isRetry && cleanPath !== '/api/auth/guest') {
      console.warn('[apiFetch] 401 Unauthorized encountered. Refreshing guest session and retrying...');
      await tokenStorage.clearTokens();
      await createGuestSession();
      return apiFetch(path, options, true);
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
  createGuestSession
};

export default apiFetch;
