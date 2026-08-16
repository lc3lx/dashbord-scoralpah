import { BotEngineCard } from '@components/organisms/BotEngineCard';
import type { BotEngineContent } from '../../types';
import styles from './BotEngineSection.module.css';

export type BotEngineSectionProps = {
  content: BotEngineContent;
};

export function BotEngineSection({ content }: BotEngineSectionProps) {
  return (
    <section className={styles.section} aria-label={content.name}>
      <BotEngineCard
        name={content.name}
        iconSrc={content.iconSrc}
        statusLabel={content.statusLabel}
        statusTone={content.statusTone}
        stats={content.stats}
      />
    </section>
  );
}
