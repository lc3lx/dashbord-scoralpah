import { cn } from '@utils/cn';
import { Icon } from '../Icon';
import styles from './Avatar.module.css';

export type AvatarProps = {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn(styles.avatar, styles[size], className)}>
      <Icon src={src} alt={alt} size="trade" decorative={false} className={styles.image} />
    </div>
  );
}
