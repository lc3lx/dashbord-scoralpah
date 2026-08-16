import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import type { TextTone } from '../../types';
import styles from './StatCard.module.css';

export type StatCardProps = {
  label: string;
  value: string;
  valueTone?: TextTone;
  className?: string;
};

export function StatCard({ label, value, valueTone = 'body', className }: StatCardProps) {
  return (
    <article className={cn(styles.card, className)}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Text variant="h3" tone={valueTone} className={styles.value}>
        {value}
      </Text>
    </article>
  );
}
