import { Button } from '@components/atoms/Button';
import { PageHeader } from '@components/organisms/PageHeader';
import { Text } from '@components/atoms/Text';
import { activityService } from '../../data/activityService';
import styles from './NotificationsHeaderSection.module.css';

export type NotificationsHeaderSectionProps = {
  onBack: () => void;
  onMarkAll: () => void | Promise<void>;
};

export function NotificationsHeaderSection({
  onBack,
  onMarkAll,
}: NotificationsHeaderSectionProps) {
  const content = activityService.getNotificationsPageContent();

  return (
    <PageHeader
      title={content.title}
      onBack={onBack}
      action={
        <Button variant="text-link" className={styles.markAll} onClick={() => void onMarkAll()}>
          <Text variant="caption-xs" tone="link" className={styles.markAllLabel}>
            {content.markAllLabel}
          </Text>
        </Button>
      }
      className={styles.header}
    />
  );
}
