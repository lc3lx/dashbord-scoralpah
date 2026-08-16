import type { ReactNode } from 'react';
import { MiniField } from '@components/molecules/MiniField';
import { cn } from '@utils/cn';
import type { ChipTone } from '../../types';
import styles from './ActivationPanel.module.css';

export type ActivationStatus = {
  label: string;
  status: string;
  tone: ChipTone;
};

export type ActivationPanelProps = {
  items: ActivationStatus[];
  variant?: 'surface' | 'promo';
  className?: string;
  children?: ReactNode;
};

export function ActivationPanel({
  items,
  variant = 'surface',
  className,
  children,
}: ActivationPanelProps) {
  const labelTone = variant === 'promo' ? 'primary' : 'muted';

  return (
    <section
      className={cn(styles.panel, variant === 'promo' && styles.promo, className)}
      aria-label="Activation status"
    >
      {items.map((item) => (
        <MiniField
          key={item.label}
          label={item.label}
          status={item.status}
          tone={item.tone}
          labelTone={labelTone}
        />
      ))}
      {children}
    </section>
  );
}
