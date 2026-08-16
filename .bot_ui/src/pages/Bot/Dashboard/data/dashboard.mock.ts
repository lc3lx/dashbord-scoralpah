import { t } from '@shared/i18n';
import type { DashboardContent, DashboardTimeframe } from '../types';

export const DASHBOARD_INITIAL_TIMEFRAME: DashboardTimeframe = 'today';

/** Honest empty shell — labels/i18n only. No fabricated balances, names, charts, or trades. */
export function getDashboardContent(): DashboardContent {
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t('dashboard.greeting.morning')
      : hour < 18
        ? t('dashboard.greeting.afternoon')
        : t('dashboard.greeting.evening');

  return {
    greeting,
    userName: '—',
    waveEmoji: '👋🏻',
    notificationsAriaLabel: t('dashboard.notificationsAria'),
    balance: {
      label: t('dashboard.balance.label'),
      value: '—',
      growth: '—',
      growthSuffix: '',
      statusLabel: '—',
      statusTone: 'neutral',
      todayProfitLabel: t('dashboard.balance.todayProfit'),
      todayProfitValue: '—',
      todayLossLabel: t('dashboard.balance.todayLoss'),
      todayLossValue: '—',
      netTodayLabel: t('dashboard.balance.netToday'),
      netTodayValue: '—',
    },
    stats: [
      {
        id: 'week-profit',
        label: t('dashboard.stats.weekProfit'),
        value: '—',
        secondary: t('dashboard.fromServerTrades'),
        valueTone: 'primary',
      },
      {
        id: 'month-profit',
        label: t('dashboard.stats.monthProfit'),
        value: '—',
        secondary: t('dashboard.fromServerTrades'),
        valueTone: 'primary',
      },
      {
        id: 'total-trades',
        label: t('dashboard.stats.totalTrades'),
        value: '—',
        secondary: t('dashboard.fromServerTrades'),
        valueTone: 'primary',
      },
      {
        id: 'win-rate',
        label: t('dashboard.stats.winRate'),
        value: '—',
        secondary: t('dashboard.fromServerTrades'),
        valueTone: 'primary',
      },
    ],
    performance: {
      label: t('dashboard.performance'),
      value: '—',
      timeframes: [
        { id: 'today', label: t('dashboard.tf.today') },
        { id: '7d', label: t('dashboard.tf.7d') },
        { id: '30d', label: t('dashboard.tf.30d') },
        { id: 'all', label: t('dashboard.tf.all') },
      ],
      dayLabels: [],
    },
    markets: [],
    tradeSnapshot: [],
  };
}
