import { Input } from '@components/atoms/Input';
import { PasswordInput } from '@components/atoms/PasswordInput';
import { FormField } from '@components/molecules/FormField';
import { AuthBrand, AuthHero, AuthServerError, AuthShell } from '@features/Auth';
import { BINOLLA_REFERRAL_SIGNUP_URL } from '@constants/binolla';
import { useT } from '@shared/i18n';
import {
  useBinollaPlatformAuth,
  type BinollaAuthMode,
} from './hooks/useBinollaPlatformAuth';
import styles from './LinkBinollaPage.module.css';

export type BinollaPlatformAuthProps = {
  mode: BinollaAuthMode;
  onToggleMode?: () => void;
};

export function BinollaPlatformAuth({ mode, onToggleMode }: BinollaPlatformAuthProps) {
  const t = useT();
  const flow = useBinollaPlatformAuth(mode, onToggleMode);
  const isLogin = mode === 'login';

  return (
    <AuthShell
      ariaLabel={isLogin ? t('binolla.auth.loginAria') : t('binolla.auth.signupAria')}
      glows={['top-right']}
      bodyClassName={styles.body}
    >
      <AuthBrand />

      <div className={styles.hero}>
        <AuthHero
          title={isLogin ? t('binolla.auth.loginTitle') : t('binolla.auth.signupTitle')}
          description={isLogin ? t('binolla.auth.loginDesc') : t('binolla.auth.signupDesc')}
          titleVariant="h2"
          descriptionTone="caption"
        />
      </div>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          void flow.submitCredentials();
        }}
        noValidate
      >
        <FormField id="binolla-email" label={t('binolla.auth.emailLabel')} error={undefined}>
          <Input
            id="binolla-email"
            type="email"
            name="email"
            autoComplete="username"
            placeholder={t('binolla.auth.emailPlaceholder')}
            value={flow.email}
            onChange={(event) => flow.setEmail(event.target.value)}
          />
        </FormField>

        <FormField id="binolla-password" label={t('binolla.auth.passwordLabel')} error={undefined}>
          <PasswordInput
            id="binolla-password"
            name="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            value={flow.password}
            onChange={(event) => flow.setPassword(event.target.value)}
          />
        </FormField>

        <p className={styles.help}>
          {t('binolla.auth.help', { url: BINOLLA_REFERRAL_SIGNUP_URL })}
        </p>

        <AuthServerError message={flow.error} />

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={flow.status === 'loading' || flow.status === 'success'}
          >
            {flow.status === 'loading'
              ? isLogin
                ? t('binolla.auth.loggingIn')
                : t('binolla.auth.creating')
              : flow.status === 'success'
                ? t('binolla.auth.entering')
                : isLogin
                  ? t('binolla.auth.loginCta')
                  : t('binolla.auth.signupCta')}
          </button>

          {flow.canEnterViaTelegram ? (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => void flow.enterBotWithTelegram()}
              disabled={flow.status === 'loading'}
            >
              {t('binolla.auth.enterViaTelegram')}
            </button>
          ) : null}

          <button type="button" className={styles.secondaryBtn} onClick={flow.goToOtherMode}>
            {isLogin ? t('binolla.auth.goSignup') : t('binolla.auth.goLogin')}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
