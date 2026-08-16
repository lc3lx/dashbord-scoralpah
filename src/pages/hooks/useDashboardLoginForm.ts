import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { meApi } from '@shared/api';
import {
  authService,
  useAuthForm,
  validateLoginForm,
  type LoginFormValues,
} from '@features/Auth';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
import { LOGIN_INITIAL_VALUES } from '@pages/Bot/Login/data/login.mock';

function isAdminMe(me: { isAdmin?: boolean; role?: string | null }): boolean {
  return Boolean(me.isAdmin) || String(me.role ?? '').toLowerCase() === 'admin';
}

/**
 * Website dashboard login — admins go to /admin only.
 * Never dump operators into the Telegram bot trading UI.
 */
export function useDashboardLoginForm() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      setInfo(null);
      await authService.login(values);
      const me = await meApi.get();
      const admin = isAdminMe(me);
      const destination = admin ? ROUTES.admin : ROUTES.login;
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '1892a4',
        },
        body: JSON.stringify({
          sessionId: '1892a4',
          runId: 'post-fix',
          hypothesisId: 'H6+H7',
          location: 'useDashboardLoginForm.ts',
          message: 'dashboard post-login',
          data: {
            isAdmin: Boolean(me.isAdmin),
            role: me.role ?? null,
            adminResolved: admin,
            destination,
            baseUrl: String(import.meta.env.BASE_URL ?? ''),
            path: typeof window !== 'undefined' ? window.location.pathname : null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!admin) {
        tokenStore.clear();
        throw { message: 'لوحة التحكم للمسؤولين فقط — استخدم تطبيق البوت للتداول.' };
      }
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

  return {
    ...form,
    goToSignup,
    onForgotPassword,
    continueWithTelegram: async () => {
      setInfo('تسجيل الدخول عبر تيليجرام متاح من تطبيق البوت فقط.');
    },
    info,
  };
}
