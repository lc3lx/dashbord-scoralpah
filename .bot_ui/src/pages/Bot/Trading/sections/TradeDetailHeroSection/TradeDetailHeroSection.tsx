import { tradeAssets } from '@assets/index';
import { Chip } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import { PageHeader } from '@components/organisms/PageHeader';
import { Text } from '@components/atoms/Text';
import { CandlestickChart } from '@components/organisms/CandlestickChart';
import type { TradeDetailContent } from '../../types';
import styles from './TradeDetailHeroSection.module.css';

export type TradeDetailHeroSectionProps = {
  content: TradeDetailContent['hero'];
  candleData: TradeDetailContent['candleData'];
};

const directionIconMap = {
  up: tradeAssets.arrowUp,
  down: tradeAssets.arrowDown,
} as const;

export function TradeDetailHeroSection({ content, candleData }: TradeDetailHeroSectionProps) {
  return (
    <section className={styles.section} aria-label="Trade overview">
      <article className={styles.card}>
        <div className={styles.heroRow}>
          <div className={styles.directionIcon}>
            <Icon src={directionIconMap[content.direction]} size="trade" decorative />
          </div>
          <div className={styles.info}>
            <Text variant="h3" tone="body" className={styles.pair}>
              {content.pair}
            </Text>
            <Text variant="caption-xs" tone="caption">
              {content.tradeRef}
            </Text>
          </div>
          <div className={styles.amountBlock}>
            <Text variant="h3" tone="body" align="right" className={styles.menuDots}>
              ...
            </Text>
            <Text variant="caption-xs" tone="caption" align="right">
              {content.amountLabel}
            </Text>
          </div>
        </div>

        <div className={styles.chartWrap}>
          <CandlestickChart data={candleData} height={146} className={styles.chart} />
        </div>
      </article>
    </section>
  );
}

export type TradeDetailHeaderSectionProps = {
  title: string;
  statusLabel: string;
  statusTone: TradeDetailContent['statusTone'];
  onBack: () => void;
};

export function TradeDetailHeaderSection({
  title,
  statusLabel,
  statusTone,
  onBack,
}: TradeDetailHeaderSectionProps) {
  return (
    <PageHeader
      title={title}
      onBack={onBack}
      action={<Chip label={statusLabel} tone={statusTone} style="solid" />}
      className={styles.header}
    />
  );
}
