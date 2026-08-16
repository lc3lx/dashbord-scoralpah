import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { tokenStore } from '@shared/auth/tokenStore';

/** Auth pages that still need a JWT (e.g. link Binolla) without bottom nav. */
export function RequireAuth() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(tokenStore.isAuthenticated());
    setReady(true);
  }, [location.pathname]);

  if (!ready) return null;
  if (!authed) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
