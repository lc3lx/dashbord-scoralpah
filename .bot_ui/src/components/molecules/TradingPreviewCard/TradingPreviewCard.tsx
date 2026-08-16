import { imageAssets, uiAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import { cn } from '@utils/cn';
import styles from './TradingPreviewCard.module.css';

export type TradingPreviewCardProps = {
  pair?: string;
  timer?: string;
  className?: string;
};

export function TradingPreviewCard({
  pair,
  timer = '00:43',
  className,
}: TradingPreviewCardProps) {
  const t = useT();
  const pairLabel = pair ?? t('onboarding.preview.trading');

  return (
    <article className={cn(styles.card, className)} aria-label={t('onboarding.preview.aria')}>
      <header className={styles.header}>
        <div className={styles.pairInfo}>
          <span className={styles.chartIconWrap}>
            <Icon src={uiAssets.chart} size="xs" decorative />
          </span>
          <Text variant="caption-xs" tone="connector">
            {pairLabel}
          </Text>
        </div>
        <Text variant="caption-xs" tone="connector" className={styles.timer}>
          {timer}
        </Text>
      </header>

      <div className={styles.chartWrap}>
        <img src={imageAssets.onboardingChart} alt="" className={styles.chart} />
      </div>

      <footer className={styles.actions}>
        <div className={cn(styles.tradeButton, styles.upButton)}>
          <Icon src={uiAssets.upArrow} size="xs" decorative />
          <Text variant="caption" tone="primary" className={styles.tradeLabel}>
            {t('common.up')}
          </Text>
        </div>
        <div className={cn(styles.tradeButton, styles.downButton)}>
          <Icon src={uiAssets.downArrow} size="xs" decorative />
          <Text variant="caption" tone="primary" className={styles.tradeLabel}>
            {t('common.down')}
          </Text>
        </div>
      </footer>
    </article>
  );
}
