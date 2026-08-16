import type { CandlestickPoint } from '@components/organisms/CandlestickChart';
import type { ChipTone, TradeDirection } from '@components/types';

export type TradeStatus = 'running' | 'profit' | 'loss';
export type TradeSource = 'bot' | 'user';
export type TradePlatform = 'global' | 'binolla';
export type TradeListFilter = 'all' | 'live' | 'profit' | 'loss' | 'today';

export type TradeRecord = {
  id: string;
  pair: string;
  platform: TradePlatform;
  strategy: string;
  indicator: string;
  duration: string;
  direction: TradeDirection;
  amount: number;
  stakeLabel: string;
  result?: string;
  resultTone?: 'success' | 'danger' | 'warning';
  status: TradeStatus;
  source: TradeSource;
  timeLabel: string;
  isToday: boolean;
  liveTimerSeconds?: number;
  entryTime?: string;
  exitTime?: string;
  signalStrength: string;
  candleData: CandlestickPoint[];
  openedAt: number;
};

export type TradeDetailRow = {
  id: string;
  label: string;
  value: string;
  valueTone?: 'success' | 'primary';
};

export type TradeTimelineEntry = {
  id: string;
  title: string;
  timestamp: string;
  status: 'completed' | 'pending';
  showCheck?: boolean;
};

export type TradeDetailContent = {
  id: string;
  pageTitle: string;
  statusLabel: string;
  statusTone: ChipTone;
  hero: {
    direction: TradeDirection;
    pair: string;
    tradeRef: string;
    amountLabel: string;
  };
  candleData: CandlestickPoint[];
  detailRows: TradeDetailRow[];
  timelineTitle: string;
  timeline: TradeTimelineEntry[];
  timelineCheckIconSrc: string;
};

export type PlaceTradeInput = {
  direction: TradeDirection;
  pair: string;
  platform: TradePlatform;
  amount: number;
  durationLabel: string;
  strategy: string;
  indicator: string;
  source?: TradeSource;
};

export type ListTradesParams = {
  filter?: TradeListFilter;
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
