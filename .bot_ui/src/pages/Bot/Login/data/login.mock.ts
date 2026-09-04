import { t } from '@shared/i18n';
import type { LoginCopy } from '../types';

export function getLoginCopy(): LoginCopy {
  return {
    title: t('login.title'),
    description: t('login.description'),
    emailLabel: t('login.emailLabel'),
    emailPlaceholder: t('login.emailPlaceholder'),
    passwordLabel: t('login.passwordLabel'),
    passwordPlaceholder: '••••••••',
    forgotPasswordLabel: t('login.forgotPassword'),
    submitLabel: t('login.submit'),
    createAccountLabel: t('login.createAccount'),
    securityTitle: t('login.securityTitle'),
    securitySubtitle: t('login.securitySubtitle'),
    footerPrefix: t('login.footerPrefix'),
    footerLinkLabel: t('login.footerLinkLabel'),
    footerSuffix: t('login.footerSuffix'),
    footerHref: '#',
    telegramLabel: t('login.continueTelegram'),
  };
}

export const LOGIN_INITIAL_VALUES = {
  email: '',
  password: '',
} as const;
