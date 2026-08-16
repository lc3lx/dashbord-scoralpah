import { uiAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { KeyPoint } from '@components/molecules';
import { ActivationPanel } from '@components/organisms';
import { useT } from '@shared/i18n';
import type { OnboardingStepTwoContent } from '../../types';
import styles from './OnboardingStepTwo.module.css';

export type OnboardingStepTwoProps = {
  content: OnboardingStepTwoContent;
};

export function OnboardingStepTwo({ content }: OnboardingStepTwoProps) {
  const t = useT();
  return (
    <section className={styles.step} aria-label={t('onboarding.aria')}>
      <Text as="h1" variant="display" tone="primary" align="center" className={styles.title}>
        {content.title}
      </Text>

      <Text variant="body" tone="onboarding" align="center" className={styles.description}>
        {content.description}
      </Text>

      <div className={styles.cardSection}>
        <ActivationPanel variant="promo" items={content.activationItems}>
          <div className={styles.keySection}>
            <Text variant="caption" tone="primary" className={styles.keyLabel}>
              {t('onboarding.step2.activationKeyLabel')}
            </Text>
            <div className={styles.keyField}>
              <Text variant="body-sm" tone="body" className={styles.keyValue}>
                {content.activationKey}
              </Text>
              <Icon
                src={uiAssets.activationKeyValid}
                decorative
                className={styles.keyValidIcon}
              />
            </div>
          </div>

          <button type="button" className={styles.activateButton}>
            {t('onboarding.step2.activate')}
          </button>
        </ActivationPanel>
      </div>

      <ul className={styles.keyPoints}>
        {content.keyPoints.map((point) => (
          <li key={point.id}>
            <KeyPoint text={point.text} variant={point.variant} />
          </li>
        ))}
      </ul>
    </section>
  );
}
