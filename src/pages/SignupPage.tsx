/**
 * Website-only Signup — email/password only (no Telegram continue).
 */
import { AuthBrand, AuthHero, AuthLegalFooter, AuthShell } from '@features/Auth';
import { useSignupForm } from '@pages/Bot/Signup/hooks/useSignupForm';
import { SignupFormSection } from '@pages/Bot/Signup/sections/SignupFormSection';
import { SignupSignInPrompt } from '@pages/Bot/Signup/sections/SignupSignInPrompt';
import { getSignupCopy } from '@pages/Bot/Signup/data/signup.mock';
import styles from '@pages/Bot/Signup/SignupPage.module.css';

export default function DashboardSignupPage() {
  const copy = getSignupCopy();
  const form = useSignupForm();

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
      <SignupSignInPrompt
        dividerLabel={copy.dividerLabel}
        promptLabel={copy.promptLabel}
        signInLabel={copy.signInLabel}
        onSignIn={form.goToLogin}
      />
    </AuthShell>
  );
}
