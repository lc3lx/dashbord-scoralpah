import type { ActivationFormValues } from '@features/Auth';
import type { ActivationStatus } from '@components/organisms/ActivationPanel';

export type ActivationCopy = {
  title: string;
  description: string;
  keyLabel: string;
  keyPlaceholder: string;
  submitLabel: string;
  hint: string;
  successTitle: string;
  successDescription: string;
  successActionLabel: string;
};

/**
 * Temporary activation copy — replace via CMS/API adapter when backend is ready.
 */
export const ACTIVATION_COPY: ActivationCopy = {
  title: 'Enter Activation Key',
  description: 'Activate your Scar Alpha AI subscription to unlock trading.',
  keyLabel: 'Activation Key',
  keyPlaceholder: 'SCAR-XXXX-XXXX-XXXX',
  submitLabel: 'Activate',
  hint: 'Try key "invalid" to see the error state.',
  successTitle: 'Activation Successful',
  successDescription: 'Your Scar Alpha AI subscription is now active for 30 days.',
  successActionLabel: 'Enter App',
};

export const ACTIVATION_STATUS_ITEMS: ActivationStatus[] = [
  { label: 'Account Status', status: 'Approved', tone: 'success' },
  { label: 'Subscription Status', status: 'Inactive', tone: 'warning' },
  { label: 'Key Status', status: 'Awaiting entry', tone: 'awaiting' },
];

export const ACTIVATION_INITIAL_VALUES: ActivationFormValues = {
  activationKey: '',
};
