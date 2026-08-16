import { apiRequest } from './apiClient';
import { BINOLLA_LOGIN_MS, timedSignal } from './timedSignal';
import type {
  AccountStatusResponse,
  AccountSubscriptionResponse,
  ActivationHistoryResponse,
  AuthTelegramResponse,
  BinollaBalanceDto,
  BinollaConnectRequest,
  BinollaConnectResponse,
  BinollaCredentialRequest,
  BinollaStatusDto,
  BotRuntimeResponse,
  ChangePasswordRequest,
  EmailAuthRequest,
  MarketAssetsResponse,
  MarketCandlesResponse,
  MarketPriceResponse,
  MeResponse,
  NotificationDto,
  NotificationListResponse,
  PlaceTradeRequest,
  RsiSmartBacktestOptions,
  StrategiesResponse,
  StrategySignalResponse,
  TradeDto,
  TradeListResponse,
  AdminAuditListResponse,
  AdminBinollaAccountDto,
  AdminBinollaAccountListResponse,
  AdminBotControlRequest,
  AdminBotListResponse,
  AdminBotRuntimeDto,
  AdminNotificationListResponse,
  AdminSendNotificationRequest,
  AdminSendNotificationResponse,
  AdminTradeListResponse,
  AdminUserDetailDto,
  AdminUserListResponse,
  CreateMarketingDemoUserRequest,
  MarketingDemoConfigDto,
  MarketingDemoUserDto,
  MarketingDemoUserListResponse,
  PatchAdminUserRequest,
  UpdateProfileRequest,
} from './types';

export const authApi = {
  telegram(initData: string): Promise<AuthTelegramResponse> {
    return apiRequest<AuthTelegramResponse>('/api/auth/telegram', {
      method: 'POST',
      body: { initData },
      auth: false,
    });
  },
  login(body: Pick<EmailAuthRequest, 'email' | 'password'>): Promise<AuthTelegramResponse> {
    return apiRequest<AuthTelegramResponse>('/api/auth/login', {
      method: 'POST',
      body: { email: body.email, password: body.password },
      auth: false,
    });
  },
  register(body: EmailAuthRequest): Promise<AuthTelegramResponse> {
    return apiRequest<AuthTelegramResponse>('/api/auth/register', {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
        fullName: body.fullName,
        country: body.country,
        username: body.username,
      },
      auth: false,
    });
  },
  changePassword(body: ChangePasswordRequest): Promise<{ changed: boolean }> {
    return apiRequest<{ changed: boolean }>('/api/auth/change-password', {
      method: 'POST',
      body,
    });
  },
  linkTelegram(initData: string): Promise<AuthTelegramResponse> {
    return apiRequest<AuthTelegramResponse>('/api/auth/link-telegram', {
      method: 'POST',
      body: { initData },
    });
  },
};

export const meApi = {
  get(): Promise<MeResponse> {
    return apiRequest<MeResponse>('/api/me');
  },
  update(body: UpdateProfileRequest): Promise<MeResponse> {
    return apiRequest<MeResponse>('/api/me', {
      method: 'PUT',
      body,
    });
  },
};

export const accountApi = {
  status(): Promise<AccountStatusResponse> {
    return apiRequest<AccountStatusResponse>('/api/account/status');
  },
  subscription(): Promise<AccountSubscriptionResponse> {
    return apiRequest<AccountSubscriptionResponse>('/api/account/subscription');
  },
  activationHistory(): Promise<ActivationHistoryResponse> {
    return apiRequest<ActivationHistoryResponse>('/api/account/activation-history');
  },
};

export const notificationsApi = {
  list(): Promise<NotificationListResponse> {
    return apiRequest<NotificationListResponse>('/api/notifications');
  },
  get(id: string): Promise<NotificationDto> {
    return apiRequest<NotificationDto>(`/api/notifications/${encodeURIComponent(id)}`);
  },
  markRead(id: string): Promise<NotificationDto> {
    return apiRequest<NotificationDto>(`/api/notifications/${encodeURIComponent(id)}/read`, {
      method: 'POST',
    });
  },
  markAllRead(): Promise<NotificationListResponse> {
    return apiRequest<NotificationListResponse>('/api/notifications/read-all', {
      method: 'POST',
    });
  },
};

