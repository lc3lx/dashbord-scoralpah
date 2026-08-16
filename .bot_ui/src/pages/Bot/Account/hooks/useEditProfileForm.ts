import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { useAuthForm } from '@features/Auth';
import { accountService } from '../services/accountService';
import { validateEditProfileForm } from '../utils/validation';
import type { EditProfileFormValues } from '../types';

export function useEditProfileForm() {
  const navigate = useNavigate();
  const copy = accountService.getEditProfileCopy();

  const handleSubmit = useCallback(
    async (values: EditProfileFormValues) => {
      await accountService.updateProfile(values);
      navigate(ROUTES.settings);
    },
    [navigate],
  );

  const form = useAuthForm<EditProfileFormValues>({
    initialValues: accountService.getEditProfileInitialValues(),
    validate: validateEditProfileForm,
    onSubmit: handleSubmit,
  });

  return {
    copy,
    ...form,
  };
}

export type UseEditProfileFormReturn = ReturnType<typeof useEditProfileForm>;
