import { OptionChip } from '@components/molecules/OptionChip';
import { tradeService } from '@services/trades';
import type { TradeListFilter } from '@services/trades';
import styles from './HistoryFiltersSection.module.css';

export type HistoryFiltersSectionProps = {
  activeFilter: TradeListFilter;
  onFilterChange: (filter: TradeListFilter) => void;
};

export function HistoryFiltersSection({
  activeFilter,
  onFilterChange,
}: HistoryFiltersSectionProps) {
  const content = tradeService.getHistoryPageContent();

  return (
    <section className={styles.section} aria-label="Trade filters">
      <div className={styles.scroll}>
        {content.filterOptions.map((option) => (
          <OptionChip
            key={option.id}
            label={option.label}
            selected={activeFilter === option.id}
            onSelect={() => onFilterChange(option.id)}
            className={styles.chip}
          />
        ))}
      </div>
    </section>
  );
}
