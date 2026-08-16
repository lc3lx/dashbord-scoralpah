import { ROUTES } from '@constants/routes';
import { t } from '@shared/i18n';
import type { NotificationItem, NotificationsPageContent } from '../types';

export function getNotificationsPageContent(): NotificationsPageContent {
  return {
    title: t('notifications.title'),
    markAllLabel: t('notifications.markAll'),
    backAriaLabel: t('notifications.backAria'),
    defaultActionLabel: t('notifications.openRelated'),
  };
}

export function getLiveTradeNotificationTitle(): string {
  return t('notifications.liveTradeTitle');
}

export function getSeedNotifications(): NotificationItem[] {
  const openRelated = t('notifications.openRelated');
  return [
    {
      id: 'notif-account-not-approved',
      variant: 'account-not-approved',
      title: t('notifications.accountNotApproved.title'),
      description: t('notifications.accountNotApproved.desc'),
      timestamp: '2h ago',
      detailTimestamp: 'Today · 2h ago',
      read: false,
    },
    {
      id: 'notif-account-approved',
      variant: 'account-approved',
      title: t('notifications.accountApproved.title'),
      description: t('notifications.accountApproved.desc'),
      timestamp: '2h ago',
      detailTimestamp: 'Today · 2h ago',
      read: false,
      action: {
        label: openRelated,
        path: ROUTES.activation,
      },
    },
    {
      id: 'notif-activation-success',
      variant: 'activation-success',
      title: t('notifications.activationSuccess.title'),
      description: t('notifications.activationSuccess.desc'),
      timestamp: '2h ago',
      detailTimestamp: 'Today · 2h ago',
      read: true,
      action: {
        label: openRelated,
        path: ROUTES.subscription,
      },
    },
    {
      id: 'notif-bot-started',
      variant: 'bot-started',
      title: t('notifications.botStarted.title'),
      description: t('notifications.botStarted.desc'),
      timestamp: '1h ago',
      detailTimestamp: 'Today · 1h ago',
      read: true,
      action: {
        label: openRelated,
        path: ROUTES.bot,
      },
    },
    {
      id: 'notif-new-signal',
      variant: 'new-signal',
      title: t('notifications.newSignal.title'),
      description: t('notifications.newSignal.desc'),
      timestamp: '38m ago',
      detailTimestamp: 'Today · 38m ago',
      read: false,
      action: {
        label: openRelated,
        path: ROUTES.bot,
      },
    },
    {
      id: 'notif-live-trade',
      variant: 'live-trade',
      title: t('notifications.liveTradeTitle'),
      description: t('notifications.liveTrade.desc'),
      timestamp: '35m ago',
      detailTimestamp: 'Today · 35m ago',
      read: true,
      tradeId: 'T-2415',
    },
    {
      id: 'notif-trade-profit',
      variant: 'trade-profit',
      title: t('notifications.tradeProfit.title'),
      description: t('notifications.tradeProfit.desc'),
      timestamp: '34m ago',
      detailTimestamp: 'Today · 34m ago',
      read: true,
      tradeId: 'T-2401',
    },
    {
      id: 'notif-trade-loss',
      variant: 'trade-loss',
      title: t('notifications.tradeLoss.title'),
      description: t('notifications.tradeLoss.desc'),
      timestamp: '22m ago',
      detailTimestamp: 'Today · 22m ago',
      read: true,
      tradeId: 'T-2403',
    },
    {
      id: 'notif-profit-target',
      variant: 'profit-target',
      title: t('notifications.profitTarget.title'),
      description: t('notifications.profitTarget.desc'),
      timestamp: '12m ago',
      detailTimestamp: 'Today · 12m ago',
      read: true,
      action: {
        label: openRelated,
        path: ROUTES.bot,
      },
    },
    {
      id: 'notif-loss-limit',
      variant: 'loss-limit',
      title: t('notifications.lossLimit.title'),
      description: t('notifications.lossLimit.desc'),
      timestamp: '10m ago',
      detailTimestamp: 'Today · 10m ago',
      read: true,
      action: {
        label: openRelated,
        path: ROUTES.bot,
      },
    },
  ];
}
