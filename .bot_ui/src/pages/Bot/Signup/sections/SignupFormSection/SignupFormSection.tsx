import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@components/atoms/Input';
import { PasswordInput } from '@components/atoms/PasswordInput';
import { FormField } from '@components/molecules/FormField';
import { AuthenticationForm } from '@components/organisms/AuthenticationForm';
import { AuthServerError, AuthSubmitButton, type FormStatus, type SignupFormValues } from '@features/Auth';
import { ROUTES } from '@constants/routes';
import { t } from '@shared/i18n';
import type { SignupCopy } from '../../types';
import styles from './SignupFormSection.module.css';

export type SignupFormSectionProps = {
  copy: SignupCopy;
  values: SignupFormValues;
  fieldErrors: Partial<Record<keyof SignupFormValues, string>>;
  serverError: string | null;
  status: FormStatus;
  isSubmitDisabled: boolean;
  onFieldChange: (field: keyof SignupFormValues, value: string) => void;
  onSubmit: (event?: FormEvent) => void;
};

export function SignupFormSection({
  copy,
  values,
  fieldErrors,
  serverError,
  status,
  isSubmitDisabled,
  onFieldChange,
  onSubmit,
}: SignupFormSectionProps) {
  return (
    <form className={styles.formRoot} onSubmit={onSubmit} noValidate>
      <AuthenticationForm className={styles.form} spacing="none">
        <FormField id="signup-full-name" label={copy.fullNameLabel} error={fieldErrors.fullName}>
          <Input
            id="signup-full-name"
            name="fullName"
            autoComplete="name"
            placeholder={copy.fullNamePlaceholder}
            value={values.fullName}
            hasError={Boolean(fieldErrors.fullName)}
            aria-describedby={fieldErrors.fullName ? 'signup-full-name-error' : undefined}
            onChange={(event) => onFieldChange('fullName', event.target.value)}
          />
        </FormField>

        <FormField id="signup-email" label={copy.emailLabel} error={fieldErrors.email}>
          <Input
            id="signup-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            value={values.email}
            hasError={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
            onChange={(event) => onFieldChange('email', event.target.value)}
          />
        </FormField>

        <FormField id="signup-password" label={copy.passwordLabel} error={fieldErrors.password}>
          <PasswordInput
            id="signup-password"
            name="password"
            autoComplete="new-password"
            placeholder={copy.passwordPlaceholder}
            value={values.password}
            hasError={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
            onChange={(event) => onFieldChange('password', event.target.value)}
          />
        </FormField>

        <FormField id="signup-country" label={copy.countryLabel} error={fieldErrors.country}>
          <Input
            id="signup-country"
            name="country"
            autoComplete="country-name"
            placeholder={copy.countryPlaceholder}
            value={values.country}
            hasError={Boolean(fieldErrors.country)}
            aria-describedby={fieldErrors.country ? 'signup-country-error' : undefined}
            onChange={(event) => onFieldChange('country', event.target.value)}
          />
        </FormField>

        <FormField id="signup-telegram" label={copy.telegramLabel} error={fieldErrors.telegramId}>
          <Input
            id="signup-telegram"
            name="telegramId"
            autoComplete="username"
            placeholder={copy.telegramPlaceholder}
            value={values.telegramId}
            hasError={Boolean(fieldErrors.telegramId)}
            aria-describedby={fieldErrors.telegramId ? 'signup-telegram-error' : undefined}
            onChange={(event) => onFieldChange('telegramId', event.target.value)}
          />
        </FormField>

        <FormField
          id="signup-binolla"
          label={copy.binollaLabel}
          error={fieldErrors.binollaAccount}
        >
          <Input
            id="signup-binolla"
            name="binollaAccount"
            placeholder={copy.binollaPlaceholder}
            value={values.binollaAccount}
            hasError={Boolean(fieldErrors.binollaAccount)}
            aria-describedby={fieldErrors.binollaAccount ? 'signup-binolla-error' : 'signup-binolla-help'}
            onChange={(event) => onFieldChange('binollaAccount', event.target.value)}
          />
        </FormField>
        <p id="signup-binolla-help" className={styles.help}>
          {t('signup.noAccount')}{' '}
          <Link to={ROUTES.linkBinolla} className={styles.registerLink}>
            {t('signup.createBinolla')}
          </Link>
        </p>
      </AuthenticationForm>

      <AuthServerError message={serverError} />

      <div className={styles.actions}>
        <AuthSubmitButton
          label={copy.submitLabel}
          status={status}
          disabled={isSubmitDisabled}
        />
      </div>
    </form>
  );
}
