import { brandAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { useT } from '@shared/i18n';
import styles from './AuthBrand.module.css';

export function AuthBrand() {
  const t = useT();
  return (
    <div className={styles.brand} role="img" aria-label={t('auth.brandAria')}>
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
