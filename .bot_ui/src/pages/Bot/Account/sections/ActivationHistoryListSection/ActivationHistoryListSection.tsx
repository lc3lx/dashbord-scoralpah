import { Badge } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import type { ActivationHistoryEntry } from '../../types';
import styles from './ActivationHistoryListSection.module.css';

export type ActivationHistoryListSectionProps = {
  entries: ActivationHistoryEntry[];
};

export function ActivationHistoryListSection({ entries }: ActivationHistoryListSectionProps) {
  return (
    <section className={styles.section} aria-label="Activation history list">
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={styles.item}>
            <article className={styles.card}>
              <div className={styles.header}>
                <div className={styles.keyRow}>
                  <Icon src={entry.iconSrc} size="sm" decorative />
                  <Text variant="body-sm" tone="body" className={styles.keyLabel}>
                    {entry.keyLabel}
                  </Text>
                </div>
                <Badge label={entry.statusLabel} tone={entry.statusTone} style="outlined" />
              </div>

              <div className={styles.metaGrid}>
                <div className={styles.metaColumn}>
                  <Text variant="caption-xs" tone="caption">
                    {entry.planLabel}
                  </Text>
                  <Text variant="caption-xs" tone="body">
                    {entry.planDuration}
                  </Text>
                </div>
                <div className={styles.metaColumn}>
                  <Text variant="caption-xs" tone="caption">
                    {entry.usedLabel}
                  </Text>
                  <Text variant="caption-xs" tone="body">
                    {entry.usedDate}
                  </Text>
                </div>
                <div className={styles.metaColumn}>
                  <Text variant="caption-xs" tone="caption">
                    {entry.expirationLabel}
                  </Text>
                  <Text variant="caption-xs" tone="body">
                    {entry.expirationDate}
                  </Text>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
