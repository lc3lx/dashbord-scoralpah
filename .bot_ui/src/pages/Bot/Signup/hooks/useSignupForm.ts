import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi, meApi } from '@shared/api';
import { routeAfterAuth } from '@shared/access/botAccess';
import {
  authService,
  useAuthForm,
  validateSignupForm,
  type SignupFormValues,
} from '@features/Auth';
import { SIGNUP_INITIAL_VALUES } from '../data/signup.mock';

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
      const [status, me] = await Promise.all([accountApi.status(), meApi.get()]);
      const destination = routeAfterAuth(status.botAccess, me.isAdmin, me.role);
      debugLog('H1+H5', 'useSignupForm.ts:handleSubmit', 'post-signup navigate', {
        botAccess: status.botAccess ?? null,
        isAdmin: Boolean(me.isAdmin),
        role: me.role ?? null,
        destination,
      });
      navigate(destination, { replace: true });
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
    const [status, me] = await Promise.all([accountApi.status(), meApi.get()]);
    navigate(routeAfterAuth(status.botAccess, me.isAdmin, me.role), { replace: true });
  }, [navigate]);

  return {
    ...form,
    goToLogin,
    continueWithTelegram,
  };
}
