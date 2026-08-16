import type { FormEvent } from 'react';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { PasswordInput } from '@components/atoms/PasswordInput';
import { FormField } from '@components/molecules/FormField';
import { AuthenticationForm } from '@components/organisms/AuthenticationForm';
import { AuthServerError, AuthSubmitButton, type FormStatus } from '@features/Auth';
import type { LoginCopy } from '../../types';
import styles from './LoginFormSection.module.css';

export type LoginFormSectionProps = {
  copy: LoginCopy;
  email: string;
  password: string;
  emailError?: string;
  passwordError?: string;
  serverError: string | null;
  status: FormStatus;
  isSubmitDisabled: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  onSubmit: (event?: FormEvent) => void;
};

export function LoginFormSection({
  copy,
  email,
  password,
  emailError,
  passwordError,
  serverError,
  status,
  isSubmitDisabled,
  onEmailChange,
  onPasswordChange,
  onForgotPassword,
  onCreateAccount,
  onSubmit,
}: LoginFormSectionProps) {
  return (
    <form className={styles.formRoot} onSubmit={onSubmit} noValidate>
      <AuthenticationForm
        className={styles.form}
        footerClassName={styles.forgotRow}
        footer={
          <Button
            type="button"
            variant="text-link"
            onClick={onForgotPassword}
            className={styles.forgotButton}
          >
            {copy.forgotPasswordLabel}
          </Button>
        }
      >
        <FormField id="login-email" label={copy.emailLabel} error={emailError}>
          <Input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            value={email}
            hasError={Boolean(emailError)}
            aria-describedby={emailError ? 'login-email-error' : undefined}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </FormField>

        <FormField id="login-password" label={copy.passwordLabel} error={passwordError}>
          <PasswordInput
            id="login-password"
            name="password"
            placeholder={copy.passwordPlaceholder}
            value={password}
            hasError={Boolean(passwordError)}
            aria-describedby={passwordError ? 'login-password-error' : undefined}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </FormField>
      </AuthenticationForm>

      <AuthServerError message={serverError} />

      <div className={styles.actions}>
        <AuthSubmitButton
          label={copy.submitLabel}
          status={status}
          disabled={isSubmitDisabled}
        />
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={onCreateAccount}
          className={styles.secondary}
        >
          {copy.createAccountLabel}
        </Button>
      </div>
    </form>
  );
}
