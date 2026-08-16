import { Loader } from '@components/atoms/Loader';
import { useT } from '@shared/i18n';
import styles from './SplashLoader.module.css';

export function SplashLoader() {
  const t = useT();

  return (
    <div className={styles.loaderArea}>
      <Loader animated label={t('splash.loading')} />
    </div>
  );
}
