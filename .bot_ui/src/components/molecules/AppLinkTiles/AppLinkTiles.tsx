import { Link } from 'react-router-dom';
import { brandAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { ROUTES } from '@constants/routes';
import { useT } from '@shared/i18n';
import { cn } from '@utils/cn';
import styles from './AppLinkTiles.module.css';

export type AppLinkTilesProps = {
  className?: string;
};

export function AppLinkTiles({ className }: AppLinkTilesProps) {
  const t = useT();

  return (
    <div className={cn(styles.tiles, className)}>
      <div className={styles.tile}>
        <div className={cn(styles.tileIcon, styles.scarTile)}>
          <Icon
            src={brandAssets.scarTile}
            size="fill"
            decorative
            className={styles.scarImage}
          />
        </div>
        <Text variant="caption" tone="primary" align="center" className={styles.tileLabel}>
          {t('appLink.scarAlpha')}
        </Text>
      </div>

      <div className={styles.connector}>
        <div className={styles.dots} aria-hidden="true">
          <span className={cn(styles.dot, styles.dotLow)} />
          <span className={cn(styles.dot, styles.dotMid)} />
          <span className={cn(styles.dot, styles.dotHigh)} />
        </div>
        <Text variant="caption-xs" tone="connector" align="center">
          {t('appLink.linked')}
        </Text>
      </div>

      <Link
        className={styles.tile}
        to={ROUTES.signup}
        aria-label={t('appLink.createAccountAria')}
      >
        <div className={cn(styles.tileIcon, styles.binollaTile)}>
          <Icon
            src={brandAssets.binolla}
            size="fill"
            decorative
            className={styles.binollaImage}
          />
        </div>
        <Text variant="caption" tone="primary" align="center" className={styles.tileLabel}>
          {t('appLink.binolla')}
        </Text>
      </Link>
    </div>
  );
}
