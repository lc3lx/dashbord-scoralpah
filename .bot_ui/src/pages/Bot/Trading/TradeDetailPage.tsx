import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { PageContent } from '@components/layouts/PageContent';
import { ROUTES } from '@constants/routes';
import { useT } from '@shared/i18n';
import { useTradeDetail } from './hooks/useTradeDetail';
import {
  TradeDetailHeaderSection,
  TradeDetailHeroSection,
} from './sections/TradeDetailHeroSection';
import { TradeDetailsSection } from './sections/TradeDetailsSection';
import { TradeTimelineSection } from './sections/TradeTimelineSection';
import styles from './TradeDetailPage.module.css';

export default function TradeDetailPage() {
  const t = useT();
  const navigate = useNavigate();
  const { tradeId } = useParams<{ tradeId: string }>();
  const { detail, status } = useTradeDetail(tradeId);

  if (status === 'loading') return null;

  if (status === 'missing' || !detail) {
    return (
      <main className={styles.page} aria-label={t('trade.detail.title')}>
        <div className={styles.scroll}>
          <PageContent className={styles.content}>
            <TradeDetailHeaderSection
              title={t('trade.detail.title')}
              statusLabel={t('common.missing')}
              statusTone="neutral"
              onBack={() => navigate(-1)}
            />
            <Text variant="body-sm" tone="caption" align="center">
              {t('trade.detail.notFound')}
            </Text>
            <Button variant="ghost" fullWidth onClick={() => navigate(ROUTES.history)}>
              {t('trade.detail.backHistory')}
            </Button>
          </PageContent>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page} aria-label={detail.pageTitle}>
      <div className={styles.scroll}>
        <PageContent className={styles.content}>
          <TradeDetailHeaderSection
            title={detail.pageTitle}
            statusLabel={detail.statusLabel}
            statusTone={detail.statusTone}
            onBack={() => navigate(-1)}
          />
          <TradeDetailHeroSection content={detail.hero} candleData={detail.candleData} />
          <TradeDetailsSection rows={detail.detailRows} />
          <TradeTimelineSection
            title={detail.timelineTitle}
            entries={detail.timeline}
            checkIconSrc={detail.timelineCheckIconSrc}
          />
        </PageContent>
      </div>
    </main>
  );
}
