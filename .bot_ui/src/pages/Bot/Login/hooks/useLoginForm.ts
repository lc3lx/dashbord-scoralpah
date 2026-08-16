import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi, meApi } from '@shared/api';
import { routeAfterAuth } from '@shared/access/botAccess';
import {
  authService,
  useAuthForm,
  validateLoginForm,
  type LoginFormValues,
} from '@features/Auth';
import { t } from '@shared/i18n';
import { LOGIN_INITIAL_VALUES } from '../data/login.mock';

function debugLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
) {
  // #region agent log
  fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '1892a4',
    },
    body: JSON.stringify({
      sessionId: '1892a4',
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export function useLoginForm() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      setInfo(null);
      await authService.login(values);
      const [status, me] = await Promise.all([accountApi.status(), meApi.get()]);
      const destination = routeAfterAuth(status.botAccess, me.isAdmin, me.role);
      debugLog('H1+H5', 'useLoginForm.ts:handleSubmit', 'post-login navigate', {
        botAccess: status.botAccess ?? null,
        isAdmin: Boolean(me.isAdmin),
        role: me.role ?? null,
        destination,
        baseUrl: String(import.meta.env.BASE_URL ?? ''),
        viaRouteAfterAuth: true,
      });
      navigate(destination, { replace: true });
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
      const [status, me] = await Promise.all([accountApi.status(), meApi.get()]);
      navigate(routeAfterAuth(status.botAccess, me.isAdmin, me.role), { replace: true });
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
