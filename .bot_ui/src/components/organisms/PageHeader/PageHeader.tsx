import type { ReactNode } from 'react';
import { uiAssets } from '@assets/index';
import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { useT } from '@shared/i18n';
import { cn } from '@utils/cn';
import styles from './PageHeader.module.css';

export type PageHeaderProps = {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
  className?: string;
};

export function PageHeader({ title, onBack, action, className }: PageHeaderProps) {
  const t = useT();
  return (
    <header className={cn(styles.header, className)}>
      {onBack ? (
        <Button
          variant="icon"
          className={styles.backButton}
          onClick={onBack}
          aria-label={t('common.goBack')}
        >
          <Icon src={uiAssets.back} size="sm" className={styles.backIcon} />
        </Button>
      ) : (
        <span className={styles.spacer} />
      )}
      <Text variant="h2" tone="body" align="center" className={styles.title}>
        {title}
      </Text>
      <div className={styles.action}>{action ?? <span className={styles.spacer} />}</div>
    </header>
  );
}
