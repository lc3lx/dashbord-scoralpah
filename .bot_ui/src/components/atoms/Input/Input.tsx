import type { InputHTMLAttributes } from 'react';
import { cn } from '@utils/cn';
import styles from './Input.module.css';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function Input({ className, hasError = false, ...rest }: InputProps) {
  return (
    <input
      className={cn(styles.input, hasError && styles.error, className)}
      aria-invalid={hasError || undefined}
      {...rest}
    />
  );
}
