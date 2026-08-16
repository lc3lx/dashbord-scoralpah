import { useEffect, useRef } from 'react';
import { uiAssets } from '@assets/index';
import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import styles from './ActivationSuccessModal.module.css';

export type ActivationSuccessModalProps = {
  open: boolean;
  title: string;
  description: string;
  actionLabel: string;
  onEnterApp: () => void;
};

export function ActivationSuccessModal({
  open,
  title,
  description,
  actionLabel,
  onEnterApp,
}: ActivationSuccessModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activation-success-title"
        tabIndex={-1}
      >
        <div className={styles.content}>
          <div className={styles.iconWrap} aria-hidden="true">
            <Icon src={uiAssets.activationSuccessCheck} decorative className={styles.icon} />
          </div>
          <Text
            id="activation-success-title"
            variant="h2"
            tone="primary"
            align="center"
            className={styles.title}
          >
            {title}
          </Text>
          <Text variant="caption" align="center" className={styles.description}>
            {description}
          </Text>
          <Button variant="primary" fullWidth className={styles.action} onClick={onEnterApp}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
