import { useCallback, useEffect, useState } from 'react';
import { activityService } from '../data/activityService';
import type { NotificationItem } from '../types';

type DetailStatus = 'loading' | 'ready' | 'missing';

export function useNotificationDetail(notificationId: string | undefined) {
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const [status, setStatus] = useState<DetailStatus>('loading');

  const load = useCallback(async () => {
    if (!notificationId) {
      setNotification(null);
      setStatus('missing');
      return;
    }

    setStatus('loading');
    const item = await activityService.getNotificationById(notificationId);
    if (!item) {
      setNotification(null);
      setStatus('missing');
      return;
    }

    if (!item.read) {
      await activityService.markRead(item.id);
    }

    setNotification({ ...item, read: true });
    setStatus('ready');
  }, [notificationId]);

  useEffect(() => {
    let active = true;

    void (async () => {
      await load();
      if (!active) return;
    })();

    return () => {
      active = false;
    };
  }, [load]);

  return { notification, status };
}