export const binollaApi = {
  connect(body: BinollaConnectRequest): Promise<BinollaConnectResponse> {
    return apiRequest<BinollaConnectResponse>('/api/binolla/connect', {
      method: 'POST',
      body: { ssid: body.ssid, accountType: body.accountType ?? 'Demo' },
    });
  },
  login(body: BinollaCredentialRequest): Promise<BinollaConnectResponse> {
    return apiRequest<BinollaConnectResponse>('/api/binolla/login', {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
        accountType: body.accountType ?? 'Demo',
      },
      signal: timedSignal(BINOLLA_LOGIN_MS),
    });
  },
  signup(body: BinollaCredentialRequest): Promise<BinollaConnectResponse> {
    return apiRequest<BinollaConnectResponse>('/api/binolla/signup', {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
        accountType: body.accountType ?? 'Demo',
      },
      signal: timedSignal(BINOLLA_LOGIN_MS),
    });
  },
  status(): Promise<BinollaStatusDto> {
    return apiRequest<BinollaStatusDto>('/api/binolla/status');
  },
  balance(signal?: AbortSignal): Promise<BinollaBalanceDto> {
    return apiRequest<BinollaBalanceDto>('/api/binolla/balance', { signal });
  },
  disconnect(): Promise<{ disconnected: boolean }> {
    return apiRequest<{ disconnected: boolean }>('/api/binolla/disconnect', { method: 'POST' });
  },
};

export const strategiesApi = {
  list(): Promise<StrategiesResponse> {
    return apiRequest<StrategiesResponse>('/api/strategies');
  },
  rsiSignal(
    asset: string,
    period = 60,
    signal?: AbortSignal,
    options: RsiSmartBacktestOptions = {},
  ): Promise<StrategySignalResponse> {
    const encoded = encodeURIComponent(asset);
    const query = new URLSearchParams({ period: String(period) });
    if (options.rsiLength != null) query.set('rsiLength', String(options.rsiLength));
    if (options.oversold != null) query.set('oversold', String(options.oversold));
    if (options.overbought != null) query.set('overbought', String(options.overbought));
    if (options.backtestCandles != null) query.set('backtestCandles', String(options.backtestCandles));
    if (options.expiryCandles != null) query.set('expiryCandles', String(options.expiryCandles));
    if (options.minimumSuccessRate != null) query.set('minimumSuccessRate', String(options.minimumSuccessRate));
    if (options.autoExecute) query.set('autoExecute', 'true');
    return apiRequest<StrategySignalResponse>(
      `/api/strategies/rsi/signal/${encoded}?${query}`,
      { signal },
    );
  },
};

export const botApi = {
  status(): Promise<BotRuntimeResponse> {
    return apiRequest<BotRuntimeResponse>('/api/bot/status');
  },
  start(asset: string, amount = 25, durationSeconds = 300, dailyProfitTarget = 50, dailyLossLimit = 30): Promise<BotRuntimeResponse> {
    return apiRequest<BotRuntimeResponse>('/api/bot/start', {
      method: 'POST',
      body: { asset, amount, durationSeconds, dailyProfitTarget, dailyLossLimit },
    });
  },
  pause(): Promise<BotRuntimeResponse> {
    return apiRequest<BotRuntimeResponse>('/api/bot/pause', { method: 'POST' });
  },
  stop(): Promise<BotRuntimeResponse> {
    return apiRequest<BotRuntimeResponse>('/api/bot/stop', { method: 'POST' });
  },
  apply(body: { asset?: string; amount?: number; durationSeconds?: number; dailyProfitTarget?: number; dailyLossLimit?: number }): Promise<BotRuntimeResponse> {
    return apiRequest<BotRuntimeResponse>('/api/bot/apply', { method: 'POST', body });
  },
};

export const marketApi = {
  assets(signal?: AbortSignal): Promise<MarketAssetsResponse> {
    return apiRequest<MarketAssetsResponse>('/api/market/assets', { signal });
  },
  price(asset: string, signal?: AbortSignal): Promise<MarketPriceResponse> {
    return apiRequest<MarketPriceResponse>(`/api/market/price/${encodeURIComponent(asset)}`, {
      signal,
    });
  },
  candles(asset: string, period = 60, signal?: AbortSignal): Promise<MarketCandlesResponse> {
    return apiRequest<MarketCandlesResponse>(
      `/api/market/candles/${encodeURIComponent(asset)}?period=${period}`,
      { signal },
    );
  },
};

export const tradesApi = {
  place(body: PlaceTradeRequest, idempotencyKey: string): Promise<TradeDto> {
    return apiRequest<TradeDto>('/api/trades', {
      method: 'POST',
      body,
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },
  list(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    asset?: string;
  } = {}): Promise<TradeListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.status) query.set('status', params.status);
    if (params.asset) query.set('asset', params.asset);
    const qs = query.toString();
    return apiRequest<TradeListResponse>(`/api/trades${qs ? `?${qs}` : ''}`);
  },
  get(id: string): Promise<TradeDto> {
    return apiRequest<TradeDto>(`/api/trades/${encodeURIComponent(id)}`);
  },
};

