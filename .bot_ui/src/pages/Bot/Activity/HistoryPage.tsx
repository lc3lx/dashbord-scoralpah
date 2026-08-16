import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { getTradeDetailPath } from '@constants/routes';
import type { TradeListFilter } from '@services/trades';
import { useT } from '@shared/i18n';
import { useTradeHistory } from './hooks/useTradeHistory';
import { HistoryFiltersSection } from './sections/HistoryFiltersSection';
import { HistoryHeaderSection } from './sections/HistoryHeaderSection';
import { HistoryListSection } from './sections/HistoryListSection';
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const t = useT();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<TradeListFilter>('all');
  const { trades, isEmpty, isLoading } = useTradeHistory(activeFilter);

  const handleTradeSelect = useCallback(
    (tradeId: string) => {
      navigate(getTradeDetailPath(tradeId));
    },
    [navigate],
  );

  if (isLoading) return null;

  return (
    <main className={styles.page} aria-label={t('history.aria')}>
      <div className={styles.scroll}>
        <BackgroundGlow variant="top-right" />
        <PageContent className={styles.content}>
          <div className={styles.stickyHeader}>
            <HistoryHeaderSection onBack={() => navigate(-1)} />
            <HistoryFiltersSection activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>
          <HistoryListSection
            trades={trades}
            isEmpty={isEmpty}
            activeFilter={activeFilter}
            onTradeSelect={handleTradeSelect}
          />
        </PageContent>
      </div>
    </main>
  );
}
