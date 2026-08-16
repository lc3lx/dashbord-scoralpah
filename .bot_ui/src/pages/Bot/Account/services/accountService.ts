import { getBinollaReferralLabel } from '@constants/binolla';
import { accountAssets } from '@assets/index';
import { ROUTES } from '@constants/routes';
import {
  getAccountPageContent,
  getActivationHistoryPageContent as getActivationHistoryPageContentMock,
  getChangePasswordCopy as getChangePasswordCopyMock,
  getEditProfileCopy as getEditProfileCopyMock,
  getSeedAccountSnapshot,
  getSubscriptionPageContent as getSubscriptionPageContentMock,
} from '../data/account.mock';
import type {
  AccountSnapshot,
  AccountMenuItem,
  ChangePasswordFormValues,
  EditProfileFormValues,
} from '../types';
import { accountApi, ApiClientError, authApi, binollaApi, meApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
import { isTelegramWebApp } from '@shared/telegram/telegramWebApp';

type AccountListener = () => void;

const listeners = new Set<AccountListener>();
let cachedSnapshot: AccountSnapshot | null = null;
let lastSsidHint = '';

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function formatApprovalStatus(status: string): string {
  switch (status) {
    case 'Pending':
      return t('common.pending');
    case 'Approved':
      return t('common.approved');
    case 'Rejected':
      return t('common.rejected');
    default:
      return status;
  }
}

function formatBotAccessLabel(botAccess: string): string {
  switch (botAccess) {
    case 'Allowed':
      return t('account.access.allowed');
    case 'BinollaNotConnected':
      return t('account.access.binollaNotConnected');
    case 'AdminApprovalRequired':
      return t('account.access.adminRequired');
    case 'NotEligible':
      return t('account.access.rejected');
    case 'SessionExpired':
      return t('account.access.sessionExpired');
    default:
      return botAccess;
  }
}

function buildSnapshotFromApi(): Promise<AccountSnapshot> {
  return (async () => {
    const [me, status] = await Promise.all([meApi.get(), accountApi.status()]);

    const fullName = me.fullName?.trim() || me.username?.trim() || me.email?.trim() || t('common.trader');
    const telegram = me.username
      ? `@${me.username.replace(/^@/, '')}`
      : me.telegramUserId
        ? String(me.telegramUserId)
        : t('common.none');
    const email = me.email?.trim() || t('common.none');
    const accessLabel = formatBotAccessLabel(status.botAccess);
    const approvalLabel = formatApprovalStatus(status.approvalStatus);
    const connectedLabel = t('account.value.connected');
    const notConnectedLabel = t('account.value.notConnected');

    const badges = [
      {
        id: 'access',
        label: accessLabel,
        tone:
          status.botAccess === 'Allowed'
            ? ('success' as const)
            : status.botAccess === 'AdminApprovalRequired'
              ? ('warning' as const)
              : ('danger' as const),
      },
      {
        id: 'approval',
        label: t('account.approvalBadge', { status: approvalLabel }),
        tone: status.adminApproved ? ('success' as const) : ('warning' as const),
      },
    ];

    const menuItems: AccountMenuItem[] = [
      {
        id: 'edit-profile',
        label: t('account.menu.editProfile'),
        iconSrc: accountAssets.editProfile,
        route: ROUTES.editProfile,
      },
    ];

    if (me.hasPassword) {
      menuItems.push({
        id: 'change-password',
        label: t('account.menu.changePassword'),
        iconSrc: accountAssets.changePassword,
        route: ROUTES.changePassword,
      });
    }

    menuItems.push(
      {
        id: 'subscription',
        label: t('account.menu.subscription'),
        iconSrc: accountAssets.expiration,
        route: ROUTES.subscription,
      },
      {
        id: 'activation-history',
        label: t('account.menu.activationHistory'),
        iconSrc: accountAssets.activationHistory,
        route: ROUTES.activationHistory,
      },
      {
        id: 'notifications',
        label: t('account.menu.notifications'),
        iconSrc: accountAssets.notifications,
        route: ROUTES.notifications,
      },
    );

    // Admin console lives on the website dashboard only (not Mini App).
    if (me.isAdmin && !isTelegramWebApp()) {
      menuItems.unshift({
        id: 'admin',
        label: t('account.menu.admin'),
        iconSrc: accountAssets.subscriptionCrown,
        route: ROUTES.admin,
      });
    }

    const snapshot: AccountSnapshot = {
      profile: {
        fullName,
        email,
        country: me.country ?? '—',
        telegramId: telegram,
        binollaAccountId: status.binollaConnected ? connectedLabel : notConnectedLabel,
        accountType: status.accountType || t('common.demo'),
        expirationLabel: t('account.value.none'),
        accountStatus:
          status.botAccess === 'Allowed'
            ? 'approved'
            : status.botAccess === 'NotEligible'
              ? 'rejected'
              : status.botAccess === 'SessionExpired'
                ? 'pending'
                : 'pending',
        planLabel: t('account.value.freePlan'),
        avatarIconSrc: accountAssets.profileUser,
      },
      badges,
      details: [
        {
          id: 'email',
          label: t('account.detail.email'),
          value: email,
          iconSrc: accountAssets.country,
        },
        {
          id: 'telegram',
          label: t('account.detail.telegram'),
          value: telegram,
          iconSrc: accountAssets.telegram,
        },
        {
          id: 'binolla',
          label: t('account.detail.binolla'),
          value:
            status.botAccess === 'SessionExpired'
              ? t('account.value.sessionExpiredReconnect')
              : status.binollaConnected
                ? connectedLabel
                : notConnectedLabel,
          iconSrc: accountAssets.binollaId,
        },
        {
          id: 'account-type',
          label: t('account.detail.accountType'),
          value: status.accountType || t('common.demo'),
          iconSrc: accountAssets.accountType,
        },
        {
          id: 'approval',
          label: t('account.detail.approval'),
          value: approvalLabel,
          iconSrc: accountAssets.expiration,
        },
        {
          id: 'bot-access',
          label: t('account.detail.botAccess'),
          value: accessLabel,
          iconSrc: accountAssets.accountType,
        },
      ],
      menuItems,
      pageContent: {
        ...getAccountPageContent(),
        versionLabel:
          status.botAccess === 'SessionExpired'
            ? t('account.versionSessionExpired')
            : status.botAccess === 'AdminApprovalRequired'
              ? t('account.versionPending')
              : t('account.versionOk'),
      },
      subscription: {
        ...getSeedAccountSnapshot().subscription,
        planName: t('account.value.freePlan'),
        status: status.botAccess === 'Allowed' ? 'active' : 'pending',
        statusLabel: accessLabel,
        statusTone: status.botAccess === 'Allowed' ? 'success' : 'warning',
        startDate: '—',
        endDate: t('account.value.none'),
        daysLeft: 0,
        keyUsedLabel: t('account.approvalBadge', { status: approvalLabel }),
      },
      activationHistory: [],
      botAccess: status.botAccess,
    };

    cachedSnapshot = snapshot;
    return structuredClone(snapshot);
  })();
}

export const accountService = {
  subscribe(listener: AccountListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async fetchAccountSnapshot(): Promise<AccountSnapshot> {
    try {
      return await buildSnapshotFromApi();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        tokenStore.clear();
      }
      throw error;
    }
  },

  async updateProfile(values: EditProfileFormValues): Promise<AccountSnapshot> {
    await meApi.update({
      fullName: values.fullName.trim(),
      country: values.country.trim(),
      username: values.telegramId.trim() || undefined,
    });

    const ssid = values.binollaAccountId.trim();
    const connectedLabel = t('account.value.connected');
    const notConnectedLabel = t('account.value.notConnected');
    if (ssid && ssid !== connectedLabel && ssid !== notConnectedLabel && ssid !== lastSsidHint) {
      await binollaApi.connect({ ssid, accountType: 'Demo' });
      lastSsidHint = connectedLabel;
    }

    const snapshot = await buildSnapshotFromApi();
    notifyListeners();
    return snapshot;
  },

  async changePassword(values: ChangePasswordFormValues): Promise<void> {
    await authApi.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  },

  async logout(): Promise<void> {
    try {
      await binollaApi.disconnect().catch(() => undefined);
    } finally {
      tokenStore.clear();
      cachedSnapshot = null;
      notifyListeners();
    }
  },

  getEditProfileCopy() {
    return {
      ...getEditProfileCopyMock(),
      binollaLabel: t('account.edit.binollaFallback'),
      binollaPlaceholder: t('account.edit.binollaFallbackPh'),
      binollaHelpText: t('account.edit.binollaHelp'),
      binollaRegisterLabel: getBinollaReferralLabel(),
      binollaRegisterHref: ROUTES.linkBinolla,
      successMessage: t('account.edit.successLinked'),
    };
  },

  getEditProfileInitialValues(): EditProfileFormValues {
    return {
      fullName: cachedSnapshot?.profile.fullName ?? '',
      country: cachedSnapshot?.profile.country ?? '',
      telegramId: cachedSnapshot?.profile.telegramId ?? '',
      binollaAccountId: '',
    };
  },

  getChangePasswordCopy() {
    return getChangePasswordCopyMock();
  },

  getSubscriptionPageContent() {
    return {
      ...getSubscriptionPageContentMock(),
      pageTitle: t('account.subscription.accessTitle'),
      enterKeyLabel: t('account.subscription.linkBinolla'),
      viewHistoryLabel: t('account.subscription.back'),
    };
  },

  getActivationHistoryPageContent() {
    return getActivationHistoryPageContentMock();
  },

  async getSubscriptionDetails() {
    const details = await accountApi.subscription();
    return {
      planName: details.planName || t('account.value.freePlan'),
      status: details.status === 'active' ? ('active' as const) : ('pending' as const),
      statusLabel: details.statusLabel,
      statusTone: details.status === 'active' ? ('success' as const) : ('warning' as const),
      startDate: details.startedAt ? new Date(details.startedAt).toLocaleDateString() : '—',
      endDate: details.approvedAt ? new Date(details.approvedAt).toLocaleDateString() : t('account.value.none'),
      daysLeft: 0,
      keyUsedLabel: details.keyUsedLabel,
      iconSrc: accountAssets.subscriptionCrown,
    };
  },

  async getActivationHistory() {
    const history = await accountApi.activationHistory();
    return history.items.map((item) => ({
      id: item.id,
      keyLabel: item.keyLabel,
      status: item.status === 'active' ? ('active' as const) : ('expired' as const),
      statusLabel: item.statusLabel,
      statusTone: item.status === 'active' ? ('success' as const) : ('neutral' as const),
      planLabel: t('account.history.plan'),
      planDuration: t('account.value.freePlan'),
      usedLabel: t('account.history.used'),
      usedDate: new Date(item.createdAt).toLocaleDateString(),
      expirationLabel: t('account.history.expires'),
      expirationDate: t('account.value.none'),
      iconSrc: accountAssets.historyKey,
    }));
  },

  setUnreadNotificationCount(count: number): void {
    if (!cachedSnapshot) return;
    cachedSnapshot = {
      ...cachedSnapshot,
      menuItems: cachedSnapshot.menuItems.map((item) =>
        item.id === 'notifications'
          ? {
              ...item,
              badge: count > 0 ? { label: String(count), tone: 'danger' as const } : undefined,
            }
          : item,
      ),
    };
    notifyListeners();
  },

  reset(): void {
    cachedSnapshot = null;
    notifyListeners();
  },
};

export type AccountService = typeof accountService;
