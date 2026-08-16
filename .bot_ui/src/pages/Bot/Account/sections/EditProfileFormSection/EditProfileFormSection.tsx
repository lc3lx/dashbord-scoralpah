import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@components/atoms/Input';
import { Text } from '@components/atoms/Text';
import { FormField } from '@components/molecules/FormField';
import { AuthServerError, AuthSubmitButton, type FormStatus } from '@features/Auth';
import { ROUTES } from '@constants/routes';
import { useT } from '@shared/i18n';
import type { EditProfileCopy, EditProfileFormValues } from '../../types';
import styles from './EditProfileFormSection.module.css';

export type EditProfileFormSectionProps = {
  copy: EditProfileCopy;
  values: EditProfileFormValues;
  fieldErrors: Partial<Record<keyof EditProfileFormValues, string>>;
  serverError: string | null;
  status: FormStatus;
  isSubmitDisabled: boolean;
  onFieldChange: (field: keyof EditProfileFormValues, value: string) => void;
  onSubmit: (event?: FormEvent) => void;
};

export function EditProfileFormSection({
  copy,
  values,
  fieldErrors,
  serverError,
  status,
  isSubmitDisabled,
  onFieldChange,
  onSubmit,
}: EditProfileFormSectionProps) {
  const t = useT();

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <FormField id="edit-full-name" label={copy.fullNameLabel} error={fieldErrors.fullName}>
        <Input
          id="edit-full-name"
          name="fullName"
          autoComplete="name"
          placeholder={copy.fullNamePlaceholder}
          value={values.fullName}
          hasError={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? 'edit-full-name-error' : undefined}
          onChange={(event) => onFieldChange('fullName', event.target.value)}
        />
      </FormField>

      <FormField id="edit-country" label={copy.countryLabel} error={fieldErrors.country}>
        <Input
          id="edit-country"
          name="country"
          autoComplete="country-name"
          placeholder={copy.countryPlaceholder}
          value={values.country}
          hasError={Boolean(fieldErrors.country)}
          aria-describedby={fieldErrors.country ? 'edit-country-error' : undefined}
          onChange={(event) => onFieldChange('country', event.target.value)}
        />
      </FormField>

      <FormField id="edit-telegram" label={copy.telegramLabel} error={fieldErrors.telegramId}>
        <Input
          id="edit-telegram"
          name="telegramId"
          autoComplete="username"
          placeholder={copy.telegramPlaceholder}
          value={values.telegramId}
          hasError={Boolean(fieldErrors.telegramId)}
          aria-describedby={fieldErrors.telegramId ? 'edit-telegram-error' : undefined}
          onChange={(event) => onFieldChange('telegramId', event.target.value)}
        />
      </FormField>

      <FormField id="edit-binolla" label={copy.binollaLabel} error={fieldErrors.binollaAccountId}>
        <Input
          id="edit-binolla"
          name="binollaAccountId"
          autoComplete="off"
          placeholder={copy.binollaPlaceholder}
          value={values.binollaAccountId}
          hasError={Boolean(fieldErrors.binollaAccountId)}
          aria-describedby={
            fieldErrors.binollaAccountId
              ? 'edit-binolla-error'
              : copy.binollaHelpText
                ? 'edit-binolla-help'
                : undefined
          }
          onChange={(event) => onFieldChange('binollaAccountId', event.target.value)}
        />
      </FormField>

      {copy.binollaHelpText ? (
        <Text variant="caption" tone="caption" id="edit-binolla-help" className={styles.help}>
          {copy.binollaHelpText}{' '}
          <Link to={ROUTES.linkBinolla} className={styles.registerLink}>
            {copy.binollaRegisterLabel ?? t('account.edit.registerFallback')}
          </Link>
        </Text>
      ) : null}

      <AuthServerError message={serverError} />

      <div className={styles.actions}>
        <AuthSubmitButton label={copy.submitLabel} status={status} disabled={isSubmitDisabled} />
      </div>
    </form>
  );
}
