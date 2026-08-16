import { accountAssets } from '@assets/index';
import { uiAssets } from '@assets/index';
import { Badge } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import type { AccountMenuItem } from '../../types';
import styles from './AccountMenuSection.module.css';

export type AccountMenuSectionProps = {
  items: AccountMenuItem[];
  logoutLabel: string;
  onItemSelect: (item: AccountMenuItem) => void;
  onLogout: () => void;
};

export function AccountMenuSection({
  items,
  logoutLabel,
  onItemSelect,
  onLogout,
}: AccountMenuSectionProps) {
  return (
    <section className={styles.section} aria-label="Account actions">
      <div className={styles.card}>
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={styles.row}
            data-last={index === items.length - 1 ? 'true' : undefined}
            onClick={() => onItemSelect(item)}
          >
            <span className={styles.leading}>
              <span className={styles.iconWrap}>
                <Icon src={item.iconSrc} size="sm" decorative />
              </span>
              <Text variant="body" tone="body" className={styles.label}>
                {item.label}
              </Text>
            </span>
            <span className={styles.trailing}>
              {item.badge && (
                <Badge label={item.badge.label} tone={item.badge.tone} style="outlined" />
              )}
              <Icon src={uiAssets.chevronNav} size="xs" decorative className={styles.chevron} />
            </span>
          </button>
        ))}
      </div>

      <button type="button" className={styles.logoutCard} onClick={onLogout}>
        <span className={styles.logoutLeading}>
          <span className={styles.logoutIconWrap}>
            <Icon src={accountAssets.logout} size="sm" decorative />
          </span>
          <Text variant="body" tone="danger" className={styles.logoutLabel}>
            {logoutLabel}
          </Text>
        </span>
      </button>
    </section>
  );
}
