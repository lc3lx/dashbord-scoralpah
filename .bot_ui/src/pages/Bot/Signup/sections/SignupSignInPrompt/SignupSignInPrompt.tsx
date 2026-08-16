import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import styles from './SignupSignInPrompt.module.css';

export type SignupSignInPromptProps = {
  dividerLabel: string;
  promptLabel: string;
  signInLabel: string;
  onSignIn: () => void;
};

export function SignupSignInPrompt({
  dividerLabel,
  promptLabel,
  signInLabel,
  onSignIn,
}: SignupSignInPromptProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.divider} aria-hidden="true">
        <span className={styles.line} />
        <span className={styles.or}>{dividerLabel}</span>
        <span className={styles.line} />
      </div>

      <p className={styles.prompt}>
        <Text as="span" variant="body-sm" className={styles.promptText}>
          {promptLabel}
        </Text>{' '}
        <Button type="button" variant="text-link" onClick={onSignIn} className={styles.signIn}>
          {signInLabel}
        </Button>
      </p>
    </div>
  );
}
