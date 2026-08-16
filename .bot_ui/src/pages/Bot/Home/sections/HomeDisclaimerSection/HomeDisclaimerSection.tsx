import { Text } from '@components/atoms/Text';
import styles from './HomeDisclaimerSection.module.css';

export type HomeDisclaimerSectionProps = {
  text: string;
};

export function HomeDisclaimerSection({ text }: HomeDisclaimerSectionProps) {
  return (
    <section className={styles.section} aria-label="Disclaimer">
      <Text variant="caption-xs" className={styles.text}>
        {text}
      </Text>
    </section>
  );
}
