import { useEffect, useState } from 'react';
import { LimitCard } from '@components/molecules/LimitCard';
import { useT } from '@shared/i18n';
import type { LimitCardItem } from '../../types';
import styles from './RiskLimitsSection.module.css';

export type RiskLimitsSectionProps = {
  limits: LimitCardItem[];
  profitTarget: number;
  lossLimit: number;
  onLimitChange: (field: 'dailyProfitTarget' | 'dailyLossLimit', value: number) => void;
};

function parseLimit(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export function RiskLimitsSection({
  limits,
  profitTarget,
  lossLimit,
  onLimitChange,
}: RiskLimitsSectionProps) {
  const t = useT();
  const [profitDraft, setProfitDraft] = useState(String(profitTarget));
  const [lossDraft, setLossDraft] = useState(String(lossLimit));

  useEffect(() => {
    setProfitDraft(String(profitTarget));
  }, [profitTarget]);

  useEffect(() => {
    setLossDraft(String(lossLimit));
  }, [lossLimit]);

  return (
    <section className={styles.section} aria-label="Risk limits">
      <div className={styles.grid}>
        {limits.map((limit) => {
          const isProfit = limit.id === 'profit-target';
          return (
            <LimitCard
              key={limit.id}
              iconSrc={limit.iconSrc}
              label={limit.label}
              value={limit.value}
              hint={t('home.risk.tapToEdit')}
              valueTone={limit.valueTone}
              editable
              prefix={isProfit ? '$' : '-$'}
              inputValue={isProfit ? profitDraft : lossDraft}
              onInputChange={isProfit ? setProfitDraft : setLossDraft}
              onCommit={() => {
                onLimitChange(
                  isProfit ? 'dailyProfitTarget' : 'dailyLossLimit',
                  parseLimit(isProfit ? profitDraft : lossDraft),
                );
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
