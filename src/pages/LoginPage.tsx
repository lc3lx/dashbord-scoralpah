/**
 * Website-only Login — never offers Telegram continue (no Mini App coupling).
 * Reuses the same form/visuals as the bot Login page.
 */
import { AuthBrand, AuthHero, AuthLegalFooter, AuthShell } from '@features/Auth';
import { SecurityNotice } from '@components/molecules/SecurityNotice';
import { useLoginForm } from '@pages/Bot/Login/hooks/useLoginForm';
import { LoginFormSection } from '@pages/Bot/Login/sections/LoginFormSection';
import { getLoginCopy } from '@pages/Bot/Login/data/login.mock';
import styles from '@pages/Bot/Login/LoginPage.module.css';

export default function DashboardLoginPage() {
  const copy = getLoginCopy();
  const form = useLoginForm();

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
      <div className={styles.securitySection}>
        <SecurityNotice title={copy.securityTitle} subtitle={copy.securitySubtitle} />
      </div>
    </AuthShell>
  );
}
