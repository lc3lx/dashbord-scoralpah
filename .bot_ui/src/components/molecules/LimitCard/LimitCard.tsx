import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './LimitCard.module.css';

export type LimitCardProps = {
  iconSrc: string;
  label: string;
  value: string;
  hint: string;
  valueTone?: 'profit' | 'loss';
  className?: string;
};

const valueToneClassMap = {
  profit: styles.valueProfit,
  loss: styles.valueLoss,
} as const;

export function LimitCard({
  iconSrc,
  label,
  value,
  hint,
  valueTone = 'profit',
  className,
}: LimitCardProps) {
  return (
    <article className={cn(styles.card, className)}>
      <div className={styles.header}>
        <Icon src={iconSrc} size="xs" decorative />
        <Text variant="caption" tone="muted" className={styles.label}>
          {label}
        </Text>
      </div>
      <Text variant="h3" className={cn(styles.value, valueToneClassMap[valueTone])}>
        {value}
      </Text>
      <Text variant="caption-xs" tone="muted" className={styles.hint}>
        {hint}
      </Text>
    </article>
  );
}
