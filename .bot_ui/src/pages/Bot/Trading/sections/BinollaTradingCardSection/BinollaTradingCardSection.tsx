import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { CandlestickChart } from '@components/organisms/CandlestickChart';
import { useT } from '@shared/i18n';
import type { BinollaCardContent } from '../../types';
import styles from './BinollaTradingCardSection.module.css';

export type BinollaTradingCardSectionProps = {
  content: BinollaCardContent;
};

/** A read-only market monitor. Scar Alpha opens and closes trades autonomously. */
export function BinollaTradingCardSection({ content }: BinollaTradingCardSectionProps) {
  const t = useT();
  const last = content.candleData[content.candleData.length - 1];
  const priceTone = last == null ? undefined : last.close >= last.open ? 'up' : 'down';
  const pair = content.pairSymbol ?? content.pairName;

  return (
    <section className={styles.section} aria-label={t('nav.trading')}>
      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.platform}>
            <div className={styles.platformIcon}>
              <Icon src={content.platformIconSrc} decorative className={styles.platformIconImage} />
            </div>
            <div>
              <Text variant="caption" tone="primary" className={styles.platformLabel}>
                {content.platformLabel}
              </Text>
              <Text variant="caption-xs" tone="muted" className={styles.monitorLabel}>
                {t('trading.monitorOnly')}
              </Text>
            </div>
          </div>
          <Text variant="caption-xs" tone="caption" className={styles.balance}>
            {content.balancePrefix}{' '}
            <Text as="span" variant="caption-xs" tone="primary">
              {content.balanceValue}
            </Text>
          </Text>
        </header>

        <div className={styles.marketBar}>
          <div>
            <Text variant="body-sm" tone="primary" className={styles.pairName}>
              {pair}
              {content.pairSuffix ? ` · ${content.pairSuffix}` : ''}
            </Text>
            <p className={styles.price} data-tone={priceTone}>
              {content.priceDisplay}
            </p>
          </div>
          <span className={styles.liveBadge} aria-label={t('trading.liveMarket')}>
            <span className={styles.liveDot} />
            {t('trading.liveMarket')}
          </span>
        </div>

        {content.activeTrade ? (
          <div className={styles.activeTrade} aria-live="polite">
            <span className={styles.activeDot} />
            <Text variant="caption-xs" tone="primary">
              {t('trading.monitorOnly')} · {content.activeTrade.direction} {content.activeTrade.asset}
              {' · '}${content.activeTrade.amount.toFixed(2)} · {Math.round(content.activeTrade.durationSeconds / 60)}m
            </Text>
          </div>
        ) : null}

        <div className={styles.chartWrap}>
          {content.candleData.length > 0 ? (
            <CandlestickChart
              data={content.candleData}
              height={640}
              visibleBars={48}
              className={styles.chart}
            />
          ) : (
            <div className={styles.chartEmpty} role="img" aria-label={t('trading.noCandlesFallback')}>
              <Text variant="caption" tone="caption" align="center">
                {content.chartStatusLabel ?? t('trading.noCandlesFallback')}
              </Text>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
