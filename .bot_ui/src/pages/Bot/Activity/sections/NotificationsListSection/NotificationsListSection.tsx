import { NotificationCard } from '@components/molecules/NotificationCard';
import type { NotificationItem } from '../../types';
import styles from './NotificationsListSection.module.css';

export type NotificationsListSectionProps = {
  notifications: NotificationItem[];
  onNotificationClick: (notification: NotificationItem) => void;
};

export function NotificationsListSection({
  notifications,
  onNotificationClick,
}: NotificationsListSectionProps) {
  return (
    <section className={styles.section} aria-label="Notifications list">
      <ul className={styles.list}>
        {notifications.map((notification) => (
          <li key={notification.id} className={styles.item}>
            <NotificationCard
              variant={notification.variant}
              title={notification.title}
              description={notification.description}
              timestamp={notification.timestamp}
              onClick={
                notification.tradeId ? () => onNotificationClick(notification) : undefined
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
