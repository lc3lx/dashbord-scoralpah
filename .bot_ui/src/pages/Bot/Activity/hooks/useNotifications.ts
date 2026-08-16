import { useCallback, useEffect, useRef, useState } from 'react';
import { activityService } from '../data/activityService';
import { loadPageData, PAGE_CACHE_TTL, pageCacheKey, readCachedPageData, storePageData } from '@shared/cache/pageDataCache';
import type { NotificationItem } from '../types';

export function useNotifications() {
  const cacheKey = pageCacheKey('notifications');
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(() => readCachedPageData(cacheKey));
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    const load = async () => {
      const next = await loadPageData(cacheKey, () => activityService.fetchNotifications(), PAGE_CACHE_TTL.notifications);
      if (activeRef.current) setNotifications(next);
    };

    void load();

    const unsubscribe = activityService.subscribe(() => {
      void activityService.fetchNotifications().then((next) => {
        storePageData(cacheKey, next, PAGE_CACHE_TTL.notifications);
        if (activeRef.current) setNotifications(next);
      });
    });

    return () => {
      activeRef.current = false;
      unsubscribe();
    };
  }, [cacheKey]);

  const markAllRead = useCallback(async () => {
    const next = await activityService.markAllRead();
    storePageData(cacheKey, next, PAGE_CACHE_TTL.notifications);
    if (activeRef.current) setNotifications(next);
  }, [cacheKey]);

  return {
    notifications: notifications ?? [],
    isLoading: notifications === null,
    markAllRead,
  };
}

export type UseNotificationsReturn = ReturnType<typeof useNotifications>;
