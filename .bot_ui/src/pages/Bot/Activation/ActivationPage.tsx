import { AuthBrand, AuthHero, AuthShell } from '@features/Auth';
import {
  ACTIVATION_COPY,
  ACTIVATION_STATUS_ITEMS,
} from './data/activation.mock';
import { useActivationForm } from './hooks/useActivationForm';
import { ActivationFormSection } from './sections/ActivationFormSection';
import { ActivationSuccessModal } from './sections/ActivationSuccessModal';
import styles from './ActivationPage.module.css';

export default function ActivationPage() {
  const form = useActivationForm();
  const copy = ACTIVATION_COPY;

  return (
    <AuthShell ariaLabel="Activation" glows={['top-right']} bodyClassName={styles.body}>
      <div className={styles.brandSection}>
        <AuthBrand />
      </div>

      <div className={styles.heroSection}>
        <AuthHero
          title={copy.title}
          description={copy.description}
          titleVariant="h2"
          descriptionTone="caption"
          descriptionClassName={styles.heroDescription}
        />
      </div>

      <ActivationFormSection
        copy={copy}
        statusItems={ACTIVATION_STATUS_ITEMS}
        values={form.values}
        fieldErrors={form.fieldErrors}
        serverError={form.serverError}
        status={form.status}
        isSubmitDisabled={form.isSubmitDisabled}
        onFieldChange={form.setField}
        onSubmit={form.submit}
      />

      <ActivationSuccessModal
        open={form.showSuccess}
        title={copy.successTitle}
        description={copy.successDescription}
        actionLabel={copy.successActionLabel}
        onEnterApp={form.enterApp}
      />
    </AuthShell>
  );
}
