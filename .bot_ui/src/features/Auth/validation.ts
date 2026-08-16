import { t } from '@shared/i18n';
import type {
  ActivationFormValues,
  FieldErrors,
  LoginFormValues,
  SignupFormValues,
} from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_PATTERN = /^@?[a-zA-Z0-9_]{5,32}$/;
const MIN_PASSWORD_LENGTH = 8;

export function required(value: string, label: string): string | undefined {
  if (!value.trim()) {
    return t('validation.required', { label });
  }

  return undefined;
}

export function emailRule(value: string): string | undefined {
  const missing = required(value, t('validation.label.email'));
  if (missing) {
    return missing;
  }

  if (!EMAIL_PATTERN.test(value.trim())) {
    return t('validation.emailInvalid');
  }

  return undefined;
}

export function passwordRule(value: string): string | undefined {
  const missing = required(value, t('validation.label.password'));
  if (missing) {
    return missing;
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    return t('validation.passwordMin', { min: MIN_PASSWORD_LENGTH });
  }

  return undefined;
}

export function telegramRule(value: string): string | undefined {
  const missing = required(value, t('validation.label.telegramId'));
  if (missing) {
    return missing;
  }

  if (!TELEGRAM_PATTERN.test(value.trim())) {
    return t('validation.telegramInvalid');
  }

  return undefined;
}

export function optionalTelegramRule(value: string): string | undefined {
  if (!value.trim()) {
    return undefined;
  }

  return telegramRule(value);
}

export function validateLoginForm(values: LoginFormValues): FieldErrors<keyof LoginFormValues> {
  return {
    email: emailRule(values.email),
    password: passwordRule(values.password),
  };
}

export function validateSignupForm(values: SignupFormValues): FieldErrors<keyof SignupFormValues> {
  return {
    fullName: required(values.fullName, t('validation.label.fullName')),
    email: emailRule(values.email),
    password: passwordRule(values.password),
    country: required(values.country, t('validation.label.country')),
    telegramId: optionalTelegramRule(values.telegramId),
    binollaAccount: undefined,
  };
}

export function validateActivationForm(
  values: ActivationFormValues,
): FieldErrors<keyof ActivationFormValues> {
  return {
    activationKey: required(values.activationKey, t('validation.label.activationKey')),
  };
}

export function hasFieldErrors<T extends string>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some((message) => Boolean(message));
}
