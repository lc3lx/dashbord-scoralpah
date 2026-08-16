import { Chip } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import type { ChipTone } from '../../types';
import styles from './BotSetupPreviewCard.module.css';

export type BotSetupDetailField = {
  id: string;
  label: string;
  value: string;
  valueTone?: 'body' | 'success' | 'loss-limit';
};

export type BotSetupPreviewCardProps = {
  name: string;
  statusLabel: string;
  statusTone: ChipTone;
  strengthLabel: string;
  strengthValue: string;
  iconSrc: string;
  fields: BotSetupDetailField[];
  className?: string;
};

const valueToneClassMap = {
  body: styles.valueBody,
  success: styles.valueSuccess,
  'loss-limit': styles.valueLossLimit,
} as const;

export function BotSetupPreviewCard({
  name,
  statusLabel,
  statusTone,
  strengthLabel,
  strengthValue,
  iconSrc,
  fields,
  className,
}: BotSetupPreviewCardProps) {
  return (
    <article className={cn(styles.card, className)} aria-label="Bot setup preview">
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

        <div className={styles.strength}>
          <Text variant="caption-xs" className={styles.strengthLabel}>
            {strengthLabel}
          </Text>
          <Text variant="body" tone="success" className={styles.strengthValue}>
            {strengthValue}
          </Text>
        </div>
      </header>

      <div className={styles.details}>
        <div className={styles.grid}>
          {fields.map((field) => (
            <div key={field.id} className={styles.field}>
              <Text variant="caption-xs" className={styles.fieldLabel}>
                {field.label}
              </Text>
              <Text
                variant="body-sm"
                className={cn(
                  styles.fieldValue,
                  valueToneClassMap[field.valueTone ?? 'body'],
                )}
              >
                {field.value}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
