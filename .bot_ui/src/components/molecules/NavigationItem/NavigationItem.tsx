import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './NavigationItem.module.css';

export type NavigationItemProps = {
  iconSrc: string;
  label?: string;
  active?: boolean;
  iconClassName?: string;
  onClick?: () => void;
  className?: string;
};

export function NavigationItem({
  iconSrc,
  label,
  active = false,
  iconClassName,
  onClick,
  className,
}: NavigationItemProps) {
  return (
    <button
      type="button"
      className={cn(styles.item, active && styles.active, className)}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        src={iconSrc}
        size="nav"
        decorative
        className={cn(styles.icon, iconClassName)}
      />
      {label && (
        <Text
          variant="nav"
          tone={active ? 'nav-active' : 'muted'}
          className={styles.label}
        >
          {label}
        </Text>
      )}
    </button>
  );
}
