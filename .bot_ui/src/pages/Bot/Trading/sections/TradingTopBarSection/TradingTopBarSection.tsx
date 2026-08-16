import { Button } from '@components/atoms/Button';
import { Chip } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import type { TradingTopBarContent } from '../../types';
import { TradingBrandMark } from '../../components/TradingBrandMark';
import styles from './TradingTopBarSection.module.css';

export type TradingTopBarSectionProps = {
  content: TradingTopBarContent;
  onRefresh?: () => void;
  onExport?: () => void;
};

export function TradingTopBarSection({ content, onRefresh, onExport }: TradingTopBarSectionProps) {
  return (
    <section className={styles.section} aria-label="Trading header">
      <TradingBrandMark />

      <div className={styles.actions}>
        <Chip
          label={content.connectionLabel}
          tone={content.connectionTone}
          style="solid"
          className={styles.connectionChip}
        />
        <Button variant="icon" className={styles.actionButton} aria-label={content.refreshAriaLabel} onClick={onRefresh}>
          <Icon src={content.refreshIconSrc} decorative className={styles.actionIcon} />
        </Button>
        <Button variant="icon" className={styles.actionButton} aria-label={content.exportAriaLabel} onClick={onExport}>
          <Icon src={content.exportIconSrc} decorative className={styles.actionIcon} />
        </Button>
      </div>
    </section>
  );
}
