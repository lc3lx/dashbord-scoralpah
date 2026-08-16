import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@utils/cn';
import type { ButtonVariant } from '../../types';
import styles from './Button.module.css';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children?: ReactNode;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary: styles.primary,
  ghost: styles.ghost,
  'text-link': styles.textLink,
  icon: styles.icon,
};

export function Button({
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles.button, variantClassMap[variant], fullWidth && styles.fullWidth, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
