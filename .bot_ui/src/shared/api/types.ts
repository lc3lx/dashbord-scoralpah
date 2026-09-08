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
  assets?: string[];
  amount: number;
  durationSeconds: number;
  dailyProfitTarget: number;
  dailyLossLimit: number;
  updatedAt: string;
  autoStopAtProfit: boolean;
  autoStopAtLoss: boolean;
  signalConfirmationEnabled: boolean;
  riskLevel: 'risk-low' | 'risk-medium' | 'risk-high' | string;
  notificationsEnabled: boolean;
  pnlSessionStartedAt?: string | null;
  stopReason?: string | null;
  /** Which strategy the bot runs: 'rsi' or 'ema'. */
  strategyId?: string | null;
};

export type StrategySignalResponse = {
  strategyId: string;
  asset: string;
  signal: 'Call' | 'Put' | 'None' | string;
  rsi: number;
  liveRsi?: number | null;
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
  strategyId?: string | null;
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
  loginEmail?: string | null;
  loginPassword?: string | null;
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
  /** Admin has unlocked the Binolla demo balance for this user. */
  demoAllowed: boolean;
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
  /** Admin has unlocked the Binolla demo balance for this user. */
  demoAllowed: boolean;
  marketingConfig: MarketingDemoConfigDto | null;
  binollaAccount: AdminBinollaAccountDto | null;
  createdAt: string;
  updatedAt: string;
};

export type PatchAdminUserRequest = {
  isMarketingDemo?: boolean;
  /** Unlock/lock the Binolla demo balance. Omit to leave unchanged. */
  demoAllowed?: boolean;
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
  assets?: string[];
  amount: number;
  durationSeconds: number;
  dailyProfitTarget: number;
  dailyLossLimit: number;
  updatedAt: string;
  isMarketingDemo: boolean;
  /** Pairs the bot watches. */
  assets?: string[];
  /** Strategy the bot runs (rsi, ema, alt5, smart…). */
  strategyId?: string | null;
};

export type AdminBotListResponse = {
  items: AdminBotRuntimeDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminBotControlRequest = {
  /** Strategy to run (rsi, ema, alt5, smart…). Omit to keep the current one. */
  strategyId?: string;
  /** Pairs to trade. Required by `start`. */
  assets?: string[];
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

/** Global bot stop, as the admin panel sees it. */
export type AdminFleetActionResponse = {
  maintenanceActive: boolean;
  message: string | null;
  since: string | null;
  /** Bots stopped/started by the action, or currently running for a plain read. */
  botsAffected: number;
};

export type AdminMaintenanceRequest = {
  active: boolean;
  message?: string | null;
};

// ---- Referral program ----

export type ReferralTierDto = {
  level: number;
  minReferrals: number;
  ratePercent: number;
  giftUsd: number;
  reached: boolean;
  isCurrent: boolean;
};

export type ReferralSummaryResponse = {
  referralCode: string;
  referralLink: string;
  telegramShareLink: string;
  qualifiedReferrals: number;
  totalReferrals: number;
  pendingReferrals: number;
  currentTier: number;
  currentRatePercent: number;
  nextTier: ReferralTierDto | null;
  referralsToNextTier: number;
  totalCommissionEarned: number;
  totalRewardsEarned: number;
  totalPaidOut: number;
  availableBalance: number;
  minPayoutUsd: number;
  iPhoneQualifiedReferrals: number;
  iPhoneTarget: number;
  iPhoneEligible: boolean;
  tiers: ReferralTierDto[];
};

export type ReferralMemberDto = {
  userId: string;
  displayName: string | null;
  referredAt: string;
  depositMet: boolean;
  activeDaysCount: number;
  requiredActiveDays: number;
  qualificationDays: number;
  windowEndsAt: string;
  qualified: boolean;
  qualifiedAt: string | null;
};

export type ReferralMembersResponse = {
  items: ReferralMemberDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type ReferralCommissionDto = {
  id: string;
  referredUserId: string;
  referredDisplayName: string | null;
  tradeAmount: number;
  ratePercent: number;
  tier: number;
  amount: number;
  createdAt: string;
};

export type ReferralCommissionsResponse = {
  items: ReferralCommissionDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type ReferralRewardDto = {
  id: string;
  kind: 'TierGift' | 'IPhone' | string;
  tier: number | null;
  amount: number;
  status: 'Granted' | 'Paid' | 'Cancelled' | string;
  grantedAt: string;
  paidAt: string | null;
  note: string | null;
};

export type ReferralRewardsResponse = {
  items: ReferralRewardDto[];
};

export type ReferralPayoutRequest = {
  amount: number;
  method: string;
  destination: string;
};

export type ReferralPayoutDto = {
  id: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid' | string;
  method: string | null;
  destination: string | null;
  requestedAt: string;
  decidedAt: string | null;
  adminNote: string | null;
};

export type ReferralPayoutsResponse = {
  items: ReferralPayoutDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminReferralOverviewDto = {
  referrerUserId: string;
  displayName: string | null;
  email: string | null;
  qualifiedReferrals: number;
  totalReferrals: number;
  currentTier: number;
  totalCommissionEarned: number;
  totalRewardsEarned: number;
  availableBalance: number;
};

export type AdminReferralOverviewListResponse = {
  items: AdminReferralOverviewDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminReferralDetailResponse = {
  referrer: AdminReferralOverviewDto;
  members: ReferralMemberDto[];
  recentCommissions: ReferralCommissionDto[];
  rewards: ReferralRewardDto[];
};

export type AdminDepositOverrideRequest = {
  met: boolean | null;
  note?: string | null;
};

export type AdminPayoutDecisionRequest = {
  decision: 'approve' | 'reject' | 'paid';
  note?: string | null;
};

export type AdminRewardPaidRequest = {
  note?: string | null;
};

export type AdminReferralPayoutDto = {
  id: string;
  userId: string;
  userDisplayName: string | null;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid' | string;
  method: string | null;
  destination: string | null;
  requestedAt: string;
  decidedAt: string | null;
  adminNote: string | null;
};

export type AdminReferralPayoutsResponse = {
  items: AdminReferralPayoutDto[];
  total: number;
  page: number;
  pageSize: number;
};
