/**
 * Dashboard website routes (React Router paths).
 * With basename `/dashboard` + Vite `base: '/dashboard/'`, public URLs are:
 *   /dashboard/          → home
 *   /dashboard/login
 *   /dashboard/signup
 *   /dashboard/trading
 *   …
 *
 * Telegram Mini App keeps its own routes in bot_telegram_webapp (no /dashboard prefix).
 */
export const ROUTES = {
  splash: '/',
  onboarding: '/onboarding',
  login: '/login',
  signup: '/signup',
  linkBinolla: '/link-binolla',
  activation: '/activation',
  /** Main dashboard home at /dashboard/ */
  home: '/',
  bot: '/bot',
  trading: '/trading',
  tradeDetail: '/trading/:tradeId',
  history: '/history',
  notifications: '/notifications',
  notificationDetail: '/notifications/:notificationId',
  settings: '/settings',
  editProfile: '/settings/edit-profile',
  changePassword: '/settings/change-password',
  subscription: '/settings/subscription',
  activationHistory: '/settings/activation-history',
  admin: '/admin',
  adminUsers: '/admin/users',
  adminUserDetail: '/admin/users/:userId',
  adminApprovals: '/admin/approvals',
  adminMarketing: '/admin/marketing',
  adminNotifications: '/admin/notifications',
  adminAudit: '/admin/audit',
  adminBots: '/admin/bots',
  adminTrades: '/admin/trades',
  adminReferrals: '/admin/referrals',
  adminReferralPayouts: '/admin/referrals/payouts',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export function getTradeDetailPath(tradeId: string): string {
  return `/trading/${tradeId}`;
}

export function getNotificationDetailPath(notificationId: string): string {
  return `/notifications/${notificationId}`;
}

export const FIGMA_FILE_KEY = '2Xub9DUc8qXvRygoo6mBDv';

export const FIGMA_NODES = {
  splash: '54:2',
  onboardingStep1: '81:94',
  onboardingStep2: '92:1081',
  onboardingStep3: '92:1107',
  login: '96:4098',
  signup: '96:4250',
  activation: '113:4335',
  activationSuccess: '113:4504',
  dashboard: '113:4633',
  home: '222:2106',
  bot: '222:2106',
  trading: '210:614',
  tradeDetail: '222:1810',
  history: '213:1219',
  notifications: '209:179',
  notificationDetail: '210:395',
  settings: '222:3050',
  editProfile: '233:3106',
  changePassword: '233:3347',
  subscription: '233:3369',
  activationHistory: '233:3391',
  bottomNavigation: '113:5431',
  botSettingsSheet: '222:2234',
  chartSheet: '222:2537',
  marketTypeSheet: '282:2150',
  tradingPairSheet: '282:2450',
  indicatorSheet: '282:2750',
  strategySheet: '282:3050',
} as const;
