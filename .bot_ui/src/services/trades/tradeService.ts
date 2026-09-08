import {
  DEFAULT_PAGE_SIZE,
  getHistoryPageContent as getHistoryPageContentMock,
  getTradeDetailPageTitle,
  getTradeDetailTimelineTitle,
  TRADE_DETAIL_TIMELINE_CHECK_ICON,
} from './trade.mock';
import type {
  ListTradesParams,
  PaginatedResult,
  PlaceTradeInput,
  TradeDetailContent,
  TradeListFilter,
  TradeRecord,
  TradeStatus,
} from './types';
import type { TradeDirection } from '@components/types';
import { ApiClientError, createIdempotencyKey, marketApi, tradesApi } from '@shared/api';
import type { TradeDto } from '@shared/api';
import { t } from '@shared/i18n';

type TradeChangeListener = () => void;

const listeners = new Set<TradeChangeListener>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function mapStatus(
  status: string,
  pnl?: number | null,
  createdAt?: string,
  durationSeconds?: number,
): TradeStatus {
  const s = status.toLowerCase();
  if (s === 'profit' || s === 'tie') return 'profit';
  if (s === 'loss') return 'loss';
  if (typeof pnl === 'number') {
    if (pnl > 0) return 'profit';
    if (pnl < 0) return 'loss';
    return 'profit';
  }
  if (s === 'running' || s === 'pending') {
    if (createdAt) {
      const opened = Date.parse(createdAt);
      const dur = (durationSeconds && durationSeconds > 0 ? durationSeconds : 60) + 90;
      if (Number.isFinite(opened) && Date.now() > opened + dur * 1000) return 'unknown';
    }
    return 'running';
  }
  if (s === 'failed' || s === 'cancelled' || s === 'unknown') return 'unknown';
  return 'unknown';
}

function mapDirection(direction: string): TradeDirection {
  const d = direction.toUpperCase();
  return d === 'PUT' || d === 'DOWN' ? 'down' : 'up';
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatPnl(pnl: number | null, status: string): string | undefined {
  if (pnl === null || pnl === undefined) {
    if (status.toLowerCase() === 'running' || status.toLowerCase() === 'pending') return undefined;
    return undefined;
  }
  const sign = pnl > 0 ? '+' : '';
  return `${sign}$${pnl.toFixed(2)}`;
}

function mapTrade(dto: TradeDto): TradeRecord {
  const status = mapStatus(dto.status, dto.pnl, dto.createdAt, dto.durationSeconds);
  const pnlLabel = formatPnl(dto.pnl, dto.status);
  const openedAt = new Date(dto.createdAt).getTime() || Date.now();
  const durationSec = dto.durationSeconds > 0 ? dto.durationSeconds : 60;
  const remaining =
    status === 'running'
      ? Math.max(0, Math.ceil((openedAt + durationSec * 1000 - Date.now()) / 1000))
      : undefined;
  const isBot = (dto.strategyId ?? 'rsi').toLowerCase() === 'rsi';
  return {
    id: dto.id,
    pair: dto.asset,
    platform: 'binolla',
    strategy: 'RSI',
    indicator: 'RSI',
    duration: formatDuration(dto.durationSeconds),
    durationSeconds: durationSec,
    direction: mapDirection(dto.direction),
    amount: dto.amount,
    stakeLabel: `$${dto.amount}`,
    result: pnlLabel,
    resultTone: dto.pnl !== null && dto.pnl >= 0 ? 'success' : dto.pnl !== null ? 'danger' : undefined,
    status,
    source: isBot ? 'bot' : 'user',
    timeLabel: formatTime(dto.createdAt),
    isToday: isToday(dto.createdAt),
    liveTimerSeconds: remaining,
    entryTime: formatTime(dto.createdAt),
    exitTime: status === 'running' ? undefined : formatTime(dto.updatedAt),
    signalStrength: '—',
    candleData: [],
    openedAt,
  };
}

function matchesFilter(trade: TradeRecord, filter: TradeListFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'live') return trade.status === 'running';
  if (filter === 'profit') return trade.status === 'profit';
  if (filter === 'loss') return trade.status === 'loss';
  if (filter === 'today') return trade.isToday;
  return true;
}

function formatDirectionLabel(direction: TradeDirection): string {
  return direction === 'up' ? t('trade.detail.up') : t('trade.detail.down');
}

