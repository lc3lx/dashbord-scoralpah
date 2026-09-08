import { imageAssets } from '@assets/index';
import { HOME_INITIAL_RUNTIME, getBotStatusDisplay, getHomeMockContent } from './home.mock';
import type { HomeData, HomeRuntimeState, StrategyOptionItem } from '../types';
import {
  ApiClientError,
  binollaApi,
  botApi,
  marketApi,
  strategiesApi,
  tradesApi,
} from '@shared/api';
import type { StrategySignalResponse, TradeDto } from '@shared/api';
import { canBrowseMarket } from '@shared/access/botAccess';
import { MARKET_FETCH_MS, timedSignal } from '@shared/api/timedSignal';
import { getAccountStatusCached, invalidateBotSessionCache } from '@shared/api/botSessionCache';
import {
  pickPreferredMarketAsset,
  filterFxCurrencyAssets,
  isFxCurrencySymbol,
} from '@shared/market/preferAsset';
import {
  bucketPerformance,
  formatMoneyPlain,
  formatSignedMoney,
  formatWinRate,
  weekAndMonthSummaries,
} from '@shared/trades/tradeAggregates';
import { t } from '@shared/i18n';

const MAX_BOT_PAIRS = 2000;
const DESIRED_RUNNING_KEY = 'scar-alpha-bot-desired-running';

export { MAX_BOT_PAIRS };

type DesiredRunningSnapshot = {
  assets: string[];
  amount: number;
  durationSeconds: number;
  dailyProfitTarget: number;
  dailyLossLimit: number;
};

