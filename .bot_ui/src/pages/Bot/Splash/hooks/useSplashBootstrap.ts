import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi, ApiClientError, meApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { authService } from '@features/Auth';
import { t } from '@shared/i18n';
import { isOnboardingDone } from '@shared/onboarding/onboardingStorage';
import { routeAfterAuth } from '@shared/access/botAccess';
import { bootstrapTelegramWebApp, hasTelegramInitData } from '@shared/telegram/telegramWebApp';

const SPLASH_MIN_MS = 1200;

/**
 * Bootstrap:
 * Telegram Mini App → initData JWT → account status → route
 * Website → existing JWT or onboarding/login (no Telegram required)
 */
export function useSplashBootstrap() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    bootstrapTelegramWebApp();

    const started = Date.now();

    const finish = async (path: string) => {
      const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - started));
      await new Promise((r) => window.setTimeout(r, wait));
      if (active) navigate(path, { replace: true });
    };

    void (async () => {
      try {
        if (!tokenStore.isAuthenticated()) {
          if (hasTelegramInitData()) {
            await authService.loginWithTelegram();
          } else if (!isOnboardingDone()) {
            await finish(ROUTES.onboarding);
            return;
          } else {
            await finish(ROUTES.login);
            return;
          }
        }

        const [status, me] = await Promise.all([accountApi.status(), meApi.get()]);
        const destination = routeAfterAuth(status.botAccess, me.isAdmin, me.role);
        // #region agent log
        fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '1892a4',
          },
          body: JSON.stringify({
            sessionId: '1892a4',
            hypothesisId: 'H2+H5',
            location: 'useSplashBootstrap.ts',
            message: 'splash post-auth navigate',
            data: {
              botAccess: status.botAccess ?? null,
              isAdmin: Boolean(me.isAdmin),
              role: me.role ?? null,
              destination,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        await finish(destination);
      } catch (err) {
        tokenStore.clear();
        const message =
          err instanceof ApiClientError
            ? err.message
            : err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : t('splash.telegramSignInFailed');
        if (active) {
          setError(message);
          if (!isOnboardingDone()) {
            await finish(ROUTES.onboarding);
          } else {
            await finish(ROUTES.login);
          }
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  return { error };
}