function buildTradeRef(trade: TradeRecord): string {
  return t('trade.detail.idBinolla', { id: trade.id.slice(0, 8) });
}

function formatTradeStatusValue(status: TradeRecord['status']): string {
  if (status === 'running') return t('history.status.running');
  if (status === 'profit') return t('history.status.profit');
  if (status === 'unknown') return t('history.status.unknown');
  return t('history.status.loss');
}

function buildDetailRows(trade: TradeRecord): TradeDetailContent['detailRows'] {
  return [
    { id: 'direction', label: t('trade.detail.direction'), value: formatDirectionLabel(trade.direction) },
    { id: 'amount', label: t('trade.detail.amount'), value: trade.stakeLabel },
    { id: 'duration', label: t('trade.detail.duration'), value: trade.duration },
    { id: 'entry-time', label: t('trade.detail.entry'), value: trade.entryTime ?? trade.timeLabel },
    { id: 'exit-time', label: t('trade.detail.exit'), value: trade.exitTime ?? '—' },
    { id: 'indicator', label: t('trade.detail.indicator'), value: trade.indicator },
    { id: 'strategy', label: t('trade.detail.strategy'), value: trade.strategy },
    { id: 'signal-strength', label: t('trade.detail.strength'), value: trade.signalStrength },
    {
      id: 'trade-source',
      label: t('trade.detail.source'),
      value: trade.source === 'bot' ? t('trade.detail.sourceBot') : t('trade.detail.sourceUser'),
    },
    { id: 'status', label: t('trade.detail.result'), value: formatTradeStatusValue(trade.status) },
  ];
}

function buildTimeline(trade: TradeRecord): TradeDetailContent['timeline'] {
  const signalTime = trade.entryTime ?? trade.timeLabel;
  return [
    {
      id: 'signal-detected',
      title: t('trade.timeline.signalDetected'),
      timestamp: signalTime,
      status: 'completed',
      showCheck: true,
    },
    {
      id: 'trade-opened',
      title: t('trade.timeline.opened'),
      timestamp: trade.entryTime ?? trade.timeLabel,
      status: 'completed',
      showCheck: true,
    },
    {
      id: 'trade-closed',
      title: t('trade.timeline.closed'),
      timestamp: trade.exitTime ?? '—',
      status: trade.status === 'running' ? 'pending' : 'completed',
      showCheck: trade.status !== 'running',
    },
    {
      id: 'result-calculated',
      title: t('trade.timeline.result'),
      timestamp: trade.exitTime ?? '—',
      status: trade.status === 'running' ? 'pending' : 'completed',
      showCheck: false,
    },
  ];
}

function buildDetailContent(trade: TradeRecord): TradeDetailContent {
  const statusTone =
    trade.status === 'running'
      ? 'warning'
      : trade.status === 'profit'
        ? 'success'
        : trade.status === 'unknown'
          ? 'neutral'
          : 'danger';
  const statusLabel =
    trade.status === 'running'
      ? t('trade.detail.statusLive')
      : trade.status === 'profit'
        ? t('trade.detail.statusWon')
        : trade.status === 'unknown'
          ? t('trade.detail.statusUnknown')
          : t('trade.detail.statusLost');

  return {
    id: trade.id,
    pageTitle: getTradeDetailPageTitle(),
    statusLabel,
    statusTone,
    hero: {
      direction: trade.direction,
      pair: trade.pair,
      tradeRef: buildTradeRef(trade),
      amountLabel: t('trade.detail.onStake', { stake: trade.stakeLabel }),
    },
    candleData: [...trade.candleData],
    detailRows: buildDetailRows(trade),
    timelineTitle: getTradeDetailTimelineTitle(),
    timelineCheckIconSrc: TRADE_DETAIL_TIMELINE_CHECK_ICON,
    timeline: buildTimeline(trade),
  };
}

function parseDurationSeconds(label: string): number {
  const trimmed = label.trim().toLowerCase();
  if (trimmed.endsWith('min')) {
    const n = Number.parseInt(trimmed, 10);
    return Number.isFinite(n) ? n * 60 : 60;
  }
  if (trimmed.endsWith('m')) {
    const n = Number.parseInt(trimmed, 10);
    return Number.isFinite(n) ? n * 60 : 60;
  }
  if (trimmed.endsWith('s')) {
    const n = Number.parseInt(trimmed, 10);
    return Number.isFinite(n) ? n : 60;
  }
  const n = Number.parseInt(trimmed, 10);
  return Number.isFinite(n) ? n : 60;
}

