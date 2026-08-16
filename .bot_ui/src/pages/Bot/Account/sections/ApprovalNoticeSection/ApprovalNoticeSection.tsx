import { Link } from 'react-router-dom';
import { Text } from '@components/atoms/Text';
import { getBinollaLoginLabel, getBinollaReferralLabel } from '@constants/binolla';
import { ROUTES } from '@constants/routes';
import { useT } from '@shared/i18n';
import type { AccountStatus } from '../../types';
import styles from './ApprovalNoticeSection.module.css';

export type ApprovalNoticeSectionProps = {
  accountStatus: AccountStatus;
  binollaConnected: boolean;
  botAccess?: string;
};

export function ApprovalNoticeSection({
  accountStatus,
  binollaConnected,
  botAccess,
}: ApprovalNoticeSectionProps) {
  const t = useT();

  if (botAccess === 'SessionExpired') {
    return (
      <section className={styles.section} aria-label={t('account.notice.sessionExpired.aria')}>
        <div className={styles.card} data-tone="warning">
          <Text variant="body" tone="body" className={styles.title}>
            {t('account.notice.sessionExpired.title')}
          </Text>
          <Text variant="caption" tone="caption" className={styles.body}>
            {t('account.notice.sessionExpired.body')}
          </Text>
          <Link className={styles.link} to={ROUTES.linkBinolla}>
            {t('account.notice.sessionExpired.cta')}
          </Link>
        </div>
      </section>
    );
  }

  if (!binollaConnected && accountStatus !== 'rejected') {
    return (
      <section className={styles.section} aria-label={t('account.notice.connect.aria')}>
        <div className={styles.card} data-tone="info">
          <Text variant="body" tone="body" className={styles.title}>
            {t('account.notice.connect.title')}
          </Text>
          <Text variant="caption" tone="caption" className={styles.body}>
            {t('account.notice.connect.body')}
          </Text>
          <Link className={styles.link} to={ROUTES.linkBinolla}>
            {getBinollaReferralLabel()}
          </Link>
          <Link className={styles.link} to={ROUTES.linkBinolla}>
            {getBinollaLoginLabel()}
          </Link>
        </div>
      </section>
    );
  }

  if (accountStatus === 'pending') {
    return (
      <section className={styles.section} aria-label={t('account.notice.pending.aria')}>
        <div className={styles.card} data-tone="warning">
          <Text variant="body" tone="body" className={styles.title}>
            {t('account.notice.pending.title')}
          </Text>
          <Text variant="caption" tone="caption" className={styles.body}>
            {t('account.notice.pending.body')}
          </Text>
        </div>
      </section>
    );
  }

  if (accountStatus === 'rejected') {
    return (
      <section className={styles.section} aria-label={t('account.notice.rejected.aria')}>
        <div className={styles.card} data-tone="danger">
          <Text variant="body" tone="body" className={styles.title}>
            {t('account.notice.rejected.title')}
          </Text>
          <Text variant="caption" tone="caption" className={styles.body}>
            {t('account.notice.rejected.body')}
          </Text>
        </div>
      </section>
    );
  }

  return null;
}
