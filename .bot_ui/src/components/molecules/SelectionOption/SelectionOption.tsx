import { uiAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './SelectionOption.module.css';

export type SelectionOptionProps = {
  title: string;
  description?: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function SelectionOption({
  title,
  description,
  selected = false,
  onSelect,
  className,
}: SelectionOptionProps) {
  return (
    <button
      type="button"
      className={cn(styles.option, selected && styles.selected, className)}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className={styles.content}>
        <Text variant="body-sm" tone="body" className={styles.title}>
          {title}
        </Text>
        {description && (
          <Text variant="caption" tone="muted" className={styles.description}>
            {description}
          </Text>
        )}
      </span>
      {selected && (
        <Icon src={uiAssets.keypointCheck} size="xs" decorative className={styles.check} />
      )}
    </button>
  );
}
