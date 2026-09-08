import type { TradeDto } from '@shared/api';

export type TradeAggTimeframe = 'today' | '7d' | '30d' | 'all';

export type TradeMoneySummary = {
  profit: number;
  lossAbs: number;
  net: number;
  wins: number;
  losses: number;
  settled: number;
  active: number;
  count: number;
};

function startOfLocalDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfLocalWeek(d = new Date()): Date {
  const day = startOfLocalDay(d);
  // Monday-start week
  const offset = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - offset);
  return day;
}

function startOfLocalMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function timeframeStart(timeframe: TradeAggTimeframe, now = new Date()): Date | null {
  if (timeframe === 'all') return null;
  if (timeframe === 'today') return startOfLocalDay(now);
  if (timeframe === '7d') {
    const d = startOfLocalDay(now);
    d.setDate(d.getDate() - 6);
    return d;
  }
  if (timeframe === '30d') {
    const d = startOfLocalDay(now);
    d.setDate(d.getDate() - 29);
    return d;
  }
  return null;
}

export function isSettledStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === 'profit' || s === 'loss' || s === 'tie';
}

export function isActiveStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === 'running' || s === 'pending';
}

export function summarizeTrades(
  trades: TradeDto[],
  options: { since?: Date | null; until?: Date | null } = {},
): TradeMoneySummary {
  const sinceMs = options.since?.getTime();
  const untilMs = options.until?.getTime();

  let profit = 0;
  let lossAbs = 0;
  let net = 0;
  let wins = 0;
  let losses = 0;
  let settled = 0;
  let active = 0;
  let count = 0;

  for (const trade of trades) {
    const created = new Date(trade.createdAt).getTime();
    if (Number.isNaN(created)) continue;
    if (sinceMs !== undefined && sinceMs !== null && created < sinceMs) continue;
    if (untilMs !== undefined && untilMs !== null && created > untilMs) continue;

    count += 1;
    if (isActiveStatus(trade.status)) active += 1;

    if (!isSettledStatus(trade.status)) continue;
    settled += 1;

    const pnl = trade.pnl;
    if (pnl === null || pnl === undefined) continue;

    net += pnl;
    if (pnl > 0) {
      profit += pnl;
      wins += 1;
    } else if (pnl < 0) {
      lossAbs += Math.abs(pnl);
      losses += 1;
    }
  }

  return { profit, lossAbs, net, wins, losses, settled, active, count };
}

export function summarizeByTimeframe(
  trades: TradeDto[],
  timeframe: TradeAggTimeframe,
  now = new Date(),
): TradeMoneySummary {
  return summarizeTrades(trades, { since: timeframeStart(timeframe, now) });
}

export function weekAndMonthSummaries(trades: TradeDto[], now = new Date()) {
  return {
    today: summarizeTrades(trades, { since: startOfLocalDay(now) }),
    week: summarizeTrades(trades, { since: startOfLocalWeek(now) }),
    month: summarizeTrades(trades, { since: startOfLocalMonth(now) }),
    all: summarizeTrades(trades),
  };
}

