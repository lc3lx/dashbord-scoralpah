import {
  bucketPerformance,
  formatMoneyPlain,
  formatSignedMoney,
  formatWinRate,
  summarizeByTimeframe,
  weekAndMonthSummaries,
} from '@shared/trades/tradeAggregates';
import type { DashboardContent, DashboardTimeframe } from '../types';
import { binollaApi, meApi, tradesApi } from '@shared/api';
import type { TradeDto } from '@shared/api';
import { MARKET_FETCH_MS, timedSignal } from '@shared/api/timedSignal';
import { getAccountStatusCached } from '@shared/api/botSessionCache';
import { t } from '@shared/i18n';
import { getDashboardContent, DASHBOARD_INITIAL_TIMEFRAME } from './dashboard.mock';

function abbr(asset: string): string {
  const cleaned = asset.replace(/[^a-zA-Z0-9]/g, '');
  return (cleaned.slice(0, 2) || asset.slice(0, 2)).toUpperCase();
}

function toneForNet(net: number): 'success' | 'danger' | 'primary' {
  if (net > 0) return 'success';
  if (net < 0) return 'danger';
  return 'primary';
}

function mapRecentTrades(items: TradeDto[]) {
  return items.slice(0, 5).map((trade) => ({
    id: trade.id,
    pair: trade.asset,
    abbr: abbr(trade.asset),
    subtitle: `${trade.direction} · ${trade.status} · ${new Date(trade.createdAt).toLocaleTimeString('en-GB', { hour12: false })}`,
    result:
      trade.pnl === null || trade.pnl === undefined
        ? trade.status
        : formatSignedMoney(trade.pnl),
    resultTone:
      trade.pnl !== null && trade.pnl !== undefined && trade.pnl > 0
        ? ('success' as const)
        : trade.pnl !== null && trade.pnl !== undefined && trade.pnl < 0
          ? ('danger' as const)
          : ('primary' as const),
    stake: formatMoneyPlain(trade.amount),
  }));
}

async function fetchAllTradesForStats(): Promise<{ items: TradeDto[]; total: number } | null> {
  try {
    const first = await tradesApi.list({ page: 1, pageSize: 100 });
    const items = [...first.items];
    const totalPages = Math.max(1, Math.ceil(first.total / first.pageSize));
    // Cap pages to keep Home snappy — still enough for real local aggregates.
    const maxPages = Math.min(totalPages, 5);
    for (let page = 2; page <= maxPages; page += 1) {
      const next = await tradesApi.list({ page, pageSize: 100 });
      items.push(...next.items);
    }
    return { items, total: first.total };
  } catch {
    return null;
  }
}

function applyTradeAggregates(
  content: DashboardContent,
  trades: TradeDto[],
  totalFromServer: number,
  timeframe: DashboardTimeframe,
): void {
  const buckets = weekAndMonthSummaries(trades);
  const performance = summarizeByTimeframe(trades, timeframe);

  content.balance.todayProfitValue =
    buckets.today.profit > 0 ? formatSignedMoney(buckets.today.profit) : '$0.00';
  content.balance.todayLossValue =
    buckets.today.lossAbs > 0 ? formatSignedMoney(-buckets.today.lossAbs) : '$0.00';
  content.balance.netTodayValue = formatSignedMoney(buckets.today.net);

  content.stats = content.stats.map((stat) => {
    if (stat.id === 'week-profit') {
      return {
        ...stat,
        value: formatSignedMoney(buckets.week.net),
        secondary: t('dashboard.stats.tradeCount', { n: buckets.week.count }),
        valueTone: toneForNet(buckets.week.net),
      };
    }
    if (stat.id === 'month-profit') {
      return {
        ...stat,
        value: formatSignedMoney(buckets.month.net),
        secondary: t('dashboard.stats.tradeCount', { n: buckets.month.count }),
        valueTone: toneForNet(buckets.month.net),
      };
    }
    if (stat.id === 'total-trades') {
      return {
        ...stat,
        value: String(totalFromServer),
        secondary: t('dashboard.stats.todayCount', { n: buckets.today.count }),
        valueTone: 'primary',
      };
    }
    if (stat.id === 'win-rate') {
      return {
        ...stat,
        value: formatWinRate(buckets.all.wins, buckets.all.settled),
        secondary: t('dashboard.stats.settledCount', { n: buckets.all.settled }),
        valueTone: 'primary',
      };
    }
    return { ...stat, value: '—', secondary: t('dashboard.fromServerTrades') };
  });

  content.performance.value =
    performance.count === 0 ? '—' : formatSignedMoney(performance.net);
  content.performance.dayLabels = [];
  content.performance.series = bucketPerformance(trades, timeframe).map((bucket) => ({
    label: bucket.label,
    net: bucket.net,
  }));
  content.performance.details = {
    trades: performance.count,
    wins: performance.wins,
    losses: performance.losses,
    winRate: formatWinRate(performance.wins, performance.settled),
    profit: formatSignedMoney(performance.profit),
    loss: performance.lossAbs > 0 ? formatSignedMoney(-performance.lossAbs) : '$0.00',
  };
}