export const adminApi = {
  listAccounts(
    statusOrParams?:
      | string
      | {
          status?: string;
          q?: string;
          page?: number;
          pageSize?: number;
        },
  ): Promise<AdminBinollaAccountListResponse> {
    const params =
      typeof statusOrParams === 'string' || statusOrParams == null
        ? { status: statusOrParams }
        : statusOrParams;
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.q) query.set('q', params.q);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return apiRequest<AdminBinollaAccountListResponse>(`/api/admin/binolla/accounts${qs ? `?${qs}` : ''}`);
  },
  getAccount(id: string): Promise<AdminBinollaAccountDto> {
    return apiRequest<AdminBinollaAccountDto>(`/api/admin/binolla/accounts/${encodeURIComponent(id)}`);
  },
  approve(id: string): Promise<AdminBinollaAccountDto> {
    return apiRequest<AdminBinollaAccountDto>(
      `/api/admin/binolla/accounts/${encodeURIComponent(id)}/approve`,
      { method: 'POST' },
    );
  },
  reject(id: string): Promise<AdminBinollaAccountDto> {
    return apiRequest<AdminBinollaAccountDto>(
      `/api/admin/binolla/accounts/${encodeURIComponent(id)}/reject`,
      { method: 'POST' },
    );
  },
  listDemoUsers(params: {
    active?: 'true' | 'false' | 'all';
    page?: number;
    pageSize?: number;
  } = {}): Promise<MarketingDemoUserListResponse> {
    const query = new URLSearchParams();
    query.set('active', params.active ?? 'true');
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    return apiRequest<MarketingDemoUserListResponse>(`/api/admin/demo-users?${query}`);
  },
  createDemoUser(body: CreateMarketingDemoUserRequest): Promise<MarketingDemoUserDto> {
    return apiRequest<MarketingDemoUserDto>('/api/admin/demo-users', {
      method: 'POST',
      body,
    });
  },
  setDemoUser(
    id: string,
    isMarketingDemo: boolean,
    telegramUserId?: number | null,
  ): Promise<MarketingDemoUserDto> {
    return apiRequest<MarketingDemoUserDto>(
      `/api/admin/demo-users/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: {
          isMarketingDemo,
          ...(telegramUserId != null ? { telegramUserId } : {}),
        },
      },
    );
  },
  updateDemoConfig(id: string, config: MarketingDemoConfigDto): Promise<MarketingDemoUserDto> {
    return apiRequest<MarketingDemoUserDto>(
      `/api/admin/demo-users/${encodeURIComponent(id)}/config`,
      {
        method: 'PUT',
        body: { config },
      },
    );
  },
  listUsers(params: {
    q?: string;
    role?: string;
    isMarketingDemo?: boolean;
    page?: number;
    pageSize?: number;
  } = {}): Promise<AdminUserListResponse> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.role) query.set('role', params.role);
    if (params.isMarketingDemo != null) query.set('isMarketingDemo', String(params.isMarketingDemo));
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return apiRequest<AdminUserListResponse>(`/api/admin/users${qs ? `?${qs}` : ''}`);
  },
  getUser(id: string): Promise<AdminUserDetailDto> {
    return apiRequest<AdminUserDetailDto>(`/api/admin/users/${encodeURIComponent(id)}`);
  },
  patchUser(id: string, body: PatchAdminUserRequest): Promise<AdminUserDetailDto> {
    return apiRequest<AdminUserDetailDto>(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body,
    });
  },
  listAudit(params: {
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<AdminAuditListResponse> {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId);
    if (params.action) query.set('action', params.action);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return apiRequest<AdminAuditListResponse>(`/api/admin/audit${qs ? `?${qs}` : ''}`);
  },
  listAdminNotifications(params: {
    userId?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<AdminNotificationListResponse> {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return apiRequest<AdminNotificationListResponse>(`/api/admin/notifications${qs ? `?${qs}` : ''}`);
  },
  sendNotification(body: AdminSendNotificationRequest): Promise<AdminSendNotificationResponse> {
    return apiRequest<AdminSendNotificationResponse>('/api/admin/notifications', {
      method: 'POST',
      body,
    });
  },
  listBots(params: {
    state?: string;
    q?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<AdminBotListResponse> {
    const query = new URLSearchParams();
    if (params.state) query.set('state', params.state);
    if (params.q) query.set('q', params.q);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return apiRequest<AdminBotListResponse>(`/api/admin/bots${qs ? `?${qs}` : ''}`);
  },
  getBot(userId: string): Promise<AdminBotRuntimeDto> {
    return apiRequest<AdminBotRuntimeDto>(`/api/admin/bots/${encodeURIComponent(userId)}`);
  },
  controlBot(userId: string, body: AdminBotControlRequest): Promise<AdminBotRuntimeDto> {
    return apiRequest<AdminBotRuntimeDto>(
      `/api/admin/bots/${encodeURIComponent(userId)}/control`,
      { method: 'POST', body },
    );
  },
  listAdminTrades(params: {
    userId?: string;
    status?: string;
    asset?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<AdminTradeListResponse> {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId);
    if (params.status) query.set('status', params.status);
    if (params.asset) query.set('asset', params.asset);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return apiRequest<AdminTradeListResponse>(`/api/admin/trades${qs ? `?${qs}` : ''}`);
  },
};
