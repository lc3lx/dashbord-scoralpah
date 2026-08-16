import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import type { TradeTimelineEntry } from '../../types';
import styles from './TradeTimelineSection.module.css';

export type TradeTimelineSectionProps = {
  title: string;
  entries: TradeTimelineEntry[];
  checkIconSrc: string;
};

export function TradeTimelineSection({ title, entries, checkIconSrc }: TradeTimelineSectionProps) {
  return (
    <section className={styles.section} aria-label={title}>
      <Text variant="body-sm" tone="body" className={styles.title}>
        {title}
      </Text>
      <article className={styles.card}>
        {entries.map((entry) => (
          <div key={entry.id} className={styles.entry}>
            <div className={styles.dotWrap}>
              <span
                className={entry.status === 'completed' ? styles.dotActive : styles.dotPending}
                aria-hidden="true"
              />
            </div>
            <div className={styles.entryContent}>
              <Text variant="caption" tone="body">
                {entry.title}
              </Text>
              <Text variant="caption-xs" tone="caption">
                {entry.timestamp}
              </Text>
            </div>
            {entry.showCheck && (
              <Icon src={checkIconSrc} size="xs" decorative className={styles.checkIcon} />
            )}
          </div>
        ))}
      </article>
    </section>
  );
}
