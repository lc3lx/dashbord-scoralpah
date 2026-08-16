import { Text } from '@components/atoms/Text';
import type { TradeDetailRow } from '../../types';
import styles from './TradeDetailsSection.module.css';

export type TradeDetailsSectionProps = {
  rows: TradeDetailRow[];
};

export function TradeDetailsSection({ rows }: TradeDetailsSectionProps) {
  return (
    <section className={styles.section} aria-label="Trade details">
      <article className={styles.card}>
        {rows.map((row, index) => (
          <div
            key={row.id}
            className={styles.row}
            data-last={index === rows.length - 1 ? 'true' : undefined}
          >
            <Text variant="caption-xs" tone="caption">
              {row.label}
            </Text>
            <Text
              variant="caption-xs"
              tone={row.valueTone === 'success' ? 'success' : 'body'}
              align="right"
            >
              {row.value}
            </Text>
          </div>
        ))}
      </article>
    </section>
  );
}
