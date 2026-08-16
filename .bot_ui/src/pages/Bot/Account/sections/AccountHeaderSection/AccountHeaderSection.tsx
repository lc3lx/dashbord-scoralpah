import { Text } from '@components/atoms/Text';
import styles from './AccountHeaderSection.module.css';

export type AccountHeaderSectionProps = {
  title: string;
};

export function AccountHeaderSection({ title }: AccountHeaderSectionProps) {
  return (
    <section className={styles.section} aria-label="Account header">
      <Text variant="h1" tone="body" className={styles.title}>
        {title}
      </Text>
    </section>
  );
}
