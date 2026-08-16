import { Link } from 'react-router-dom';
import { AppLinkTiles, KeyPoint, TradingPreviewCard } from '@components/molecules';
import { Text } from '@components/atoms/Text';
import {
  getBinollaReferralLabel,
  BINOLLA_REFERRAL_SIGNUP_URL,
} from '@constants/binolla';
import { ROUTES } from '@constants/routes';
import { useT } from '@shared/i18n';
import { openExternalLink } from '@shared/telegram/telegramWebApp';
import type { OnboardingStepOneContent } from '../../types';
import styles from './OnboardingStepOne.module.css';

export type OnboardingStepOneProps = {
  content: OnboardingStepOneContent;
};

export function OnboardingStepOne({ content }: OnboardingStepOneProps) {
  const t = useT();

  return (
    <section className={styles.step} aria-label={t('onboarding.aria')}>
      <Text as="h1" variant="display" tone="primary" align="center" className={styles.title}>
        {content.title}
      </Text>

      <Text variant="body" tone="onboarding" align="center" className={styles.description}>
        {content.description}
      </Text>

      <div className={styles.tilesSection}>
        <AppLinkTiles />
      </div>

      <Link className={styles.referralCta} to={ROUTES.signup}>
        {getBinollaReferralLabel()}
      </Link>

      <button
        type="button"
        className={styles.referralCta}
        onClick={() => openExternalLink(BINOLLA_REFERRAL_SIGNUP_URL)}
      >
        {t('onboarding.step1.openPartner')}
      </button>

      <div className={styles.cardSection}>
        <TradingPreviewCard />
      </div>

      <ul className={styles.keyPoints}>
        {content.keyPoints.map((point) => (
          <li key={point.id}>
            <KeyPoint text={point.text} variant={point.variant} />
          </li>
        ))}
      </ul>

      <Text variant="caption-xs" tone="disclaimer" align="center" className={styles.footnote}>
        {content.footnote}
      </Text>
    </section>
  );
}
