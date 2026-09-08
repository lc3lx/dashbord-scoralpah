import type { ChipTone } from '@components/types';
import type { TradeRecord } from '@services/trades';
import { tradeService } from '@services/trades';
import type { TradeCardProps } from '@components/molecules/TradeCard';
import { t } from '@shared/i18n';

function resolvePlatform(trade: TradeRecord): { label: string; tone: ChipTone } {
  if (trade.platform === 'binolla') {
    return { label: t('history.platform.binolla'), tone: 'warning' };
  }

  return { label: t('history.platform.global'), tone: 'info' };
}

function resolveStatus(trade: TradeRecord): { label: string; tone: ChipTone } {
  if (trade.status === 'running') return { label: t('history.status.running'), tone: 'warning' };
  if (trade.status === 'profit') return { label: t('history.status.profit'), tone: 'success' };
  if (trade.status === 'unknown') return { label: t('history.status.unknown'), tone: 'neutral' };
  return { label: t('history.status.loss'), tone: 'danger' };
}

function resolveSourceLabel(trade: TradeRecord): string {
  return trade.source === 'bot' ? t('history.source.bot') : t('history.source.user');
}

function resolveActionLabel(trade: TradeRecord): string {
  const content = tradeService.getHistoryPageContent();
  return trade.status === 'running' ? content.viewChartLabel : content.detailsLabel;
}

export function mapTradeRecordToCardProps(trade: TradeRecord): TradeCardProps {
  const platform = resolvePlatform(trade);
  const status = resolveStatus(trade);

  return {
    pair: trade.pair,
    platform: platform.label,
    platformTone: platform.tone,
    strategy: `${trade.strategy} · ${trade.indicator} · ${trade.duration}`,
    amount: trade.stakeLabel,
    result: trade.result,
    resultTone: trade.resultTone,
    liveTimer: trade.status === 'running' ? formatLiveTimer(trade.liveTimerSeconds ?? 0) : undefined,
    timestamp: trade.timeLabel,
    stake: trade.stakeLabel,
    statusLabel: status.label,
    statusTone: status.tone,
    sourceLabel: resolveSourceLabel(trade),
    direction: trade.direction,
    actionLabel: resolveActionLabel(trade),
  };
}

function formatLiveTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
