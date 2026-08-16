import type { ReactNode } from 'react';
import { Label } from '@components/atoms/Label';
import { cn } from '@utils/cn';
import styles from './FormField.module.css';

export type FormFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
  spacing?: 'default' | 'compact';
  error?: string;
};

export function FormField({
  id,
  label,
  children,
  className,
  spacing = 'default',
  error,
}: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className={cn(styles.field, spacing === 'compact' && styles.compact, className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
