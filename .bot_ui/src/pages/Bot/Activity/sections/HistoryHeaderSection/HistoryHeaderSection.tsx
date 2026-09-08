import { Text } from '@components/atoms/Text';
import { tradeService } from '@services/trades';
import styles from './HistoryHeaderSection.module.css';

export type HistoryHeaderSectionProps = {
  onBack?: () => void;
};

export function HistoryHeaderSection(_props: HistoryHeaderSectionProps) {
  const content = tradeService.getHistoryPageContent();

  return (
    <section className={styles.section} aria-label="Trades header">
      <Text variant="h1" tone="body" className={styles.title}>
        {content.title}
      </Text>
    </section>
  );
}
