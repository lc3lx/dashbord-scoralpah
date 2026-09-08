import { useEffect, useState } from 'react';
import { tradeService } from '@services/trades';
import { loadPageData, PAGE_CACHE_TTL, pageCacheKey, readCachedPageData, storePageData } from '@shared/cache/pageDataCache';
import type { PaginatedResult, TradeListFilter, TradeRecord } from '@services/trades';

export function useTradeHistory(filter: TradeListFilter) {
  const cacheKey = pageCacheKey(`history:${filter}:all`);
  const [result, setResult] = useState<PaginatedResult<TradeRecord> | null>(() => readCachedPageData(cacheKey));

  useEffect(() => {
    let active = true;

    const logList = (next: PaginatedResult<TradeRecord>, source: string) => {
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
        body: JSON.stringify({
          sessionId: '1892a4',
          runId: 'post-fix',
          hypothesisId: 'A',
          location: 'useTradeHistory.ts:list',
          message: 'history_all_pages',
          data: {
            source,
            filter,
            itemCount: next.items.length,
            total: next.total,
            hasMore: next.hasMore,
            pageSize: next.pageSize,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    };

    const load = async () => {
      const next = await loadPageData(
        cacheKey,
        () => tradeService.listAllTrades(filter),
        PAGE_CACHE_TTL.history,
      );
      if (active) {
        setResult(next);
        logList(next, 'load');
      }
    };

    void load();

    const unsubscribe = tradeService.subscribe(() => {
      void tradeService.listAllTrades(filter).then((next) => {
        storePageData(cacheKey, next, PAGE_CACHE_TTL.history);
        if (active) {
          setResult(next);
          logList(next, 'subscribe');
        }
      });
    });

    const pollId = window.setInterval(() => {
      void tradeService.listAllTrades(filter).then((next) => {
        storePageData(cacheKey, next, PAGE_CACHE_TTL.history);
        if (active) setResult(next);
      });
    }, 8_000);

    const tickId = window.setInterval(() => {
      if (!active) return;
      setResult((current) => {
        if (!current?.items.some((t) => t.status === 'running')) return current;
        return {
          ...current,
          items: current.items.map((t) => {
            if (t.status !== 'running') return t;
            const dur = t.durationSeconds ?? 300;
            const expired = Date.now() > t.openedAt + (dur + 90) * 1000;
            if (expired) {
              return { ...t, status: 'unknown' as const, liveTimerSeconds: 0 };
            }
            const left = Math.max(0, Math.ceil((t.openedAt + dur * 1000 - Date.now()) / 1000));
            return left === t.liveTimerSeconds ? t : { ...t, liveTimerSeconds: left };
          }),
        };
      });
    }, 1000);

    return () => {
      active = false;
      unsubscribe();
      window.clearInterval(pollId);
      window.clearInterval(tickId);
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
