import { optionalTelegramRule, passwordRule, required } from '@features/Auth';
import type { FieldErrors } from '@features/Auth';
import { t } from '@shared/i18n';
import type { ChangePasswordFormValues, EditProfileFormValues } from '../types';

export function validateEditProfileForm(
  values: EditProfileFormValues,
): FieldErrors<keyof EditProfileFormValues> {
  return {
    fullName: required(values.fullName, t('validation.label.fullName')),
    country: required(values.country, t('validation.label.country')),
    telegramId: optionalTelegramRule(values.telegramId),
  };
}

export function validateChangePasswordForm(
  values: ChangePasswordFormValues,
): FieldErrors<keyof ChangePasswordFormValues> {
  const currentPassword = passwordRule(values.currentPassword);
  const newPassword = passwordRule(values.newPassword);

  let confirmPassword: string | undefined;
  const missingConfirm = required(values.confirmPassword, t('validation.label.confirmPassword'));

  if (missingConfirm) {
    confirmPassword = missingConfirm;
  } else if (values.confirmPassword !== values.newPassword) {
    confirmPassword = t('validation.passwordsMismatch');
  }

  return {
    currentPassword,
    newPassword,
    confirmPassword,
  };
}
