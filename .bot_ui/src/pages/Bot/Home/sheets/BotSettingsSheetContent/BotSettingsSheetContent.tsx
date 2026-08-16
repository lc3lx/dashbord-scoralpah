import { Button } from '@components/atoms/Button';
import { OptionChip } from '@components/molecules/OptionChip';
import { ToggleRow } from '@components/molecules/ToggleRow';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import type { BotSettingsSheetContent } from '../../types';
import styles from './BotSettingsSheetContent.module.css';

export type BotSettingsSheetContentProps = {
  content: BotSettingsSheetContent;
  onToggleChange: (toggleId: string, enabled: boolean) => void;
  onRiskSelect: (riskId: string) => void;
  onSave: () => void;
};

function isComingSoonToggle(id: string): boolean {
  return id.startsWith('auto-') || id === 'signal-confirm';
}

export function BotSettingsSheetContent({
  content,
  onToggleChange,
  onRiskSelect: _onRiskSelect,
  onSave,
}: BotSettingsSheetContentProps) {
  const t = useT();

  return (
    <div className={styles.root}>
      <Text variant="caption-xs" tone="caption">
        {t('home.settings.note')}
      </Text>
      <div className={styles.toggles}>
        {content.toggles.map((toggle) => (
          <ToggleRow
            key={toggle.id}
            label={toggle.label}
            checked={isComingSoonToggle(toggle.id) ? false : toggle.enabled}
            onChange={(enabled) => {
              if (isComingSoonToggle(toggle.id)) return;
              onToggleChange(toggle.id, enabled);
            }}
          />
        ))}
      </div>

      <div className={styles.riskSection}>
        <Text variant="body-sm" tone="body" className={styles.riskLabel}>
          {content.riskLabel}
        </Text>
        <div className={styles.riskChips}>
          {content.riskOptions.map((option) => (
            <OptionChip
              key={option.id}
              label={option.label}
              selected={option.id === content.selectedRiskId}
              onSelect={() => {
                /* Coming Soon — local risk chips do not enforce anything */
              }}
              className={styles.riskChip}
            />
          ))}
        </div>
      </div>

      <Button variant="primary" fullWidth className={styles.saveButton} onClick={onSave}>
        {content.saveLabel}
      </Button>
    </div>
  );
}
