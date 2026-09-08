import {
  TRADING_INITIAL_RUNTIME,
  getTradingMockContent,
} from './trading.mock';
import { activityService } from '../../Activity/data/activityService';
import { tradeService } from '@services/trades';
import type { TradingData, TradingPairOption, TradingRuntimeState } from '../types';
import type { TradeDirection } from '@components/types';
import type { CandlestickPoint } from '@components/organisms/CandlestickChart';
import {
  ApiClientError,
  binollaApi,
  marketApi,
  strategiesApi,
  tradesApi,
  type AccountStatusResponse,
} from '@shared/api';
import {
  getAdminNotApprovedTradeMessage,
  canBrowseMarket,
  canTrade,
} from '@shared/access/botAccess';
import { MARKET_FETCH_MS, timedSignal } from '@shared/api/timedSignal';
import { getAccountStatusCached } from '@shared/api/botSessionCache';
import { pickPreferredMarketAsset, isPreferredMarketSymbol } from '@shared/market/preferAsset';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';

const SELECTED_ASSET_KEY_PREFIX = 'scar-alpha-selected-asset';

let runtimeState: TradingRuntimeState = {
  ...TRADING_INITIAL_RUNTIME,
  candlePeriodId: sanitizeCandlePeriodId(TRADING_INITIAL_RUNTIME.candlePeriodId),
};
/** Last asset symbol confirmed from Binolla assets API — never invent a pair. */
let selectedAsset: string | null = null;
/** True after the user picks a pair in the UI this session — honor any available sticky. */
let userChosePair = false;
/** Bound to tokenStore user so module state never leaks across accounts. */
let boundUserId: string | null = null;
/** Prevent overlapping full refreshes from aborting each other. */
let fetchInFlight: Promise<TradingData> | null = null;
let livePriceInFlight = false;

const MAX_CANDLES_STORED = 200;
/** Last live quote — kept so full candle refresh cannot yank the forming candle. */
let lastLivePrice: number | null = null;
/** In-memory candle series from ticks — survives server refreshes that lag a period behind. */
let liveCandleSeries: CandlestickPoint[] = [];

function selectedAssetStorageKey(userId: string | null): string {
  return `${SELECTED_ASSET_KEY_PREFIX}:${userId ?? 'anonymous'}`;
}

