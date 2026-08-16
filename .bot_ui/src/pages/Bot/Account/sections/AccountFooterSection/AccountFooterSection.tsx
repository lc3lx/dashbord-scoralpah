import { Text } from '@components/atoms/Text';
import styles from './AccountFooterSection.module.css';

export type AccountFooterSectionProps = {
  versionLabel: string;
};

export function AccountFooterSection({ versionLabel }: AccountFooterSectionProps) {
  return (
    <footer className={styles.footer}>
      <Text variant="caption-xs" tone="caption" align="center" className={styles.version}>
        {versionLabel}
      </Text>
    </footer>
  );
}
