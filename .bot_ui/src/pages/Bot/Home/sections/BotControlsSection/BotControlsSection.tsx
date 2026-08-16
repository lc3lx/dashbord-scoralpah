import { BotControl } from '@components/molecules/BotControl';
import { Text } from '@components/atoms/Text';
import type { BotControlAction } from '@components/types';
import { useT } from '@shared/i18n';
import styles from './BotControlsSection.module.css';

export type BotControlsSectionProps = {
  controls: BotControlAction[];
  isStartPressed: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onApply: () => void;
  isUpdating?: boolean;
  /** Phase 9: auto Start/Pause/Stop is out of scope — show Coming Soon. */
  comingSoon?: boolean;
};

const handlers: Record<
  BotControlAction,
  keyof Pick<BotControlsSectionProps, 'onStart' | 'onPause' | 'onStop' | 'onApply'>
> = {
  start: 'onStart',
  pause: 'onPause',
  stop: 'onStop',
  apply: 'onApply',
};

export function BotControlsSection({
  controls,
  isStartPressed,
  onStart,
  onPause,
  onStop,
  onApply,
  isUpdating = false,
  comingSoon = true,
}: BotControlsSectionProps) {
  const t = useT();
  const handlerMap = { onStart, onPause, onStop, onApply };

  return (
    <section className={styles.section} aria-label={t('home.aria')}>
      <div className={styles.card}>
        {controls.map((action) => (
          <BotControl
            key={action}
            action={action}
            pressed={!comingSoon && action === 'start' && isStartPressed}
            disabled={comingSoon || isUpdating}
            onClick={handlerMap[handlers[action]]}
            className={styles.control}
          />
        ))}
      </div>
      {comingSoon ? (
        <Text variant="caption-xs" tone="caption" align="center" className={styles.soonNote}>
          {t('home.controls.note')}
        </Text>
      ) : isStartPressed ? (
        <Text variant="caption-xs" tone="success" align="center" className={styles.soonNote} aria-live="polite">
          {t('home.controls.runningNote')}
        </Text>
      ) : null}
    </section>
  );
}
