import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { t } from '@shared/i18n';
import { cn } from '@utils/cn';
import styles from './BottomSheet.module.css';

export type BottomSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

const CLOSE_ANIMATION_MS = 250;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function BottomSheet({ open, title, onClose, children, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      setIsMounted(true);
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timer = window.setTimeout(() => {
      setIsMounted(false);
      previouslyFocusedRef.current?.focus?.();
      previouslyFocusedRef.current = null;
    }, CLOSE_ANIMATION_MS);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!isMounted || !open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !sheetRef.current) return;

      const focusable = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);

      if (focusable.length === 0) {
        event.preventDefault();
        sheetRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (active === first || active === sheetRef.current)) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFrame = requestAnimationFrame(() => {
      const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = focusable?.[0];
      (first ?? sheetRef.current)?.focus();
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted, open, onClose]);

  if (!isMounted) return null;

  return (
    <div
      className={cn(styles.overlay, isVisible && styles.overlayVisible)}
      role="presentation"
      onClick={open ? onClose : undefined}
    >
      <div
        ref={sheetRef}
        className={cn(styles.sheet, isVisible && styles.sheetVisible, className)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.header}>
          <Text variant="h2" tone="body">
            {title}
          </Text>
          <Button variant="text-link" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
