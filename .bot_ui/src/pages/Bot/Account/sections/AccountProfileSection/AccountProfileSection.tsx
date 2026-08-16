import { accountAssets } from '@assets/index';
import { Chip } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import type { AccountBadge, AccountProfile } from '../../types';
import styles from './AccountProfileSection.module.css';

export type AccountProfileSectionProps = {
  profile: AccountProfile;
  badges: AccountBadge[];
};

export function AccountProfileSection({ profile, badges }: AccountProfileSectionProps) {
  return (
    <section className={styles.section} aria-label="Account profile">
      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>
            <Icon src={profile.avatarIconSrc} size="trade" decorative />
          </div>
          <span className={styles.editBadge} aria-hidden="true">
            <Icon src={accountAssets.editBadge} size="xs" decorative />
          </span>
        </div>

        <div className={styles.meta}>
          <Text variant="body" tone="body" className={styles.name}>
            {profile.fullName}
          </Text>
          <Text variant="caption-xs" tone="caption" className={styles.email}>
            {profile.email}
          </Text>
          <div className={styles.badges}>
            {badges.map((badge) => (
              <Chip
                key={badge.id}
                label={badge.label}
                tone={badge.tone}
                style="outlined"
                className={styles.badge}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
