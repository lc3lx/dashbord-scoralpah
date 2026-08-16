import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi, meApi } from '@shared/api';
import { routeAfterAuth } from '@shared/access/botAccess';
import {
  useAuthForm,
  validateActivationForm,
  type ActivationFormValues,
} from '@features/Auth';
import { ACTIVATION_INITIAL_VALUES } from '../data/activation.mock';

/**
 * Activation keys are obsolete. Redirect users to account status.
 */
export function useActivationForm() {
  const navigate = useNavigate();

  useEffect(() => {
    void Promise.all([accountApi.status(), meApi.get()])
      .then(([status, me]) => {
        navigate(routeAfterAuth(status.botAccess, me.isAdmin, me.role), { replace: true });
      })
      .catch(() => {
        navigate(ROUTES.login, { replace: true });
      });
  }, [navigate]);

  const handleSubmit = useCallback(async (_values: ActivationFormValues) => {
    const [status, me] = await Promise.all([accountApi.status(), meApi.get()]);
    navigate(routeAfterAuth(status.botAccess, me.isAdmin, me.role));
  }, [navigate]);

  const form = useAuthForm<ActivationFormValues>({
    initialValues: { ...ACTIVATION_INITIAL_VALUES },
    validate: validateActivationForm,
    onSubmit: handleSubmit,
  });

  const enterApp = useCallback(() => {
    navigate(ROUTES.settings);
  }, [navigate]);

  return {
    ...form,
    showSuccess: false,
    enterApp,
  };
}
