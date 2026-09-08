import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { accountAssets } from '@assets/index';
import { Chip } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import type { AccountBadge, AccountProfile } from '../../types';
import styles from './AccountProfileSection.module.css';

const AVATAR_STORAGE_PREFIX = 'scar-alpha-avatar:';

export type AccountProfileSectionProps = {
  profile: AccountProfile;
  badges: AccountBadge[];
};

function avatarStorageKey(profile: AccountProfile): string {
  return `${AVATAR_STORAGE_PREFIX}${profile.telegramId || profile.email || profile.fullName}`;
}

export function AccountProfileSection({ profile, badges }: AccountProfileSectionProps) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageKey = avatarStorageKey(profile);
  const [avatarSrc, setAvatarSrc] = useState(profile.avatarIconSrc);
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAvatarSrc(saved);
        setIsCustomAvatar(true);
        return;
      }
    } catch {
      /* ignore storage errors */
    }
    setAvatarSrc(profile.avatarIconSrc);
    setIsCustomAvatar(false);
  }, [profile.avatarIconSrc, storageKey]);

  const handlePickAvatar = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : null;
        if (!result) return;
        try {
          localStorage.setItem(storageKey, result);
        } catch {
          /* quota — still show locally */
        }
        setAvatarSrc(result);
        setIsCustomAvatar(true);
      };
      reader.readAsDataURL(file);
    },
    [storageKey],
  );

  const subtitle =
    profile.telegramId && profile.telegramId !== t('common.none')
      ? profile.telegramId
      : profile.email !== t('common.none')
        ? profile.email
        : profile.telegramId;

  return (
    <section className={styles.section} aria-label="Account profile">
      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <button
            type="button"
            className={styles.avatarButton}
            onClick={handlePickAvatar}
            aria-label={t('account.menu.editProfile')}
          >
            <div className={styles.avatar}>
              {isCustomAvatar ? (
                <img src={avatarSrc} alt="" className={styles.avatarImage} />
              ) : (
                <Icon src={avatarSrc || accountAssets.profileUser} size="trade" decorative />
              )}
            </div>
            <span className={styles.editBadge} aria-hidden="true">
              <Icon src={accountAssets.editBadge} size="xs" decorative />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleAvatarChange}
          />
        </div>

        <div className={styles.meta}>
          <Text variant="body" tone="body" className={styles.name}>
            {profile.fullName}
          </Text>
          <Text variant="caption-xs" tone="caption" className={styles.email}>
            {subtitle}
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
