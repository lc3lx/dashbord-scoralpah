import type { ChipTone } from '@components/types';

export type AccountStatus = 'approved' | 'pending' | 'rejected';
export type SubscriptionStatus = 'active' | 'expired' | 'pending';
export type ActivationHistoryStatus = 'active' | 'expired';

export type AccountProfile = {
  fullName: string;
  email: string;
  country: string;
  telegramId: string;
  binollaAccountId: string;
  accountType: string;
  expirationLabel: string;
  accountStatus: AccountStatus;
  planLabel: string;
  avatarIconSrc: string;
};

export type AccountBadge = {
  id: string;
  label: string;
  tone: ChipTone;
};

export type AccountDetailItem = {
  id: string;
  label: string;
  value: string;
  iconSrc: string;
};

export type AccountMenuItem = {
  id: string;
  label: string;
  iconSrc: string;
  route?: string;
  badge?: {
    label: string;
    tone: ChipTone;
  };
  tone?: 'default' | 'danger';
  action?: 'logout' | 'education';
};

export type AccountPageContent = {
  title: string;
  versionLabel: string;
  logoutLabel: string;
};

export type EditProfileFormValues = {
  fullName: string;
  country: string;
  telegramId: string;
  binollaAccountId: string;
};

export type EditProfileCopy = {
  pageTitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  countryLabel: string;
  countryPlaceholder: string;
  telegramLabel: string;
  telegramPlaceholder: string;
  binollaLabel: string;
  binollaPlaceholder: string;
  binollaHelpText?: string;
  binollaRegisterLabel?: string;
  binollaRegisterHref?: string;
  submitLabel: string;
  successMessage: string;
};

export type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordCopy = {
  pageTitle: string;
  currentPasswordLabel: string;
  currentPasswordPlaceholder: string;
  newPasswordLabel: string;
  newPasswordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  submitLabel: string;
  successMessage: string;
};

export type SubscriptionDetails = {
  planName: string;
  status: SubscriptionStatus;
  statusLabel: string;
  statusTone: ChipTone;
  startDate: string;
  endDate: string;
  daysLeft: number;
  keyUsedLabel: string;
  iconSrc: string;
};

export type SubscriptionPageContent = {
  pageTitle: string;
  enterKeyLabel: string;
  viewHistoryLabel: string;
};

export type ActivationHistoryEntry = {
  id: string;
  keyLabel: string;
  status: ActivationHistoryStatus;
  statusLabel: string;
  statusTone: ChipTone;
  planLabel: string;
  planDuration: string;
  usedLabel: string;
  usedDate: string;
  expirationLabel: string;
  expirationDate: string;
  iconSrc: string;
};

export type ActivationHistoryPageContent = {
  pageTitle: string;
  emptyLabel: string;
};

export type AccountSnapshot = {
  profile: AccountProfile;
  badges: AccountBadge[];
  details: AccountDetailItem[];
  menuItems: AccountMenuItem[];
  pageContent: AccountPageContent;
  subscription: SubscriptionDetails;
  activationHistory: ActivationHistoryEntry[];
  botAccess?: string;
};
