import { Toggle } from '@components/atoms/Toggle';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './ToggleRow.module.css';

export type ToggleRowProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

export function ToggleRow({ label, checked, onChange, className }: ToggleRowProps) {
  return (
    <div className={cn(styles.row, className)}>
      <Text variant="body-sm" tone="body" className={styles.label}>
        {label}
      </Text>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
