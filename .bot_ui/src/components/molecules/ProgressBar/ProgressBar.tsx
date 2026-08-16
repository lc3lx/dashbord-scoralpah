import { useT } from '@shared/i18n';
import { cn } from '@utils/cn';
import styles from './ProgressBar.module.css';

export type ProgressBarProps = {
  totalSteps: number;
  currentStep: number;
  className?: string;
};

export function ProgressBar({ totalSteps, currentStep, className }: ProgressBarProps) {
  const t = useT();

  return (
    <div
      className={cn(styles.progress, className)}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep}
      aria-label={t('onboarding.stepOf', { n: currentStep, total: totalSteps })}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;

        return (
          <span
            key={step}
            className={cn(styles.dot, isActive ? styles.active : styles.inactive)}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
