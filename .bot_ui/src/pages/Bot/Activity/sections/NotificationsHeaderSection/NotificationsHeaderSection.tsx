import { Button } from '@components/atoms/Button';
import { PageHeader } from '@components/organisms/PageHeader';
import { Text } from '@components/atoms/Text';
import { activityService } from '../../data/activityService';
import styles from './NotificationsHeaderSection.module.css';

export type NotificationsHeaderSectionProps = {
  onBack: () => void;
  onMarkAll: () => void;
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
        <Button variant="text-link" className={styles.markAll} onClick={onMarkAll}>
          <Text variant="caption-xs" tone="link">
            {content.markAllLabel}
          </Text>
        </Button>
      }
      className={styles.header}
    />
  );
}
