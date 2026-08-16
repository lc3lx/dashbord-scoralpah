import { useCallback, useEffect, useState } from 'react';
import { meApi } from '@shared/api';
import {
  loadPageData,
  PAGE_CACHE_TTL,
  pageCacheKey,
  readCachedPageData,
  storePageData,
} from '@shared/cache/pageDataCache';
import { dashboardService } from '../data/dashboardService';
import type { DashboardContent, DashboardTimeframe } from '../types';

const DEMO_POLL_MS = 12_000;

export function useDashboardData() {
  const cacheKey = pageCacheKey('dashboard');
  const demoCacheKey = pageCacheKey('dashboard-demo');
  const [data, setData] = useState<DashboardContent | null>(() => readCachedPageData(cacheKey));
  const [timeframe, setTimeframe] = useState<DashboardTimeframe>(
    dashboardService.getInitialTimeframe(),
  );
  const [isLoading, setIsLoading] = useState(() => readCachedPageData<DashboardContent>(cacheKey) === null);
  const [isDemo, setIsDemo] = useState(() => readCachedPageData<boolean>(demoCacheKey) ?? false);

  const refresh = useCallback(async (activeTimeframe: DashboardTimeframe) => {
    const content = await dashboardService.fetchContent(activeTimeframe);
    return content;
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const content = await loadPageData(cacheKey, () => refresh(timeframe), PAGE_CACHE_TTL.dashboard);
      if (!active) return;
      setData(content);
      setIsLoading(false);

      if (readCachedPageData<boolean>(demoCacheKey) === null) {
        try {
          const me = await meApi.get();
          const nextIsDemo = Boolean(me.isMarketingDemo);
          storePageData(demoCacheKey, nextIsDemo, PAGE_CACHE_TTL.dashboard);
          if (active) setIsDemo(nextIsDemo);
        } catch {
          /* keep non-demo polling off */
        }
      }
    })();

    return () => {
      active = false;
    };
    // Initial load only — timeframe switches recompute locally from tradeSnapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isDemo) return undefined;

    const timer = window.setInterval(() => {
      void refresh(timeframe).then((content) => {
        setData(content);
      });
    }, DEMO_POLL_MS);

    return () => window.clearInterval(timer);
  }, [isDemo, refresh, timeframe]);

  const selectTimeframe = useCallback((next: DashboardTimeframe) => {
    setTimeframe(next);
    setData((current) =>
      current ? dashboardService.performanceForTimeframe(current, next) : current,
    );
  }, []);

  return { data, isLoading, timeframe, selectTimeframe };
}
