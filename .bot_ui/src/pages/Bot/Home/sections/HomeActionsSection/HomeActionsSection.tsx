import { Button } from '@components/atoms/Button';
import type { HomeActionItem, HomeSheetId } from '../../types';
import styles from './HomeActionsSection.module.css';

export type HomeActionsSectionProps = {
  actions: HomeActionItem[];
  onAction: (sheetTarget: Extract<HomeSheetId, 'chart' | 'settings'>) => void;
};

export function HomeActionsSection({ actions, onAction }: HomeActionsSectionProps) {
  return (
    <section className={styles.section} aria-label="Home actions">
      <div className={styles.actions}>
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            className={styles.actionButton}
            onClick={() => onAction(action.sheetTarget)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
