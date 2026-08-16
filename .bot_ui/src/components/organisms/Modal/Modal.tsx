import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './Modal.module.css';

export type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, title, onClose, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={cn(styles.modal, className)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <Text variant="h2" tone="body">
            {title}
          </Text>
          <Button variant="text-link" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
