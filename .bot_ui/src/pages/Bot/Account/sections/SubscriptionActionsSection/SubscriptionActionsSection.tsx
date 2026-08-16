import { Button } from '@components/atoms/Button';
import styles from './SubscriptionActionsSection.module.css';

export type SubscriptionActionsSectionProps = {
  enterKeyLabel: string;
  viewHistoryLabel: string;
  onEnterKey: () => void;
  onViewHistory: () => void;
};

export function SubscriptionActionsSection({
  enterKeyLabel,
  viewHistoryLabel,
  onEnterKey,
  onViewHistory,
}: SubscriptionActionsSectionProps) {
  return (
    <section className={styles.section} aria-label="Subscription actions">
      <Button variant="primary" fullWidth onClick={onEnterKey}>
        {enterKeyLabel}
      </Button>
      <Button variant="ghost" fullWidth onClick={onViewHistory} className={styles.secondary}>
        {viewHistoryLabel}
      </Button>
    </section>
  );
}
