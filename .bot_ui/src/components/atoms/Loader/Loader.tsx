import { uiAssets } from '@assets/index';
import { useT } from '@shared/i18n';
import { Icon } from '../Icon';
import styles from './Loader.module.css';

export type LoaderProps = {
  label?: string;
  animated?: boolean;
};

export function Loader({ label, animated = false }: LoaderProps) {
  const t = useT();
  const resolvedLabel = label ?? t('common.loading');
  return (
    <div className={styles.loader} role="status" aria-label={resolvedLabel}>
      <Icon
        src={uiAssets.loader}
        size="loader"
        decorative
        className={animated ? styles.spinning : undefined}
      />
    </div>
  );
}
