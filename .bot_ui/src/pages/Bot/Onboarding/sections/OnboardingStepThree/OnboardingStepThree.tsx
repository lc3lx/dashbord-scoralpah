import { brandAssets } from '@assets/index';
import { Text } from '@components/atoms/Text';
import { BotSetupPreviewCard, KeyPoint } from '@components/molecules';
import type { OnboardingStepThreeContent } from '../../types';
import styles from './OnboardingStepThree.module.css';

export type OnboardingStepThreeProps = {
  content: OnboardingStepThreeContent;
};

export function OnboardingStepThree({ content }: OnboardingStepThreeProps) {
  const { botPreview } = content;

  return (
    <section className={styles.step} aria-label="Onboarding step 3">
      <Text as="h1" variant="display" tone="primary" align="center" className={styles.title}>
        {content.title}
      </Text>

      <Text variant="body" tone="onboarding" align="center" className={styles.description}>
        {content.description}
      </Text>

      <div className={styles.cardSection}>
        <BotSetupPreviewCard
          name={botPreview.name}
          statusLabel={botPreview.statusLabel}
          statusTone={botPreview.statusTone}
          strengthLabel={botPreview.strengthLabel}
          strengthValue={botPreview.strengthValue}
          iconSrc={brandAssets.botSetupLogo}
          fields={botPreview.fields}
        />
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
