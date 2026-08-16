import { StatCard } from '@components/molecules/StatCard';
import type { HomeStatItem } from '../../types';
import styles from './HomeStatsSection.module.css';

export type HomeStatsSectionProps = {
  stats: HomeStatItem[];
};

export function HomeStatsSection({ stats }: HomeStatsSectionProps) {
  return (
    <section className={styles.section} aria-label="Performance stats">
      <div className={styles.grid}>
        {stats.map((stat) => (
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
