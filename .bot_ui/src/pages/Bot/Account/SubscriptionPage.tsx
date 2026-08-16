import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { PageHeader } from '@components/organisms/PageHeader';
import { ROUTES } from '@constants/routes';
import { accountService } from './services/accountService';
import { useSubscriptionData } from './hooks/useSubscriptionData';
import { SubscriptionActionsSection } from './sections/SubscriptionActionsSection';
import { SubscriptionCardSection } from './sections/SubscriptionCardSection';
import styles from './AccountPage.module.css';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const content = accountService.getSubscriptionPageContent();
  const { subscription, isLoading } = useSubscriptionData();

  const handleEnterKey = useCallback(() => {
    navigate(ROUTES.editProfile);
  }, [navigate]);

  const handleViewHistory = useCallback(() => {
    navigate(ROUTES.activationHistory);
  }, [navigate]);

  if (isLoading || !subscription) return null;

  return (
    <main className={styles.formPage} aria-label={content.pageTitle}>
      <div className={styles.scroll}>
        <PageContent className={styles.formContent}>
          <PageHeader title={content.pageTitle} onBack={() => navigate(-1)} />
          <SubscriptionCardSection subscription={subscription} />
          <SubscriptionActionsSection
            enterKeyLabel={content.enterKeyLabel}
            viewHistoryLabel={content.viewHistoryLabel}
            onEnterKey={handleEnterKey}
            onViewHistory={handleViewHistory}
          />
        </PageContent>
      </div>
    </main>
  );
}
