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
import type { TradeDto } from '@shared/api';
import { canBrowseMarket } from '@shared/access/botAccess';
import { MARKET_FETCH_MS, timedSignal } from '@shared/api/timedSignal';
import { getAccountStatusCached } from '@shared/api/botSessionCache';
import {
  isPreferredMarketSymbol,
  pickPreferredMarketAsset,
} from '@shared/market/preferAsset';
import {
  formatMoneyPlain,
  formatSignedMoney,
  formatWinRate,
  weekAndMonthSummaries,
} from '@shared/trades/tradeAggregates';
import { t } from '@shared/i18n';

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

function formatSignal(signal: string): string {
  const s = signal.toLowerCase();
  if (s === 'call') return t('common.callUp');
  if (s === 'put') return t('common.putDown');
  return t('common.none');
}

function refreshSettingsLabels(): void {
  const fresh = getHomeMockContent().sheets.settings;
  const prevById = new Map(runtimeState.settings.toggles.map((toggle) => [toggle.id, toggle]));
  runtimeState.settings = {
    ...fresh,
    selectedRiskId: runtimeState.settings.selectedRiskId,
    toggles: fresh.toggles.map((toggle) => ({
      ...toggle,
      enabled: prevById.get(toggle.id)?.enabled ?? toggle.enabled,
    })),
    riskOptions: [...fresh.riskOptions],
  };
}

