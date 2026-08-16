import { SelectionOption } from '@components/molecules/SelectionOption';
import type { MarketTypeSheetContent } from '../../types';
import styles from './MarketTypeSheetContent.module.css';

export type MarketTypeSheetContentProps = {
  content: MarketTypeSheetContent;
  onSelect: (optionId: string) => void;
};

export function MarketTypeSheetContent({ content, onSelect }: MarketTypeSheetContentProps) {
  return (
    <div className={styles.root}>
      {content.options.map((option) => (
        <SelectionOption
          key={option.id}
          title={option.title}
          description={option.description}
          selected={option.id === content.selectedId}
          onSelect={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}
