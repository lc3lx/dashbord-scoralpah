import { uiAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './SettingRow.module.css';

export type SettingRowProps = {
  variant?: 'default' | 'home';
  iconSrc: string;
  label: string;
  value: string;
  onClick?: () => void;
  className?: string;
};

export function SettingRow({
  variant = 'default',
  iconSrc,
  label,
  value,
  onClick,
  className,
}: SettingRowProps) {
  const Component = onClick ? 'button' : 'div';
  const isHome = variant === 'home';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      className={cn(
        styles.row,
        isHome && styles.home,
        onClick && styles.interactive,
        className,
      )}
      onClick={onClick}
    >
      <span className={cn(styles.iconWrap, isHome && styles.iconWrapHome)}>
        <Icon src={iconSrc} size="sm" />
      </span>
      <span className={styles.content}>
        <Text
          variant="caption"
          tone="caption"
          className={cn(styles.label, isHome && styles.homeLabel)}
        >
          {label}
        </Text>
        <Text variant="body" tone="body" className={cn(styles.value, isHome && styles.homeValue)}>
          {value}
        </Text>
      </span>
      <Icon src={uiAssets.chevronNav} size="xs" className={styles.chevron} />
    </Component>
  );
}
