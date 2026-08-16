import { useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import { loadPageData, PAGE_CACHE_TTL, pageCacheKey, readCachedPageData } from '@shared/cache/pageDataCache';
import type { ActivationHistoryEntry } from '../types';

export function useActivationHistory() {
  const cacheKey = pageCacheKey('activation-history');
  const [entries, setEntries] = useState<ActivationHistoryEntry[] | null>(() => readCachedPageData(cacheKey));

  useEffect(() => {
    let active = true;

    const load = async () => {
      const next = await loadPageData(cacheKey, () => accountService.getActivationHistory(), PAGE_CACHE_TTL.subscription);
      if (active) setEntries(next);
    };

    void load();

    const unsubscribe = accountService.subscribe(() => {
      void load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [cacheKey]);

  return {
    entries: entries ?? [],
    isLoading: entries === null,
  };
}

export type UseActivationHistoryReturn = ReturnType<typeof useActivationHistory>;
