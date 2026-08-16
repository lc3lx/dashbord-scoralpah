import { Outlet, useLocation } from 'react-router-dom';
import styles from './AppShell.module.css';

/**
 * Website shell: full-bleed on phones, wider centered column on laptop+.
 * Admin console uses a wide viewport so tables fit on laptop.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  return (
    <div className={`${styles.shell} ${isAdmin ? styles.shellAdmin : ''}`}>
      <div className={`${styles.viewport} ${isAdmin ? styles.viewportAdmin : ''}`}>
        <Outlet />
      </div>
    </div>
  );
}
