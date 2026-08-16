import { AuthBrand, AuthHero, AuthLegalFooter, AuthShell } from '@features/Auth';
import { SecurityNotice } from '@components/molecules/SecurityNotice';
import { Button } from '@components/atoms/Button';
import { hasTelegramInitData } from '@shared/telegram/telegramWebApp';
import { useLoginForm } from './hooks/useLoginForm';
import { LoginFormSection } from './sections/LoginFormSection';
import { getLoginCopy } from './data/login.mock';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const copy = getLoginCopy();
  const form = useLoginForm();
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
        <AuthHero title={copy.title} description={copy.description} />
      </div>
      <LoginFormSection
        copy={copy}
        email={form.values.email}
        password={form.values.password}
        emailError={form.fieldErrors.email}
        passwordError={form.fieldErrors.password}
        serverError={form.serverError}
        status={form.status}
        isSubmitDisabled={form.isSubmitDisabled}
        onEmailChange={(value) => form.setField('email', value)}
        onPasswordChange={(value) => form.setField('password', value)}
        onForgotPassword={form.onForgotPassword}
        onCreateAccount={form.goToSignup}
        onSubmit={form.submit}
      />
      {form.info ? <p>{form.info}</p> : null}
      {showTelegram ? (
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={() => void form.continueWithTelegram()}
          disabled={form.isSubmitDisabled}
        >
          {copy.telegramLabel}
        </Button>
      ) : null}
      <div className={styles.securitySection}>
        <SecurityNotice title={copy.securityTitle} subtitle={copy.securitySubtitle} />
      </div>
    </AuthShell>
  );
}
