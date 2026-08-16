import { LimitCard } from '@components/molecules/LimitCard';
import type { LimitCardItem } from '../../types';
import styles from './RiskLimitsSection.module.css';

export type RiskLimitsSectionProps = {
  limits: LimitCardItem[];
};

export function RiskLimitsSection({ limits }: RiskLimitsSectionProps) {
  return (
    <section className={styles.section} aria-label="Risk limits">
      <div className={styles.grid}>
        {limits.map((limit) => (
          <LimitCard
            key={limit.id}
            iconSrc={limit.iconSrc}
            label={limit.label}
            value={limit.value}
            hint={limit.hint}
            valueTone={limit.valueTone}
          />
        ))}
      </div>
    </section>
  );
}
