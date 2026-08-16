import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { meApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';

/** Auth pages that still need a JWT (e.g. link Binolla) without bottom nav. */
export function RequireAuth() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [adminBypass, setAdminBypass] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const hasToken = tokenStore.isAuthenticated();
      if (!hasToken) {
        if (!cancelled) {
          setAuthed(false);
          setAdminBypass(false);
          setReady(true);
        }
        return;
      }
      let isAdmin = false;
      try {
        const me = await meApi.get();
        isAdmin = Boolean(me.isAdmin);
      } catch {
        isAdmin = false;
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
          location: 'RequireAuth.tsx',
          message: 'require-auth gate',
          data: {
            pathname: location.pathname,
            isAdmin,
            onLinkBinolla: location.pathname === ROUTES.linkBinolla,
            willBypassBinolla: isAdmin && location.pathname === ROUTES.linkBinolla,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!cancelled) {
        setAuthed(true);
        setAdminBypass(isAdmin && location.pathname === ROUTES.linkBinolla);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (!ready) return null;
  if (!authed) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }
  // Admins must not stay on Binolla link — send them to the admin console.
  if (adminBypass) {
    return <Navigate to={ROUTES.admin} replace />;
  }
  return <Outlet />;
}
