import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { meApi } from '@shared/api';
import { ROUTES } from '@constants/routes';
import styles from './AdminShell.module.css';

const NAV = [
  { to: ROUTES.adminUsers, label: 'Users' },
  { to: ROUTES.adminBots, label: 'Bots' },
  { to: ROUTES.adminTrades, label: 'Trades' },
  { to: ROUTES.adminApprovals, label: 'Approvals' },
  { to: ROUTES.adminMarketing, label: 'Marketing' },
  { to: ROUTES.adminNotifications, label: 'Notifications' },
  { to: ROUTES.adminAudit, label: 'Audit' },
] as const;

export default function AdminShell() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await meApi.get();
        const isAdmin =
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
            hypothesisId: 'H4+H5',
            location: 'AdminShell.tsx',
            message: 'admin shell gate',
            data: { isAdmin, role: me.role ?? null, allowed: isAdmin },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        if (!cancelled) {
          setAllowed(isAdmin);
          setChecking(false);
        }
      } catch {
        if (!cancelled) {
          setAllowed(false);
          setChecking(false);
          navigate(ROUTES.login, { replace: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (checking) {
    return <div className={styles.gate}>Checking admin access…</div>;
  }

  if (!allowed) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.nav}>
        <p className={styles.brand}>ScarAlpha Admin</p>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink to={ROUTES.home} className={styles.navLink}>
          ← Back to app
        </NavLink>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
