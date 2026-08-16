import type { FormEvent } from 'react';
import { PasswordInput } from '@components/atoms/PasswordInput';
import { FormField } from '@components/molecules/FormField';
import { AuthServerError, AuthSubmitButton, type FormStatus } from '@features/Auth';
import type { ChangePasswordCopy, ChangePasswordFormValues } from '../../types';
import styles from './ChangePasswordFormSection.module.css';

export type ChangePasswordFormSectionProps = {
  copy: ChangePasswordCopy;
  values: ChangePasswordFormValues;
  fieldErrors: Partial<Record<keyof ChangePasswordFormValues, string>>;
  serverError: string | null;
  status: FormStatus;
  isSubmitDisabled: boolean;
  onFieldChange: (field: keyof ChangePasswordFormValues, value: string) => void;
  onSubmit: (event?: FormEvent) => void;
};

export function ChangePasswordFormSection({
  copy,
  values,
  fieldErrors,
  serverError,
  status,
  isSubmitDisabled,
  onFieldChange,
  onSubmit,
}: ChangePasswordFormSectionProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <FormField
        id="current-password"
        label={copy.currentPasswordLabel}
        error={fieldErrors.currentPassword}
      >
        <PasswordInput
          id="current-password"
          name="currentPassword"
          autoComplete="current-password"
          placeholder={copy.currentPasswordPlaceholder}
          value={values.currentPassword}
          hasError={Boolean(fieldErrors.currentPassword)}
          aria-describedby={
            fieldErrors.currentPassword ? 'current-password-error' : undefined
          }
          onChange={(event) => onFieldChange('currentPassword', event.target.value)}
        />
      </FormField>

      <FormField id="new-password" label={copy.newPasswordLabel} error={fieldErrors.newPassword}>
        <PasswordInput
          id="new-password"
          name="newPassword"
          autoComplete="new-password"
          placeholder={copy.newPasswordPlaceholder}
          value={values.newPassword}
          hasError={Boolean(fieldErrors.newPassword)}
          aria-describedby={fieldErrors.newPassword ? 'new-password-error' : undefined}
          onChange={(event) => onFieldChange('newPassword', event.target.value)}
        />
      </FormField>

      <FormField
        id="confirm-password"
        label={copy.confirmPasswordLabel}
        error={fieldErrors.confirmPassword}
      >
        <PasswordInput
          id="confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={copy.confirmPasswordPlaceholder}
          value={values.confirmPassword}
          hasError={Boolean(fieldErrors.confirmPassword)}
          aria-describedby={
            fieldErrors.confirmPassword ? 'confirm-password-error' : undefined
          }
          onChange={(event) => onFieldChange('confirmPassword', event.target.value)}
        />
      </FormField>

      <AuthServerError message={serverError} />

      <div className={styles.actions}>
        <AuthSubmitButton label={copy.submitLabel} status={status} disabled={isSubmitDisabled} />
      </div>
    </form>
  );
}