function backendStatusForFilter(filter: TradeListFilter): string | undefined {
  if (filter === 'live') return 'Running';
  if (filter === 'profit') return 'Profit';
  if (filter === 'loss') return 'Loss';
  return undefined;
}

export const tradeService = {
  subscribe(listener: TradeChangeListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async listTrades(params: ListTradesParams = {}): Promise<PaginatedResult<TradeRecord>> {
    const filter = params.filter ?? 'all';
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

    try {
      const response = await tradesApi.list({
        page,
        pageSize,
        status: backendStatusForFilter(filter),
      });

      let items = response.items.map(mapTrade);
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '1892a4',
        },
        body: JSON.stringify({
          sessionId: '1892a4',
          runId: 'trade-settle',
          hypothesisId: 'H3',
          location: 'tradeService.ts:listTrades',
          message: 'history list',
          data: {
            filter,
            page,
            pageSize,
            total: response.total,
            itemCount: response.items.length,
            mappedCount: items.length,
            hasMore: response.page * response.pageSize < response.total,
            sample: response.items.slice(0, 5).map((t) => ({
              id: t.id?.slice?.(0, 8),
              status: t.status,
              pnl: t.pnl,
              mapped: mapStatus(t.status, t.pnl, t.createdAt, t.durationSeconds),
              durationSeconds: t.durationSeconds,
            })),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (filter === 'today') {
        items = items.filter((trade) => trade.isToday);
      } else if (filter === 'all' || filter === 'live' || filter === 'profit' || filter === 'loss') {
        items = items.filter((trade) => matchesFilter(trade, filter));
      }

      return {
        items,
        total: filter === 'today' ? items.length : response.total,
        page: response.page,
        pageSize: response.pageSize,
        hasMore: response.page * response.pageSize < response.total,
      };
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError('REQUEST_FAILED', t('history.loadFailed'), 0);
    }
  },

  async listAllTrades(filter: TradeListFilter = 'all'): Promise<PaginatedResult<TradeRecord>> {
    const backendFilter: TradeListFilter = filter === 'today' ? 'all' : filter;
    const pageSize = 100;
    const first = await tradeService.listTrades({ filter: backendFilter, page: 1, pageSize });
    const items = [...first.items];
    const totalPages = Math.max(1, Math.ceil((first.total || 0) / (first.pageSize || pageSize)));
    for (let page = 2; page <= totalPages; page += 1) {
      const next = await tradeService.listTrades({ filter: backendFilter, page, pageSize });
      items.push(...next.items);
    }
    const filtered = filter === 'today' ? items.filter((trade) => trade.isToday) : items;
    return {
      items: filtered,
      total: filter === 'today' ? filtered.length : first.total,
      page: 1,
      pageSize,
      hasMore: false,
    };
  },

  async getTradeById(tradeId: string): Promise<TradeRecord | null> {
    try {
      const dto = await tradesApi.get(tradeId);
      const trade = mapTrade(dto);
      try {
        const candles = await marketApi.candles(dto.asset, 60);
        trade.candleData = candles.candles.map((c) => ({
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
      } catch {
        trade.candleData = [];
      }
      return trade;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) return null;
      throw error;
    }
  },

  async getTradeDetail(tradeId: string): Promise<TradeDetailContent | null> {
    const trade = await this.getTradeById(tradeId);
    if (!trade) return null;
    return buildDetailContent(trade);
  },

  async placeTrade(input: PlaceTradeInput): Promise<string> {
    const direction = input.direction === 'down' ? 'PUT' : 'CALL';
    const durationSeconds = parseDurationSeconds(input.durationLabel);
    const strategyId = input.strategy?.toLowerCase() === 'rsi' ? 'rsi' : 'rsi';

    const dto = await tradesApi.place(
      {
        asset: input.pair,
        direction,
        amount: input.amount,
        durationSeconds,
        strategyId,
      },
      createIdempotencyKey(),
    );

    notifyListeners();
    return dto.id;
  },

  getHistoryPageContent() {
    return getHistoryPageContentMock();
  },

  reset(): void {
    notifyListeners();
  },
};

export type TradeService = typeof tradeService;
