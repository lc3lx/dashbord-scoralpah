import { tradeAssets } from '@assets/index';
import { Badge } from '@components/atoms/Badge';
import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import type { ChipTone, TradeDirection } from '../../types';
import styles from './TradeCard.module.css';

export type TradeCardProps = {
  pair: string;
  platform: string;
  platformTone?: ChipTone;
  strategy: string;
  amount: string;
  result?: string;
  resultTone?: 'success' | 'danger' | 'warning';
  liveTimer?: string;
  timestamp: string;
  stake: string;
  statusLabel: string;
  statusTone: ChipTone;
  sourceLabel: string;
  direction: TradeDirection;
  actionLabel?: string;
  onDetails?: () => void;
  className?: string;
};

const directionIconMap: Record<TradeDirection, string> = {
  up: tradeAssets.arrowUp,
  down: tradeAssets.arrowDown,
};

const directionClassMap: Record<TradeDirection, string> = {
  up: styles.directionUp,
  down: styles.directionDown,
};

const resultToneMap = {
  success: 'success' as const,
  danger: 'danger' as const,
  warning: 'warning' as const,
};

export function TradeCard({
  pair,
  platform,
  platformTone = 'info',
  strategy,
  amount,
  result,
  resultTone = 'success',
  liveTimer,
  timestamp,
  stake,
  statusLabel,
  statusTone,
  sourceLabel,
  direction,
  actionLabel = 'Details',
  onDetails,
  className,
}: TradeCardProps) {
  return (
    <article className={cn(styles.card, className)}>
      <div className={styles.main}>
        <div className={cn(styles.direction, directionClassMap[direction])}>
          <Icon src={directionIconMap[direction]} size="trade" />
        </div>
        <div className={styles.info}>
          <div className={styles.pairRow}>
            <Text variant="body" tone="primary" className={styles.pair}>
              {pair}
            </Text>
            <Badge label={platform} tone={platformTone} />
          </div>
          <Text variant="caption-xs" tone="caption" className={styles.strategy}>
            {strategy}
          </Text>
        </div>
        <div className={styles.result}>
          {liveTimer ? (
            <Text variant="body-sm" tone="warning" align="right" className={styles.liveTimer}>
              {liveTimer}
            </Text>
          ) : result ? (
            <Text variant="body" tone={resultToneMap[resultTone]} align="right">
              {result}
            </Text>
          ) : (
            <Text variant="body" tone="warning" align="right">
              {amount}
            </Text>
          )}
          <Text variant="caption-xs" tone="caption" align="right">
            {timestamp} · {stake}
          </Text>
        </div>
      </div>
      <div className={styles.footer}>
        <Badge label={statusLabel} tone={statusTone} />
        <Badge label={sourceLabel} tone="neutral" />
        {onDetails && (
          <Button variant="text-link" className={styles.details} onClick={onDetails}>
            {actionLabel}
            <Icon src={tradeAssets.detailsChevron} size="xs" className={styles.detailsIcon} />
          </Button>
        )}
      </div>
    </article>
  );
}
