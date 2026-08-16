import type { ChipTone } from '@components/types';

export type OnboardingKeyPoint = {
  id: string;
  text: string;
  variant: 'check' | 'trade' | 'warning';
};

export type ActivationStatusItem = {
  label: string;
  status: string;
  tone: ChipTone;
};

export type BotSetupDetailField = {
  id: string;
  label: string;
  value: string;
  valueTone?: 'body' | 'success' | 'loss-limit';
};

export type OnboardingStepOneContent = {
  title: string;
  description: string;
  keyPoints: OnboardingKeyPoint[];
  footnote: string;
};

export type OnboardingStepTwoContent = {
  title: string;
  description: string;
  activationItems: ActivationStatusItem[];
  activationKey: string;
  keyPoints: OnboardingKeyPoint[];
};

export type BotSetupPreview = {
  name: string;
  statusLabel: string;
  statusTone: ChipTone;
  strengthLabel: string;
  strengthValue: string;
  fields: BotSetupDetailField[];
};

export type OnboardingStepThreeContent = {
  title: string;
  description: string;
  botPreview: BotSetupPreview;
  keyPoints: OnboardingKeyPoint[];
};

export type OnboardingContent = {
  step1: OnboardingStepOneContent;
  step2: OnboardingStepTwoContent;
  step3: OnboardingStepThreeContent;
};

export type OnboardingFooterVariant = 'next-full' | 'nav' | 'get-started';

export type OnboardingBodyVariant = 'step-one' | 'step-two' | 'step-three';

export const ONBOARDING_TOTAL_STEPS = 3;
