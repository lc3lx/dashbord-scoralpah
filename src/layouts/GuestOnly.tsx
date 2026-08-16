import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { tokenStore } from '@shared/auth/tokenStore';

/** Login / signup — send already-authenticated users into the app. */
export function GuestOnly() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(tokenStore.isAuthenticated());
    setReady(true);
  }, [location.pathname]);

  if (!ready) return null;
  if (authed) {
    return <Navigate to={ROUTES.home} replace />;
  }
  return <Outlet />;
}
