import { Badge } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import type { SubscriptionDetails } from '../../types';
import styles from './SubscriptionCardSection.module.css';

export type SubscriptionCardSectionProps = {
  subscription: SubscriptionDetails;
};

export function SubscriptionCardSection({ subscription }: SubscriptionCardSectionProps) {
  const t = useT();
  const rows = [
    { label: t('account.subscription.start'), value: subscription.startDate },
    { label: t('account.subscription.end'), value: subscription.endDate },
    { label: t('account.subscription.daysLeft'), value: String(subscription.daysLeft) },
    { label: t('account.subscription.keyUsed'), value: subscription.keyUsedLabel },
  ];

  return (
    <section className={styles.section} aria-label={t('account.subscription.title')}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.iconWrap}>
            <Icon src={subscription.iconSrc} size="md" decorative />
          </span>
          <div className={styles.meta}>
            <Text variant="body" tone="body" className={styles.planName}>
              {subscription.planName}
            </Text>
            <Badge
              label={subscription.statusLabel}
              tone={subscription.statusTone}
              style="outlined"
            />
          </div>
        </div>

        <div className={styles.grid}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <Text variant="caption-xs" tone="caption" className={styles.label}>
                {row.label}
              </Text>
              <Text variant="caption-xs" tone="body" className={styles.value}>
                {row.value}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
