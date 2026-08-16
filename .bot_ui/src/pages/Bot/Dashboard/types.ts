import type { TextTone } from '@components/types';
import type { TradeDto } from '@shared/api';

export type DashboardTimeframe = 'today' | '7d' | '30d' | 'all';

export type DashboardStatCard = {
  id: string;
  label: string;
  value: string;
  secondary: string;
  valueTone: TextTone;
};

export type DashboardMarketRow = {
  id: string;
  pair: string;
  abbr: string;
  subtitle: string;
  result: string;
  resultTone: TextTone;
  stake: string;
};

export type DashboardBalance = {
  label: string;
  value: string;
  growth: string;
  growthSuffix: string;
  statusLabel: string;
  statusTone: 'success' | 'danger' | 'warning' | 'neutral' | 'active';
  todayProfitLabel: string;
  todayProfitValue: string;
  todayLossLabel: string;
  todayLossValue: string;
  netTodayLabel: string;
  netTodayValue: string;
};

export type DashboardPerformance = {
  label: string;
  value: string;
  timeframes: Array<{ id: DashboardTimeframe; label: string }>;
  dayLabels: string[];
};

export type DashboardContent = {
  greeting: string;
  userName: string;
  waveEmoji: string;
  notificationsAriaLabel: string;
  balance: DashboardBalance;
  stats: DashboardStatCard[];
  performance: DashboardPerformance;
  markets: DashboardMarketRow[];
  /** Raw server trades used to recompute performance by timeframe (no invented series). */
  tradeSnapshot: TradeDto[];
};
