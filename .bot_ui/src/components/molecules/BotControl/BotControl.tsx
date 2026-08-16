import { uiAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import { cn } from '@utils/cn';
import type { BotControlAction } from '../../types';
import styles from './BotControl.module.css';

export type BotControlProps = {
  action: BotControlAction;
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

const ACTION_ICONS: Record<BotControlAction, { icon: string; toneClass: string }> = {
  start: { icon: uiAssets.play, toneClass: styles.start },
  pause: { icon: uiAssets.pause, toneClass: styles.pause },
  stop: { icon: uiAssets.stop, toneClass: styles.stop },
  apply: { icon: uiAssets.apply, toneClass: styles.apply },
};

export function BotControl({
  action,
  pressed = false,
  disabled = false,
  onClick,
  className,
}: BotControlProps) {
  const t = useT();
  const { icon, toneClass } = ACTION_ICONS[action];
  const labels: Record<BotControlAction, string> = {
    start: t('home.controls.start'),
    pause: t('home.controls.pause'),
    stop: t('home.controls.stop'),
    apply: t('home.controls.apply'),
  };
  const label = labels[action];

  return (
    <button
      type="button"
      className={cn(
        styles.control,
        toneClass,
        pressed && styles.pressed,
        disabled && styles.disabled,
        className,
      )}
      aria-pressed={pressed}
      aria-disabled={disabled}
      disabled={disabled}
      title={disabled ? t('home.controls.comingSoonTitle') : undefined}
      onClick={disabled ? undefined : onClick}
    >
      <Icon src={icon} size="sm" />
      <Text variant="caption" className={styles.label}>
        {disabled ? t('common.soon') : label}
      </Text>
    </button>
  );
}
