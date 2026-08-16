import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import type { AccountDetailItem } from '../../types';
import styles from './AccountDetailsSection.module.css';

export type AccountDetailsSectionProps = {
  items: AccountDetailItem[];
};

export function AccountDetailsSection({ items }: AccountDetailsSectionProps) {
  return (
    <section className={styles.section} aria-label="Account details">
      <div className={styles.card}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={styles.row}
            data-last={index === items.length - 1 ? 'true' : undefined}
          >
            <span className={styles.iconWrap}>
              <Icon src={item.iconSrc} size="sm" decorative />
            </span>
            <div className={styles.content}>
              <Text variant="caption-xs" tone="caption" className={styles.label}>
                {item.label}
              </Text>
              <Text variant="body-sm" tone="body" className={styles.value}>
                {item.value}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
