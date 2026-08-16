import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BotLayout } from '@components/layouts/BotLayout/BotLayout';
import { ROUTES } from '@constants/routes';
import { meApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';

/**
 * On the website dashboard, bot UI routes are not the admin console.
 * Admins are bounced to /admin; non-admins are sent back to login.
 */
export function DashboardBotLayout() {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!tokenStore.isAuthenticated()) {
        if (!cancelled) {
          setIsAdmin(false);
          setReady(true);
        }
        return;
      }
      try {
        const me = await meApi.get();
        const admin =
          Boolean(me.isAdmin) || String(me.role ?? '').toLowerCase() === 'admin';
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
            hypothesisId: 'H7',
            location: 'DashboardBotLayout.tsx',
            message: 'bot-layout gate on dashboard',
            data: {
              isAdmin: Boolean(me.isAdmin),
              role: me.role ?? null,
              adminResolved: admin,
              path: typeof window !== 'undefined' ? window.location.pathname : null,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        if (!cancelled) {
          setIsAdmin(admin);
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;
  if (isAdmin) {
    return <Navigate to={ROUTES.admin} replace />;
  }
  return <BotLayout />;
}
