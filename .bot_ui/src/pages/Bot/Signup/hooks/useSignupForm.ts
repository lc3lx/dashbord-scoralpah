import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi } from '@shared/api';
import { routeForBotAccess } from '@shared/access/botAccess';
import {
  authService,
  useAuthForm,
  validateSignupForm,
  type SignupFormValues,
} from '@features/Auth';
import { SIGNUP_INITIAL_VALUES } from '../data/signup.mock';

export function useSignupForm() {
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (values: SignupFormValues) => {
      await authService.signup(values);
      const ssid = values.binollaAccount?.trim();
      if (ssid) {
        const { binollaApi } = await import('@shared/api');
        await binollaApi.connect({ ssid, accountType: 'Demo' });
      }
      const status = await accountApi.status();
      navigate(routeForBotAccess(status.botAccess), { replace: true });
    },
    [navigate],
  );

  const form = useAuthForm<SignupFormValues>({
    initialValues: { ...SIGNUP_INITIAL_VALUES },
    validate: validateSignupForm,
    onSubmit: handleSubmit,
  });

  const goToLogin = useCallback(() => {
    navigate(ROUTES.login);
  }, [navigate]);

  const continueWithTelegram = useCallback(async () => {
    await authService.loginWithTelegram();
    const status = await accountApi.status();
    navigate(routeForBotAccess(status.botAccess), { replace: true });
  }, [navigate]);

  return {
    ...form,
    goToLogin,
    continueWithTelegram,
  };
}
