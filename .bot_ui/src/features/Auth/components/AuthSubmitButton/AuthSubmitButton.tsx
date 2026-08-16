import { Button } from '@components/atoms/Button';
import { useT } from '@shared/i18n';
import type { FormStatus } from '../../types';
import { cn } from '@utils/cn';
import styles from './AuthSubmitButton.module.css';

export type AuthSubmitButtonProps = {
  label: string;
  status: FormStatus;
  disabled?: boolean;
  className?: string;
};

export function AuthSubmitButton({
  label,
  status,
  disabled = false,
  className,
}: AuthSubmitButtonProps) {
  const t = useT();
  const statusLabel: Record<FormStatus, string | null> = {
    idle: null,
    loading: t('common.pleaseWait'),
    success: t('common.success'),
    error: null,
  };
  const displayLabel = statusLabel[status] ?? label;
  const isBusy = status === 'loading' || status === 'success';

  return (
    <Button
      type="submit"
      variant="primary"
      fullWidth
      disabled={disabled || isBusy}
      aria-busy={status === 'loading'}
      className={cn(
        styles.submit,
        status === 'loading' && styles.loading,
        status === 'success' && styles.success,
        status === 'error' && styles.error,
        className,
      )}
    >
      {displayLabel}
    </Button>
  );
}
