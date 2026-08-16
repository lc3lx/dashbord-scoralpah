import { t } from '@shared/i18n';
import type { OnboardingContent } from '../types';

/**
 * Onboarding copy aligned with Phase 7/9 product model:
 * Telegram → Binolla credentials (partner signup) → admin approval → FREE Demo + RSI.
 */
export function getOnboardingMockContent(): OnboardingContent {
  return {
    step1: {
      title: t('onboarding.step1.title'),
      description: t('onboarding.step1.description'),
      keyPoints: [
        {
          id: 'step1-1',
          text: t('onboarding.step1.kp1'),
          variant: 'check',
        },
        {
          id: 'step1-2',
          text: t('onboarding.step1.kp2'),
          variant: 'check',
        },
        { id: 'step1-3', text: t('onboarding.step1.kp3'), variant: 'check' },
        {
          id: 'step1-4',
          text: t('onboarding.step1.kp4'),
          variant: 'trade',
        },
      ],
      footnote: t('onboarding.step1.footnote'),
    },
    step2: {
      title: t('onboarding.step2.title'),
      description: t('onboarding.step2.description'),
      activationItems: [
        { label: t('onboarding.step2.binolla'), status: t('common.connected'), tone: 'success' },
        {
          label: t('onboarding.step2.adminApproval'),
          status: t('common.pending'),
          tone: 'warning',
        },
      ],
      activationKey: t('onboarding.step2.activationKey'),
      keyPoints: [
        { id: 'step2-1', text: t('onboarding.step2.kp1'), variant: 'check' },
        { id: 'step2-2', text: t('onboarding.step2.kp2'), variant: 'check' },
        { id: 'step2-3', text: t('onboarding.step2.kp3'), variant: 'check' },
        {
          id: 'step2-4',
          text: t('onboarding.step2.kp4'),
          variant: 'check',
        },
        {
          id: 'step2-5',
          text: t('onboarding.step2.kp5'),
          variant: 'warning',
        },
      ],
    },
    step3: {
      title: t('onboarding.step3.title'),
      description: t('onboarding.step3.description'),
      botPreview: {
        name: t('onboarding.step3.botName'),
        statusLabel: t('onboarding.step3.status'),
        statusTone: 'warning',
        strengthLabel: t('onboarding.step3.mode'),
        strengthValue: t('onboarding.step3.demo'),
        fields: [
          { id: 'indicator', label: t('onboarding.step3.signal'), value: t('common.rsi') },
          { id: 'strategy', label: t('onboarding.step3.strategy'), value: t('common.rsi') },
          {
            id: 'amount',
            label: t('onboarding.step3.amount'),
            value: t('onboarding.step3.amountValue'),
          },
          {
            id: 'duration',
            label: t('onboarding.step3.duration'),
            value: t('onboarding.step3.durationValue'),
          },
          {
            id: 'profit-target',
            label: t('onboarding.step3.autoTrading'),
            value: t('common.notAvailable'),
          },
          {
            id: 'loss-limit',
            label: t('onboarding.step3.account'),
            value: t('onboarding.step3.demoOnly'),
          },
        ],
      },
      keyPoints: [
        {
          id: 'step3-1',
          text: t('onboarding.step3.kp1'),
          variant: 'check',
        },
        {
          id: 'step3-2',
          text: t('onboarding.step3.kp2'),
          variant: 'check',
        },
        {
          id: 'step3-3',
          text: t('onboarding.step3.kp3'),
          variant: 'check',
        },
        {
          id: 'step3-4',
          text: t('onboarding.step3.kp4'),
          variant: 'check',
        },
        {
          id: 'step3-5',
          text: t('onboarding.step3.kp5'),
          variant: 'check',
        },
      ],
    },
  };
}
