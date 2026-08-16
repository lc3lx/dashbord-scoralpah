import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi } from '@shared/api';
import { routeForBotAccess } from '@shared/access/botAccess';
import {
  authService,
  useAuthForm,
  validateLoginForm,
  type LoginFormValues,
} from '@features/Auth';
import { t } from '@shared/i18n';
import { LOGIN_INITIAL_VALUES } from '../data/login.mock';

export function useLoginForm() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      setInfo(null);
      await authService.login(values);
      const status = await accountApi.status();
      navigate(routeForBotAccess(status.botAccess), { replace: true });
    },
    [navigate],
  );

  const form = useAuthForm<LoginFormValues>({
    initialValues: { ...LOGIN_INITIAL_VALUES },
    validate: validateLoginForm,
    onSubmit: handleSubmit,
  });

  const goToSignup = useCallback(() => {
    navigate(ROUTES.signup);
  }, [navigate]);

  const onForgotPassword = useCallback(() => {
    setInfo(t('login.forgotInfo'));
  }, []);

  const continueWithTelegram = useCallback(async () => {
    setInfo(null);
    try {
      await authService.loginWithTelegram();
      const status = await accountApi.status();
      navigate(routeForBotAccess(status.botAccess), { replace: true });
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : t('auth.authFailed');
      setInfo(message);
    }
  }, [navigate]);

  return {
    ...form,
    goToSignup,
    onForgotPassword,
    continueWithTelegram,
    info,
  };
}
