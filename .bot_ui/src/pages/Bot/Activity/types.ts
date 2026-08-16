import type { NotificationVariant } from '@components/types';

export type NotificationRelatedAction = {
  label: string;
  path: string;
};

export type NotificationItem = {
  id: string;
  variant: NotificationVariant;
  title: string;
  description: string;
  timestamp: string;
  detailTimestamp: string;
  read: boolean;
  tradeId?: string;
  action?: NotificationRelatedAction;
};

export type NotificationsPageContent = {
  title: string;
  markAllLabel: string;
  backAriaLabel: string;
  defaultActionLabel: string;
};

export type HistoryEmptyState = {
  title: string;
  description: string;
};
