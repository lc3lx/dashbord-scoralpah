import { TradeCard } from '@components/molecules/TradeCard';
import { Text } from '@components/atoms/Text';
import type { TradeRecord } from '@services/trades';
import { tradeService } from '@services/trades';
import { mapTradeRecordToCardProps } from '../../utils/mapTradeRecordToCardProps';
import styles from './HistoryListSection.module.css';

export type HistoryListSectionProps = {
  trades: TradeRecord[];
  isEmpty: boolean;
  activeFilter: string;
  onTradeSelect: (tradeId: string) => void;
};

export function HistoryListSection({
  trades,
  isEmpty,
  activeFilter,
  onTradeSelect,
}: HistoryListSectionProps) {
  const content = tradeService.getHistoryPageContent();

  if (isEmpty) {
    const isFiltered = activeFilter !== 'all';

    return (
      <section className={styles.empty} aria-label="Empty trade history">
        <Text variant="body-sm" tone="body" align="center" className={styles.emptyTitle}>
          {isFiltered ? content.emptyFilterMessage : content.emptyAllMessage}
        </Text>
        <Text variant="caption-xs" tone="caption" align="center">
          {isFiltered ? content.emptyFilterDescription : content.emptyAllDescription}
        </Text>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label="Trade history list">
      <ul className={styles.list}>
        {trades.map((trade) => {
          const cardProps = mapTradeRecordToCardProps(trade);

          return (
            <li key={trade.id} className={styles.item}>
              <TradeCard {...cardProps} onDetails={() => onTradeSelect(trade.id)} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
