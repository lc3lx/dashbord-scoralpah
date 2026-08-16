import { ROUTES } from '@constants/routes';
import { t } from '@shared/i18n';

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

export function getAdminNotApprovedTradeMessage(): string {
  return t('api.adminNotApprovedTrade');
}
