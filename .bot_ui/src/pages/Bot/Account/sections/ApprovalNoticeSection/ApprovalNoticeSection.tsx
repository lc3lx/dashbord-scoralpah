import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Text } from '@components/atoms/Text';
import { getBinollaLoginLabel, getBinollaReferralLabel } from '@constants/binolla';
import { ROUTES } from '@constants/routes';
import { binollaApi } from '@shared/api';
import { invalidateBotSessionCache } from '@shared/api/botSessionCache';
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
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectError, setReconnectError] = useState<string | null>(null);

  const tryReconnect = useCallback(async () => {
    setReconnecting(true);
    setReconnectError(null);
    try {
      await binollaApi.reconnect();
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
        body: JSON.stringify({
          sessionId: '1892a4',
          runId: 'binolla-auto',
          hypothesisId: 'BR1',
          location: 'ApprovalNoticeSection.tsx:tryReconnect',
          message: 'reconnect_ok',
          data: {},
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      invalidateBotSessionCache();
      window.location.reload();
    } catch {
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
        body: JSON.stringify({
          sessionId: '1892a4',
          runId: 'binolla-auto',
          hypothesisId: 'BR1',
          location: 'ApprovalNoticeSection.tsx:tryReconnect',
          message: 'reconnect_failed',
          data: {},
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      setReconnectError(t('account.notice.sessionExpired.reconnectFailed'));
    } finally {
      setReconnecting(false);
    }
  }, [t]);

  useEffect(() => {
    if (botAccess !== 'SessionExpired') return;
    void tryReconnect();
  }, [botAccess, tryReconnect]);

  if (botAccess === 'SessionExpired') {
    return (
      <section className={styles.section} aria-label={t('account.notice.sessionExpired.aria')}>
        <div className={styles.card} data-tone="warning">
          <Text variant="body" tone="body" className={styles.title}>
            {t('account.notice.sessionExpired.title')}
          </Text>
          <Text variant="caption" tone="caption" className={styles.body}>
            {reconnecting
              ? t('account.notice.sessionExpired.reconnecting')
              : t('account.notice.sessionExpired.body')}
          </Text>
          {reconnectError ? (
            <Text variant="caption" tone="danger" className={styles.body}>
              {reconnectError}
            </Text>
          ) : null}
          <button
            type="button"
            className={styles.link}
            onClick={() => void tryReconnect()}
            disabled={reconnecting}
          >
            {t('account.notice.sessionExpired.ctaAuto')}
          </button>
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