export const dashboardService = {
  async fetchContent(timeframe: DashboardTimeframe = DASHBOARD_INITIAL_TIMEFRAME): Promise<DashboardContent> {
    const content = structuredClone(getDashboardContent());

    try {
      const [me, status, balance, tradeBundle] = await Promise.all([
        meApi.get().catch(() => null),
        getAccountStatusCached().catch(() => null),
        binollaApi.balance(timedSignal(MARKET_FETCH_MS)).catch(() => null),
        fetchAllTradesForStats(),
      ]);

      content.userName = me?.fullName?.trim() || me?.username?.trim() || t('common.trader');

      content.balance.value = balance ? formatMoneyPlain(balance.currentBalance) : '—';
      content.balance.growth = status
        ? t('dashboard.accessPrefix', { value: status.botAccess })
        : '—';
      content.balance.growthSuffix =
        status?.botAccess === 'AdminApprovalRequired'
          ? t('dashboard.waitingApproval')
          : status?.adminApproved
            ? t('dashboard.adminApproved')
            : t('account.approvalBadge', { status: status?.approvalStatus ?? '—' });
      content.balance.statusLabel =
        status?.botAccess === 'Allowed'
          ? t('dashboard.balance.statusActive')
          : status?.botAccess === 'AdminApprovalRequired'
            ? t('dashboard.balance.statusPending')
            : t('dashboard.balance.statusBlocked');
      content.balance.statusTone =
        status?.botAccess === 'Allowed'
          ? 'success'
          : status?.botAccess === 'AdminApprovalRequired'
            ? 'warning'
            : 'danger';

      if (tradeBundle) {
        content.tradeSnapshot = tradeBundle.items;
        content.markets = mapRecentTrades(tradeBundle.items);
        applyTradeAggregates(content, tradeBundle.items, tradeBundle.total, timeframe);
      } else {
        content.tradeSnapshot = [];
        content.markets = [];
      }
    } catch {
      content.balance.value = '—';
      content.markets = [];
      content.tradeSnapshot = [];
    }

    return content;
  },

  performanceForTimeframe(
    content: DashboardContent,
    timeframe: DashboardTimeframe,
  ): DashboardContent {
    const next = structuredClone(content);
    if (!next.tradeSnapshot.length) {
      next.performance.value = '—';
      next.performance.series = [];
      return next;
    }
    applyTradeAggregates(next, next.tradeSnapshot, next.tradeSnapshot.length, timeframe);
    // Prefer server total already on stats if present; keep markets as-is.
    next.markets = content.markets;
    const totalStat = content.stats.find((s) => s.id === 'total-trades');
    if (totalStat) {
      next.stats = next.stats.map((s) => (s.id === 'total-trades' ? { ...totalStat } : s));
    }
    return next;
  },

  getInitialTimeframe(): DashboardTimeframe {
    return DASHBOARD_INITIAL_TIMEFRAME;
  },
};

export type DashboardService = typeof dashboardService;
