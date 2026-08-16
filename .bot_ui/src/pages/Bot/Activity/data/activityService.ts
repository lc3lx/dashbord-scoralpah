import {
  getNotificationsPageContent as getNotificationsPageContentMock,
} from './activity.mock';
import { accountService } from '../../Account/services/accountService';
import { notificationsApi, type NotificationDto } from '@shared/api';
import { t } from '@shared/i18n';
import type { NotificationVariant } from '@components/types';
import type { NotificationItem } from '../types';

type NotificationListener = () => void;

const listeners = new Set<NotificationListener>();
let cached: NotificationItem[] = [];

const VARIANTS: NotificationVariant[] = [
  'account-not-approved',
  'account-approved',
  'activation-success',
  'bot-started',
  'new-signal',
  'trade-profit',
  'trade-loss',
  'profit-target',
  'loss-limit',
  'live-trade',
];

function asVariant(value: string): NotificationVariant {
  return VARIANTS.includes(value as NotificationVariant)
    ? (value as NotificationVariant)
    : 'live-trade';
}

function formatRelative(iso: string): string {
  const created = new Date(iso).getTime();
  if (Number.isNaN(created)) return iso;
  const delta = Math.max(0, Date.now() - created);
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return t('notifications.justNow');
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatDetail(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function mapDto(item: NotificationDto): NotificationItem {
  return {
    id: item.id,
    variant: asVariant(item.variant),
    title: item.title,
    description: item.description,
    timestamp: formatRelative(item.createdAt),
    detailTimestamp: formatDetail(item.createdAt),
    read: item.read,
    tradeId: item.tradeId ?? undefined,
    action: item.actionPath
      ? { label: t('notifications.openRelated'), path: item.actionPath }
      : undefined,
  };
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function syncAccountBadge(unread: number): void {
  accountService.setUnreadNotificationCount(unread);
}

export const activityService = {
  subscribe(listener: NotificationListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async fetchNotifications(): Promise<NotificationItem[]> {
    const response = await notificationsApi.list();
    cached = response.items.map(mapDto);
    syncAccountBadge(response.unreadCount);
    return cached.map((item) => ({ ...item }));
  },

  async getNotificationById(id: string): Promise<NotificationItem | null> {
    try {
      return mapDto(await notificationsApi.get(id));
    } catch {
      const match = cached.find((item) => item.id === id);
      return match ? { ...match } : null;
    }
  },

  async markRead(id: string): Promise<NotificationItem | null> {
    const updated = mapDto(await notificationsApi.markRead(id));
    cached = cached.map((item) => (item.id === id ? updated : item));
    notifyListeners();
    return updated;
  },

  async markAllRead(): Promise<NotificationItem[]> {
    const response = await notificationsApi.markAllRead();
    cached = response.items.map(mapDto);
    syncAccountBadge(response.unreadCount);
    notifyListeners();
    return cached.map((item) => ({ ...item }));
  },

  async addTradeNotification(_input: {
    tradeId: string;
    description: string;
    variant?: NotificationItem['variant'];
    title?: string;
  }): Promise<NotificationItem | null> {
    const items = await activityService.fetchNotifications();
    notifyListeners();
    return items[0] ?? null;
  },

  getNotificationsPageContent() {
    return getNotificationsPageContentMock();
  },

  reset(): void {
    cached = [];
    syncAccountBadge(0);
    notifyListeners();
  },
};

export type ActivityService = typeof activityService;
