import type { ReactNode } from 'react';
import { cn } from '@utils/cn';
import styles from './PageContent.module.css';

export type PageContentProps = {
  children: ReactNode;
  className?: string;
  centered?: boolean;
};

export function PageContent({ children, className, centered = false }: PageContentProps) {
  return (
    <div className={cn(styles.content, centered && styles.centered, className)}>{children}</div>
  );
}
