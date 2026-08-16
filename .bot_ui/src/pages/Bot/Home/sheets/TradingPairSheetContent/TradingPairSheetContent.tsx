import { Input } from '@components/atoms/Input';
import { SelectionOption } from '@components/molecules/SelectionOption';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import type { TradingPairSheetContent } from '../../types';
import styles from './TradingPairSheetContent.module.css';

export type TradingPairSheetContentProps = {
  content: TradingPairSheetContent;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredOptions: TradingPairSheetContent['options'];
  onSelect: (optionId: string) => void;
};

export function TradingPairSheetContent({
  content,
  searchQuery,
  onSearchChange,
  filteredOptions,
  onSelect,
}: TradingPairSheetContentProps) {
  const t = useT();
  const emptyCatalog = content.options.length === 0;

  return (
    <div className={styles.root}>
      <Input
        value={searchQuery}
        placeholder={content.searchPlaceholder}
        onChange={(event) => onSearchChange(event.target.value)}
        className={styles.search}
        disabled={emptyCatalog}
      />
      <div className={styles.list}>
        {emptyCatalog ? (
          <Text variant="caption" tone="muted" className={styles.empty}>
            {t('home.pairs.empty')}
          </Text>
        ) : filteredOptions.length === 0 && searchQuery.trim() ? (
          <Text variant="caption" tone="muted" className={styles.empty}>
            {content.emptySearchMessage}
          </Text>
        ) : (
          filteredOptions.map((option) => (
            <SelectionOption
              key={option.id}
              title={option.title}
              description={option.description}
              selected={option.id === content.selectedId}
              onSelect={() => onSelect(option.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
