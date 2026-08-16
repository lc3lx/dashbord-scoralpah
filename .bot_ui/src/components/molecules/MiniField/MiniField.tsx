import { Chip } from '@components/atoms/Chip';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import type { ChipTone } from '../../types';
import styles from './MiniField.module.css';

export type MiniFieldProps = {
  label: string;
  status: string;
  tone?: ChipTone;
  labelTone?: 'muted' | 'primary';
  className?: string;
};

export function MiniField({
  label,
  status,
  tone = 'neutral',
  labelTone = 'muted',
  className,
}: MiniFieldProps) {
  return (
    <div className={cn(styles.field, className)}>
      <Text
        variant="caption"
        tone={labelTone === 'primary' ? 'primary' : 'muted'}
        className={cn(styles.label, labelTone === 'primary' && styles.labelPrimary)}
      >
        {label}
      </Text>
      <Chip label={status} tone={tone} style="solid" />
    </div>
  );
}
