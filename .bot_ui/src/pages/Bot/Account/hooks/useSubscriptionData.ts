import { useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import { loadPageData, PAGE_CACHE_TTL, pageCacheKey, readCachedPageData } from '@shared/cache/pageDataCache';
import type { SubscriptionDetails } from '../types';

export function useSubscriptionData() {
  const cacheKey = pageCacheKey('subscription');
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(() => readCachedPageData(cacheKey));

  useEffect(() => {
    let active = true;

    const load = async () => {
      const next = await loadPageData(cacheKey, () => accountService.getSubscriptionDetails(), PAGE_CACHE_TTL.subscription);
      if (active) setSubscription(next);
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
    subscription,
    isLoading: subscription === null,
  };
}

export type UseSubscriptionDataReturn = ReturnType<typeof useSubscriptionData>;