function readDesiredRunning(): DesiredRunningSnapshot | null {
  try {
    const raw = localStorage.getItem(DESIRED_RUNNING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DesiredRunningSnapshot;
    if (!Array.isArray(parsed.assets) || parsed.assets.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDesiredRunning(snapshot: DesiredRunningSnapshot | null): void {
  try {
    if (!snapshot) localStorage.removeItem(DESIRED_RUNNING_KEY);
    else localStorage.setItem(DESIRED_RUNNING_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore */
  }
}

function normalizePairIds(ids: string[], valid?: Set<string>, max = MAX_BOT_PAIRS): string[] {
  const out: string[] = [];
  for (const raw of ids) {
    const id = raw?.trim();
    if (!id || out.includes(id)) continue;
    if (!isFxCurrencySymbol(id)) continue;
    if (valid && !valid.has(id)) continue;
    out.push(id);
    if (out.length >= max) break;
  }
  return out;
}

function formatSelectedPairsLabel(
  pairIds: string[],
  options: { id: string; title: string }[],
): string {
  if (pairIds.length === 0) return '—';
  const titles = pairIds.map((id) => options.find((o) => o.id === id)?.title ?? id);
  if (titles.length === 1) return titles[0] ?? '—';
  return `${titles[0]} +${titles.length - 1}`;
}

function seedRuntimeFromMock(): HomeRuntimeState {
  const settings = getHomeMockContent().sheets.settings;
  return {
    ...HOME_INITIAL_RUNTIME,
    strategyId: 'rsi',
    technicalIndicatorId: 'rsi',
    tradeAmountId: 'amount-25',
    durationId: 'duration-300',
    settings: {
      ...settings,
      toggles: settings.toggles.map((toggle) => ({ ...toggle })),
      riskOptions: [...settings.riskOptions],
    },
  };
}

/** Map bot duration (180/240/300) to RSI backtest expiry candles 3–5 (default 5). */
function expiryCandlesFromDurationId(durationId: string): 3 | 4 | 5 {
  const seconds = Number(durationId.replace('duration-', '')) || 300;
  const candles = Math.round(seconds / 60);
  if (candles === 3 || candles === 4 || candles === 5) return candles;
  return 5;
}

let runtimeState: HomeRuntimeState = seedRuntimeFromMock();

function cloneRuntime(): HomeRuntimeState {
  return {
    ...runtimeState,
    settings: {
      ...runtimeState.settings,
      toggles: runtimeState.settings.toggles.map((toggle) => ({ ...toggle })),
      riskOptions: [...runtimeState.settings.riskOptions],
    },
  };
}

function toBotPreferences(settings: HomeRuntimeState['settings'], strategyId?: string) {
  const enabled = (id: string) => settings.toggles.find((toggle) => toggle.id === id)?.enabled ?? false;
  return {
    autoStopAtProfit: enabled('auto-profit'),
    autoStopAtLoss: enabled('auto-loss'),
    signalConfirmationEnabled: enabled('signal-confirm'),
    riskLevel: settings.selectedRiskId,
    notificationsEnabled: enabled('notifications'),
    // Without this the picked strategy stays client-side and the bot keeps running RSI.
    ...(strategyId ? { strategyId } : {}),
  };
}

function applyBotPreferences(
  settings: HomeRuntimeState['settings'],
  bot: Awaited<ReturnType<typeof botApi.status>>,
): HomeRuntimeState['settings'] {
  const enabledById: Record<string, boolean> = {
    'auto-profit': bot.autoStopAtProfit,
    'auto-loss': bot.autoStopAtLoss,
    'signal-confirm': bot.signalConfirmationEnabled,
    notifications: bot.notificationsEnabled,
  };
  return {
    ...settings,
    selectedRiskId: bot.riskLevel,
    dailyProfitTarget: bot.dailyProfitTarget,
    dailyLossLimit: bot.dailyLossLimit,
    toggles: settings.toggles.map((toggle) => ({
      ...toggle,
      enabled: enabledById[toggle.id] ?? toggle.enabled,
    })),
  };
}

function formatSignal(signal: string): string {
  const s = signal.toLowerCase();
  if (s === 'call') return t('common.callUp');
  if (s === 'put') return t('common.putDown');
  return t('common.none');
}

function pairDisplayName(
  id: string,
  options: { id: string; title: string }[],
): string {
  if (!id) return '—';
  return options.find((o) => o.id === id)?.title ?? id;
}

function closedRsiValue(signal: StrategySignalResponse): number {
  return Number(signal.rsi);
}

function liveRsiValue(signal: StrategySignalResponse): number {
  return Number(signal.liveRsi ?? signal.rsi);
}

function isClosedCallRsi(signal: StrategySignalResponse): boolean {
  const rsi = closedRsiValue(signal);
  return Number.isFinite(rsi) && rsi <= 25;
}

function isClosedPutRsi(signal: StrategySignalResponse): boolean {
  const rsi = closedRsiValue(signal);
  return Number.isFinite(rsi) && rsi >= 75;
}

function backtestReady(signal: StrategySignalResponse): boolean {
  const rate = Number(signal.backtest?.successRate ?? 0);
  const total = Number(signal.backtest?.totalSignals ?? 0);
  return signal.backtest?.passed === true && total > 0 && rate >= 75;
}

/** Closed RSI first. Backtest only counts after the candle closed at 25/75. */
function isCallSetup(signal: StrategySignalResponse): boolean {
  return (
    signal.signal === 'Call' &&
    isClosedCallRsi(signal) &&
    backtestReady(signal)
  );
}

function isPutSetup(signal: StrategySignalResponse): boolean {
  return (
    signal.signal === 'Put' &&
    isClosedPutRsi(signal) &&
    backtestReady(signal)
  );
}

function isActionableSetup(signal: StrategySignalResponse): boolean {
  return isCallSetup(signal) || isPutSetup(signal);
}

function pickLiveDisplaySignal(
  results: Array<StrategySignalResponse | null>,
): { signal: StrategySignalResponse | null; pickMode: string } {
  const valid = results.filter(
    (s): s is StrategySignalResponse =>
      s != null && Number.isFinite(liveRsiValue(s)),
  );
  if (valid.length === 0) return { signal: null, pickMode: 'none' };
  const actionable = valid.filter(isActionableSetup);
  if (actionable.length > 0) {
    const signal = [...actionable].sort((a, b) => {
      // Prefer deeper closed RSI extreme first; backtest rate is secondary.
      const edge = (s: StrategySignalResponse) => {
        const rsi = closedRsiValue(s);
        return isCallSetup(s) ? 25 - rsi : rsi - 75;
      };
      const edgeDiff = edge(b) - edge(a);
      if (edgeDiff !== 0) return edgeDiff;
      return (b.backtest?.successRate ?? 0) - (a.backtest?.successRate ?? 0);
    })[0]!;
    return { signal, pickMode: 'actionable' };
  }
  const tick = Math.floor(Date.now() / 2000);
  return { signal: valid[tick % valid.length]!, pickMode: 'rotate' };
}

function engineStatsFromSignal(
  signal: StrategySignalResponse,
  pairLabel: string,
): HomeData['botEngine']['stats'] {
  const rate = signal.backtest?.successRate;
  const atExtreme = isClosedCallRsi(signal) || isClosedPutRsi(signal);
  // Backtest only has entry meaning when the closed candle RSI is already at 25/75.
  const passed = atExtreme && backtestReady(signal);
  const rateLabel =
    rate == null
      ? '—'
      : !atExtreme
        ? t('home.strategy.awaitRsi', { n: Math.round(rate) })
        : passed
          ? t('home.strategy.successRate', { n: Math.round(rate) })
          : t('home.strategy.filterFailed', { n: Math.round(rate) });
  const live = Number(signal.liveRsi ?? signal.rsi);
  const closed = Number(signal.rsi);
  const rsiValue = Number.isFinite(live) ? live : closed;
  let signalLabel = formatSignal(signal.signal);
  let signalTone: HomeData['botEngine']['stats'][number]['valueTone'] =
    isCallSetup(signal) ? 'success' : 'primary';
  if (isCallSetup(signal)) {
    signalLabel = formatSignal('Call');
  } else if (isPutSetup(signal)) {
    signalLabel = formatSignal('Put');
  } else if (atExtreme && !passed) {
    signalLabel = t('home.strategy.filterFailed', { n: Math.round(rate ?? 0) });
  }
  return [
    { id: 'pair', label: t('home.stat.pair'), value: pairLabel },
    {
      id: 'signal',
      label: t('home.stat.signal'),
      value: signalLabel,
      valueTone: signalTone,
    },
    {
      id: 'strength',
      label: t('common.liveRsi'),
      value: Number.isFinite(rsiValue) ? rsiValue.toFixed(2) : '—',
    },
    {
      id: 'backtest',
      label: t('home.stat.backtest'),
      value: rateLabel,
      valueTone: passed ? 'success' : 'primary',
    },
    {
      id: 'updated',
      label: t('home.stat.candle'),
      value: new Date(signal.candleTime).toLocaleTimeString('en-GB', { hour12: false }),
    },
  ];
}

function refreshSettingsLabels(): void {
  const fresh = getHomeMockContent().sheets.settings;
  const prevById = new Map(runtimeState.settings.toggles.map((toggle) => [toggle.id, toggle]));
  runtimeState.settings = {
    ...fresh,
    selectedRiskId: runtimeState.settings.selectedRiskId,
    dailyProfitTarget: runtimeState.settings.dailyProfitTarget,
    dailyLossLimit: runtimeState.settings.dailyLossLimit,
    toggles: fresh.toggles.map((toggle) => ({
      ...toggle,
      enabled: prevById.get(toggle.id)?.enabled ?? toggle.enabled,
    })),
    riskOptions: [...fresh.riskOptions],
  };
}

function strategyPreview(id: string): string {
  if (id === 'smart') return imageAssets.strategies.trendBreaker;
  if (id === 'alt5') return imageAssets.strategies.redSignalPro;
  if (id === 'rsi') return imageAssets.strategies.otcHunter;
  if (id === 'ema') return imageAssets.strategies.alphaMomentum;
  if (id === 'macd') return imageAssets.strategies.scarPrecision;
  return imageAssets.strategies.redSignalPro;
}

async function fetchTradesForHomeStats(): Promise<{ items: TradeDto[]; total: number } | null> {
  try {
    const first = await tradesApi.list({ page: 1, pageSize: 100 });
    return { items: first.items, total: first.total };
  } catch {
    return null;
  }
}

function applyHomeTradeStats(
  base: ReturnType<typeof getHomeMockContent>,
  trades: TradeDto[],
): void {
  const buckets = weekAndMonthSummaries(trades);
  base.stats = base.stats.map((stat) => {
    if (stat.id === 'today-gain') {
      return {
        ...stat,
        value: buckets.today.profit > 0 ? formatSignedMoney(buckets.today.profit) : '$0.00',
        valueTone: 'success',
      };
    }
    if (stat.id === 'net') {
      return {
        ...stat,
        value: formatSignedMoney(buckets.today.net),
        valueTone: buckets.today.net > 0 ? 'success' : buckets.today.net < 0 ? 'danger' : undefined,
      };
    }
    if (stat.id === 'active') {
      return {
        ...stat,
        value: String(buckets.all.active),
        valueTone: buckets.all.active > 0 ? 'warning' : undefined,
      };
    }
    if (stat.id === 'win-rate') {
      return {
        ...stat,
        value: formatWinRate(buckets.all.wins, buckets.all.settled),
      };
    }
    return stat;
  });
  base.performancePoints = bucketPerformance(trades, '7d').map((bucket) => ({
    label: bucket.label,
    net: bucket.net,
  }));
}

export const homeService = {
  async fetchHomeData(): Promise<HomeData> {
    refreshSettingsLabels();
    const base = structuredClone(getHomeMockContent());
    let asset = runtimeState.tradingPairId || '';
    let pairIds = [...(runtimeState.tradingPairIds ?? [])];

    try {
      const [status, balance, strategies, tradeBundle, botRuntimeInitial] = await Promise.all([
        getAccountStatusCached().catch(() => null),
        binollaApi.balance(timedSignal(MARKET_FETCH_MS)).catch(() => null),
        strategiesApi.list().catch(() => null),
        fetchTradesForHomeStats(),
        botApi.status().catch(() => null),
      ]);

      let botRuntime = botRuntimeInitial;

      if (botRuntime) {
        runtimeState.botStatus = botRuntime.state.toLowerCase() as HomeRuntimeState['botStatus'];
        runtimeState.stopReason = botRuntime.stopReason ?? null;
        if (
          botRuntime.stopReason === 'DAILY_PROFIT_TARGET_REACHED' ||
          botRuntime.stopReason === 'DAILY_LOSS_LIMIT_REACHED'
        ) {
          writeDesiredRunning(null);
        }
        const fromBot = normalizePairIds(
          botRuntime.assets?.length
            ? botRuntime.assets
            : botRuntime.asset
              ? [botRuntime.asset]
              : [],
        );
        if (fromBot.length) {
          pairIds = fromBot;
          runtimeState.tradingPairIds = fromBot;
          runtimeState.tradingPairId = fromBot[0] ?? '';
          asset = fromBot[0] ?? '';
        } else if (botRuntime.asset) {
          runtimeState.tradingPairId = botRuntime.asset;
          asset = botRuntime.asset;
        }
        runtimeState.tradeAmountId = `amount-${botRuntime.amount}`;
        runtimeState.durationId = `duration-${botRuntime.durationSeconds}`;
        runtimeState.settings = applyBotPreferences(runtimeState.settings, botRuntime);

        // Auto-resume: user wanted Running but server lost state (API restart) or soft-stopped.
        const desired = readDesiredRunning();
        const serverStopped =
          botRuntime.state === 'Stopped' &&
          botRuntime.stopReason !== 'DAILY_PROFIT_TARGET_REACHED' &&
          botRuntime.stopReason !== 'DAILY_LOSS_LIMIT_REACHED';
        if (desired && serverStopped) {
          try {
            const resumed = await botApi.start(
              desired.assets,
              desired.amount,
              desired.durationSeconds,
              desired.dailyProfitTarget,
              desired.dailyLossLimit,
              toBotPreferences(runtimeState.settings, runtimeState.strategyId),
            );
            botRuntime = resumed;
            runtimeState.botStatus = 'running';
            runtimeState.stopReason = null;
            pairIds = normalizePairIds(resumed.assets?.length ? resumed.assets : desired.assets);
            runtimeState.tradingPairIds = pairIds;
            runtimeState.tradingPairId = pairIds[0] ?? '';
            asset = pairIds[0] ?? '';
          } catch {
            /* next poll retries */
          }
        }

        // Session soft-fail while bot Running — silent reconnect so trading resumes alone.
        if (
          runtimeState.botStatus === 'running' &&
          (status?.botAccess === 'SessionExpired' || status?.botAccess === 'BinollaNotConnected')
        ) {
          await binollaApi.reconnect().catch(() => undefined);
          invalidateBotSessionCache();
        }
      }

      const assets =
        canBrowseMarket(status?.botAccess)
          ? await marketApi.assets(timedSignal(MARKET_FETCH_MS)).catch(() => null)
          : null;

      if (assets?.assets?.length) {
        const fxAssets = filterFxCurrencyAssets(assets.assets);
        const options = fxAssets.map((a) => ({
          id: a.symbol,
          title: a.name || a.symbol,
          description: a.available ? t('common.available') : t('home.asset.unavailable'),
        }));
        base.sheets.tradingPair.options = options;
        const valid = new Set(options.map((o) => o.id));
        const preferred = pickPreferredMarketAsset(
          fxAssets.map((a) => ({ symbol: a.symbol, available: a.available })),
        );
        const seed = normalizePairIds(
          pairIds.length
            ? pairIds.filter(isFxCurrencySymbol)
            : runtimeState.tradingPairId && isFxCurrencySymbol(runtimeState.tradingPairId)
              ? [runtimeState.tradingPairId]
              : [],
          valid,
        );
        pairIds =
          seed.length > 0
            ? seed
            : preferred?.symbol && valid.has(preferred.symbol)
              ? [preferred.symbol]
              : options[0]?.id
                ? [options[0].id]
                : [];
        asset = pairIds[0] ?? '';
        runtimeState.tradingPairIds = pairIds;
        runtimeState.tradingPairId = asset;
        base.sheets.tradingPair.selectedIds = pairIds;
        base.sheets.tradingPair.selectedId = asset;
        // #region agent log
        fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
          body: JSON.stringify({
            sessionId: '1892a4',
            runId: 'multi-pair',
            hypothesisId: 'MP1',
            location: 'homeService.ts:fetchHomeData',
            message: 'home_pair_options',
            data: {
              optionCount: options.length,
              selectedIds: pairIds,
              preferred: preferred?.symbol ?? null,
              sample: options.slice(0, 12).map((o) => o.id),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      } else {
        base.sheets.tradingPair.options = [];
        base.sheets.tradingPair.selectedId = '';
        base.sheets.tradingPair.selectedIds = [];
        if (!assets) {
          asset = runtimeState.tradingPairId;
          pairIds = runtimeState.tradingPairIds ?? [];
        } else {
          runtimeState.tradingPairId = '';
          runtimeState.tradingPairIds = [];
          asset = '';
          pairIds = [];
        }
      }

      if (strategies?.strategies?.length) {
        // Every strategy the server reports as runnable. Each card describes ITSELF —
        // reusing the RSI copy for another strategy would misdescribe what it does.
        const strategyOptions: StrategyOptionItem[] = strategies.strategies
          .filter((s) => s.enabled)
          .map((s) => ({
            id: s.id,
            title: s.name,
            stats: [
              {
                label: t('home.strategy.stat.indicators'),
                value: t(`home.strategy.${s.id}.indicator`),
              },
              {
                label: t('home.strategy.stat.duration'),
                value: t(`home.strategy.${s.id}.expiry`),
              },
              {
                label: t(`home.strategy.${s.id}.filter`),
                value: t(`home.strategy.${s.id}.filterValue`),
              },
              { label: t('home.strategy.stat.markets'), value: t('home.market.binolla') },
            ],
            successRate: t(`home.strategy.${s.id}.success`),
            previewSrc: strategyPreview(s.id),
            enabled: s.enabled,
          }));

        base.sheets.strategy.options = strategyOptions;
        // The server owns which strategy is running — otherwise a reload would show
        // RSI while the bot is actually on EMA.
        if (botRuntime?.strategyId) {
          runtimeState.strategyId = botRuntime.strategyId;
        }
        const enabled = strategies.strategies.find((s) => s.enabled)?.id ?? strategies.strategies[0]?.id ?? '';
        if (!strategies.strategies.some((s) => s.id === runtimeState.strategyId && s.enabled)) {
          runtimeState.strategyId = enabled;
        }
        base.sheets.strategy.selectedId = runtimeState.strategyId;
      } else {
        base.sheets.strategy.options = [];
        base.sheets.strategy.selectedId = '';
      }

      // Only RSI is backed by a live signal endpoint.
      base.sheets.technicalIndicator.selectedId = 'rsi';
      runtimeState.technicalIndicatorId = 'rsi';
      base.sheets.technicalIndicator.options = getHomeMockContent().sheets.technicalIndicator.options;

      if (balance) {
        base.stats = base.stats.map((stat) =>
          stat.id === 'balance' ? { ...stat, value: formatMoneyPlain(balance.currentBalance) } : stat,
        );
      } else {
        base.stats = base.stats.map((stat) =>
          stat.id === 'balance' ? { ...stat, value: '—' } : stat,
        );
      }

      if (tradeBundle) {
        applyHomeTradeStats(base, tradeBundle.items);
      } else {
        base.stats = base.stats.map((stat) =>
          stat.id === 'balance' ? stat : { ...stat, value: '—' },
        );
      }

      const analyzeIds = (
        pairIds.length > 0 ? pairIds : asset ? [asset] : []
      ).filter(isFxCurrencySymbol);
      const running = runtimeState.botStatus === 'running';
      const expiryCandles = expiryCandlesFromDurationId(runtimeState.durationId);
      // Placement is server-side (BotSignalWorker scans every selected FX pair each tick).
      const signalOpts = { expiryCandles, backtestCandles: 200, autoExecute: false as const };
      const openTradeCount = tradeBundle
        ? weekAndMonthSummaries(tradeBundle.items).all.active
        : 0;
      // One live trade at a time — pause Home RSI until it settles.
      // While Running, BotSignalWorker owns the full multi-pair scan server-side.
      // Home must not poll Binolla in parallel (one asset/change) or it starves the worker
      // and looks like "only one pair is analyzed".
      const scanIds =
        openTradeCount > 0 || running ? [] : analyzeIds;
      const signalResults: Array<Awaited<ReturnType<typeof strategiesApi.rsiSignal>> | null> = [];
      if (scanIds.length && canBrowseMarket(status?.botAccess)) {
        // Serial: Binolla history subscribe is one-pair-at-a-time.
        for (const symbol of scanIds) {
          signalResults.push(
            await strategiesApi
              .rsiSignal(symbol, 60, timedSignal(MARKET_FETCH_MS), signalOpts)
              .catch(() => null),
          );
        }
      }
      const picked = pickLiveDisplaySignal(signalResults);
      let signal = picked.signal;
      if (!running && openTradeCount === 0 && signal && isActionableSetup(signal)) {
        // #region agent log
        fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
          body: JSON.stringify({
            sessionId: '1892a4',
            runId: 'rsi-zone',
            hypothesisId: 'H-E',
            location: 'homeService.ts:autoExecute',
            message: 'ui_auto_execute',
            data: {
              asset: signal.asset,
              signal: signal.signal,
              liveRsi: signal.liveRsi ?? null,
              closedRsi: signal.rsi,
              putOk: isClosedPutRsi(signal),
              callOk: isClosedCallRsi(signal),
              violation:
                (signal.signal === 'Put' && !isClosedPutRsi(signal)) ||
                (signal.signal === 'Call' && !isClosedCallRsi(signal)),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        try {
          const placed = await strategiesApi.rsiSignal(
            signal.asset,
            60,
            timedSignal(MARKET_FETCH_MS),
            { ...signalOpts, autoExecute: true },
          );
          signal = placed;
        } catch {
          /* worker may still place */
        }
      }
      const pairLabel = pairDisplayName(
        signal?.asset ?? scanIds[0] ?? '',
        base.sheets.tradingPair.options,
      );
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
        body: JSON.stringify({
          sessionId: '1892a4',
          runId: 'live-rsi',
          hypothesisId: 'H-UI1',
          location: 'homeService.ts:rsiMulti',
          message: 'analyzed_pairs',
            data: {
            running,
            openTradeCount,
            pickMode: picked.pickMode,
            pairCount: analyzeIds.length,
            scanCount: scanIds.length,
            pairs: scanIds,
            expiryCandles,
            pairLabel,
            liveRsi: signal?.liveRsi ?? null,
            closedRsi: signal?.rsi ?? null,
            automationError: signal?.automationError ?? null,
            automatedTradeId: signal?.automatedTradeId ?? null,
            rsiEqual: signal ? Number(signal.liveRsi ?? signal.rsi) === Number(signal.rsi) : null,
            best: signal
              ? {
                  asset: signal.asset,
                  signal: signal.signal,
                  successRate: signal.backtest?.successRate ?? null,
                  passed: signal.backtest?.passed ?? null,
                }
              : null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (signal) {
        base.botEngine.stats = engineStatsFromSignal(signal, pairLabel);
      } else {
        base.botEngine.stats = [
          { id: 'pair', label: t('home.stat.pair'), value: pairLabel },
          { id: 'signal', label: t('home.stat.signal'), value: t('common.none') },
          { id: 'strength', label: t('common.liveRsi'), value: '—' },
          { id: 'backtest', label: t('home.stat.backtest'), value: '—' },
          { id: 'updated', label: t('home.stat.candle'), value: '—' },
        ];
      }

      const chartAsset = signal?.asset ?? asset;
      try {
        const candles =
          chartAsset && canBrowseMarket(status?.botAccess)
            ? await marketApi.candles(chartAsset, 60, timedSignal(MARKET_FETCH_MS)).catch(() => null)
            : null;
        const mapped = candles
          ? candles.candles.map((c) => ({
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close,
            }))
          : [];
        base.sheets.chart.candleData =
          mapped.length > 48 ? mapped.slice(mapped.length - 48) : mapped;
        base.sheets.chart.stats = [
          { id: 'indicator', label: t('trading.indicator'), value: t('common.rsi') },
          {
            id: 'strategy',
            label: t('trading.strategy'),
            value:
              strategies?.strategies.find((s) => s.id === runtimeState.strategyId)?.name ?? '—',
          },
          {
            id: 'signal',
            label: t('home.stat.signal'),
            value: signal ? formatSignal(signal.signal) : t('common.none'),
            valueTone: signal?.signal.toLowerCase() === 'call' ? 'success' : undefined,
          },
        ];
      } catch {
        base.sheets.chart.candleData = [];
      }

      const strategyName =
        strategies?.strategies.find((s) => s.id === runtimeState.strategyId)?.name ?? '—';
      const pairName = formatSelectedPairsLabel(
        pairIds.length ? pairIds : asset ? [asset] : [],
        base.sheets.tradingPair.options,
      );

      base.configRows = base.configRows.map((row) => {
        if (row.id === 'trading-pair') return { ...row, value: pairName };
        if (row.id === 'indicator') return { ...row, value: t('common.rsi') };
        if (row.id === 'strategy') return { ...row, value: strategyName };
        if (row.id === 'market-type') return { ...row, value: t('home.market.binolla') };
        return row;
      });

      if (status?.botAccess === 'AdminApprovalRequired') {
        base.disclaimer = t('home.disclaimer.pending');
      } else if (status?.botAccess === 'BinollaNotConnected') {
        base.disclaimer = t('home.disclaimer.notConnected');
      } else if (status?.botAccess === 'NotEligible') {
        base.disclaimer = t('home.disclaimer.rejected');
      } else if (status?.botAccess === 'SessionExpired') {
        base.disclaimer = t('home.disclaimer.sessionExpired');
      } else if (runtimeState.stopReason === 'DAILY_PROFIT_TARGET_REACHED') {
        base.disclaimer = t('home.disclaimer.dailyProfitReached');
      } else if (runtimeState.stopReason === 'DAILY_LOSS_LIMIT_REACHED') {
        base.disclaimer = t('home.disclaimer.dailyLossReached');
      } else {
        base.disclaimer = t('home.disclaimer.ok');
      }

      if (runtimeState.stopReason === 'DAILY_PROFIT_TARGET_REACHED') {
        base.botEngine.statusLabel = t('home.bot.statusDailyProfit');
        base.botEngine.statusTone = 'success';
      } else if (runtimeState.stopReason === 'DAILY_LOSS_LIMIT_REACHED') {
        base.botEngine.statusLabel = t('home.bot.statusDailyLoss');
        base.botEngine.statusTone = 'danger';
      } else {
        const statusDisplay = getBotStatusDisplay()[runtimeState.botStatus];
        base.botEngine.statusLabel = statusDisplay.label;
        base.botEngine.statusTone = statusDisplay.tone;
      }

      base.riskLimits = base.riskLimits.map((limit) => ({
        ...limit,
        value: limit.id === 'profit-target'
          ? `$${botRuntime?.dailyProfitTarget ?? 50}`
          : `-$${botRuntime?.dailyLossLimit ?? 30}`,
        hint: t('home.risk.activeHint'),
      }));

      base.tradeAmount = {
        ...base.tradeAmount,
        label: t('home.tradeAmount'),
        options: [10, 25, 50, 100].map((amount) => ({ id: `amount-${amount}`, label: `$${amount}` })),
        displayValue: `$${botRuntime?.amount ?? 25}`,
        selectedId: `amount-${botRuntime?.amount ?? 25}`,
      };
      base.duration = {
        ...base.duration,
        label: t('home.duration'),
        options: [180, 240, 300].map((seconds) => ({ id: `duration-${seconds}`, label: `${seconds / 60}m` })),
        displayValue: `${(botRuntime?.durationSeconds ?? 300) / 60}m`,
        selectedId: `duration-${botRuntime?.durationSeconds ?? 300}`,
      };

      runtimeState.marketTypeId = 'binolla-market';
    } catch (error) {
      if (error instanceof ApiClientError) {
        base.disclaimer = error.message;
      }
      base.sheets.chart.candleData = [];
      base.sheets.tradingPair.options = [];
      base.sheets.strategy.options = [];
      base.botEngine.stats = [
        { id: 'pair', label: t('home.stat.pair'), value: '—' },
        { id: 'signal', label: t('home.stat.signal'), value: t('common.none') },
        { id: 'strength', label: t('common.liveRsi'), value: '—' },
        { id: 'backtest', label: t('home.stat.backtest'), value: '—' },
        { id: 'updated', label: t('home.stat.candle'), value: '—' },
      ];
      base.stats = base.stats.map((stat) => ({ ...stat, value: '—' }));
    }

    return {
      ...base,
      runtime: cloneRuntime(),
    };
  },

  async updateRuntime(partial: Partial<HomeRuntimeState>): Promise<HomeRuntimeState> {
    const amountId = partial.tradeAmountId ?? runtimeState.tradeAmountId;
    const durationId = partial.durationId ?? runtimeState.durationId;
    const amount = Number(amountId.replace('amount-', '')) || 25;
    const durationSeconds = Number(durationId.replace('duration-', '')) || 300;
    let pairIds = normalizePairIds(
      partial.tradingPairIds ??
        runtimeState.tradingPairIds ??
        (runtimeState.tradingPairId ? [runtimeState.tradingPairId] : []),
    );
    if (partial.tradingPairId && partial.tradingPairIds === undefined) {
      pairIds = normalizePairIds([partial.tradingPairId]);
    }
    const asset = pairIds[0] ?? '';

    const settings = partial.settings ?? runtimeState.settings;
    const dailyProfitTarget = Math.max(0, settings.dailyProfitTarget ?? 50);
    const dailyLossLimit = Math.max(0, settings.dailyLossLimit ?? 30);

    // Resolve the strategy BEFORE saving: the payload below must carry the newly
    // picked one, not the value still sitting in runtimeState. The server rejects
    // strategies that are not released, so verify here and fall back rather than
    // sending something that will 400.
    let strategyId = partial.strategyId ?? runtimeState.strategyId;
    if (partial.strategyId && partial.strategyId !== runtimeState.strategyId) {
      try {
        const strategies = await strategiesApi.list();
        if (!strategies.strategies.find((s) => s.id === partial.strategyId)?.enabled) {
          strategyId = runtimeState.strategyId;
        }
      } catch {
        strategyId = runtimeState.strategyId;
      }
      partial = { ...partial, strategyId };
    }

    let persistedBot: Awaited<ReturnType<typeof botApi.status>> | null = null;

    if (partial.botStatus === 'running') {
      persistedBot = await botApi.start(
        pairIds,
        amount,
        durationSeconds,
        dailyProfitTarget,
        dailyLossLimit,
        toBotPreferences(settings, strategyId),
      );
      writeDesiredRunning({
        assets: pairIds,
        amount,
        durationSeconds,
        dailyProfitTarget,
        dailyLossLimit,
      });
    } else if (partial.botStatus === 'paused') {
      persistedBot = await botApi.pause();
      // Keep desired so API restart can restore; pause is intentional but we still want auto-resume to Paused... skip
    } else if (partial.botStatus === 'stopped') {
      persistedBot = await botApi.stop();
      writeDesiredRunning(null);
    }
    if (
      partial.settings ||
      partial.tradeAmountId ||
      partial.durationId ||
      partial.tradingPairId ||
      partial.tradingPairIds ||
      partial.strategyId
    ) {
      persistedBot = await botApi.apply({
        asset,
        assets: pairIds,
        amount,
        durationSeconds,
        dailyProfitTarget,
        dailyLossLimit,
        ...toBotPreferences(settings, strategyId),
      });
    }

    if (persistedBot) {
      const persistedPairs = normalizePairIds(
        persistedBot.assets?.length
          ? persistedBot.assets
          : persistedBot.asset
            ? [persistedBot.asset]
            : pairIds,
      );
      partial = {
        ...partial,
        botStatus: persistedBot.state.toLowerCase() as HomeRuntimeState['botStatus'],
        stopReason: persistedBot.stopReason ?? null,
        tradingPairIds: persistedPairs,
        tradingPairId: persistedPairs[0] ?? persistedBot.asset ?? asset,
        tradeAmountId: `amount-${persistedBot.amount}`,
        durationId: `duration-${persistedBot.durationSeconds}`,
        settings: applyBotPreferences(partial.settings ?? runtimeState.settings, persistedBot),
      };
    }
    if (partial.technicalIndicatorId && partial.technicalIndicatorId !== 'rsi') {
      partial = { ...partial, technicalIndicatorId: 'rsi' };
    }

    if (partial.marketTypeId && partial.marketTypeId !== 'binolla-market') {
      partial = { ...partial, marketTypeId: 'binolla-market' };
    }

    runtimeState = {
      ...runtimeState,
      ...partial,
      settings: partial.settings
        ? {
            ...runtimeState.settings,
            ...partial.settings,
            toggles: partial.settings.toggles ?? runtimeState.settings.toggles,
            riskOptions: partial.settings.riskOptions ?? runtimeState.settings.riskOptions,
          }
        : runtimeState.settings,
    };

    return cloneRuntime();
  },

  resetRuntime(): void {
    runtimeState = seedRuntimeFromMock();
  },
};
