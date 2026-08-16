import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { ROUTES } from '@constants/routes';
import { useT } from '@shared/i18n';
import { useNotifications } from '../Activity/hooks/useNotifications';
import { useDashboardData } from './hooks/useDashboardData';
import { BalanceCardSection } from './sections/BalanceCardSection';
import { DashboardHeaderSection } from './sections/DashboardHeaderSection';
import { DashboardStatsSection } from './sections/DashboardStatsSection';
import { PerformanceSection } from './sections/PerformanceSection';
import { RecentTradesSection } from './sections/RecentTradesSection';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const t = useT();
  const navigate = useNavigate();
  const { data, isLoading, timeframe, selectTimeframe } = useDashboardData();
  const { notifications } = useNotifications();

  const handleNotifications = useCallback(() => {
    navigate(ROUTES.notifications);
  }, [navigate]);

  if (isLoading || !data) return null;

  return (
    <main className={styles.page} aria-label={t('dashboard.aria')}>
      <div className={styles.scroll}>
        <PageContent className={styles.content}>
          <DashboardHeaderSection
            notificationsAriaLabel={data.notificationsAriaLabel}
            hasUnread={notifications.some((item) => !item.read)}
            onNotificationsClick={handleNotifications}
          />
          <BalanceCardSection balance={data.balance} />
          <DashboardStatsSection stats={data.stats} />
          <PerformanceSection
            performance={data.performance}
            activeTimeframe={timeframe}
            onTimeframeChange={selectTimeframe}
          />
          <RecentTradesSection markets={data.markets} />
        </PageContent>
      </div>
    </main>
  );
}
