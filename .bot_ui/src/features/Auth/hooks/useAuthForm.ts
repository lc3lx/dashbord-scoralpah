import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { t } from '@shared/i18n';
import type { FieldErrors, FormStatus } from '../types';
import { hasFieldErrors } from '../validation';

export type UseAuthFormOptions<T extends Record<string, string>> = {
  initialValues: T;
  validate: (values: T) => FieldErrors<keyof T & string>;
  onSubmit: (values: T) => Promise<void>;
};

export type UseAuthFormResult<T extends Record<string, string>> = {
  values: T;
  fieldErrors: FieldErrors<keyof T & string>;
  status: FormStatus;
  serverError: string | null;
  isSubmitDisabled: boolean;
  setField: (field: keyof T & string, value: string) => void;
  clearErrors: () => void;
  submit: (event?: FormEvent) => Promise<void>;
};

export function useAuthForm<T extends Record<string, string>>({
  initialValues,
  validate,
  onSubmit,
}: UseAuthFormOptions<T>): UseAuthFormResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<keyof T & string>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setServerError(null);
    setStatus('idle');
  }, []);

  const setField = useCallback((field: keyof T & string, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setServerError(null);
    setStatus((current) => (current === 'loading' ? current : 'idle'));
  }, []);

  const submit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();

      const errors = validate(values);
      const filtered = Object.fromEntries(
        Object.entries(errors).filter(([, message]) => Boolean(message)),
      ) as FieldErrors<keyof T & string>;

      if (hasFieldErrors(filtered)) {
        setFieldErrors(filtered);
        setStatus('error');
        setServerError(null);
        return;
      }

      setFieldErrors({});
      setServerError(null);
      setStatus('loading');

      try {
        await onSubmit(values);
        setStatus('success');
      } catch (err) {
        const message =
          err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
            ? err.message
            : t('common.errorGeneric');
        setServerError(message);
        setStatus('error');
      }
    },
    [onSubmit, validate, values],
  );

  const isSubmitDisabled = useMemo(
    () => status === 'loading' || status === 'success',
    [status],
  );

  return {
    values,
    fieldErrors,
    status,
    serverError,
    isSubmitDisabled,
    setField,
    clearErrors,
    submit,
  };
}
