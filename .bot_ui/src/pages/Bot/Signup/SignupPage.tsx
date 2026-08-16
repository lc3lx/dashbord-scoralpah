import { AuthBrand, AuthHero, AuthLegalFooter, AuthShell } from '@features/Auth';
import { Button } from '@components/atoms/Button';
import { hasTelegramInitData } from '@shared/telegram/telegramWebApp';
import { useSignupForm } from './hooks/useSignupForm';
import { SignupFormSection } from './sections/SignupFormSection';
import { SignupSignInPrompt } from './sections/SignupSignInPrompt';
import { getSignupCopy } from './data/signup.mock';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const copy = getSignupCopy();
  const form = useSignupForm();
  const showTelegram = hasTelegramInitData();

  return (
    <AuthShell
      ariaLabel={copy.title}
      bodyClassName={styles.body}
      footer={
        <AuthLegalFooter
          prefix={copy.footerPrefix}
          linkLabel={copy.footerLinkLabel}
          suffix={copy.footerSuffix}
          href={copy.footerHref}
        />
      }
    >
      <div className={styles.brandSection}>
        <AuthBrand />
      </div>
      <div className={styles.heroSection}>
        <AuthHero
          title={copy.title}
          description={copy.description}
          descriptionClassName={styles.heroDescription}
        />
      </div>
      <div className={styles.formSection}>
        <SignupFormSection
          copy={copy}
          values={form.values}
          fieldErrors={form.fieldErrors}
          serverError={form.serverError}
          status={form.status}
          isSubmitDisabled={form.isSubmitDisabled}
          onFieldChange={form.setField}
          onSubmit={form.submit}
        />
      </div>
      {showTelegram ? (
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={() => void form.continueWithTelegram()}
          disabled={form.isSubmitDisabled}
        >
          {copy.telegramContinueLabel}
        </Button>
      ) : null}
      <SignupSignInPrompt
        dividerLabel={copy.dividerLabel}
        promptLabel={copy.promptLabel}
        signInLabel={copy.signInLabel}
        onSignIn={form.goToLogin}
      />
    </AuthShell>
  );
}
