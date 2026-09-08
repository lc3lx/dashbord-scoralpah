import { AuthBrand, AuthHero, AuthLegalFooter, AuthShell } from '@features/Auth';
import { SecurityNotice } from '@components/molecules/SecurityNotice';
import { Button } from '@components/atoms/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { useDemoLoginForm } from './hooks/useDemoLoginForm';
import { LoginFormSection } from '../Login/sections/LoginFormSection';
import { getDemoLoginCopy } from './data/demoLogin.mock';
import styles from '../Login/LoginPage.module.css';

export default function DemoLoginPage() {
  const copy = getDemoLoginCopy();
  const form = useDemoLoginForm();
  const navigate = useNavigate();

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
        hideCreateAccount
        hideForgotPassword
        onEmailChange={(value) => form.setField('email', value)}
        onPasswordChange={(value) => form.setField('password', value)}
        onForgotPassword={() => undefined}
        onCreateAccount={() => undefined}
        onSubmit={form.submit}
      />
      <Button
        type="button"
        variant="ghost"
        fullWidth
        onClick={() => navigate(ROUTES.login)}
        className={styles.secondaryNav}
      >
        {copy.normalLoginLabel}
      </Button>
      <div className={styles.securitySection}>
        <SecurityNotice title={copy.securityTitle} subtitle={copy.securitySubtitle} />
      </div>
    </AuthShell>
  );
}
