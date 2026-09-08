import { accountAssets } from '@assets/index';
import { ROUTES } from '@constants/routes';
import { t } from '@shared/i18n';
import type {
  AccountSnapshot,
  ActivationHistoryPageContent,
  ChangePasswordCopy,
  EditProfileCopy,
  EditProfileFormValues,
  SubscriptionPageContent,
} from '../types';

export function getAccountPageContent() {
  return {
    title: t('account.title'),
    versionLabel: t('account.versionDefault'),
    logoutLabel: t('account.logout'),
  };
}

export function getEditProfileCopy(): EditProfileCopy {
  return {
    pageTitle: t('account.edit.title'),
    fullNameLabel: t('account.edit.fullName'),
    fullNamePlaceholder: t('account.edit.fullNamePh'),
    countryLabel: t('account.edit.country'),
    countryPlaceholder: t('account.edit.countryPh'),
    telegramLabel: t('account.edit.telegram'),
    telegramPlaceholder: t('account.edit.telegramPh'),
    binollaLabel: t('account.edit.binolla'),
    binollaPlaceholder: t('account.edit.binollaPh'),
    submitLabel: t('common.save'),
    successMessage: t('account.edit.success'),
  };
}

export function getChangePasswordCopy(): ChangePasswordCopy {
  return {
    pageTitle: t('account.password.title'),
    currentPasswordLabel: t('account.password.current'),
    currentPasswordPlaceholder: '••••••••',
    newPasswordLabel: t('account.password.new'),
    newPasswordPlaceholder: '••••••••',
    confirmPasswordLabel: t('account.password.confirm'),
    confirmPasswordPlaceholder: '••••••••',
    submitLabel: t('account.password.submit'),
    successMessage: t('account.password.success'),
  };
}

export function getSubscriptionPageContent(): SubscriptionPageContent {
  return {
    pageTitle: t('account.subscription.title'),
    enterKeyLabel: t('account.subscription.enterKey'),
    viewHistoryLabel: t('account.subscription.viewHistory'),
  };
}

export function getActivationHistoryPageContent(): ActivationHistoryPageContent {
  return {
    pageTitle: t('account.history.title'),
    emptyLabel: t('account.history.empty'),
  };
}

export const EDIT_PROFILE_INITIAL_VALUES: EditProfileFormValues = {
  fullName: 'Alex Morgan',
  country: 'United States',
  telegramId: '@alexmorgan',
  binollaAccountId: 'BNL-482910',
};

export function getSeedAccountSnapshot(): AccountSnapshot {
  return {
    profile: {
      fullName: 'Alex Morgan',
      email: 'alex.morgan@scaralpha.ai',
      country: 'United States',
      telegramId: '@alexmorgan',
      binollaAccountId: 'BNL-482910',
      accountType: t('common.demo'),
      expirationLabel: 'Aug 3, 2026',
      accountStatus: 'approved',
      planLabel: 'Alpha Pro',
      avatarIconSrc: accountAssets.profileUser,
    },
    badges: [
      { id: 'approved', label: t('common.approved'), tone: 'success' },
      { id: 'plan', label: 'Alpha Pro', tone: 'danger' },
    ],
    details: [
      {
        id: 'country',
        label: t('account.detail.country'),
        value: 'United States',
        iconSrc: accountAssets.country,
      },
      {
        id: 'telegram',
        label: t('account.detail.telegram'),
        value: '@alexmorgan',
        iconSrc: accountAssets.telegram,
      },
      {
        id: 'binolla-id',
        label: t('account.detail.binollaId'),
        value: 'BNL-482910',
        iconSrc: accountAssets.binollaId,
      },
      {
        id: 'account-type',
        label: t('account.detail.accountType'),
        value: t('common.demo'),
        iconSrc: accountAssets.accountType,
      },
      {
        id: 'expiration',
        label: t('account.detail.expiration'),
        value: 'Aug 3, 2026',
        iconSrc: accountAssets.expiration,
      },
    ],
    menuItems: [
      {
        id: 'edit-profile',
        label: t('account.menu.editProfile'),
        iconSrc: accountAssets.editProfile,
        route: ROUTES.editProfile,
      },
      {
        id: 'change-password',
        label: t('account.menu.changePassword'),
        iconSrc: accountAssets.changePassword,
        route: ROUTES.changePassword,
      },
      {
        id: 'activation-history',
        label: t('account.menu.activationHistory'),
        iconSrc: accountAssets.activationHistory,
        route: ROUTES.activationHistory,
      },
      {
        id: 'education-guide',
        label: t('account.menu.education'),
        iconSrc: accountAssets.education,
        action: 'education',
        badge: { label: t('account.badge.new'), tone: 'danger' },
      },
      {
        id: 'notifications',
        label: t('account.menu.notifications'),
        iconSrc: accountAssets.notifications,
        route: ROUTES.notifications,
        badge: { label: '3', tone: 'danger' },
      },
    ],
    pageContent: getAccountPageContent(),
    subscription: {
      planName: 'Alpha Pro',
      status: 'active',
      statusLabel: t('common.active'),
      statusTone: 'success',
      startDate: 'Jul 3, 2026',
      endDate: 'Aug 3, 2026',
      daysLeft: 30,
      keyUsedLabel: 'SCAR-••••-1B2A',
      iconSrc: accountAssets.subscriptionCrown,
    },
    activationHistory: [
      {
        id: 'key-1',
        keyLabel: 'SCAR-••••-1B2A',
        status: 'active',
        statusLabel: t('common.active'),
        statusTone: 'success',
        planLabel: t('account.history.plan'),
        planDuration: '30 days',
        usedLabel: t('account.history.used'),
        usedDate: 'Jul 3, 2026',
        expirationLabel: t('account.history.expires'),
        expirationDate: 'Aug 3, 2026',
        iconSrc: accountAssets.historyKey,
      },
      {
        id: 'key-2',
        keyLabel: 'SCAR-••••-9F3C',
        status: 'expired',
        statusLabel: t('common.expired'),
        statusTone: 'neutral',
        planLabel: t('account.history.plan'),
        planDuration: '30 days',
        usedLabel: t('account.history.used'),
        usedDate: 'May 1, 2026',
        expirationLabel: t('account.history.expires'),
        expirationDate: 'May 31, 2026',
        iconSrc: accountAssets.historyKey,
      },
      {
        id: 'key-3',
        keyLabel: 'SCAR-••••-7D2E',
        status: 'expired',
        statusLabel: t('common.expired'),
        statusTone: 'neutral',
        planLabel: t('account.history.plan'),
        planDuration: '7 days',
        usedLabel: t('account.history.used'),
        usedDate: 'Apr 10, 2026',
        expirationLabel: t('account.history.expires'),
        expirationDate: 'Apr 17, 2026',
        iconSrc: accountAssets.historyKey,
      },
      {
        id: 'key-4',
        keyLabel: 'SCAR-••••-4A1B',
        status: 'expired',
        statusLabel: t('common.expired'),
        statusTone: 'neutral',
        planLabel: t('account.history.plan'),
        planDuration: '30 days',
        usedLabel: t('account.history.used'),
        usedDate: 'Mar 2, 2026',
        expirationLabel: t('account.history.expires'),
        expirationDate: 'Apr 1, 2026',
        iconSrc: accountAssets.historyKey,
      },
    ],
  };
}
