import { useCallback, useEffect, useMemo, useState } from 'react';
import { tradingService } from '../data/tradingService';
import { invalidatePageData, loadPageData, PAGE_CACHE_TTL, pageCacheKey, readCachedPageData, storePageData } from '@shared/cache/pageDataCache';
import { getTradingMockContent } from '../data/trading.mock';
import type { TradingData, TradingRuntimeState } from '../types';

/** Full candles/RSI refresh — recover empty chart after post-login asset warmup */
const LIVE_REFRESH_MS = 10_000;
/** Price tick — keep below subscribe thrash; quote needs MarketDataTimeout headroom */
const LIVE_TICK_MS = 3_000;

export function useTradingData() {
  const cacheKey = pageCacheKey('trading');
  const [data, setData] = useState<TradingData | null>(() => readCachedPageData(cacheKey));

  const reload = useCallback(async () => {
    invalidatePageData(cacheKey);
    const next = await tradingService.fetchTradingData();
    storePageData(cacheKey, next, PAGE_CACHE_TTL.trading);
    setData(next);
    return next;
  }, [cacheKey]);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const next = await loadPageData(cacheKey, () => tradingService.fetchTradingData(), PAGE_CACHE_TTL.trading);
        if (active) setData(next);
      } catch {
        /* keep loading UI */
      }
    })();

    const refreshTimer = window.setInterval(() => {
      void (async () => {
        try {
          const next = await tradingService.fetchTradingData();
          storePageData(cacheKey, next, PAGE_CACHE_TTL.trading);
          if (active) setData(next);
        } catch {
          /* ignore refresh errors */
        }
      })();
    }, LIVE_REFRESH_MS);

    const tickTimer = window.setInterval(() => {
      void (async () => {
        try {
          const price = await tradingService.fetchLivePrice();
          if (!active || price == null) return;
          setData((current) =>
            current ? tradingService.applyLiveQuote(current, price) : current,
          );
        } catch {
          /* ignore tick errors */
        }
      })();
    }, LIVE_TICK_MS);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.clearInterval(tickTimer);
    };
  }, [cacheKey]);

  const duration = useMemo(() => {
    if (!data) return null;

    const selected = data.durationOptions.find((option) => option.id === data.runtime.durationId);

    return {
      selectedId: data.runtime.durationId,
      label: selected?.label ?? getTradingMockContent().durationOptions[0].label,
    };
  }, [data]);

  // Static selected duration — not a local fake countdown of an open order.
  const expiryDisplay = useMemo(() => {
    if (!duration) return '—';
    return duration.label;
  }, [duration]);

  const updateRuntime = useCallback(async (partial: Partial<TradingRuntimeState>) => {
    const runtime = await tradingService.updateRuntime(partial);
    invalidatePageData(cacheKey);
    setData((current) => (current ? { ...current, runtime } : current));
    return runtime;
  }, [cacheKey]);

  const cycleTradeDuration = useCallback(async () => {
    const runtime = await tradingService.cycleTradeDuration();
    invalidatePageData(cacheKey);
    setData((current) => (current ? { ...current, runtime } : current));
    return runtime;
  }, [cacheKey]);

  const selectCandlePeriod = useCallback(async (candlePeriodId: string) => {
    await tradingService.setCandlePeriod(candlePeriodId);
    invalidatePageData(cacheKey);
    const next = await tradingService.fetchTradingData();
    setData(next);
    return next;
  }, [cacheKey]);

  const selectPair = useCallback(async (symbol: string) => {
    tradingService.setSelectedAsset(symbol);
    invalidatePageData(cacheKey);
    const next = await tradingService.fetchTradingData();
    setData(next);
    return next;
  }, [cacheKey]);

  const placeTrade = useCallback(async (direction: 'up' | 'down') => {
    return tradingService.placeTrade(direction);
  }, []);

  return {
    data,
    duration,
    expiryDisplay,
    updateRuntime,
    cycleTradeDuration,
    selectCandlePeriod,
    selectPair,
    placeTrade,
    reload,
  };
}

export type UseTradingDataReturn = ReturnType<typeof useTradingData>;
