import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { ApiClientError } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
import { accountService } from '../services/accountService';
import { loadPageData, PAGE_CACHE_TTL, pageCacheKey, readCachedPageData, storePageData } from '@shared/cache/pageDataCache';
import type { AccountSnapshot } from '../types';

export function useAccountData() {
  const navigate = useNavigate();
  const cacheKey = pageCacheKey('account');
  const [snapshot, setSnapshot] = useState<AccountSnapshot | null>(() => readCachedPageData(cacheKey));
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    const load = async () => {
      try {
        const next = await loadPageData(cacheKey, () => accountService.fetchAccountSnapshot(), PAGE_CACHE_TTL.account);
        if (activeRef.current) {
          setSnapshot(next);
          setError(null);
        }
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          tokenStore.clear();
          navigate(ROUTES.login, { replace: true });
          return;
        }
        if (activeRef.current) {
          setError(err instanceof ApiClientError ? err.message : t('account.loadError'));
        }
      }
    };

    void load();

    const unsubscribe = accountService.subscribe(() => {
      void accountService.fetchAccountSnapshot().then((next) => {
        storePageData(cacheKey, next, PAGE_CACHE_TTL.account);
        if (activeRef.current) setSnapshot(next);
      });
    });

    return () => {
      activeRef.current = false;
      unsubscribe();
    };
  }, [cacheKey, navigate]);

  const refresh = useCallback(async () => {
    const next = await accountService.fetchAccountSnapshot();
    storePageData(cacheKey, next, PAGE_CACHE_TTL.account);
    if (activeRef.current) setSnapshot(next);
  }, [cacheKey]);

  const logout = useCallback(async () => {
    await accountService.logout();
  }, []);

  return {
    snapshot,
    isLoading: snapshot === null && !error,
    error,
    refresh,
    logout,
  };
}

export type UseAccountDataReturn = ReturnType<typeof useAccountData>;
