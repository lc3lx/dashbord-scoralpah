import { Outlet } from 'react-router-dom';
import { t } from '@shared/i18n';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return (
    <section className={styles.layout} aria-label={t('layout.auth')}>
      <Outlet />
    </section>
  );
}
