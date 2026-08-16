import { imageAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { cn } from '@utils/cn';
import type { GlowVariant } from '../../types';
import styles from './BackgroundGlow.module.css';

export type BackgroundGlowProps = {
  variant?: GlowVariant;
  className?: string;
};

const variantClassMap: Record<GlowVariant, string> = {
  center: styles.center,
  'top-right': styles.topRight,
  bottom: styles.bottom,
};

export function BackgroundGlow({ variant = 'top-right', className }: BackgroundGlowProps) {
  return (
    <div className={cn(styles.glow, variantClassMap[variant], className)} aria-hidden="true">
      <Icon
        src={variant === 'center' ? imageAssets.backgroundGlowEllipse : imageAssets.backgroundShape}
        decorative
        className={styles.image}
      />
    </div>
  );
}
