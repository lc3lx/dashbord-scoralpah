import { CandlestickChart } from '@components/organisms/CandlestickChart';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import type { ChartSheetContent } from '../../types';
import styles from './ChartSheetContent.module.css';

export type ChartSheetContentProps = {
  content: ChartSheetContent;
};

export function ChartSheetContent({ content }: ChartSheetContentProps) {
  const t = useT();

  return (
    <div className={styles.root}>
      <div className={styles.chartWrap}>
        {content.candleData.length > 0 ? (
          <CandlestickChart data={content.candleData} />
        ) : (
          <Text variant="caption" tone="caption" align="center" className={styles.empty}>
            {t('home.chart.empty')}
          </Text>
        )}
      </div>
      <div className={styles.stats}>
        {content.stats.map((stat) => (
          <div key={stat.id} className={styles.statBox}>
            <Text variant="caption-xs" tone="muted" className={styles.statLabel}>
              {stat.label}
            </Text>
            <Text variant="body-sm" tone={stat.valueTone ?? 'body'} className={styles.statValue}>
              {stat.value}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
