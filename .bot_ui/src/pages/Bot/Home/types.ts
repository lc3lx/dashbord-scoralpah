import type { BotControlAction, ChipTone, TextTone } from '@components/types';
import type { CandlestickPoint } from '@components/organisms/CandlestickChart';

/** Figma 222:2106 — Home / AI Bot main screen */
export type HomeSheetId =
  | 'chart'
  | 'settings'
  | 'marketType'
  | 'tradingPair'
  | 'technicalIndicator'
  | 'strategy';

export type BotRunStatus = 'running' | 'paused' | 'stopped';

/** Figma 207:724 — page header container */
export type HomeHeaderNotificationAction = {
  /** Figma 222:2263 — notification bell icon */
  iconSrc: string;
  ariaLabel: string;
};

export type HomeHeaderContent = {
  /** Figma 207:727 */
  title: string;
  /** Figma 207:729 */
  subtitle: string;
  /** Figma 222:2234 variant only — omitted on base 222:2106 */
  notificationAction?: HomeHeaderNotificationAction;
};

export type BotEngineStat = {
  id: string;
  label: string;
  value: string;
  valueTone?: TextTone;
};

/** Figma 207:737 — Bot engine hero card */
export type BotEngineContent = {
  name: string;
  iconSrc: string;
  statusLabel: string;
  statusTone: ChipTone;
  stats: BotEngineStat[];
};

/** Figma 207:774 — 2x3 stat card grid */
export type HomeStatItem = {
  id: string;
  label: string;
  value: string;
  valueTone?: TextTone;
};

/** Figma 207:845–207:903 — home SettingRow list */
export type HomeConfigRow = {
  id: string;
  iconSrc: string;
  label: string;
  value: string;
  sheetTarget?: Extract<
    HomeSheetId,
    'marketType' | 'tradingPair' | 'technicalIndicator' | 'strategy'
  >;
};

export type ComplexityLevel = 'low' | 'medium';

export type IndicatorOptionItem = {
  id: string;
  title: string;
  description: string;
  bestFor: string;
  complexity: ComplexityLevel;
  previewSrc: string;
  enabled?: boolean;
};

export type StrategyStatItem = {
  label: string;
  value: string;
};

export type StrategyOptionItem = {
  id: string;
  title: string;
  stats: StrategyStatItem[];
  successRate: string;
  previewSrc: string;
  enabled?: boolean;
};

export type OptionChipItem = {
  id: string;
  label: string;
};

/** Figma 207:906 / 207:922 — OptionChip groups */
export type ChipGroupContent = {
  label: string;
  selectedId: string;
  displayValue: string;
  options: OptionChipItem[];
};

/** Figma 207:941 / 207:952 — risk limit cards */
export type LimitCardItem = {
  id: string;
  iconSrc: string;
  label: string;
  value: string;
  hint: string;
  valueTone: 'profit' | 'loss';
};

/** Figma 207:963 — ghost action buttons */
export type HomeActionItem = {
  id: string;
  label: string;
  sheetTarget: Extract<HomeSheetId, 'chart' | 'settings'>;
};

export type BotSettingsToggleItem = {
  id: string;
  label: string;
  enabled: boolean;
};

export type SelectionListItem = {
  id: string;
  title: string;
  description?: string;
};

/** Figma 207:1786 — chart sheet stat boxes */
export type ChartStatBox = {
  id: string;
  label: string;
  value: string;
  valueTone?: TextTone;
};

/** Figma 222:2537 — chart bottom sheet */
export type ChartSheetContent = {
  titleTemplate: string;
  candleData: CandlestickPoint[];
  stats: ChartStatBox[];
};

/** Figma 222:2234 — bot settings bottom sheet */
export type BotSettingsSheetContent = {
  title: string;
  toggles: BotSettingsToggleItem[];
  riskLabel: string;
  riskOptions: OptionChipItem[];
  selectedRiskId: string;
  saveLabel: string;
};

export type MarketTypeSheetContent = {
  title: string;
  options: SelectionListItem[];
  selectedId: string;
};

export type TradingPairSheetContent = {
  title: string;
  searchPlaceholder: string;
  emptySearchMessage: string;
  options: SelectionListItem[];
  selectedId: string;
};

/** Figma 282:2750 — technical indicator selection sheet */
export type TechnicalIndicatorSheetContent = {
  title: string;
  options: IndicatorOptionItem[];
  selectedId: string;
};

/** Figma 282:3050 — strategy selection sheet */
export type StrategySheetContent = {
  title: string;
  options: StrategyOptionItem[];
  selectedId: string;
};

export type HomeSheetsContent = {
  chart: ChartSheetContent;
  settings: BotSettingsSheetContent;
  marketType: MarketTypeSheetContent;
  tradingPair: TradingPairSheetContent;
  technicalIndicator: TechnicalIndicatorSheetContent;
  strategy: StrategySheetContent;
};

export type HomePageContent = {
  header: HomeHeaderContent;
  botEngine: BotEngineContent;
  stats: HomeStatItem[];
  controls: BotControlAction[];
  configRows: HomeConfigRow[];
  tradeAmount: ChipGroupContent;
  duration: ChipGroupContent;
  riskLimits: LimitCardItem[];
  actions: HomeActionItem[];
  disclaimer: string;
  sheets: HomeSheetsContent;
};

export type HomeRuntimeState = {
  botStatus: BotRunStatus;
  marketTypeId: string;
  tradingPairId: string;
  technicalIndicatorId: string;
  strategyId: string;
  tradeAmountId: string;
  durationId: string;
  settings: BotSettingsSheetContent;
};

export type HomeData = HomePageContent & {
  runtime: HomeRuntimeState;
};

export type HomeSheetTitles = Record<HomeSheetId, string>;
