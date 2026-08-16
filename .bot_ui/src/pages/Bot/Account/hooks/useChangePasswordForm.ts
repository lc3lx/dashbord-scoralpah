import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { useAuthForm } from '@features/Auth';
import { accountService } from '../services/accountService';
import { validateChangePasswordForm } from '../utils/validation';
import type { ChangePasswordFormValues } from '../types';

const INITIAL_VALUES: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function useChangePasswordForm() {
  const navigate = useNavigate();
  const copy = accountService.getChangePasswordCopy();

  const handleSubmit = useCallback(
    async (values: ChangePasswordFormValues) => {
      await accountService.changePassword(values);
      navigate(ROUTES.settings);
    },
    [navigate],
  );

  const form = useAuthForm<ChangePasswordFormValues>({
    initialValues: INITIAL_VALUES,
    validate: validateChangePasswordForm,
    onSubmit: handleSubmit,
  });

  return {
    copy,
    ...form,
  };
}

export type UseChangePasswordFormReturn = ReturnType<typeof useChangePasswordForm>;
