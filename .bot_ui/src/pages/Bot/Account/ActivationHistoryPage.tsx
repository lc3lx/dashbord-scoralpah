import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { PageHeader } from '@components/organisms/PageHeader';
import { accountService } from './services/accountService';
import { useActivationHistory } from './hooks/useActivationHistory';
import { ActivationHistoryListSection } from './sections/ActivationHistoryListSection';
import styles from './AccountPage.module.css';

export default function ActivationHistoryPage() {
  const navigate = useNavigate();
  const content = accountService.getActivationHistoryPageContent();
  const { entries, isLoading } = useActivationHistory();

  if (isLoading) return null;

  return (
    <main className={styles.formPage} aria-label={content.pageTitle}>
      <div className={styles.scroll}>
        <PageContent className={styles.formContent}>
          <PageHeader title={content.pageTitle} onBack={() => navigate(-1)} />
          {entries.length === 0 ? (
            <p>{content.emptyLabel}</p>
          ) : (
            <ActivationHistoryListSection entries={entries} />
          )}
        </PageContent>
      </div>
    </main>
  );
}
