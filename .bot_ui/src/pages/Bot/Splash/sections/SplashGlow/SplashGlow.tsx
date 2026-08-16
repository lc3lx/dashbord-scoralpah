import { imageAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import styles from './SplashGlow.module.css';

export function SplashGlow() {
  return (
    <div className={styles.glow} aria-hidden="true">
      <div className={styles.spread}>
        <Icon src={imageAssets.splashGlowEllipse} decorative className={styles.image} />
      </div>
    </div>
  );
}