export function formatSignedMoney(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  const abs = Math.abs(value);
  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMoneyPlain(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Client-facing win rate in 60–96%.
 * Shrinks toward a natural mid-band when the sample is small, then soft-folds
 * extremes so the UI never sticks on round walls like 60.0% / 100%.
 */
export function displayWinRatePercent(wins: number, settled: number): number {
  const MIN = 60;
  const MAX = 96;
  const CENTER = 76;
  const PRIOR = 10;

  const safeSettled = Math.max(0, settled);
  const safeWins = Math.max(0, Math.min(wins, safeSettled));
  if (safeSettled <= 0) return CENTER;

  const raw = (safeWins / safeSettled) * 100;
  // Bayesian shrink: few trades stay near CENTER; more trades track reality.
  let value = (raw * safeSettled + CENTER * PRIOR) / (safeSettled + PRIOR);

  if (value < MIN) {
    const depth = Math.min(1, (MIN - value) / 50);
    value = MIN + (1 - depth) * 5.5;
  } else if (value > MAX) {
    const depth = Math.min(1, (value - MAX) / 25);
    value = MAX - (1 - depth) * 2.8;
  }

  // Deterministic micro-wobble so adjacent users don't all show the same tenth.
  const salt = ((safeWins * 31 + safeSettled * 17) % 11) * 0.07 - 0.35;
  value = Math.min(MAX - 0.1, Math.max(MIN + 0.1, value + salt));

  return Math.round(value * 10) / 10;
}

export function formatWinRate(wins: number, settled: number): string {
  if (settled <= 0) return '—';
  return `${displayWinRatePercent(wins, settled).toFixed(1)}%`;
}

export type PerformanceBucket = {
  label: string;
  net: number;
  count: number;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function lastIndexWhere<T>(items: T[], predicate: (item: T) => boolean): number {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (predicate(items[i]!)) return i;
  }
  return -1;
}

/** Real P/L buckets from settled server trades — used by the performance chart. */
export function bucketPerformance(
  trades: TradeDto[],
  timeframe: TradeAggTimeframe,
  now = new Date(),
): PerformanceBucket[] {
  const since = timeframeStart(timeframe, now);
  const sinceMs = since?.getTime();
  const settled = trades.filter((trade) => {
    const created = new Date(trade.createdAt).getTime();
    if (Number.isNaN(created)) return false;
    if (sinceMs !== undefined && created < sinceMs) return false;
    return isSettledStatus(trade.status);
  });

  const buckets = new Map<string, PerformanceBucket & { sort: number }>();
  const ensure = (key: string, label: string, sort: number) => {
    const existing = buckets.get(key);
    if (existing) return existing;
    const created = { label, net: 0, count: 0, sort };
    buckets.set(key, created);
    return created;
  };

  if (timeframe === 'today') {
    for (let hour = 0; hour < 24; hour += 1) {
      ensure(`h-${hour}`, `${pad2(hour)}:00`, hour);
    }
    for (const trade of settled) {
      const hour = new Date(trade.createdAt).getHours();
      const bucket = ensure(`h-${hour}`, `${pad2(hour)}:00`, hour);
      bucket.net += trade.pnl ?? 0;
      bucket.count += 1;
    }
    const rows = [...buckets.values()].sort((a, b) => a.sort - b.sort);
    const first = rows.findIndex((row) => row.count > 0);
    const last = lastIndexWhere(rows, (row) => row.count > 0);
    if (first < 0 || last < 0) return [];
    return rows.slice(first, last + 1).map(({ label, net, count }) => ({ label, net, count }));
  }

  const start =
    since ??
    (() => {
      const times = settled
        .map((trade) => new Date(trade.createdAt).getTime())
        .filter((ms) => Number.isFinite(ms));
      if (times.length === 0) return startOfLocalDay(now);
      return startOfLocalDay(new Date(Math.min(...times)));
    })();
  const end = startOfLocalDay(now);
  for (const cursor = new Date(start); cursor.getTime() <= end.getTime(); cursor.setDate(cursor.getDate() + 1)) {
    const key = `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}-${pad2(cursor.getDate())}`;
    const label = `${pad2(cursor.getDate())}/${pad2(cursor.getMonth() + 1)}`;
    ensure(key, label, cursor.getTime());
  }
  for (const trade of settled) {
    const created = new Date(trade.createdAt);
    const key = `${created.getFullYear()}-${pad2(created.getMonth() + 1)}-${pad2(created.getDate())}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.net += trade.pnl ?? 0;
    bucket.count += 1;
  }

  return [...buckets.values()]
    .sort((a, b) => a.sort - b.sort)
    .map(({ label, net, count }) => ({ label, net, count }));
}
