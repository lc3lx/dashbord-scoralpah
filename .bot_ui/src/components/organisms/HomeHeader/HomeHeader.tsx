import type { ReactNode } from 'react';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './HomeHeader.module.css';

export type HomeHeaderProps = {
  title: string;
  subtitle: string;
  action?: ReactNode;
  className?: string;
};

export function HomeHeader({ title, subtitle, action, className }: HomeHeaderProps) {
  return (
    <header className={cn(styles.header, className)}>
      <div className={styles.textBlock}>
        <Text variant="h3" tone="body" className={styles.title}>
          {title}
        </Text>
        <Text variant="caption" tone="caption" className={styles.subtitle}>
          {subtitle}
        </Text>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </header>
  );
}
