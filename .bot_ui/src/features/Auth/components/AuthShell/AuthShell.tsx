import type { ReactNode } from 'react';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { cn } from '@utils/cn';
import type { GlowVariant } from '@components/types';
import styles from './AuthShell.module.css';

export type AuthShellProps = {
  ariaLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  glows?: GlowVariant[];
  contentClassName?: string;
  bodyClassName?: string;
};

export function AuthShell({
  ariaLabel,
  children,
  footer,
  glows = ['top-right'],
  contentClassName,
  bodyClassName,
}: AuthShellProps) {
  return (
    <main className={styles.page} aria-label={ariaLabel}>
      {glows.map((variant) => (
        <BackgroundGlow key={variant} variant={variant} />
      ))}

      <div className={cn(styles.body, bodyClassName)}>
        <div className={cn(styles.content, contentClassName)}>{children}</div>
      </div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </main>
  );
}
