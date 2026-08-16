import { cn } from '@utils/cn';
import type { IconSize } from '../../types';
import styles from './Icon.module.css';

export type IconProps = {
  src: string;
  alt?: string;
  size?: IconSize;
  decorative?: boolean;
  className?: string;
};

export function Icon({
  src,
  alt = '',
  size = 'md',
  decorative = true,
  className,
}: IconProps) {
  return (
    <img
      src={src}
      alt={decorative ? '' : alt}
      aria-hidden={decorative || undefined}
      className={cn(styles.icon, styles[size], className)}
    />
  );
}
