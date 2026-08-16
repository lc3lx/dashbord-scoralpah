import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { PageHeader } from '@components/organisms/PageHeader';
import { useEditProfileForm } from './hooks/useEditProfileForm';
import { EditProfileFormSection } from './sections/EditProfileFormSection';
import styles from './AccountPage.module.css';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const form = useEditProfileForm();

  return (
    <main className={styles.formPage} aria-label={form.copy.pageTitle}>
      <div className={styles.scroll}>
        <PageContent className={styles.formContent}>
          <PageHeader title={form.copy.pageTitle} onBack={() => navigate(-1)} />
          <EditProfileFormSection
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
