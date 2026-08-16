import { uiAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './KeyPoint.module.css';

export type KeyPointProps = {
  text: string;
  variant?: 'check' | 'trade' | 'warning';
  className?: string;
};

const iconMap = {
  check: uiAssets.keypointCheck,
  trade: uiAssets.keypointTrade,
  warning: uiAssets.keypointWarning,
};

const iconWrapMap = {
  check: styles.iconWrap,
  trade: styles.iconWrap,
  warning: styles.iconWrapWarning,
};

export function KeyPoint({ text, variant = 'check', className }: KeyPointProps) {
  return (
    <div className={cn(styles.keyPoint, className)}>
      <span className={iconWrapMap[variant]}>
        <Icon src={iconMap[variant]} size="xs" />
      </span>
      <Text variant="body-sm" className={styles.text}>
        {text}
      </Text>
    </div>
  );
}
