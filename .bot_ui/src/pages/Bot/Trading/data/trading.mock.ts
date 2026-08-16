import { tradingAssets } from '@assets/index';
import { t } from '@shared/i18n';
import type { TradingPageContent, TradingRuntimeState } from '../types';

export function getTradingMockContent(): TradingPageContent {
  return {
    topBar: {
      connectionLabel: t('trading.connected'),
      connectionTone: 'success',
      refreshAriaLabel: t('trading.refreshAria'),
      exportAriaLabel: t('trading.exportAria'),
      refreshIconSrc: tradingAssets.refresh,
      exportIconSrc: tradingAssets.externalLink,
    },
    binollaCard: {
      platformLabel: t('trading.platformLive'),
      platformIconSrc: tradingAssets.binollaIcon,
      balancePrefix: t('trading.balancePrefix'),
      balanceValue: '—',
      pairName: 'EUR/USD',
      pairSuffix: 'OTC',
      priceDisplay: '—',
      expiryLabel: t('trading.expiry'),
      candleData: [],
      chartStatusLabel: t('trading.waitingCandles'),
      amountLabel: t('trading.amount'),
      amountPrefix: '$',
      durationLabel: t('trading.tradeTime'),
      durationChevronSrc: tradingAssets.durationChevron,
      upLabel: t('common.up'),
      downLabel: t('common.down'),
      upIconSrc: tradingAssets.tradeUp,
      downIconSrc: tradingAssets.tradeDown,
    },
    signalCard: {
      freshLabel: t('trading.awaitingAccess'),
      freshTone: 'neutral',
      stats: [
        { id: 'signal', label: t('trading.lastSignal'), value: t('common.none') },
        { id: 'strength', label: t('common.rsi'), value: '—' },
        { id: 'indicator', label: t('trading.indicator'), value: t('common.rsi') },
        { id: 'strategy', label: t('trading.strategy'), value: t('common.rsi') },
        { id: 'market', label: t('trading.market'), value: '—' },
      ],
      ctaLabel: t('trading.openAiBot'),
    },
    durationOptions: [
      { id: 'duration-1m', label: t('trading.duration.1m'), seconds: 60 },
      { id: 'duration-5m', label: t('trading.duration.5m'), seconds: 300 },
      { id: 'duration-15m', label: t('trading.duration.15m'), seconds: 900 },
      { id: 'duration-1h', label: t('trading.duration.1h'), seconds: 3600 },
    ],
    timeframeOptions: [
      { id: 'tf-1m', label: '1m', periodSeconds: 60 },
      { id: 'tf-5m', label: '5m', periodSeconds: 300 },
      { id: 'tf-15m', label: '15m', periodSeconds: 900 },
      { id: 'tf-1h', label: '1h', periodSeconds: 3600 },
    ],
  };
}

export const TRADING_INITIAL_RUNTIME: TradingRuntimeState = {
  amount: '25',
  durationId: 'duration-1m',
  candlePeriodId: 'tf-1m',
  // Matches selected duration (1 min). Never use a fake countdown seed.
  expirySeconds: 60,
};
