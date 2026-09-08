import { Input } from '@components/atoms/Input';
import { SelectionOption } from '@components/molecules/SelectionOption';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import { MAX_BOT_PAIRS } from '../../data/homeService';
import type { TradingPairSheetContent } from '../../types';
import styles from './TradingPairSheetContent.module.css';

export type TradingPairSheetContentProps = {
  content: TradingPairSheetContent;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredOptions: TradingPairSheetContent['options'];
  onSelect: (optionId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
};

export function TradingPairSheetContent({
  content,
  searchQuery,
  onSearchChange,
  filteredOptions,
  onSelect,
  onSelectAll,
  onClearAll,
}: TradingPairSheetContentProps) {
  const t = useT();
  const emptyCatalog = content.options.length === 0;
  const selectedIds = content.selectedIds?.length
    ? content.selectedIds
    : content.selectedId
      ? [content.selectedId]
      : [];
  const filteredSelectedCount = filteredOptions.filter((o) => selectedIds.includes(o.id)).length;
  const allFilteredSelected =
    filteredOptions.length > 0 && filteredSelectedCount === filteredOptions.length;

  return (
    <div className={styles.root}>
      <Input
        value={searchQuery}
        placeholder={content.searchPlaceholder}
        onChange={(event) => onSearchChange(event.target.value)}
        className={styles.search}
        disabled={emptyCatalog}
      />
      <div className={styles.toolbar}>
        <Text variant="caption" tone="muted" className={styles.hint}>
          {t('home.pairs.multiHint', { count: selectedIds.length, max: MAX_BOT_PAIRS })}
        </Text>
        {!emptyCatalog ? (
          <button
            type="button"
            className={styles.selectAllBtn}
            onClick={allFilteredSelected ? onClearAll : onSelectAll}
            disabled={filteredOptions.length === 0}
          >
            {allFilteredSelected ? t('home.pairs.clearAll') : t('home.pairs.selectAll')}
          </button>
        ) : null}
      </div>
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
              selected={selectedIds.includes(option.id)}
              onSelect={() => onSelect(option.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
