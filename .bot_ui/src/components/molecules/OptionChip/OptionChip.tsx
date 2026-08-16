import { cn } from '@utils/cn';
import styles from './OptionChip.module.css';

export type OptionChipProps = {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function OptionChip({ label, selected = false, onSelect, className }: OptionChipProps) {
  return (
    <button
      type="button"
      className={cn(styles.chip, selected && styles.selected, className)}
      aria-pressed={selected}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}
