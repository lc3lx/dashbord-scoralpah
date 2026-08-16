import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { LanguageSwitcher } from '@components/molecules/LanguageSwitcher';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { ROUTES } from '@constants/routes';
import { useT } from '@shared/i18n';
import { useAccountData } from './hooks/useAccountData';
import { AccountDetailsSection } from './sections/AccountDetailsSection';
import { AccountFooterSection } from './sections/AccountFooterSection';
import { AccountHeaderSection } from './sections/AccountHeaderSection';
import { AccountMenuSection } from './sections/AccountMenuSection';
import { AccountProfileSection } from './sections/AccountProfileSection';
import { ApprovalNoticeSection } from './sections/ApprovalNoticeSection';
import type { AccountMenuItem } from './types';
import styles from './AccountPage.module.css';

export default function AccountPage() {
  const t = useT();
  const navigate = useNavigate();
  const { snapshot, isLoading, error, logout } = useAccountData();

  const handleMenuSelect = useCallback(
    (item: AccountMenuItem) => {
      if (item.route) {
        navigate(item.route);
        return;
      }

      if (item.action === 'education') {
        window.open('https://scaralpha.ai/education', '_blank', 'noopener,noreferrer');
      }
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    navigate(ROUTES.login);
  }, [logout, navigate]);

  if (error) {
    return (
      <main className={styles.page} aria-label={t('account.aria')}>
        <PageContent className={styles.content}>
          <p>{error}</p>
        </PageContent>
      </main>
    );
  }

  if (isLoading || !snapshot) return null;

  const binollaConnected =
    snapshot.botAccess !== undefined
      ? snapshot.botAccess !== 'BinollaNotConnected'
      : snapshot.profile.binollaAccountId === t('account.value.connected');

  return (
    <main className={styles.page} aria-label={t('account.aria')}>
      <div className={styles.scroll}>
        <BackgroundGlow variant="top-right" />
        <PageContent className={styles.content}>
          <AccountHeaderSection title={snapshot.pageContent.title} />
          <AccountProfileSection profile={snapshot.profile} badges={snapshot.badges} />
          <ApprovalNoticeSection
            accountStatus={snapshot.profile.accountStatus}
            binollaConnected={binollaConnected}
            botAccess={snapshot.botAccess}
          />
          <AccountDetailsSection items={snapshot.details} />
          <AccountMenuSection
            items={snapshot.menuItems}
            logoutLabel={snapshot.pageContent.logoutLabel}
            onItemSelect={handleMenuSelect}
            onLogout={handleLogout}
          />
          <LanguageSwitcher />
          <AccountFooterSection versionLabel={snapshot.pageContent.versionLabel} />
        </PageContent>
      </div>
    </main>
  );
}
