import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { meApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';

/** Login / signup — send already-authenticated users into the app. */
export function GuestOnly() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string>(ROUTES.home);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!tokenStore.isAuthenticated()) {
        if (!cancelled) {
          setAuthed(false);
          setReady(true);
        }
        return;
      }
      let destination: string = ROUTES.home;
      let isAdmin = false;
      try {
        const me = await meApi.get();
        isAdmin = Boolean(me.isAdmin);
        if (isAdmin) destination = ROUTES.admin;
      } catch {
        destination = ROUTES.home;
      }
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '1892a4',
        },
        body: JSON.stringify({
          sessionId: '1892a4',
          hypothesisId: 'H3',
          location: 'GuestOnly.tsx',
          message: 'guest-only authed redirect',
          data: { isAdmin, destination, pathname: location.pathname },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!cancelled) {
        setRedirectTo(destination);
        setAuthed(true);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (!ready) return null;
  if (authed) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
}
