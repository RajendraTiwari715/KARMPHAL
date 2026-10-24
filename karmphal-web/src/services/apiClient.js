import { storageService } from './storageService';

const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Unified API Client for secure backend communication.
 * Automatically handles auth tokens, JSON serialization, and safe error messages.
 */
class ApiClient {
  async getAuthHeaders() {
    let token = storageService.getToken();
    if (!token) {
      token = await storageService.initializeAuth();
    }
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();

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
