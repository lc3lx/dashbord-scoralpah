import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { PageContent } from '@components/layouts/PageContent';
import { useT } from '@shared/i18n';
import { cn } from '@utils/cn';
import { OnboardingFooter } from './components/OnboardingFooter';
import { getOnboardingMockContent } from './data/onboarding.mock';
import { useOnboardingFlow } from './hooks/useOnboardingFlow';
import { OnboardingStepOne } from './sections/OnboardingStepOne';
import { OnboardingStepTwo } from './sections/OnboardingStepTwo';
import { OnboardingStepThree } from './sections/OnboardingStepThree';
import styles from './OnboardingPage.module.css';

export default function OnboardingPage() {
  const t = useT();
  const flow = useOnboardingFlow();
  const { step1, step2, step3 } = getOnboardingMockContent();

  const bodyClassName = cn(
    styles.body,
    flow.bodyVariant === 'step-two' && styles.bodyStepTwo,
    flow.bodyVariant === 'step-three' && styles.bodyStepThree,
  );

  return (
    <main className={styles.page} aria-label={t('onboarding.aria')}>
      <BackgroundGlow variant="top-right" />

      <header className={styles.header}>
        <div className={styles.skipRow}>
          <button type="button" className={styles.skipButton} onClick={flow.skip}>
            <span className={styles.skipLabel}>{t('common.skip')}</span>
          </button>
        </div>
      </header>

      <div className={bodyClassName}>
        <PageContent>
          {flow.currentStep === 1 && <OnboardingStepOne content={step1} />}
          {flow.currentStep === 2 && <OnboardingStepTwo content={step2} />}
          {flow.currentStep === 3 && <OnboardingStepThree content={step3} />}
        </PageContent>
      </div>

      <OnboardingFooter
        currentStep={flow.currentStep}
        totalSteps={flow.totalSteps}
        variant={flow.footerVariant}
        onNext={flow.goNext}
        onBack={flow.goBack}
        onComplete={flow.complete}
      />
    </main>
  );
}
