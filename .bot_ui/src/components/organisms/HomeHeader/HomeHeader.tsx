import type { ReactNode } from 'react';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './HomeHeader.module.css';

export type HomeHeaderProps = {
  brandName?: string;
  logoSrc?: string;
  action?: ReactNode;
  className?: string;
};

export function HomeHeader({ brandName, logoSrc, action, className }: HomeHeaderProps) {
  const showBrand = Boolean(brandName || logoSrc);

  return (
    <header className={cn(styles.header, !showBrand && styles.headerEnd, className)}>
      {showBrand ? (
        <div className={styles.brand} role="img" aria-label={brandName}>
          {logoSrc ? (
            <div className={styles.logoTile}>
              <img src={logoSrc} alt="" className={styles.logo} width={28} height={28} />
            </div>
          ) : null}
          {brandName ? (
            <Text variant="body" tone="body" className={styles.brandName}>
              {brandName}
            </Text>
          ) : null}
        </div>
      ) : (
        <span />
      )}
      {action ? <div className={styles.action}>{action}</div> : null}
    </header>
  );
}
