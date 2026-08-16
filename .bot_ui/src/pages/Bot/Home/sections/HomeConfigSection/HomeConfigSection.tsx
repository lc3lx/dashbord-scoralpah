import { SettingRow } from '@components/molecules/SettingRow';
import type { HomeConfigRow, HomeSheetId } from '../../types';
import styles from './HomeConfigSection.module.css';

export type HomeConfigSectionProps = {
  rows: HomeConfigRow[];
  onRowClick: (sheetTarget: HomeSheetId) => void;
};

export function HomeConfigSection({ rows, onRowClick }: HomeConfigSectionProps) {
  return (
    <section className={styles.section} aria-label="Bot configuration">
      {rows.map((row) => (
        <SettingRow
          key={row.id}
          variant="home"
          iconSrc={row.iconSrc}
          label={row.label}
          value={row.value}
          onClick={row.sheetTarget ? () => onRowClick(row.sheetTarget!) : undefined}
          className={styles.row}
        />
      ))}
    </section>
  );
}