function strategyPreview(id: string): string {
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
    if (stat.id === 'today-loss') {
      return {
        ...stat,
        value:
          buckets.today.lossAbs > 0 ? formatSignedMoney(-buckets.today.lossAbs) : '$0.00',
        valueTone: 'danger',
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
}

export const homeService = {
  async fetchHomeData(): Promise<HomeData> {
    refreshSettingsLabels();
    const base = structuredClone(getHomeMockContent());
    let asset = runtimeState.tradingPairId || '';

    try {
      const [status, balance, strategies, tradeBundle, botRuntime] = await Promise.all([
        getAccountStatusCached().catch(() => null),
        binollaApi.balance(timedSignal(MARKET_FETCH_MS)).catch(() => null),
        strategiesApi.list().catch(() => null),
        fetchTradesForHomeStats(),
        botApi.status().catch(() => null),
      ]);

      if (botRuntime) {
        runtimeState.botStatus = botRuntime.state.toLowerCase() as HomeRuntimeState['botStatus'];
        if (botRuntime.asset) runtimeState.tradingPairId = botRuntime.asset;
        runtimeState.tradeAmountId = `amount-${botRuntime.amount}`;
        runtimeState.durationId = `duration-${botRuntime.durationSeconds}`;
      }

      const assets =
        canBrowseMarket(status?.botAccess)
          ? await marketApi.assets(timedSignal(MARKET_FETCH_MS)).catch(() => null)
          : null;

      if (assets?.assets?.length) {
        const options = assets.assets.map((a) => ({
          id: a.symbol,
          title: a.name || a.symbol,
          description: a.available ? t('common.available') : t('home.asset.unavailable'),
        }));
        base.sheets.tradingPair.options = options;
        const preferred = pickPreferredMarketAsset(
          assets.assets.map((a) => ({ symbol: a.symbol, available: a.available })),
        );
        const kept = options.find((o) => o.id === runtimeState.tradingPairId)?.id;
        asset =
          (kept && isPreferredMarketSymbol(kept) ? kept : undefined) ??
          preferred?.symbol ??
          kept ??
          options[0]?.id ??
          '';
        runtimeState.tradingPairId = asset;
        base.sheets.tradingPair.selectedId = asset;
        // #region agent log
        fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
          body: JSON.stringify({
            sessionId: '660ec2',
            runId: 'pairs-debug',
            hypothesisId: 'H3',
            location: 'homeService.ts:fetchHomeData',
            message: 'home_pair_options',
            data: {
              optionCount: options.length,
              selected: asset,
              preferred: preferred?.symbol ?? null,
              kept,
              sample: options.slice(0, 12).map((o) => o.id),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      } else {
        base.sheets.tradingPair.options = [];
        base.sheets.tradingPair.selectedId = '';
        if (!assets) {
          // Keep prior pair id only if we already had a real symbol selected.
          asset = runtimeState.tradingPairId;
        } else {
          runtimeState.tradingPairId = '';
          asset = '';
        }
      }

      if (strategies?.strategies?.length) {
        const strategyOptions: StrategyOptionItem[] = strategies.strategies
          .filter((s) => s.id === 'rsi')
          .map((s) => ({
            id: s.id,
            title: s.name,
            stats: [
              {
                label: t('home.strategy.stat.indicators'),
                value: t('home.strategy.rsi.indicator'),
              },
              {
                label: t('home.strategy.stat.duration'),
                value: t('home.strategy.rsi.expiry'),
              },
              { label: t('home.strategy.rsi.filter'), value: t('home.strategy.rsi.filterValue') },
              { label: t('home.strategy.stat.markets'), value: t('home.market.binolla') },
            ],
            successRate: t('home.strategy.rsi.success'),
            previewSrc: strategyPreview(s.id),
            enabled: s.enabled,
          }));

        base.sheets.strategy.options = strategyOptions;
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

      const signal =
        asset && canBrowseMarket(status?.botAccess)
          ? await strategiesApi
              .rsiSignal(asset, 60, timedSignal(MARKET_FETCH_MS), {
                autoExecute: runtimeState.botStatus === 'running',
              })
              .catch(() => null)
          : null;
      if (signal) {
        base.botEngine.stats = [
          {
            id: 'signal',
            label: t('home.stat.signal'),
            value: formatSignal(signal.signal),
            valueTone: signal.signal.toLowerCase() === 'call' ? 'success' : 'primary',
          },
          { id: 'strength', label: t('common.rsi'), value: signal.rsi.toFixed(2) },
          {
            id: 'updated',
            label: t('home.stat.candle'),
            value: new Date(signal.candleTime).toLocaleTimeString('en-GB', { hour12: false }),
          },
        ];
      } else {
        base.botEngine.stats = [
          { id: 'signal', label: t('home.stat.signal'), value: t('common.none') },
          { id: 'strength', label: t('common.rsi'), value: '—' },
          { id: 'updated', label: t('home.stat.candle'), value: '—' },
        ];
      }

      try {
        const candles =
          asset && canBrowseMarket(status?.botAccess)
            ? await marketApi.candles(asset, 60, timedSignal(MARKET_FETCH_MS)).catch(() => null)
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
      const pairName =
        base.sheets.tradingPair.options.find((o) => o.id === runtimeState.tradingPairId)?.title ??
        (asset || '—');

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
      } else {
        base.disclaimer = t('home.disclaimer.ok');
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
      const statusDisplay = getBotStatusDisplay()[runtimeState.botStatus];
      base.botEngine.statusLabel = statusDisplay.label;
      base.botEngine.statusTone = statusDisplay.tone;
      if (runtimeState.settings) {
        runtimeState.settings = {
          ...runtimeState.settings,
          toggles: runtimeState.settings.toggles.map((toggle) =>
            toggle.id === 'notifications' ? toggle : { ...toggle, enabled: false },
          ),
        };
      }
    } catch (error) {
      if (error instanceof ApiClientError) {
        base.disclaimer = error.message;
      }
      base.sheets.chart.candleData = [];
      base.sheets.tradingPair.options = [];
      base.sheets.strategy.options = [];
      base.botEngine.stats = [
        { id: 'signal', label: t('home.stat.signal'), value: t('common.none') },
        { id: 'strength', label: t('common.rsi'), value: '—' },
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
    const asset = partial.tradingPairId ?? runtimeState.tradingPairId;

    if (partial.botStatus === 'running') {
      await botApi.start(asset, amount, durationSeconds, 50, 30);
    } else if (partial.botStatus === 'paused') {
      await botApi.pause();
    } else if (partial.botStatus === 'stopped') {
      await botApi.stop();
    }
    if (
      partial.settings ||
      partial.tradeAmountId ||
      partial.durationId ||
      partial.tradingPairId
    ) {
      await botApi.apply({
        asset,
        amount,
        durationSeconds,
        dailyProfitTarget: 50,
        dailyLossLimit: 30,
      });
    }
    if (partial.strategyId) {
      try {
        const strategies = await strategiesApi.list();
        const selected = strategies.strategies.find((s) => s.id === partial.strategyId);
        if (!selected?.enabled) {
          partial = { ...partial, strategyId: runtimeState.strategyId };
        }
      } catch {
        partial = { ...partial, strategyId: runtimeState.strategyId };
      }
    }

    if (partial.technicalIndicatorId && partial.technicalIndicatorId !== 'rsi') {
      partial = { ...partial, technicalIndicatorId: 'rsi' };
    }

    if (partial.marketTypeId && partial.marketTypeId !== 'binolla-market') {
      partial = { ...partial, marketTypeId: 'binolla-market' };
    }

    if (partial.settings?.toggles) {
      partial = {
        ...partial,
        settings: {
          ...partial.settings,
          toggles: partial.settings.toggles.map((toggle) =>
            toggle.id.startsWith('auto-') || toggle.id === 'signal-confirm'
              ? { ...toggle, enabled: false }
              : toggle,
          ),
        },
      };
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
