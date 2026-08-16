import { Chip } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import type { ChipTone, TextTone } from '../../types';
import styles from './BotEngineCard.module.css';

export type BotEngineStat = {
  id: string;
  label: string;
  value: string;
  valueTone?: TextTone;
};

export type BotEngineCardProps = {
  name: string;
  iconSrc: string;
  statusLabel: string;
  statusTone: ChipTone;
  stats: BotEngineStat[];
  className?: string;
};

export function BotEngineCard({
  name,
  iconSrc,
  statusLabel,
  statusTone,
  stats,
  className,
}: BotEngineCardProps) {
  return (
    <article className={cn(styles.card, className)} aria-label={name}>
      <header className={styles.header}>
        <div className={styles.iconTile}>
          <Icon src={iconSrc} decorative className={styles.iconImage} />
        </div>
        <div className={styles.info}>
          <Text variant="body" tone="body" className={styles.name}>
            {name}
          </Text>
          <Chip label={statusLabel} tone={statusTone} style="solid" className={styles.statusChip} />
        </div>
      </header>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.id} className={styles.stat}>
            <Text variant="caption-xs" tone="connector" className={styles.statLabel}>
              {stat.label}
            </Text>
            <Text variant="body-sm" tone={stat.valueTone ?? 'body'} className={styles.statValue}>
              {stat.value}
            </Text>
          </div>
        ))}
      </div>
    </article>
  );
}
