import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { PageHeader } from '@components/organisms/PageHeader';
import { useChangePasswordForm } from './hooks/useChangePasswordForm';
import { ChangePasswordFormSection } from './sections/ChangePasswordFormSection';
import styles from './AccountPage.module.css';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const form = useChangePasswordForm();

  return (
    <main className={styles.formPage} aria-label={form.copy.pageTitle}>
      <div className={styles.scroll}>
        <PageContent className={styles.formContent}>
          <PageHeader title={form.copy.pageTitle} onBack={() => navigate(-1)} />
          <ChangePasswordFormSection
            copy={form.copy}
            values={form.values}
            fieldErrors={form.fieldErrors}
            serverError={form.serverError}
            status={form.status}
            isSubmitDisabled={form.isSubmitDisabled}
            onFieldChange={form.setField}
            onSubmit={form.submit}
          />
        </PageContent>
      </div>
    </main>
  );
}
