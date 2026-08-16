import type { ReactNode } from 'react';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './SettingsSection.module.css';

export type SettingsSectionProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <section className={cn(styles.section, className)}>
      {title && (
        <Text variant="caption" tone="muted" className={styles.title}>
          {title}
        </Text>
      )}
      <div className={styles.content}>{children}</div>
    </section>
  );
}
