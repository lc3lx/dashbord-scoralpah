import { brandAssets, dashboardAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import styles from './DashboardHeaderSection.module.css';

export type DashboardHeaderSectionProps = {
  notificationsAriaLabel: string;
  hasUnread: boolean;
  onNotificationsClick: () => void;
};

export function DashboardHeaderSection({
  notificationsAriaLabel,
  hasUnread,
  onNotificationsClick,
}: DashboardHeaderSectionProps) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <img
          src={brandAssets.scarTile}
          alt="Scar Alpha"
          className={styles.appLogo}
          width={42}
          height={42}
        />
      </div>

      <button
        type="button"
        className={styles.bellButton}
        aria-label={notificationsAriaLabel}
        onClick={onNotificationsClick}
      >
        <Icon src={dashboardAssets.notifBell} decorative className={styles.bellIcon} />
        {hasUnread ? <span className={styles.badge} aria-hidden="true" /> : null}
      </button>
    </header>
  );
}
