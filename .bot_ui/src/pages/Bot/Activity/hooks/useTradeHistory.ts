import { useEffect, useState } from 'react';
import { tradeService } from '@services/trades';
import { loadPageData, PAGE_CACHE_TTL, pageCacheKey, readCachedPageData, storePageData } from '@shared/cache/pageDataCache';
import type { PaginatedResult, TradeListFilter, TradeRecord } from '@services/trades';

const DEFAULT_PAGE_SIZE = 20;

export function useTradeHistory(filter: TradeListFilter) {
  const cacheKey = pageCacheKey(`history:${filter}`);
  const [result, setResult] = useState<PaginatedResult<TradeRecord> | null>(() => readCachedPageData(cacheKey));

  useEffect(() => {
    let active = true;

    const load = async () => {
      const next = await loadPageData(
        cacheKey,
        () => tradeService.listTrades({ filter, page: 1, pageSize: DEFAULT_PAGE_SIZE }),
        PAGE_CACHE_TTL.history,
      );
      if (active) setResult(next);
    };

    void load();

    const unsubscribe = tradeService.subscribe(() => {
      void tradeService.listTrades({ filter, page: 1, pageSize: DEFAULT_PAGE_SIZE }).then((next) => {
        storePageData(cacheKey, next, PAGE_CACHE_TTL.history);
        if (active) setResult(next);
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [cacheKey, filter]);

  return {
    trades: result?.items ?? [],
    total: result?.total ?? 0,
    hasMore: result?.hasMore ?? false,
    isEmpty: (result?.total ?? 0) === 0,
    isLoading: result === null,
  };
}

export type UseTradeHistoryReturn = ReturnType<typeof useTradeHistory>;
