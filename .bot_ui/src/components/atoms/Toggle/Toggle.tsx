import { cn } from '@utils/cn';
import styles from './Toggle.module.css';

export type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
};

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn(styles.toggle, checked && styles.checked, className)}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.thumb} aria-hidden="true" />
    </button>
  );
}
