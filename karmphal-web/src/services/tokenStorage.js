import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'karmphal_jwt_token';
const REFRESH_TOKEN_KEY = 'karmphal_refresh_token';

/**
 * Token Storage Service
 * Uses Capacitor Preferences on native Android/iOS and falls back to localStorage on Web.
 */
class TokenStorage {
  async getToken() {
    try {
      const { value } = await Preferences.get({ key: TOKEN_KEY });
      if (value) return value;
    } catch {
      // Ignore native preference failure and fallback to localStorage
    }
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async getRefreshToken() {
    try {
      const { value } = await Preferences.get({ key: REFRESH_TOKEN_KEY });
      if (value) return value;
    } catch {
      // Ignore native preference failure and fallback to localStorage
    }
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setTokens(token, refreshToken = null) {
    if (token) {
      try {
        await Preferences.set({ key: TOKEN_KEY, value: token });
      } catch {
        // ignore
      }
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch {
        // ignore
      }
    }

    if (refreshToken) {
      try {
        await Preferences.set({ key: REFRESH_TOKEN_KEY, value: refreshToken });
      } catch {
        // ignore
      }
      try {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } catch {
        // ignore
      }
    }
  }

  async clearTokens() {
    try {
      await Preferences.remove({ key: TOKEN_KEY });
      await Preferences.remove({ key: REFRESH_TOKEN_KEY });
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
  }
}

export const tokenStorage = new TokenStorage();
