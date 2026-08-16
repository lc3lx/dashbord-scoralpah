import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { getNotificationDetailPath } from '@constants/routes';
import { useNotifications } from './hooks/useNotifications';
import { NotificationsHeaderSection } from './sections/NotificationsHeaderSection';
import { NotificationsListSection } from './sections/NotificationsListSection';
import type { NotificationItem } from './types';
import styles from './NotificationsPage.module.css';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, isLoading, markAllRead } = useNotifications();

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      navigate(getNotificationDetailPath(notification.id));
    },
    [navigate],
  );

  if (isLoading) return null;

  return (
    <main className={styles.page} aria-label="Notifications">
      <div className={styles.scroll}>
        <BackgroundGlow variant="top-right" />
        <PageContent className={styles.content}>
          <NotificationsHeaderSection onBack={() => navigate(-1)} onMarkAll={markAllRead} />
          <NotificationsListSection
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
          />
        </PageContent>
      </div>
    </main>
  );
}
