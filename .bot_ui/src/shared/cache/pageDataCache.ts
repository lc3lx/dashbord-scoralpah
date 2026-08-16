import { tokenStore } from '@shared/auth/tokenStore';

type CacheEntry = {
  expiresAt: number;
  value?: unknown;
  pending?: Promise<unknown>;
};

const entries = new Map<string, CacheEntry>();

/**
 * Page data is deliberately kept in memory only. It makes back-and-forth
 * navigation immediate, without persisting potentially account-specific data
 * to browser storage.
 */
export function pageCacheKey(page: string): string {
  return `${tokenStore.getUserId() ?? 'anonymous'}:${page}`;
}

export function readCachedPageData<T>(key: string): T | null {
  const entry = entries.get(key);
  if (!entry || entry.value === undefined || entry.expiresAt <= Date.now()) return null;
  return entry.value as T;
}

export async function loadPageData<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs: number,
  force = false,
): Promise<T> {
  const current = entries.get(key);
  if (!force && current?.value !== undefined && current.expiresAt > Date.now()) {
    return current.value as T;
  }
  if (current?.pending) return current.pending as Promise<T>;

  const pending = loader()
    .then((value) => {
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .catch((error: unknown) => {
      entries.delete(key);
      throw error;
    });

  entries.set(key, {
    value: current?.value,
    expiresAt: current?.expiresAt ?? 0,
    pending,
  });

  return pending;
}

export function storePageData<T>(key: string, value: T, ttlMs: number): void {
  entries.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidatePageData(key: string): void {
  entries.delete(key);
}

export const PAGE_CACHE_TTL = {
  account: 30_000,
  dashboard: 20_000,
  history: 15_000,
  home: 20_000,
  notifications: 30_000,
  subscription: 60_000,
  trading: 10_000,
} as const;
