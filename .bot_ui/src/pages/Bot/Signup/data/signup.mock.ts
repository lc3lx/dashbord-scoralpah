import { t } from '@shared/i18n';
import type { SignupFormValues } from '@features/Auth';

export type SignupCopy = {
  title: string;
  description: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  countryLabel: string;
  countryPlaceholder: string;
  telegramLabel: string;
  telegramPlaceholder: string;
  binollaLabel: string;
  binollaPlaceholder: string;
  submitLabel: string;
  dividerLabel: string;
  promptLabel: string;
  signInLabel: string;
  telegramContinueLabel: string;
  footerPrefix: string;
  footerLinkLabel: string;
  footerSuffix: string;
  footerHref: string;
};

export function getSignupCopy(): SignupCopy {
  return {
    title: t('signup.title'),
    description: t('signup.description'),
    fullNameLabel: t('signup.fullName'),
    fullNamePlaceholder: t('signup.fullNamePh'),
    emailLabel: t('signup.email'),
    emailPlaceholder: t('signup.emailPh'),
    passwordLabel: t('signup.password'),
    passwordPlaceholder: '••••••••',
    countryLabel: t('signup.country'),
    countryPlaceholder: t('signup.countryPh'),
    telegramLabel: t('signup.telegram'),
    telegramPlaceholder: t('signup.telegramPh'),
    binollaLabel: t('signup.binolla'),
    binollaPlaceholder: t('signup.binollaPh'),
    submitLabel: t('signup.submit'),
    dividerLabel: t('signup.or'),
    promptLabel: t('signup.haveAccount'),
    signInLabel: t('signup.signIn'),
    telegramContinueLabel: t('login.continueTelegram'),
    footerPrefix: t('login.footerPrefix'),
    footerLinkLabel: t('login.footerLinkLabel'),
    footerSuffix: t('login.footerSuffix'),
    footerHref: '#',
  };
}

export const SIGNUP_INITIAL_VALUES: SignupFormValues = {
  fullName: '',
  email: '',
  password: '',
  country: '',
  telegramId: '',
  binollaAccount: '',
};
