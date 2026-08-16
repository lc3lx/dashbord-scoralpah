import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { markOnboardingDone } from '@shared/onboarding/onboardingStorage';
import {
  ONBOARDING_TOTAL_STEPS,
  type OnboardingBodyVariant,
  type OnboardingFooterVariant,
} from '../types';

export type OnboardingFlowController = {
  currentStep: number;
  totalSteps: number;
  footerVariant: OnboardingFooterVariant;
  bodyVariant: OnboardingBodyVariant;
  goNext: () => void;
  goBack: () => void;
  skip: () => void;
  complete: () => void;
};

export function useOnboardingFlow(): OnboardingFlowController {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const goNext = useCallback(() => {
    setCurrentStep((step) => Math.min(step + 1, ONBOARDING_TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  }, []);

  const skip = useCallback(() => {
    markOnboardingDone();
    navigate(ROUTES.signup);
  }, [navigate]);

  const complete = useCallback(() => {
    markOnboardingDone();
    navigate(ROUTES.signup);
  }, [navigate]);

  const footerVariant = useMemo<OnboardingFooterVariant>(() => {
    if (currentStep === 1) {
      return 'next-full';
    }

    if (currentStep === ONBOARDING_TOTAL_STEPS) {
      return 'get-started';
    }

    return 'nav';
  }, [currentStep]);

  const bodyVariant = useMemo<OnboardingBodyVariant>(() => {
    if (currentStep === 1) {
      return 'step-one';
    }

    if (currentStep === 2) {
      return 'step-two';
    }

    return 'step-three';
  }, [currentStep]);

  return {
    currentStep,
    totalSteps: ONBOARDING_TOTAL_STEPS,
    footerVariant,
    bodyVariant,
    goNext,
    goBack,
    skip,
    complete,
  };
}
