import { notificationAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import type { NotificationVariant } from '../../types';
import styles from './NotificationCard.module.css';

export type NotificationCardProps = {
  variant: NotificationVariant;
  title: string;
  description: string;
  timestamp: string;
  onClick?: () => void;
  className?: string;
};

const iconMap: Record<NotificationVariant, string> = {
  'account-not-approved': notificationAssets.accountNotApproved,
  'account-approved': notificationAssets.accountApproved,
  'activation-success': notificationAssets.activationSuccess,
  'bot-started': notificationAssets.botStarted,
  'new-signal': notificationAssets.newSignal,
  'trade-profit': notificationAssets.tradeProfit,
  'trade-loss': notificationAssets.tradeLoss,
  'profit-target': notificationAssets.profitTarget,
  'loss-limit': notificationAssets.lossLimit,
  'live-trade': notificationAssets.liveTrade,
};

export function NotificationCard({
  variant,
  title,
  description,
  timestamp,
  onClick,
  className,
}: NotificationCardProps) {
  const Component = onClick ? 'button' : 'article';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      className={cn(styles.card, onClick && styles.interactive, className)}
      onClick={onClick}
    >
      <Icon src={iconMap[variant]} size="notification" decorative />
      <div className={styles.content}>
        <div className={styles.header}>
          <Text variant="body-sm" tone="primary" className={styles.title}>
            {title}
          </Text>
          <Text variant="caption-xs" tone="caption" className={styles.timestamp}>
            {timestamp}
          </Text>
        </div>
        <Text variant="caption" tone="muted" className={styles.description}>
          {description}
        </Text>
      </div>
    </Component>
  );
}
