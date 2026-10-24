import { tokenStorage } from './tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Unified API Client for secure backend communication.
 * Automatically attaches JWT tokens, handles 401 by re-creating guest sessions,
 * and normalizes error responses.
 */
class ApiClient {
  async createGuestSession() {
    const url = `${BASE_URL}/api/auth/guest`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to create guest session with status ${response.status}`);
    }

    const data = await response.json();
    if (data.token) {
      await tokenStorage.setTokens(data.token, data.refreshToken);
      return data.token;
    }
    throw new Error('No token returned in guest session response');
  }

  async getAuthHeaders() {
    let token = await tokenStorage.getToken();
    if (!token) {
      token = await this.createGuestSession();
    }
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}, isRetry = false) {
    const url = `${BASE_URL}${endpoint}`;
    const authHeaders = endpoint === '/api/auth/guest' ? {} : await this.getAuthHeaders();

    const headers = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized by clearing stale token and refreshing guest session
      if (response.status === 401 && !isRetry && endpoint !== '/api/auth/guest') {
        console.warn('[ApiClient] 401 Unauthorized received. Re-creating guest session and retrying...');
        await tokenStorage.clearTokens();
        await this.createGuestSession();
        return this.request(endpoint, options, true);
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.code = data.error || 'API_ERROR';
        error.details = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const networkError = new Error('सर्वर से सम्पर्क नहीं हो सका। कृपया इंटरनेट या बैकएंड सर्वर की जाँच करें।');
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      }
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
