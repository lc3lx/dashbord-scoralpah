import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '@utils/cn';
import styles from './Label.module.css';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

export function Label({ className, children, ...rest }: LabelProps) {
  return (
    <label className={cn(styles.label, className)} {...rest}>
      {children}
    </label>
  );
}
