import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountApi, meApi } from '@shared/api';
import { routeAfterAuth } from '@shared/access/botAccess';
import {
  authService,
  useAuthForm,
  validateLoginForm,
  type LoginFormValues,
} from '@features/Auth';
import { LOGIN_INITIAL_VALUES } from '../../Login/data/login.mock';

export function useDemoLoginForm() {
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      await authService.loginDemo(values);
      const [status, me] = await Promise.all([accountApi.status(), meApi.get()]);
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
        body: JSON.stringify({
          sessionId: '1892a4',
          runId: 'demo-login',
          hypothesisId: 'DEMO1',
          location: 'useDemoLoginForm.ts:handleSubmit',
          message: 'demo_login_ok',
          data: {
            isMarketingDemo: Boolean(me.isMarketingDemo),
            botAccess: status.botAccess ?? null,
            destination: routeAfterAuth(status.botAccess, me.isAdmin, me.role),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      navigate(routeAfterAuth(status.botAccess, me.isAdmin, me.role), { replace: true });
    },
    [navigate],
  );

  return useAuthForm<LoginFormValues>({
    initialValues: { ...LOGIN_INITIAL_VALUES },
    validate: validateLoginForm,
    onSubmit: handleSubmit,
  });
}
