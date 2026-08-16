import { uiAssets } from '@assets/index';
import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { tradeService } from '@services/trades';
import { useT } from '@shared/i18n';
import styles from './HistoryHeaderSection.module.css';

export type HistoryHeaderSectionProps = {
  onBack: () => void;
};

export function HistoryHeaderSection({ onBack }: HistoryHeaderSectionProps) {
  const t = useT();
  const content = tradeService.getHistoryPageContent();

  return (
    <section className={styles.section} aria-label="Trades header">
      <Text variant="h1" tone="body" className={styles.title}>
        {content.title}
      </Text>
      <Button
        variant="icon"
        className={styles.filterButton}
        aria-label={t('common.goBack')}
        onClick={onBack}
      >
        <Icon src={uiAssets.back} size="sm" decorative />
      </Button>
    </section>
  );
}
