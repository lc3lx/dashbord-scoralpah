import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import type { DashboardMarketRow } from '../../types';
import styles from './RecentTradesSection.module.css';

export type RecentTradesSectionProps = {
  markets: DashboardMarketRow[];
};

export function RecentTradesSection({ markets }: RecentTradesSectionProps) {
  const t = useT();

  return (
    <section className={styles.list} aria-label={t('dashboard.marketsAria')}>
      {markets.length === 0 ? (
        <div className={styles.empty}>
          <Text variant="caption" tone="caption" align="center">
            {t('dashboard.markets.empty')}
          </Text>
        </div>
      ) : (
        markets.map((row) => (
          <article key={row.id} className={styles.row}>
            <span className={styles.abbr} aria-hidden="true">
              {row.abbr}
            </span>
            <div className={styles.copy}>
              <Text variant="body-sm" tone="primary" className={styles.pair}>
                {row.pair}
              </Text>
              <Text variant="caption-xs" className={styles.subtitle}>
                {row.subtitle}
              </Text>
            </div>
            <div className={styles.meta}>
              <Text variant="body-sm" tone={row.resultTone} className={styles.result}>
                {row.result}
              </Text>
              <Text variant="caption-xs" className={styles.stake}>
                {row.stake}
              </Text>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
