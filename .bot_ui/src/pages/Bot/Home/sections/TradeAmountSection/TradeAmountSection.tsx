import { FormField } from '@components/molecules/FormField';
import { Input } from '@components/atoms/Input';
import { OptionChip } from '@components/molecules/OptionChip';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import type { ChipGroupContent } from '../../types';
import styles from './TradeAmountSection.module.css';

export type TradeAmountSectionProps = {
  content: ChipGroupContent;
  value: string;
  onValueChange: (value: string) => void;
  error?: string | null;
};

export function TradeAmountSection({
  content,
  value,
  onValueChange,
  error = null,
}: TradeAmountSectionProps) {
  const t = useT();

  return (
    <section className={styles.section} aria-label={content.label}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Text variant="caption" tone="muted" className={styles.label}>
            {content.label}
          </Text>
          <Text variant="caption-xs" tone="caption" className={styles.helper}>
            {t('home.tradeAmount.helper')}
          </Text>
        </div>
        {content.options.length === 0 ? (
          <Text variant="caption" tone="caption">
            {t('home.tradeAmount.empty')}
          </Text>
        ) : (
          <>
            <Text variant="h2" tone="body" className={styles.value}>
              {value ? `$${value}` : content.displayValue}
            </Text>
            <FormField
              id="bot-trade-amount"
              label={t('home.tradeAmount.inputLabel')}
              error={error ?? undefined}
              className={styles.field}
              spacing="compact"
            >
              <Input
                id="bot-trade-amount"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={value}
                hasError={Boolean(error)}
                placeholder={t('home.tradeAmount.placeholder')}
                className={styles.input}
                onChange={(event) => onValueChange(event.target.value)}
              />
            </FormField>
            <div className={styles.chips} aria-label={t('home.tradeAmount.quickSelect')}>
              {content.options.map((option) => (
                <OptionChip
                  key={option.id}
                  label={option.label}
                  selected={option.label === `$${value}`}
                  onSelect={() => onValueChange(option.id.replace('amount-', ''))}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
