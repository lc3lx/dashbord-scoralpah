import { Chip } from '@components/atoms/Chip';
import { Text } from '@components/atoms/Text';
import type { DashboardBalance } from '../../types';
import styles from './BalanceCardSection.module.css';

export type BalanceCardSectionProps = {
  balance: DashboardBalance;
};

export function BalanceCardSection({ balance }: BalanceCardSectionProps) {
  return (
    <section className={styles.card} aria-label={balance.label}>
      <Chip
        label={balance.statusLabel}
        tone={balance.statusTone}
        showDot
        className={styles.status}
      />

      <Text variant="caption" className={styles.label}>
        {balance.label}
      </Text>
      <Text variant="h1" tone="primary" className={styles.value}>
        {balance.value}
      </Text>

      <div className={styles.growthRow}>
        <Text variant="caption" tone="primary" className={styles.growth}>
          {balance.growth}
        </Text>
        {balance.growthSuffix ? (
          <Text variant="caption-xs" className={styles.growthSuffix}>
            {balance.growthSuffix}
          </Text>
        ) : null}
      </div>

      <hr className={styles.divider} />

      <div className={styles.stats}>
        <div className={styles.stat}>
          <Text variant="caption-xs" className={styles.statLabel}>
            {balance.todayProfitLabel}
          </Text>
          <Text variant="caption" tone="success" className={styles.statValue}>
            {balance.todayProfitValue}
          </Text>
        </div>
        <div className={styles.stat}>
          <Text variant="caption-xs" className={styles.statLabel}>
            {balance.todayLossLabel}
          </Text>
          <Text variant="caption" tone="danger" className={styles.statValue}>
            {balance.todayLossValue}
          </Text>
        </div>
        <div className={styles.stat}>
          <Text variant="caption-xs" className={styles.statLabel}>
            {balance.netTodayLabel}
          </Text>
          <Text variant="caption" tone="primary" className={styles.statValue}>
            {balance.netTodayValue}
          </Text>
        </div>
      </div>
    </section>
  );
}
