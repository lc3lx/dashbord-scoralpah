import { t } from '@shared/i18n';
import type { LoginCopy } from '../../Login/types';

export type DemoLoginCopy = LoginCopy & {
  normalLoginLabel: string;
};

export function getDemoLoginCopy(): DemoLoginCopy {
  return {
    title: t('demoLogin.title'),
    description: t('demoLogin.description'),
    emailLabel: t('login.emailLabel'),
    emailPlaceholder: t('login.emailPlaceholder'),
    passwordLabel: t('login.passwordLabel'),
    passwordPlaceholder: '••••••••',
    forgotPasswordLabel: t('login.forgotPassword'),
    submitLabel: t('demoLogin.submit'),
    createAccountLabel: t('login.createAccount'),
    securityTitle: t('demoLogin.securityTitle'),
    securitySubtitle: t('demoLogin.securitySubtitle'),
    footerPrefix: t('login.footerPrefix'),
    footerLinkLabel: t('login.footerLinkLabel'),
    footerSuffix: t('login.footerSuffix'),
    footerHref: '#',
    telegramLabel: t('login.continueTelegram'),
    normalLoginLabel: t('demoLogin.normalLogin'),
  };
}