function readStoredAsset(userId: string | null): string | null {
  try {
    const v = localStorage.getItem(selectedAssetStorageKey(userId));
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

function persistSelectedAsset(symbol: string | null): void {
  try {
    const key = selectedAssetStorageKey(boundUserId ?? tokenStore.getUserId());
    if (!symbol) localStorage.removeItem(key);
    else localStorage.setItem(key, symbol);
  } catch {
    /* ignore quota / private mode */
  }
}

/** Drop in-memory candles/pair when the signed-in user changes (or logs out). */
function ensureUserIsolation(): void {
  const userId = tokenStore.getUserId();
  if (userId === boundUserId) return;
  // #region agent log
  fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
    body: JSON.stringify({
      sessionId: '1892a4',
      runId: 'user-iso',
      hypothesisId: 'ISO1',
      location: 'tradingService.ts:ensureUserIsolation',
      message: 'trading_state_reset_for_user',
      data: { from: boundUserId ? boundUserId.slice(0, 8) : null, to: userId ? userId.slice(0, 8) : null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  boundUserId = userId;
  runtimeState = {
    ...TRADING_INITIAL_RUNTIME,
    candlePeriodId: sanitizeCandlePeriodId(TRADING_INITIAL_RUNTIME.candlePeriodId),
  };
  selectedAsset = readStoredAsset(userId);
  userChosePair = false;
  liveCandleSeries = [];
  lastLivePrice = null;
}

function formatPairLabel(symbol: string, name?: string): string {
  if (name && name.includes('/')) return name.split(' ')[0] ?? name;
  const base = symbol.replace(/_otc$/i, '');
  if (base.length === 6) return `${base.slice(0, 3)}/${base.slice(3)}`;
  return base;
}

function cloneRuntime(): TradingRuntimeState {
  return { ...runtimeState };
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatSignal(signal: string): { value: string; tone?: 'success' | 'primary' } {
  const s = signal.toLowerCase();
  if (s === 'call') return { value: t('common.callUp'), tone: 'success' };
  if (s === 'put') return { value: t('common.putDown'), tone: 'primary' };
  return { value: t('common.none'), tone: 'primary' };
}

function durationSecondsFromId(id: string): number {
  const opt = getTradingMockContent().durationOptions.find((o) => o.id === id);
  return opt?.seconds ?? 60;
}

function candlePeriodSecondsFromId(id: string): number {
  const opt = getTradingMockContent().timeframeOptions.find((o) => o.id === id);
  const seconds = opt?.periodSeconds ?? 60;
  // Binolla OTC never pushes 4h (14400) history — keep chart on supported periods.
  if (seconds > 3600) return 60;
  return seconds;
}

function sanitizeCandlePeriodId(id: string): string {
  const options = getTradingMockContent().timeframeOptions;
  if (options.some((o) => o.id === id)) return id;
  return 'tf-1m';
}

function mapCandles(
  candles: { open: number; high: number; low: number; close: number; timestamp?: string }[],
): CandlestickPoint[] {
  const mapped = candles.map((c) => {
    let high = c.high;
    let low = c.low;
    if (low > high) {
      const t = low;
      low = high;
      high = t;
    }
    high = Math.max(high, c.open, c.close);
    low = Math.min(low, c.open, c.close);
    const timeSec = c.timestamp ? Math.floor(new Date(c.timestamp).getTime() / 1000) : undefined;
    return {
      open: c.open,
      high,
      low,
      close: c.close,
      time: Number.isFinite(timeSec) ? timeSec : undefined,
    };
  });

  // Binolla history often arrives newest-first; chart + live rollover need oldest→newest.
  const rawFirst = mapped[0]?.time ?? null;
  const rawLast = mapped[mapped.length - 1]?.time ?? null;
  const wasNewestFirst =
    rawFirst != null && rawLast != null && rawFirst > rawLast;
  mapped.sort((a, b) => (a.time ?? 0) - (b.time ?? 0));

  // Connect closed history only — leave the forming candle's open as Binolla sent it
  // until live ticks own it (avoids visual “merge” into the previous bar).
  const stitched =
    mapped.length <= 1
      ? mapped
      : [
          ...stitchOpenToPrevClose(mapped.slice(0, -1)),
          { ...mapped[mapped.length - 1]! },
        ];

  // #region agent log
  fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
    body: JSON.stringify({
      sessionId: '660ec2',
      runId: 'candle-order',
      hypothesisId: 'H91',
      location: 'tradingService.ts:mapCandles',
      message: 'candle_mapped',
      data: {
        count: stitched.length,
        rawFirst,
        rawLast,
        wasNewestFirst,
        sortedFirst: stitched[0]?.time ?? null,
        sortedLast: stitched[stitched.length - 1]?.time ?? null,
        ascending:
          (stitched[0]?.time ?? 0) <= (stitched[stitched.length - 1]?.time ?? 0),
        lastClose: stitched[stitched.length - 1]?.close ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (stitched.length <= MAX_CANDLES_STORED) return stitched;
  return stitched.slice(stitched.length - MAX_CANDLES_STORED);
}

function bucketOf(time: number | undefined, periodSec: number, fallback: number): number {
  if (time != null && Number.isFinite(time)) {
    return Math.floor(time / periodSec) * periodSec;
  }
  return fallback;
}

/**
 * Keep locally opened candles when the server history is still on the previous period,
 * and preserve live high/low progress on the forming bar.
 */
function mergeServerWithLiveSeries(
  serverCandles: CandlestickPoint[],
  localSeries: CandlestickPoint[],
  periodSec: number,
  livePrice: number | null,
): CandlestickPoint[] {
  const nowSec = Math.floor(Date.now() / 1000);
  const nowBucket = Math.floor(nowSec / periodSec) * periodSec;

  if (serverCandles.length === 0) {
    return localSeries.length > 0 ? localSeries.map((c) => ({ ...c })) : [];
  }

  let merged = serverCandles.map((c) => ({ ...c }));
  const serverLast = merged[merged.length - 1]!;
  const serverBucket = bucketOf(serverLast.time, periodSec, nowBucket);

  if (localSeries.length > 0) {
    const newerLocal = localSeries
      .filter((c) => bucketOf(c.time, periodSec, -1) > serverBucket)
      .map((c) => ({ ...c }));

    if (newerLocal.length > 0) {
      merged = [...merged, ...newerLocal];
    } else {
      const localLast = localSeries[localSeries.length - 1]!;
      const localBucket = bucketOf(localLast.time, periodSec, nowBucket);
      if (localBucket === serverBucket) {
        // Same forming candle — keep the wider live range, prefer live close.
        const close = livePrice ?? localLast.close;
        merged[merged.length - 1] = {
          ...serverLast,
          open: serverLast.open,
          high: Math.max(serverLast.high, localLast.high, close),
          low: Math.min(serverLast.low, localLast.low, close),
          close,
          time: serverLast.time ?? localLast.time ?? serverBucket,
        };
      }
    }
  }

  const localLast = localSeries[localSeries.length - 1];
  const localBucket = localLast
    ? bucketOf(localLast.time, periodSec, nowBucket)
    : null;

  // #region agent log
  fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
    body: JSON.stringify({
      sessionId: '660ec2',
      runId: 'candle-order',
      hypothesisId: 'H92',
      location: 'tradingService.ts:mergeServerWithLiveSeries',
      message: 'candle_merge',
      data: {
        serverCount: serverCandles.length,
        localCount: localSeries.length,
        mergedCount: merged.length,
        serverBucket,
        localBucket,
        nowBucket,
        keptExtra: merged.length - serverCandles.length,
        serverLastTime: serverLast.time ?? null,
        mergedLastTime: merged[merged.length - 1]?.time ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return merged;
}

/** Make candles touch: open[i] = close[i-1], keep high/low valid. */
function stitchOpenToPrevClose(candles: CandlestickPoint[]): CandlestickPoint[] {
  if (candles.length === 0) return candles;
  const out: CandlestickPoint[] = [{ ...candles[0]! }];
  for (let i = 1; i < candles.length; i++) {
    const prev = out[i - 1]!;
    const cur = candles[i]!;
    const open = prev.close;
    const close = cur.close;
    const high = Math.max(cur.high, open, close);
    const low = Math.min(cur.low, open, close);
    out.push({ ...cur, open, high, low, close });
  }
  return out;
}

/** Paint live quote onto the forming candle so refresh cannot jump close≠quote. */
function applyQuoteToCandles(
  candles: CandlestickPoint[],
  price: number,
  periodSec: number,
): CandlestickPoint[] {
  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(nowSec / periodSec) * periodSec;
  const next = candles.map((c) => ({ ...c }));

  if (next.length === 0) {
    return [{ open: price, high: price, low: price, close: price, time: bucket }];
  }

  const last = next[next.length - 1]!;
  const lastBucket =
    last.time != null && Number.isFinite(last.time)
      ? Math.floor(last.time / periodSec) * periodSec
      : bucket;

  if (bucket > lastBucket) {
    // New candle opens exactly where the previous one closed.
    const open = last.close;
    next.push({
      open,
      high: Math.max(open, price),
      low: Math.min(open, price),
      close: price,
      time: bucket,
    });
    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
      body: JSON.stringify({
        sessionId: '660ec2',
        runId: 'candle-order',
        hypothesisId: 'H92',
        location: 'tradingService.ts:applyQuoteToCandles',
        message: 'candle_rollover',
        data: {
          lastBucket,
          bucket,
          count: next.length,
          open,
          price,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (next.length > MAX_CANDLES_STORED) {
      return next.slice(next.length - MAX_CANDLES_STORED);
    }
    return next;
  }

  // Still the same period — update forming candle only (never rewrite prior bars).
  last.close = price;
  last.high = Math.max(last.high, price);
  last.low = Math.min(last.low, price);
  if (last.time == null) last.time = lastBucket;
  next[next.length - 1] = last;
  return next;
}

function chartStatusFor(status: AccountStatusResponse | null, hasCandles: boolean): string {
  if (!status) return t('trading.chart.connect');
  if (status.botAccess === 'BinollaNotConnected') return t('trading.chart.connectBinolla');
  if (status.botAccess === 'NotEligible') return t('trading.chart.rejected');
  if (status.botAccess === 'SessionExpired') return t('trading.chart.sessionExpired');
  if (!canBrowseMarket(status.botAccess)) return t('trading.chart.accessRequired');
  // Pending approval must not hide a market-data failure — chart can still load.
  if (!hasCandles) {
    return status.botAccess === 'AdminApprovalRequired'
      ? t('trading.waitingCandles')
      : t('trading.chart.noCandles');
  }
  if (status.botAccess === 'AdminApprovalRequired') return t('trading.chart.lockedLive');
  return t('trading.chart.live');
}

export const tradingService = {
  async fetchTradingData(): Promise<TradingData> {
    if (fetchInFlight) return fetchInFlight;
    fetchInFlight = this.fetchTradingDataInner().finally(() => {
      fetchInFlight = null;
    });
    return fetchInFlight;
  },

  async fetchTradingDataInner(): Promise<TradingData> {
    ensureUserIsolation();
    const content = structuredClone(getTradingMockContent());
    content.binollaCard.candleData = [];
    content.binollaCard.balanceValue = '—';
    content.binollaCard.priceDisplay = '—';

    try {
      const [status, balance, runningTrades] = await Promise.all([
        getAccountStatusCached().catch(() => null),
        binollaApi.balance(timedSignal(MARKET_FETCH_MS)).catch(() => null),
        tradesApi.list({ page: 1, pageSize: 5, status: 'Running' }).catch(() => null),
      ]);
      content.binollaCard.activeTrade = runningTrades?.items[0];

      const connected = Boolean(status?.binollaConnected && balance?.connected);
      content.topBar.connectionLabel = connected
        ? t('trading.connected')
        : t('trading.disconnected');
      content.topBar.connectionTone = connected ? 'success' : 'danger';

      if (balance) {
        content.binollaCard.balanceValue = formatMoney(balance.currentBalance);
      }

      if (status?.botAccess === 'AdminApprovalRequired') {
        content.topBar.connectionLabel = t('trading.awaitingApproval');
        content.topBar.connectionTone = 'warning';
      }

      const browse = canBrowseMarket(status?.botAccess);
      const tradeOk = canTrade(status?.botAccess);
      content.binollaCard.tradesDisabled = !tradeOk;
      content.binollaCard.tradeLockMessage =
        status?.botAccess === 'AdminApprovalRequired'
          ? getAdminNotApprovedTradeMessage()
          : !tradeOk
            ? t('trading.tradingUnavailable')
            : undefined;

      let assetsErrorCode: string | null = null;
      let assets = browse
        ? await marketApi.assets(timedSignal(MARKET_FETCH_MS)).catch((err: unknown) => {
            assetsErrorCode =
              err instanceof ApiClientError ? err.code : err instanceof Error ? err.name : 'unknown';
            // #region agent log
            fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
              body: JSON.stringify({
                sessionId: '660ec2',
                runId: 'pairs-debug',
                hypothesisId: 'H1',
                location: 'tradingService.ts:assets.catch',
                message: 'market_assets_failed',
                data: {
                  browse,
                  botAccess: status?.botAccess ?? null,
                  binollaConnected: status?.binollaConnected ?? null,
                  errorCode: assetsErrorCode,
                  marketFetchMs: MARKET_FETCH_MS,
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
            // #endregion
            return null;
          })
        : null;

      // Backend may return count=0 while s_assets/list is still in flight (was 8s timeout).
      // One immediate retry recovers the pair switcher without waiting for the 10s poll.
      if (browse && (assets?.assets?.length ?? 0) === 0 && !assetsErrorCode) {
        assets = await marketApi.assets(timedSignal(MARKET_FETCH_MS)).catch((err: unknown) => {
          assetsErrorCode =
            err instanceof ApiClientError ? err.code : err instanceof Error ? err.name : 'unknown';
          return null;
        });
      }

      const liveAssets = assets?.assets ?? [];
      const pairOptions: TradingPairOption[] = liveAssets.map((a) => ({
        symbol: a.symbol,
        label: formatPairLabel(a.symbol, a.name),
        available: a.available,
      }));
      content.binollaCard.pairOptions = pairOptions;

      // Open Running trade wins: open the chart on that pair when entering Trading.
      const activeAssetSymbol = content.binollaCard.activeTrade?.asset?.trim() || null;
      const activeAssetMatch = activeAssetSymbol
        ? liveAssets.find(
            (a) =>
              a.symbol.toLowerCase() === activeAssetSymbol.toLowerCase() ||
              a.symbol.toLowerCase() === `${activeAssetSymbol}_otc`.toLowerCase() ||
              a.symbol.replace(/_otc$/i, '').toLowerCase() ===
                activeAssetSymbol.replace(/_otc$/i, '').toLowerCase(),
          )
        : undefined;

      const stickyRaw =
        !activeAssetMatch && selectedAsset != null
          ? liveAssets.find(
              (a) =>
                a.symbol === selectedAsset && (a.available === undefined || a.available),
            )
          : undefined;
      // Prefer OTC twin when sticky is a non-OTC FX symbol (EURGBP often has no candle push).
      const stickyOtcTwin =
        stickyRaw && !/_otc$/i.test(stickyRaw.symbol)
          ? liveAssets.find(
              (a) =>
                a.symbol.toLowerCase() === `${stickyRaw.symbol}_otc`.toLowerCase() &&
                (a.available === undefined || a.available),
            )
          : undefined;
      const sticky = stickyOtcTwin ?? stickyRaw;
      // Honor sticky for FX majors, or any pair the user explicitly picked this session.
      // Ignore stale localStorage equity OTC (e.g. MS_otc) that never streams candles.
      const stickyUsable =
        sticky &&
        (userChosePair ||
          isPreferredMarketSymbol(sticky.symbol) ||
          /^(EUR|GBP|USD|AUD|CAD|CHF|JPY|NZD){2}(_otc)?$/i.test(
            sticky.symbol.replace('/', ''),
          ));
      const preferred =
        activeAssetMatch ??
        (stickyUsable ? sticky : undefined) ??
        pickPreferredMarketAsset(liveAssets) ??
        liveAssets.find((a) => a.available) ??
        liveAssets[0];
      const firstAsset = preferred?.symbol ?? null;
      if (selectedAsset && selectedAsset !== firstAsset) {
        liveCandleSeries = [];
        lastLivePrice = null;
      }
      selectedAsset = firstAsset;
      if (activeAssetMatch) userChosePair = false;
      persistSelectedAsset(firstAsset);

      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
        body: JSON.stringify({
          sessionId: '1892a4',
          runId: 'trade-pair',
          hypothesisId: 'PAIR1',
          location: 'tradingService.ts:fetchTradingDataInner',
          message: 'trading_assets_selected',
          data: {
            browse,
            apiCount: liveAssets.length,
            selected: firstAsset,
            activeTradeAsset: activeAssetSymbol,
            followedActive: Boolean(activeAssetMatch),
            stickyHit: Boolean(stickyUsable),
            userId: (boundUserId ?? '').slice(0, 8) || null,
            assetsErrorCode,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      if (!firstAsset) {
        content.binollaCard.pairName = browse ? t('trading.noPairs') : '—';
        content.binollaCard.pairSuffix = '';
        content.binollaCard.pairSymbol = undefined;
        content.binollaCard.priceDisplay = browse ? t('common.unavailable') : '—';
        content.binollaCard.candleData = [];
        content.binollaCard.chartStatusLabel = assetsErrorCode
          ? assetsErrorCode === 'BINOLLA_SESSION_EXPIRED'
            ? t('trading.chart.sessionExpired')
            : assetsErrorCode === 'BINOLLA_NOT_CONNECTED'
              ? t('trading.chart.connectBinolla')
              : t('trading.loadChartFailed')
          : browse
            ? t('trading.noAssetsSession')
            : chartStatusFor(status, false);
        content.signalCard.freshLabel = browse ? t('trading.noAssets') : t('trading.awaitingAccess');
        content.signalCard.freshTone = 'neutral';
        content.signalCard.stats = [
          { id: 'signal', label: t('trading.lastSignal'), value: t('common.none') },
          { id: 'strength', label: t('common.rsi'), value: '—' },
          { id: 'indicator', label: t('trading.indicator'), value: t('common.rsi') },
          { id: 'strategy', label: t('trading.strategy'), value: t('common.rsi') },
          { id: 'market', label: t('trading.market'), value: '—' },
        ];
      } else {
        const displayName = preferred?.name ?? firstAsset;
        content.binollaCard.pairName = formatPairLabel(firstAsset, displayName);
        content.binollaCard.pairSuffix = firstAsset.toLowerCase().includes('otc') ? 'OTC' : '';
        content.binollaCard.pairSymbol = firstAsset;

        const periodSeconds = candlePeriodSecondsFromId(runtimeState.candlePeriodId);
        // Candles first — parallel price/candles/RSI contended on the subscribe gate and
        // all timed out together at MarketDataTimeout.
        const candlesResponse = await marketApi
          .candles(firstAsset, periodSeconds, timedSignal(MARKET_FETCH_MS))
          .catch(() => null);
        // #region agent log
        fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
          body: JSON.stringify({
            sessionId: '660ec2',
            runId: 'chart-fix',
            hypothesisId: 'H115',
            location: 'tradingService.ts:fetchTradingDataInner',
            message: candlesResponse ? 'candles_ok' : 'candles_miss',
            data: {
              asset: firstAsset,
              periodSeconds,
              candleCount: candlesResponse?.candles?.length ?? 0,
              botAccess: status?.botAccess ?? null,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        // Price/RSI only after candles — parallel subscribe contended on one WS gate.
        let price = null as Awaited<ReturnType<typeof marketApi.price>> | null;
        let rsi = null as Awaited<ReturnType<typeof strategiesApi.rsiSignal>> | null;
        if (candlesResponse) {
          [price, rsi] = await Promise.all([
            marketApi.price(firstAsset, timedSignal(MARKET_FETCH_MS)).catch(() => null),
            strategiesApi.rsiSignal(firstAsset, periodSeconds, timedSignal(MARKET_FETCH_MS)).catch(() => null),
          ]);
        } else {
          price = await marketApi.price(firstAsset, timedSignal(MARKET_FETCH_MS)).catch(() => null);
        }

        content.binollaCard.priceDisplay =
          price?.price != null && Number.isFinite(price.price)
            ? price.price.toFixed(5)
            : t('common.unavailable');
        let candles = candlesResponse ? mapCandles(candlesResponse.candles) : [];
        const livePx =
          price?.price != null && Number.isFinite(price.price) ? price.price : lastLivePrice;
        candles = mergeServerWithLiveSeries(candles, liveCandleSeries, periodSeconds, livePx);
        if (livePx != null && candles.length > 0) {
          candles = applyQuoteToCandles(candles, livePx, periodSeconds);
          lastLivePrice = livePx;
          content.binollaCard.priceDisplay = livePx.toFixed(5);
        }
        liveCandleSeries = candles.map((c) => ({ ...c }));
        content.binollaCard.candleData = candles;
        content.binollaCard.chartStatusLabel = chartStatusFor(
          status,
          content.binollaCard.candleData.length > 0,
        );

        if (rsi) {
          const mapped = formatSignal(rsi.signal);
          const liveRsi = Number(rsi.liveRsi ?? rsi.rsi);
          const liveRsiLabel = Number.isFinite(liveRsi) ? liveRsi.toFixed(2) : '—';
          // #region agent log
          fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
            body: JSON.stringify({
              sessionId: '1892a4',
              runId: 'post-fix',
              hypothesisId: 'H-E',
              location: 'tradingService.ts:signalCard',
              message: 'display_live_rsi',
              data: {
                asset: firstAsset,
                displayed: liveRsiLabel,
                liveRsi: rsi.liveRsi ?? null,
                closedRsi: rsi.rsi,
                signal: rsi.signal,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          content.signalCard.freshLabel = `RSI ${liveRsiLabel}`;
          content.signalCard.freshTone =
            rsi.signal.toLowerCase() === 'none' ? 'neutral' : 'success';
          content.signalCard.stats = [
            {
              id: 'signal',
              label: t('trading.lastSignal'),
              value: mapped.value,
              valueTone: mapped.tone,
            },
            { id: 'strength', label: t('common.liveRsi'), value: liveRsiLabel },
            { id: 'indicator', label: t('trading.indicator'), value: t('common.rsi') },
            { id: 'strategy', label: t('trading.strategy'), value: t('common.rsi') },
            { id: 'market', label: t('trading.market'), value: firstAsset },
            {
              id: 'candle',
              label: t('trading.candle'),
              value: new Date(rsi.candleTime).toLocaleTimeString('en-GB', { hour12: false }),
            },
            {
              id: 'timeframe',
              label: t('trading.timeframe'),
              value: `${rsi.timeframe}s`,
            },
          ];
        } else {
          content.signalCard.freshLabel = t('common.none');
          content.signalCard.freshTone = 'neutral';
          content.signalCard.stats = [
            { id: 'signal', label: t('trading.lastSignal'), value: t('common.none') },
            { id: 'strength', label: t('common.rsi'), value: '—' },
            { id: 'indicator', label: t('trading.indicator'), value: t('common.rsi') },
            { id: 'strategy', label: t('trading.strategy'), value: t('common.rsi') },
            { id: 'market', label: t('trading.market'), value: firstAsset },
          ];
        }
      }
    } catch (error) {
      content.topBar.connectionLabel = t('common.errorGeneric');
      content.topBar.connectionTone = 'danger';
      content.binollaCard.balanceValue = '—';
      content.binollaCard.priceDisplay = t('common.unavailable');
      content.binollaCard.candleData = [];
      content.binollaCard.chartStatusLabel =
        error instanceof ApiClientError ? error.message : t('trading.loadChartFailed');
      if (error instanceof ApiClientError) {
        content.signalCard.freshLabel = error.code;
      }
    }

    return {
      ...content,
      runtime: cloneRuntime(),
    };
  },

  /** Lightweight tick: update last candle + price from live quote only. */
  async fetchLivePrice(): Promise<number | null> {
    ensureUserIsolation();
    // Skip until chart has candles — short aborts (~4s) were cancelling quote waits
    // and thrashing asset/change while history was still loading.
    if (!selectedAsset || fetchInFlight || livePriceInFlight || liveCandleSeries.length === 0)
      return null;
    livePriceInFlight = true;
    try {
      const quote = await marketApi
        .price(selectedAsset, timedSignal(MARKET_FETCH_MS))
        .catch(() => null);
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
        body: JSON.stringify({
          sessionId: '660ec2',
          runId: 'chart-fix',
          hypothesisId: 'H114',
          location: 'tradingService.ts:fetchLivePrice',
          message: quote ? 'live_price_ok' : 'live_price_miss',
          data: { asset: selectedAsset, hasQuote: !!quote },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return quote?.price ?? null;
    } finally {
      livePriceInFlight = false;
    }
  },

  applyLiveQuote(current: TradingData, price: number): TradingData {
    lastLivePrice = price;
    const periodSec = candlePeriodSecondsFromId(current.runtime.candlePeriodId);
    const candles = applyQuoteToCandles(current.binollaCard.candleData, price, periodSec);
    liveCandleSeries = candles.map((c) => ({ ...c }));

    return {
      ...current,
      binollaCard: {
        ...current.binollaCard,
        priceDisplay: price.toFixed(5),
        candleData: candles,
        chartStatusLabel:
          candles.length > 0
            ? t('trading.chart.live')
            : current.binollaCard.chartStatusLabel,
      },
      runtime: current.runtime,
    };
  },

  async updateRuntime(partial: Partial<TradingRuntimeState>): Promise<TradingRuntimeState> {
    const next = { ...runtimeState, ...partial };
    // Keep expiry display tied to the selected Binolla trade duration — not a fake timer.
    if (partial.durationId && partial.expirySeconds === undefined) {
      next.expirySeconds = durationSecondsFromId(partial.durationId);
    }
    runtimeState = next;
    return cloneRuntime();
  },

  /** Cycle trade duration: 1m → 5m → 15m → 1h → … */
  async cycleTradeDuration(): Promise<TradingRuntimeState> {
    const options = getTradingMockContent().durationOptions;
    const idx = Math.max(
      0,
      options.findIndex((o) => o.id === runtimeState.durationId),
    );
    const next = options[(idx + 1) % options.length]!;
    return this.updateRuntime({
      durationId: next.id,
      expirySeconds: next.seconds,
    });
  },

  async setCandlePeriod(candlePeriodId: string): Promise<TradingRuntimeState> {
    const safeId = sanitizeCandlePeriodId(candlePeriodId);
    const opt = getTradingMockContent().timeframeOptions.find((o) => o.id === safeId);
    if (!opt) return cloneRuntime();
    liveCandleSeries = [];
    lastLivePrice = null;
    return this.updateRuntime({ candlePeriodId: opt.id });
  },

  getCandlePeriodSeconds(): number {
    return candlePeriodSecondsFromId(runtimeState.candlePeriodId);
  },

  async placeTrade(direction: TradeDirection): Promise<string> {
    const status = await getAccountStatusCached().catch(() => null);
    if (!canTrade(status?.botAccess)) {
      throw new ApiClientError(
        status?.botAccess === 'AdminApprovalRequired'
          ? 'ADMIN_APPROVAL_REQUIRED'
          : status?.botAccess === 'NotEligible'
            ? 'NOT_ELIGIBLE'
            : 'BINOLLA_NOT_CONNECTED',
        status?.botAccess === 'AdminApprovalRequired'
          ? getAdminNotApprovedTradeMessage()
          : t('trading.tradingUnavailable'),
        403,
      );
    }

    if (!selectedAsset) {
      throw new ApiClientError(
        'MARKET_UNAVAILABLE',
        t('trading.noAssetYet'),
        503,
      );
    }

    const amount = Number.parseFloat(runtimeState.amount) || 25;
    const durationOption = getTradingMockContent().durationOptions.find(
      (option) => option.id === runtimeState.durationId,
    );
    const durationLabel = durationOption?.label ?? t('trading.duration.1m');
    const durationSeconds = durationSecondsFromId(runtimeState.durationId);

    const tradeId = await tradeService.placeTrade({
      direction,
      pair: selectedAsset,
      platform: 'binolla',
      amount,
      durationLabel: `${durationSeconds}s`,
      strategy: 'rsi',
      indicator: 'RSI',
      source: 'user',
    });

    // After a live Binolla order, countdown matches that order's duration.
    runtimeState = { ...runtimeState, expirySeconds: durationSeconds };

    await activityService.addTradeNotification({
      tradeId,
      description: `$${amount} ${direction.toUpperCase()} on ${selectedAsset} · ${durationLabel} expiry.`,
    });

    return tradeId;
  },

  async getTradeDetail(tradeId: string) {
    return tradeService.getTradeDetail(tradeId);
  },

  getSelectedAsset(): string | null {
    return selectedAsset;
  },

  /** Switch pair only to a symbol previously returned by GET /api/market/assets. */
  setSelectedAsset(symbol: string): void {
    const cleaned = symbol.trim();
    if (!cleaned) return;
    if (selectedAsset === cleaned) return;
    selectedAsset = cleaned;
    userChosePair = true;
    persistSelectedAsset(cleaned);
    liveCandleSeries = [];
    lastLivePrice = null;
    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
      body: JSON.stringify({
        sessionId: '660ec2',
        runId: 'pairs-debug',
        hypothesisId: 'H3',
        location: 'tradingService.ts:setSelectedAsset',
        message: 'pair_switched',
        data: { symbol: cleaned },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  },

  resetRuntime(): void {
    runtimeState = { ...TRADING_INITIAL_RUNTIME };
    selectedAsset = null;
    userChosePair = false;
    liveCandleSeries = [];
    lastLivePrice = null;
    persistSelectedAsset(null);
    boundUserId = tokenStore.getUserId();
  },
};
