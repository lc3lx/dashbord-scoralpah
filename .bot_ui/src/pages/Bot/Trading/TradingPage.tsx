import { PageContent } from '@components/layouts/PageContent';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { useT } from '@shared/i18n';
import { useTradingData } from './hooks/useTradingData';
import { BinollaTradingCardSection } from './sections/BinollaTradingCardSection';
import styles from './TradingPage.module.css';

export default function TradingPage() {
  const t = useT();
  const { data } = useTradingData();

  if (!data) {
    return (
      <main className={styles.page} aria-label={t('trading.aria')} aria-busy="true">
        <div className={styles.scroll}>
          <BackgroundGlow variant="top-right" />
          <PageContent className={styles.content}>
            <p className={styles.loading}>{t('trading.loading')}</p>
          </PageContent>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page} aria-label={t('trading.aria')}>
      <div className={styles.scroll}>
        <BackgroundGlow variant="top-right" />
        <PageContent className={styles.content}>
          <BinollaTradingCardSection content={data.binollaCard} />
        </PageContent>
      </div>
    </main>
  );
}
