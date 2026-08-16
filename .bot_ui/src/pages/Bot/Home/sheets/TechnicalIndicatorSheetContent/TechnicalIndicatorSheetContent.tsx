import { IndicatorOptionCard } from '@components/molecules/IndicatorOptionCard';
import { getComplexityDisplay } from '../../data/home.mock';
import type { TechnicalIndicatorSheetContent } from '../../types';
import styles from './TechnicalIndicatorSheetContent.module.css';

export type TechnicalIndicatorSheetContentProps = {
  content: TechnicalIndicatorSheetContent;
  onSelect: (optionId: string) => void;
};

export function TechnicalIndicatorSheetContent({
  content,
  onSelect,
}: TechnicalIndicatorSheetContentProps) {
  const complexityDisplay = getComplexityDisplay();

  return (
    <div className={styles.root}>
      {content.options.map((option) => {
        const complexity = complexityDisplay[option.complexity];
        const disabled = option.enabled === false;

        return (
          <IndicatorOptionCard
            key={option.id}
            title={option.title}
            description={option.description}
            bestFor={option.bestFor}
            complexityLabel={complexity.label}
            complexityTone={complexity.tone}
            previewSrc={option.previewSrc}
            selected={option.id === content.selectedId}
            disabled={disabled}
            onSelect={() => {
              if (!disabled) onSelect(option.id);
            }}
          />
        );
      })}
    </div>
  );
}
