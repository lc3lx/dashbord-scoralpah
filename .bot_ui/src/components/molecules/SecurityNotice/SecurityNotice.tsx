import { uiAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './SecurityNotice.module.css';

export type SecurityNoticeProps = {
  title: string;
  subtitle: string;
  className?: string;
};

export function SecurityNotice({ title, subtitle, className }: SecurityNoticeProps) {
  return (
    <aside className={cn(styles.notice, className)} aria-label="Security notice">
      <span className={styles.iconWrap}>
        <Icon src={uiAssets.securityShield} decorative className={styles.icon} />
      </span>
      <div className={styles.copy}>
        <Text variant="caption" className={styles.title}>
          {title}
        </Text>
        <Text variant="caption-xs" className={styles.subtitle}>
          {subtitle}
        </Text>
      </div>
    </aside>
  );
}
