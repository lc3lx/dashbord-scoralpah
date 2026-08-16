import type { FormEvent } from 'react';
import { Input } from '@components/atoms/Input';
import { Text } from '@components/atoms/Text';
import { FormField } from '@components/molecules/FormField';
import {
  ActivationPanel,
  type ActivationStatus,
} from '@components/organisms/ActivationPanel';
import {
  AuthServerError,
  AuthSubmitButton,
  type ActivationFormValues,
  type FormStatus,
} from '@features/Auth';
import type { ActivationCopy } from '../../types';
import styles from './ActivationFormSection.module.css';

export type ActivationFormSectionProps = {
  copy: ActivationCopy;
  statusItems: ActivationStatus[];
  values: ActivationFormValues;
  fieldErrors: Partial<Record<keyof ActivationFormValues, string>>;
  serverError: string | null;
  status: FormStatus;
  isSubmitDisabled: boolean;
  onFieldChange: (field: keyof ActivationFormValues, value: string) => void;
  onSubmit: (event?: FormEvent) => void;
};

export function ActivationFormSection({
  copy,
  statusItems,
  values,
  fieldErrors,
  serverError,
  status,
  isSubmitDisabled,
  onFieldChange,
  onSubmit,
}: ActivationFormSectionProps) {
  return (
    <>
      <div className={styles.statusSection}>
        <ActivationPanel items={statusItems} className={styles.statusPanel} />
      </div>

      <form className={styles.formRoot} onSubmit={onSubmit} noValidate>
        <div className={styles.fieldBlock}>
          <FormField
            id="activation-key"
            label={copy.keyLabel}
            error={fieldErrors.activationKey}
            className={styles.field}
          >
            <Input
              id="activation-key"
              name="activationKey"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder={copy.keyPlaceholder}
              value={values.activationKey}
              hasError={Boolean(fieldErrors.activationKey)}
              aria-describedby={
                fieldErrors.activationKey
                  ? 'activation-key-error'
                  : serverError
                    ? 'activation-server-error'
                    : 'activation-hint'
              }
              onChange={(event) => onFieldChange('activationKey', event.target.value)}
            />
          </FormField>
        </div>

        <AuthServerError message={serverError} id="activation-server-error" />

        <div className={styles.actions}>
          <AuthSubmitButton
            label={copy.submitLabel}
            status={status}
            disabled={isSubmitDisabled}
          />
        </div>

        <Text
          id="activation-hint"
          variant="caption"
          align="center"
          className={styles.hint}
        >
          {copy.hint}
        </Text>
      </form>
    </>
  );
}
