import type { ReactNode } from 'react';
import { cn } from '@utils/cn';
import styles from './AuthenticationForm.module.css';

export type AuthenticationFormProps = {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  footerClassName?: string;
  spacing?: 'default' | 'none';
};

export function AuthenticationForm({
  children,
  footer,
  className,
  footerClassName,
  spacing = 'default',
}: AuthenticationFormProps) {
  return (
    <section
      className={cn(
        styles.form,
        spacing === 'none' && styles.spacingNone,
        className,
      )}
      aria-label="Authentication form"
    >
      <div className={styles.fields}>{children}</div>
      {footer && <div className={cn(styles.footer, footerClassName)}>{footer}</div>}
    </section>
  );
}
