import { PerformanceChart } from '@components/molecules/PerformanceChart';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import type { DashboardPerformance, DashboardTimeframe } from '../../types';
import styles from './PerformanceSection.module.css';

export type PerformanceSectionProps = {
  performance: DashboardPerformance;
  activeTimeframe: DashboardTimeframe;
  onTimeframeChange: (timeframe: DashboardTimeframe) => void;
};

export function PerformanceSection({
  performance,
  activeTimeframe,
  onTimeframeChange,
}: PerformanceSectionProps) {
  const t = useT();
  const empty = performance.value === '—';
  const details = [
    { label: t('dashboard.performance.detail.trades'), value: String(performance.details.trades) },
    {
      label: t('dashboard.performance.detail.wins'),
      value: String(performance.details.wins),
      tone: 'success' as const,
    },
    {
      label: t('dashboard.performance.detail.losses'),
      value: String(performance.details.losses),
      tone: 'danger' as const,
    },
    { label: t('dashboard.performance.detail.winRate'), value: performance.details.winRate },
    {
      label: t('dashboard.performance.detail.profit'),
      value: performance.details.profit,
      tone: 'success' as const,
    },
    {
      label: t('dashboard.performance.detail.loss'),
      value: performance.details.loss,
      tone: 'danger' as const,
    },
  ];

  return (
    <section className={styles.card} aria-label={performance.label}>
      <div className={styles.top}>
        <div className={styles.copy}>
          <Text variant="caption" tone="primary" className={styles.label}>
            {performance.label}
          </Text>
          <Text
            variant="h3"
            tone={
              empty
                ? 'primary'
                : performance.value.startsWith('-')
                  ? 'danger'
                  : performance.value.startsWith('+')
                    ? 'success'
                    : 'primary'
            }
            className={styles.value}
          >
            {performance.value}
          </Text>
        </div>

        <div className={styles.tabs} role="tablist" aria-label={t('dashboard.performanceAria')}>
          {performance.timeframes.map((tab) => {
            const active = tab.id === activeTimeframe;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                onClick={() => onTimeframeChange(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <PerformanceChart
        points={performance.series}
        details={empty ? [] : details}
        emptyLabel={empty ? t('dashboard.performance.empty') : t('dashboard.performance.fromTrades')}
      />
    </section>
  );
}
