import { ROUTES } from '@constants/routes';
import { t } from '@shared/i18n';
import { isTelegramWebApp } from '@shared/telegram/telegramWebApp';

/** Live market / RSI / balance — connected pending users included. */
export function canBrowseMarket(botAccess?: string | null): boolean {
  return botAccess === 'Allowed' || botAccess === 'AdminApprovalRequired';
}

/** Demo place-order — admin approval required. */
export function canTrade(botAccess?: string | null): boolean {
  return botAccess === 'Allowed';
}

/** After connect/login, land on Trading (browse OK while pending; place-order still gated). */
export function routeForBotAccess(botAccess?: string | null): string {
  if (botAccess === 'Allowed' || botAccess === 'AdminApprovalRequired') {
    return ROUTES.trading;
  }
  if (botAccess === 'BinollaNotConnected' || botAccess === 'SessionExpired') {
    return ROUTES.linkBinolla;
  }
  return ROUTES.settings;
}

function isDashboardWebSurface(): boolean {
  try {
    return String(import.meta.env.BASE_URL ?? '').includes('dashboard');
  } catch {
    return false;
  }
}

function resolveIsAdmin(isAdmin?: boolean, role?: string | null): boolean {
  return Boolean(isAdmin) || String(role ?? '').toLowerCase() === 'admin';
}

/**
 * Website (dashboard) admins skip Binolla gating and go to the admin console.
 * Telegram Mini App and non-admins still use botAccess routing.
 */
export function routeAfterAuth(
  botAccess?: string | null,
  isAdmin?: boolean,
  role?: string | null,
): string {
  const admin = resolveIsAdmin(isAdmin, role);
  // Dashboard website: never send operators into bot trading via shared hooks.
  if (isDashboardWebSurface()) {
    return admin ? ROUTES.admin : ROUTES.login;
  }
  if (admin && !isTelegramWebApp()) {
    return ROUTES.admin;
  }
  return routeForBotAccess(botAccess);
}

export function getAdminNotApprovedTradeMessage(): string {
  return t('api.adminNotApprovedTrade');
}
