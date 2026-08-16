import { Outlet } from 'react-router-dom';
import styles from './AppShell.module.css';

export function AppShell() {
  return (
    <div className={styles.shell}>
      <div className={styles.viewport}>
        <Outlet />
      </div>
    </div>
  );
}
