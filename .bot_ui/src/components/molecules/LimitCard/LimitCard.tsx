import { Icon } from '@components/atoms/Icon';
import { Input } from '@components/atoms/Input';
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
  editable?: boolean;
  inputValue?: string;
  prefix?: string;
  onInputChange?: (value: string) => void;
  onCommit?: () => void;
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
  editable = false,
  inputValue,
  prefix = '$',
  onInputChange,
  onCommit,
}: LimitCardProps) {
  return (
    <article className={cn(styles.card, className)}>
      <div className={styles.header}>
        <Icon src={iconSrc} size="xs" decorative />
        <Text variant="caption" tone="muted" className={styles.label}>
          {label}
        </Text>
      </div>
      {editable ? (
        <div className={styles.editRow}>
          <Text variant="h3" className={cn(styles.prefix, valueToneClassMap[valueTone])}>
            {prefix}
          </Text>
          <Input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={inputValue ?? ''}
            aria-label={label}
            className={cn(styles.valueInput, valueToneClassMap[valueTone])}
            onChange={(event) => onInputChange?.(event.target.value)}
            onBlur={() => onCommit?.()}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
            }}
          />
        </div>
      ) : (
        <Text variant="h3" className={cn(styles.value, valueToneClassMap[valueTone])}>
          {value}
        </Text>
      )}
      <Text variant="caption-xs" tone="muted" className={styles.hint}>
        {hint}
      </Text>
    </article>
  );
}
