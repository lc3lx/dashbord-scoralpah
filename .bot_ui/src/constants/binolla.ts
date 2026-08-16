import { t } from '@shared/i18n';

/**
 * Binolla is the broker platform users log into / register on.
 * Scar Alpha does not create its own email/password accounts.
 *
 * Primary signup path: in-app POST /api/binolla/signup
 * (server Playwright opens BINOLLA_REFERRAL_SIGNUP_URL).
 *
 * Referral lid is attribution only — admin approval is authorization.
 */
export const BINOLLA_REFERRAL_SIGNUP_URL =
  'https://binolla.com/signup/?lid=15968' as const;
export const BINOLLA_LOGIN_URL = 'https://binolla.com/login/' as const;

export function getBinollaReferralLabel(): string {
  return t('binolla.signupLabel');
}

export function getBinollaLoginLabel(): string {
  return t('binolla.loginLabel');
}
