import { Text } from '@components/atoms/Text';
import styles from './AuthServerError.module.css';

export type AuthServerErrorProps = {
  message: string | null;
  id?: string;
};

export function AuthServerError({ message, id = 'auth-server-error' }: AuthServerErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <Text
      id={id}
      role="alert"
      variant="caption-xs"
      tone="danger"
      className={styles.error}
    >
      {message}
    </Text>
  );
}
