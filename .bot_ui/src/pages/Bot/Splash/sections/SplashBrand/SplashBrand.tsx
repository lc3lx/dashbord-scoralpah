import { brandAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { useT } from '@shared/i18n';
import styles from './SplashBrand.module.css';

export function SplashBrand() {
  const t = useT();
  return (
    <div className={styles.brand} role="img" aria-label={t('splash.brandAria')}>
      <Icon
        src={brandAssets.logoPart2}
        size="fill"
        decorative={false}
        alt=""
        className={styles.partIcon}
      />
      <Icon
        src={brandAssets.logoPart3}
        size="fill"
        decorative={false}
        alt=""
        className={styles.partAlpha}
      />
      <Icon
        src={brandAssets.logoPart1}
        size="fill"
        decorative={false}
        alt=""
        className={styles.partScar}
      />
    </div>
  );
}
