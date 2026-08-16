/** Typed backend DTOs — field names match ASP.NET camelCase JSON from API.md */

export type ApiErrorBody = {
  code: string;
  message: string;
};

export type AuthTelegramResponse = {
  accessToken: string;
  userId: string;
};

export type EmailAuthRequest = {
  email: string;
  password: string;
  fullName?: string;
  country?: string;
  username?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateProfileRequest = {
  fullName?: string;
  country?: string;
  username?: string;
};

export type MeBinollaStatus = {
  connected: boolean;
  accountType: string;
  status: string;
  lastConnectedAt: string | null;
  balance: number | null;
};

export type MeResponse = {
  userId: string;
  telegramUserId: number | null;
  email: string | null;
  hasPassword: boolean;
  username: string | null;
  fullName: string | null;
  country: string | null;
  role: string;
  isAdmin: boolean;
  binolla: MeBinollaStatus | null;
  isMarketingDemo?: boolean;
};

export type AccountStatusResponse = {
  binollaConnected: boolean;
  accountType: string;
  adminApproved: boolean;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected' | string;
  botAccess:
    | 'Allowed'
    | 'BinollaNotConnected'
    | 'AdminApprovalRequired'
    | 'NotEligible'
    | 'SessionExpired'
    | string;
};

export type BinollaConnectRequest = {
  ssid: string;
  accountType?: string;
};

export type BinollaCredentialRequest = {
  email: string;
  password: string;
  accountType?: string;
};

export type BinollaConnectResponse = {
  connected: boolean;
  accountType: string;
  access: string;
  adminApproved: boolean;
  approvalStatus: string;
  lastConnectedAt: string | null;
  balance: number | null;
};

export type BinollaStatusDto = {
  connected: boolean;
  accountType: string;
  status: string;
  lastConnectedAt: string | null;
  balance: number | null;
};

export type BinollaBalanceDto = {
  connected: boolean;
  accountType: string;
  demoBalance: number;
  realBalance: number;
  currentBalance: number;
};

export type StrategyDto = {
  id: string;
  name: string;
  status: string;
  enabled: boolean;
};

export type StrategiesResponse = {
  strategies: StrategyDto[];
};

export type BotRuntimeResponse = {
  state: 'Running' | 'Paused' | 'Stopped' | string;
  asset: string | null;
  amount: number;
  durationSeconds: number;
  dailyProfitTarget: number;
  dailyLossLimit: number;
  updatedAt: string;
};

export type StrategySignalResponse = {
  strategyId: string;
  asset: string;
  signal: 'Call' | 'Put' | 'None' | string;
  rsi: number;
  candleTime: string;
  timeframe: string;
  backtest?: {
    totalSignals: number;
    successfulSignals: number;
    failedSignals: number;
    successRate: number;
    lookbackCandles: number;
    expiryCandles: number;
    minimumSuccessRate: number;
    passed: boolean;
  } | null;
  automatedTradeId?: string | null;
  automationError?: string | null;
};

export type RsiSmartBacktestOptions = {
  rsiLength?: number;
  oversold?: number;
  overbought?: number;
  backtestCandles?: number;
  expiryCandles?: 3 | 4 | 5;
  minimumSuccessRate?: number;
  autoExecute?: boolean;
};

export type MarketAssetDto = {
  symbol: string;
  name: string;
  available: boolean;
  payout: number | null;
};

export type MarketAssetsResponse = {
  assets: MarketAssetDto[];
};

export type MarketPriceResponse = {
  asset: string;
  price: number | null;
  timestamp: string;
};

export type MarketCandleDto = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type MarketCandlesResponse = {
  asset: string;
  period: number;
  candles: MarketCandleDto[];
};

export type PlaceTradeRequest = {
  asset: string;
  direction: string;
  amount: number;
  durationSeconds: number;
  strategyId: string;
};

export type TradeDto = {
  id: string;
  binollaOrderId: string | null;
  asset: string;
  direction: string;
  amount: number;
  durationSeconds: number;
  status: string;
  pnl: number | null;
  errorCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TradeListResponse = {
  items: TradeDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminBinollaAccountDto = {
  id: string;
  userId: string;
  telegramUserId: number | null;
  email: string | null;
  username: string | null;
  fullName: string | null;
  binollaAccountIdentifier: string | null;
  connectionStatus: string;
  approvalStatus: string;
  adminApproved: boolean;
  lastConnectedAt: string | null;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
};

export type AdminBinollaAccountListResponse = {
  items: AdminBinollaAccountDto[];
  total: number;
  page?: number;
  pageSize?: number;
};

export type CreateMarketingDemoUserRequest = {
  email?: string;
  password?: string;
  fullName?: string;
  username?: string;
  telegramUserId?: number;
  config?: MarketingDemoConfigDto;
};

export type MarketingDemoConfigDto = {
  balance?: number;
  balanceWobble?: number;
  totalProfit?: number;
  totalLoss?: number;
  winRatePercent?: number;
  historyTradeCount?: number;
  defaultTradeAmount?: number;
  includeRunningTrade?: boolean;
  planName?: string | null;
  sampleTrades?: MarketingDemoTradeSeedDto[] | null;
};

export type MarketingDemoTradeSeedDto = {
  asset: string;
  direction: string;
  amount: number;
  status: string;
  pnl?: number | null;
  durationSeconds?: number;
  minutesAgo?: number;
};

export type MarketingDemoUserDto = {
  id: string;
  email: string | null;
  fullName: string | null;
  username: string | null;
  telegramUserId: number | null;
  isMarketingDemo: boolean;
  createdAt: string;
  config: MarketingDemoConfigDto;
};

export type MarketingDemoUserListResponse = {
  items: MarketingDemoUserDto[];
  total: number;
  page?: number;
  pageSize?: number;
};

export type AdminUserListItemDto = {
  id: string;
  email: string | null;
  fullName: string | null;
  username: string | null;
  telegramUserId: number | null;
  role: string;
  isMarketingDemo: boolean;
  binollaApprovalStatus: string | null;
  binollaConnected: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserListResponse = {
  items: AdminUserListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminUserDetailDto = {
  id: string;
  email: string | null;
  fullName: string | null;
  username: string | null;
  country: string | null;
  telegramUserId: number | null;
  role: string;
  isAdmin: boolean;
  isMarketingDemo: boolean;
  marketingConfig: MarketingDemoConfigDto | null;
  binollaAccount: AdminBinollaAccountDto | null;
  createdAt: string;
  updatedAt: string;
};

export type PatchAdminUserRequest = {
  isMarketingDemo?: boolean;
  telegramUserId?: number | null;
  clearTelegramUserId?: boolean;
  config?: MarketingDemoConfigDto;
};

export type AdminAuditEventDto = {
  id: string;
  action: string;
  actorUserId: string;
  targetUserId: string | null;
  targetBinollaLinkId: string | null;
  previousState: string | null;
  newState: string | null;
  detail: string | null;
  createdAt: string;
};

export type AdminAuditListResponse = {
  items: AdminAuditEventDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminSendNotificationRequest = {
  title: string;
  description: string;
  userIds?: string[];
  allApprovedUsers?: boolean;
  variant?: string;
  actionPath?: string;
};

export type AdminSendNotificationResponse = {
  sent: number;
  userIds: string[];
};

export type AdminNotificationDto = {
  id: string;
  userId: string;
  variant: string;
  title: string;
  description: string;
  read: boolean;
  actionPath: string | null;
  createdAt: string;
};

export type AdminNotificationListResponse = {
  items: AdminNotificationDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminBotRuntimeDto = {
  userId: string;
  email: string | null;
  fullName: string | null;
  telegramUserId: number | null;
  botAccess: string;
  state: string;
  asset: string | null;
  amount: number;
  durationSeconds: number;
  dailyProfitTarget: number;
  dailyLossLimit: number;
  updatedAt: string;
  isMarketingDemo: boolean;
};

export type AdminBotListResponse = {
  items: AdminBotRuntimeDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminBotControlRequest = {
  action: 'start' | 'pause' | 'stop' | 'apply' | string;
  asset?: string;
  amount?: number;
  durationSeconds?: number;
  dailyProfitTarget?: number;
  dailyLossLimit?: number;
};

export type AdminTradeDto = {
  id: string;
  userId: string;
  email: string | null;
  fullName: string | null;
  asset: string;
  direction: string;
  amount: number;
  status: string;
  pnl: number | null;
  createdAt: string;
  closedAt: string | null;
};

export type AdminTradeListResponse = {
  items: AdminTradeDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AccountSubscriptionResponse = {
  planName: string;
  status: string;
  statusLabel: string;
  approvalStatus: string;
  startedAt: string | null;
  approvedAt: string | null;
  keyUsedLabel: string;
};

export type ActivationHistoryItemDto = {
  id: string;
  keyLabel: string;
  status: string;
  statusLabel: string;
  previousState: string;
  newState: string;
  createdAt: string;
};

export type ActivationHistoryResponse = {
  items: ActivationHistoryItemDto[];
};

export type NotificationDto = {
  id: string;
  variant: string;
  title: string;
  description: string;
  read: boolean;
  tradeId: string | null;
  actionPath: string | null;
  createdAt: string;
};

export type NotificationListResponse = {
  items: NotificationDto[];
  unreadCount: number;
};
