import { OptionChip } from '@components/molecules/OptionChip';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import type { ChipGroupContent } from '../../types';
import styles from './DurationSection.module.css';

export type DurationSectionProps = {
  content: ChipGroupContent;
  onSelect: (optionId: string) => void;
};

export function DurationSection({ content, onSelect }: DurationSectionProps) {
  const t = useT();
  const selected = content.options.find((option) => option.id === content.selectedId);

  return (
    <section className={styles.section} aria-label={content.label}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Text variant="caption" tone="muted" className={styles.label}>
            {content.label}
          </Text>
          <Text variant="caption-xs" tone="caption" className={styles.helper}>
            {t('home.duration.helper')}
          </Text>
        </div>
        {content.options.length === 0 ? (
          <Text variant="caption" tone="caption">
            {t('home.duration.empty')}
          </Text>
        ) : (
          <>
            <Text variant="h2" tone="body" className={styles.value}>
              {selected?.label ?? content.displayValue}
            </Text>
            <div className={styles.chips} aria-label={t('home.duration.quickSelect')}>
              {content.options.map((option) => (
                <OptionChip
                  key={option.id}
                  label={option.label}
                  selected={option.id === content.selectedId}
                  onSelect={() => onSelect(option.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
