import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { PageHeader } from '@components/organisms/PageHeader';
import { Text } from '@components/atoms/Text';
import { getTradeDetailPath, ROUTES } from '@constants/routes';
import { useT } from '@shared/i18n';
import { activityService } from './data/activityService';
import { useNotificationDetail } from './hooks/useNotificationDetail';
import { NotificationDetailSection } from './sections/NotificationDetailSection';
import styles from './NotificationDetailPage.module.css';

export default function NotificationDetailPage() {
  const t = useT();
  const { notificationId } = useParams<{ notificationId: string }>();
  const navigate = useNavigate();
  const { notification, status } = useNotificationDetail(notificationId);
  const content = activityService.getNotificationsPageContent();

  const handleAction = useCallback(() => {
    if (!notification) return;

    if (notification.action?.path) {
      navigate(notification.action.path);
      return;
    }

    if (notification.tradeId) {
      navigate(getTradeDetailPath(notification.tradeId));
      return;
    }

    navigate(ROUTES.home);
  }, [navigate, notification]);

  if (status === 'loading') return null;

  return (
    <main className={styles.page} aria-label={t('notifications.aria')}>
      <div className={styles.scroll}>
        <PageContent className={styles.content}>
          <PageHeader title={content.title} onBack={() => navigate(ROUTES.notifications)} />

          {status === 'missing' || !notification ? (
            <Text variant="body-sm" className={styles.missing}>
              {t('notifications.notFound')}
            </Text>
          ) : (
            <NotificationDetailSection
              notification={notification}
              actionLabel={notification.action?.label ?? content.defaultActionLabel}
              onAction={handleAction}
            />
          )}
        </PageContent>
      </div>
    </main>
  );
}
