import { isTelegramWebApp } from '@shared/telegram/telegramWebApp';

const TOKEN_KEY = 'scaralpha.jwt';
const USER_KEY = 'scaralpha.userId';

function storage(): Storage {
  try {
    return isTelegramWebApp() ? sessionStorage : localStorage;
  } catch {
    return sessionStorage;
  }
}

/**
 * JWT only — never store Binolla SSID here.
 * Telegram Mini App uses sessionStorage; the website uses localStorage.
 */
export const tokenStore = {
  getAccessToken(): string | null {
    try {
      return storage().getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getUserId(): string | null {
    try {
      return storage().getItem(USER_KEY);
    } catch {
      return null;
    }
  },

  setSession(accessToken: string, userId: string): void {
    const store = storage();
    store.setItem(TOKEN_KEY, accessToken);
    store.setItem(USER_KEY, userId);
  },

  clear(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore quota / private mode
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  },
};
