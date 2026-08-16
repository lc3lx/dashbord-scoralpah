import { Text } from '@components/atoms/Text';
import type { TextTone, TextVariant } from '@components/types';
import { cn } from '@utils/cn';
import styles from './AuthHero.module.css';

export type AuthHeroProps = {
  title: string;
  description: string;
  titleVariant?: TextVariant;
  descriptionTone?: TextTone;
  inset?: boolean;
  className?: string;
  descriptionClassName?: string;
};

export function AuthHero({
  title,
  description,
  titleVariant = 'h1',
  descriptionTone = 'secondary',
  inset = false,
  className,
  descriptionClassName,
}: AuthHeroProps) {
  return (
    <header className={cn(styles.hero, inset && styles.inset, className)}>
      <Text as="h1" variant={titleVariant} tone="primary" className={styles.title}>
        {title}
      </Text>
      <Text
        variant="body-sm"
        tone={descriptionTone}
        className={cn(styles.description, descriptionClassName)}
      >
        {description}
      </Text>
    </header>
  );
}
