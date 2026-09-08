import { PerformanceChart } from '@components/molecules/PerformanceChart';
import { StatCard } from '@components/molecules/StatCard';
import { useT } from '@shared/i18n';
import type { HomePerformancePoint, HomeStatItem } from '../../types';
import styles from './HomeStatsSection.module.css';

export type HomeStatsSectionProps = {
  stats: HomeStatItem[];
  points?: HomePerformancePoint[];
};

export function HomeStatsSection({ stats, points = [] }: HomeStatsSectionProps) {
  const t = useT();
  const visibleStats = stats.filter((stat) => stat.id !== 'today-loss');

  return (
    <section className={styles.section} aria-label={t('dashboard.performance')}>
      <PerformanceChart
        points={points}
        emptyLabel={
          points.length === 0 ? t('dashboard.performance.empty') : t('dashboard.performance.fromTrades')
        }
      />
      <div className={styles.grid}>
        {visibleStats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            valueTone={stat.valueTone}
            className={styles.card}
          />
        ))}
      </div>
    </section>
  );
}
