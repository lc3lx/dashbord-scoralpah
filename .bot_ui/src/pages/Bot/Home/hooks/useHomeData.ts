import { useCallback, useEffect, useMemo, useState } from 'react';
import { homeService } from '../data/homeService';
import { invalidatePageData, loadPageData, PAGE_CACHE_TTL, pageCacheKey, readCachedPageData } from '@shared/cache/pageDataCache';
import type { HomeConfigRow, HomeData, HomeRuntimeState } from '../types';

function resolveConfigValue(
  row: HomeConfigRow,
  runtime: HomeRuntimeState,
  data: HomeData,
): string {
  const sheets = data.sheets;

  if (row.sheetTarget === 'marketType') {
    const selected = sheets.marketType.options.find(
      (option) => option.id === runtime.marketTypeId,
    );
    return selected?.title ?? row.value;
  }

  if (row.sheetTarget === 'tradingPair') {
    const ids =
      runtime.tradingPairIds?.length > 0
        ? runtime.tradingPairIds
        : runtime.tradingPairId
          ? [runtime.tradingPairId]
          : [];
    if (ids.length === 0) return row.value;
    const titles = ids.map(
      (id) => sheets.tradingPair.options.find((option) => option.id === id)?.title ?? id,
    );
    if (titles.length === 1) return titles[0] ?? row.value;
    return `${titles[0]} +${titles.length - 1}`;
  }

  if (row.sheetTarget === 'technicalIndicator') {
    const selected = sheets.technicalIndicator.options.find(
      (option) => option.id === runtime.technicalIndicatorId,
    );
    return selected?.title ?? row.value;
  }

  if (row.sheetTarget === 'strategy') {
    const selected = sheets.strategy.options.find(
      (option) => option.id === runtime.strategyId,
    );
    return selected?.title ?? row.value;
  }

  return row.value;
}

export function useHomeData() {
  const cacheKey = pageCacheKey('home');
  const [data, setData] = useState<HomeData | null>(() => readCachedPageData(cacheKey));
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    const force = reloadToken > 0;

    void loadPageData(
      cacheKey,
      () => homeService.fetchHomeData(),
      PAGE_CACHE_TTL.home,
      force,
    )
      .then((next) => {
        if (active) setData(next);
      })
      .catch(() => {
        /* keep loading UI; fetchHomeData is defensive and should not reject */
      });

    return () => {
      active = false;
    };
  }, [cacheKey, reloadToken]);

  useEffect(() => {
    const timer = window.setInterval(() => setReloadToken((n) => n + 1), 2_000);
    return () => window.clearInterval(timer);
  }, []);

  const configRows = useMemo(() => {
    if (!data) return [];

    return data.configRows.map((row) => ({
      ...row,
      value: resolveConfigValue(row, data.runtime, data),
    }));
  }, [data]);

  const tradeAmount = useMemo(() => {
    if (!data) return null;

    const selected = data.tradeAmount.options.find(
      (option) => option.id === data.runtime.tradeAmountId,
    );

    return {
      ...data.tradeAmount,
      selectedId: data.runtime.tradeAmountId,
      displayValue: selected?.label ?? data.tradeAmount.displayValue,
    };
  }, [data]);

  const duration = useMemo(() => {
    if (!data) return null;

    const selected = data.duration.options.find(
      (option) => option.id === data.runtime.durationId,
    );

    return {
      ...data.duration,
      selectedId: data.runtime.durationId,
      displayValue: selected?.label ?? data.duration.displayValue,
    };
  }, [data]);

  const refresh = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  const updateRuntime = useCallback(async (partial: Partial<HomeRuntimeState>) => {
    const runtime = await homeService.updateRuntime(partial);
    invalidatePageData(cacheKey);
    setData((current) => (current ? { ...current, runtime } : current));

    // Pair / strategy changes need a live RSI + candles refresh.
    if (partial.tradingPairId !== undefined || partial.tradingPairIds !== undefined || partial.strategyId !== undefined) {
      setReloadToken((n) => n + 1);
    }

    return runtime;
  }, [cacheKey]);

  return {
    data,
    configRows,
    tradeAmount,
    duration,
    updateRuntime,
    refresh,
  };
}

export type UseHomeDataReturn = ReturnType<typeof useHomeData>;
