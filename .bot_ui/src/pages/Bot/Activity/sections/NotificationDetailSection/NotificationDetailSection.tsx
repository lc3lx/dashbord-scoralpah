import { notificationAssets } from '@assets/index';
import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import type { NotificationVariant } from '@components/types';
import type { NotificationItem } from '../../types';
import styles from './NotificationDetailSection.module.css';

export type NotificationDetailSectionProps = {
  notification: NotificationItem;
  actionLabel: string;
  onAction: () => void;
};

const iconMap: Record<NotificationVariant, string> = {
  'account-not-approved': notificationAssets.accountNotApproved,
  'account-approved': notificationAssets.detailBell,
  'activation-success': notificationAssets.activationSuccess,
  'bot-started': notificationAssets.botStarted,
  'new-signal': notificationAssets.newSignal,
  'trade-profit': notificationAssets.tradeProfit,
  'trade-loss': notificationAssets.tradeLoss,
  'profit-target': notificationAssets.profitTarget,
  'loss-limit': notificationAssets.lossLimit,
  'live-trade': notificationAssets.liveTrade,
};

export function NotificationDetailSection({
  notification,
  actionLabel,
  onAction,
}: NotificationDetailSectionProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrap} aria-hidden="true">
          <Icon src={iconMap[notification.variant]} decorative className={styles.icon} />
        </div>
        <div className={styles.meta}>
          <Text variant="body-sm" tone="primary" className={styles.title}>
            {notification.title}
          </Text>
          <Text variant="caption-xs" className={styles.timestamp}>
            {notification.detailTimestamp}
          </Text>
        </div>
      </div>

      <Text variant="caption" className={styles.body}>
        {notification.description}
      </Text>

      <Button variant="primary" fullWidth className={styles.action} onClick={onAction}>
        {actionLabel}
      </Button>
    </article>
  );
}
